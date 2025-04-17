require('dotenv').config();
// Worker DeepSeek : file d'attente backend pour générer les résumés IA
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-a028a61e642e41608c01466a10ef5341";
const LOG_FILE = '/tmp/deepseek_worker.log';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[Worker] Variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_KEY requises.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function log(msg) {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, logMsg); } catch (e) { /* ignore */ }
  console.log(msg);
}

async function processFilm(film) {
  log(`[Worker] Traitement du film ${film.titre} (${film.id})`);
  try {
    const systemPrompt = "Tu es un professionnel de la synthétisation de films depuis 25 ans, un expert reconnu pour la clarté, la précision et la neutralité de tes résumés. Tu ne dois jamais utiliser de gras ni de titres dans tes réponses, uniquement du texte simple, structuré par des tirets, chiffres ou séparateurs visuels.";
    const userPrompt = `J’aimerais que tu me fournisses une fiche de résumé complète du film suivant : ${film.titre}\n---\n\n1 - Recherche d’abord des informations sur internet, en recoupant plusieurs sources pour avoir un résumé approfondi et fiable\n2 - Élabore un résumé complet qui couvre toute l’intrigue du film, sans te limiter à donner envie de le voir : dévoile les points importants, les moments-clés et la fin si nécessaire\n3 - Décris les personnages principaux (nom, rôle, personnalité, motivations)\n4 - Explique la morale ou le message central du film, en mentionnant aussi les choix de style du réalisateur (mise en scène, ambiance, thématiques)\n5 - Donne une ou deux citations marquantes, avec le nom du personnage ou acteur qui les prononce\n6 - Termine par un paragraphe qui montre comment je pourrais en parler comme si je l’avais vu et compris en profondeur, en faisant référence aux éléments marquants, au contexte et au style du film\n---\n- N’utilise pas de gras ou de titres\n- Utilise des tirets ou des chiffres pour structurer tes informations\n- Sépare les différentes sections visuellement avec des lignes ou d’autres éléments semblables\n- Le texte doit être en français, clair et bien organisé`;
    const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });
    const rawText = await deepseekRes.text();
    log(`[Worker] Réponse DeepSeek brute: ${rawText}`);
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error('Erreur de parsing JSON DeepSeek: ' + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
    }
    const resumeText = data.choices?.[0]?.message?.content || '';
    await supabase.from('films').update({ resume: resumeText, resume_en_cours: false, resume_error: null }).eq('id', film.id);
    log(`[Worker] Résumé généré pour ${film.titre}`);
  } catch (err) {
    log(`[Worker] Erreur pour ${film.titre} (${film.id}): ${err && err.message ? err.message : String(err)}`);
    // Incrémente le compteur d'échecs, stocke l'erreur
    const nbFails = (film.resume_fail_count || 0) + 1;
    await supabase.from('films').update({ resume_error: err && err.message ? err.message : String(err), resume_fail_count: nbFails }).eq('id', film.id);
  }
}

async function mainLoop() {
  log('[Worker] Démarrage de la file d\'attente IA');
  while (true) {
    try {
      // Récupère les films à traiter (max 3 à la fois)
      const { data: films, error } = await supabase
        .from('films')
        .select('*')
        .eq('resume_en_cours', true)
        .is('resume_error', null)
        .limit(3);
      if (error) {
        log(`[Worker] Erreur lecture Supabase: ${error.message}`);
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      if (films && films.length > 0) {
        for (const film of films) {
          await processFilm(film);
          await new Promise(r => setTimeout(r, 3000)); // Pause entre films
        }
      } else {
        await new Promise(r => setTimeout(r, 15000)); // Attente si rien à faire
      }
    } catch (err) {
      log(`[Worker] Erreur générale: ${err && err.message ? err.message : String(err)}`);
      await new Promise(r => setTimeout(r, 15000));
    }
  }
}

mainLoop();
