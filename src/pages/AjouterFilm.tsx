
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import RatingStars from '@/components/RatingStars';
import DatePicker from '@/components/DatePicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Film } from '@/components/FilmCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Clé DeepSeek uniquement côté serveur API, plus ici !
const TMDB_API_KEY = "c9676c87d113fb818db076e028368871";
const TMDB_READ_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOTY3NmM4N2QxMTNmYjgxOGRiMDc2ZTAyODM2ODg3MSIsIm5iZiI6MTc0NDc5NzUwNy43NDU5OTk4LCJzdWIiOiI2N2ZmN2Y0MzYxYjFjNGJiMzI5OWExZjQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.SSADCZ9ytDF_tnxkPS_Zs2Dszc63xZp068CDfAhEFpU";
const IA_PROMPT = (titre: string) => (
  'J’aimerais que tu me fournisses une fiche de résumé complète et très lisible du film suivant : ' + titre + '\n\n' +
  '---\n\n' +
  '1 - Recherche d’abord des informations sur internet, en recoupant plusieurs sources pour avoir un résumé approfondi et fiable\n\n' +
  '2 - Élabore un résumé complet qui couvre toute l’intrigue du film, sans te limiter à donner envie de le voir : dévoile les points importants, les moments-clés et la fin si nécessaire\n\n' +
  '3 - Décris les personnages principaux (nom, rôle, personnalité, motivations)\n\n' +
  '4 - Explique la morale ou le message central du film, en mentionnant aussi les choix de style du réalisateur (mise en scène, ambiance, thématiques)\n\n' +
  '5 - Donne une ou deux citations marquantes, avec le nom du personnage ou acteur qui les prononce\n\n' +
  '6 - Termine par un paragraphe qui montre comment je pourrais en parler comme si je l’avais vu et compris en profondeur, en faisant référence aux éléments marquants, au contexte et au style du film\n\n' +
  '---\n\n' +
  'IMPORTANT pour la lisibilité et l’édition :\n' +
  '- Utilise du markdown AVEC des caractères spéciaux visibles pour les titres (#, ##, ###, etc.), les listes, le gras (**), l’italique (*), les séparateurs (---), etc.\n' +
  '- Utilise plusieurs tailles de titres (ex : #, ##, ###) pour bien structurer le résumé et donner envie de lire chaque section.\n' +
  '- Ajoute systématiquement deux retours à la ligne entre chaque bloc/section (ex : après chaque titre, chaque paragraphe, chaque liste) pour aérer le texte.\n' +
  '- ATTENTION : Si l’éditeur ne rend pas les espaces ou retours à la ligne, INSÈRE un séparateur VISUEL comme --ESPACE-- ou <br><br> entre chaque bloc/section/partie/phrase importante pour qu’on puisse facilement les remplacer ensuite.\n' +
  '- N’hésite pas à styliser la section "notes" ou les citations avec du markdown avancé (tableaux, blockquotes, etc.)\n' +
  '- Le texte doit être en français, clair et bien organisé.\n\n' +
  'Exemple de structure attendue :\n\n' +
  '# Titre du film\n\n' +
  '--ESPACE--\n\n' +
  '## Résumé\n\n' +
  'Le résumé commence ici...\n\n' +
  '--ESPACE--\n\n' +
  '## Personnages principaux\n' +
  '- **Nom 1** : description\n' +
  '- **Nom 2** : description\n\n' +
  '--ESPACE--\n\n' +
  '## Morale et style\n\n' +
  'Quelques phrases sur la morale...\n\n' +
  '--ESPACE--\n\n' +
  '---\n\n' +
  '"Une citation marquante."\n\n' +
  '--ESPACE--\n\n' +
  '## Notes\n\n' +
  '- Point important 1\n' +
  '- Point important 2\n\n' +
  '--ESPACE--\n\n' +
  '---\n\n' +
  'Rappelle-toi :\n' +
  '- Mets toujours les titres avec #, ##, etc.\n' +
  '- Ajoute deux retours à la ligne (ou un séparateur visible comme --ESPACE--) entre chaque section ou paragraphe.\n' +
  '- Utilise du markdown pour tout ce qui peut améliorer la lisibilité et donner envie de lire.\n' +
  '- Si tu n’es pas sûr que les espaces sont visibles, mets --ESPACE-- à chaque endroit où il doit y avoir un saut de ligne ou une vraie séparation.'
);



const AjouterFilm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [titre, setTitre] = useState('');
  const [image, setImage] = useState('');
  const [resume, setResume] = useState('');
  const [note, setNote] = useState<number>(0);
  const [dateVue, setDateVue] = useState<Date | undefined>(undefined);
  const [annee, setAnnee] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [titreOfficiel, setTitreOfficiel] = useState('');
  const [titreOfficielLoading, setTitreOfficielLoading] = useState(false);
  const [titreOfficielError, setTitreOfficielError] = useState('');
  // Pour reset complet (inclut IA)
  const resetForm = () => {
    setTitre('');
    setTitreOfficiel('');
    setTitreOfficielLoading(false);
    setTitreOfficielError('');
    setImage('');
    setResume('');
    setNote(0);
    setDateVue(undefined);
    setAnnee('');
    setIaLoading(false);
    setIaPrompt("");
  };

  // Ajout hooks IA
  const [iaPrompt, setIaPrompt] = useState("");
  const [iaLoading, setIaLoading] = useState(false);

  // Suggestions TMDB
  const [tmdbSuggestions, setTmdbSuggestions] = useState<any[]>([]);
  const [showTmdbSuggestions, setShowTmdbSuggestions] = useState(false);
  const [selectedTmdbMovie, setSelectedTmdbMovie] = useState<any | null>(null);

  // Recherche DeepSeek du titre officiel uniquement sur clic bouton
  const handleFindTitreOfficiel = async () => {
    if (!titre.trim()) {
      setTitreOfficiel('');
      setTitreOfficielError('Veuillez saisir un titre ou une description.');
      return;
    }
    setTitreOfficielLoading(true);
    setTitreOfficielError('');
    try {
      const deepseekTitleRes = await fetch("http://localhost:3001/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Tu es un expert du cinéma et de la base de données TheMovieDB (TMDB). À partir d’un titre partiel, d’une faute ou d’une description, tu dois retrouver le film le plus probable et donner UNIQUEMENT son titre EXACT tel qu’il apparaît sur TMDB. Privilégie toujours le titre le plus connu et le plus pertinent. N’invente jamais de titre obscur ou peu probable. Si aucune correspondance claire n’existe, réponds strictement 'Inconnu'." },
            { role: "user", content: `L’utilisateur cherche : \"${titre}\". Quel est le titre officiel du film correspondant à cette description ? Donne-moi uniquement le titre exact tel qu’il apparaît sur TMDB, sans rien d’autre.` }
          ],
          temperature: 0.05
        })
      });
      const deepseekTitleJson = await deepseekTitleRes.json();
      let titreTrouve = '';
      try {
        titreTrouve = deepseekTitleJson.choices?.[0]?.message?.content?.trim() || '';
      } catch {}
      if (titreTrouve && titreTrouve.toLowerCase() !== 'inconnu') {
        setTitreOfficiel(titreTrouve);
        // Recherche TMDB pour suggestions
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(titreTrouve)}`, {
          headers: {
            Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
            accept: 'application/json',
          },
        });
        const tmdbJson = await tmdbRes.json();
        if (tmdbJson.results && tmdbJson.results.length > 1) {
          setTmdbSuggestions(tmdbJson.results);
          setShowTmdbSuggestions(true);
        } else {
          setTmdbSuggestions([]);
          setShowTmdbSuggestions(false);
          // Si un seul film, on peut pré-remplir directement
          if (tmdbJson.results && tmdbJson.results.length === 1) {
            const movie = tmdbJson.results[0];
            setTitre(movie.title || titreTrouve);
            setImage(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
            setAnnee(movie.release_date ? movie.release_date.slice(0, 4) : '');
          }
        }
      } else {
        setTitreOfficiel('');
        setTitreOfficielError('Titre officiel non trouvé');
        setTmdbSuggestions([]);
        setShowTmdbSuggestions(false);
      }
    } catch (e) {
      setTitreOfficiel('');
      setTitreOfficielError('Erreur lors de la désambiguïsation');
      setTmdbSuggestions([]);
      setShowTmdbSuggestions(false);
    } finally {
      setTitreOfficielLoading(false);
    }
  };

  const handleIaGenerate = async () => {
    if (!titre.trim()) {
      toast.error("Veuillez saisir le nom du film dans le champ titre.");
      return;
    }
    setIaLoading(true);
    toast.info("La génération IA peut prendre jusqu'à 30 secondes selon la longueur du résumé...");
    try {
      if (!titreOfficiel) {
        toast.error("Titre officiel non trouvé, impossible de générer la fiche film.");
        setIaLoading(false);
        return;
      }
      // 1. Utiliser le film sélectionné si dispo, sinon chercher sur TMDB
      let movie = selectedTmdbMovie;
      if (!movie) {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(titreOfficiel)}`, {
          headers: {
            Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
            accept: 'application/json',
          },
        });
        const tmdbJson = await tmdbRes.json();
        movie = tmdbJson.results?.[0];
      }
      if (!movie) {
        toast.error("Film introuvable sur TheMovieDB");
        setIaLoading(false);
        return;
      }
      // Remplir les champs avec TMDB
      setTitre(movie.title || titreOfficiel);
      setImage(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
      // Note sur 5, arrondie à 0.5 près
      const noteSur5 = movie.vote_average ? Math.round((movie.vote_average / 2) * 2) / 2 : 0;
      setNote(noteSur5);
      setResume(''); // On va remplir avec DeepSeek ensuite
      // Année de sortie
      const annee = movie.release_date ? movie.release_date.slice(0, 4) : '';
      // Stocke l'année de sortie dans le state (pour sauvegarde et affichage)
      setAnnee(annee);
      // 2. Générer le résumé avec DeepSeek
      const deepseekRes = await fetch("http://localhost:3001/deepseek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Tu es un professionnel de la synthétisation de films depuis 25 ans, un expert reconnu pour la clarté, la précision et la neutralité de tes résumés. Tu ne dois jamais utiliser de gras ni de titres dans tes réponses, uniquement du texte simple, structuré par des tirets, chiffres ou séparateurs visuels." },
            { role: "user", content: IA_PROMPT(movie.title) }
          ],
          temperature: 0.7
        })
      });
      const deepseekJson = await deepseekRes.json();
      let resumeText = '';
      try {
        resumeText = deepseekJson.choices?.[0]?.message?.content || '';
      } catch (e) {
        toast.error("Réponse IA inattendue");
        setIaLoading(false);
        return;
      }
      setResume(resumeText);
      toast.success("Fiche film générée automatiquement !");

      // Ajout du film dans Supabase APRÈS génération du résumé
      if (!user || !user.id) {
        console.error("[handleIaGenerate] Utilisateur non connecté ou user.id manquant", { user });
        toast.error("Vous devez être connecté pour ajouter un film (user ou user.id manquant)");
        setIaLoading(false);
        return;
      }
      setIsSubmitting(true);
      try {
        const newFilm = {
          id: uuidv4(),
          titre: (movie?.title || titreOfficiel || titre).trim(),
          image: movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : (image.trim() || 'https://via.placeholder.com/300x450?text=Pas+d%27image'),
          note,
          resume: resumeText,
          annee: annee || undefined,
          dateVue: dateVue ? dateVue.toISOString() : null,
          user_id: user.id
        };
        console.log('[handleIaGenerate] Insertion film pour user', { user, userId: user.id, newFilm });
        const { data: insertData, error } = await supabase
          .from('films')
          .insert(newFilm);
        console.log('[handleIaGenerate] Résultat insertion Supabase', { insertData, error });
        if (error) {
          console.error("[handleIaGenerate] Erreur lors de l'ajout du film:", error, { newFilm });
          toast.error(`Erreur Supabase: ${error.message}${error.details ? ' (' + error.details + ')' : ''}`);
          throw error;
        }
        toast.success(`Film ajouté avec succès ! (id: ${newFilm.id})`);
        // Stocke l'id du dernier film ajouté pour l'animation
        localStorage.setItem('lastAddedFilmId', newFilm.id);
        setShowConfirmation(true);
      } catch (error) {
        console.error("[handleIaGenerate] Exception:", error);
        toast.error("Impossible d'ajouter le film, veuillez réessayer");
      } finally {
        setIsSubmitting(false);
        setIaLoading(false);
        setSelectedTmdbMovie(null);
      }
    } catch (err) {
      toast.error("Erreur lors de la génération IA ou de la récupération des infos film");
      console.error(err);
      setIaLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titre.trim()) {
      toast.error("Le titre du film est requis");
      return;
    }

    if (!user || !user.id) {
      console.error("[handleSubmit] Utilisateur non connecté ou user.id manquant", { user });
      toast.error("Vous devez être connecté pour ajouter un film (user ou user.id manquant)");
      navigate('/auth');
      return;
    }

    console.log('[handleSubmit] user:', user);
    console.log('[handleSubmit] user_id:', user.id);

    setIsSubmitting(true);

    try {
      // Créer un nouvel objet film
      const newFilm = {
        id: uuidv4(),
        titre: titre.trim(),
        image: image.trim() || 'https://via.placeholder.com/300x450?text=Pas+d%27image',
        note,
        resume: resume.trim(),
        annee: annee || undefined,
        dateVue: dateVue ? dateVue.toISOString() : null,
        user_id: user.id
      };
      console.log('[handleSubmit] Tentative insertion film', newFilm);
      const { data: insertData, error } = await supabase
        .from('films')
        .insert(newFilm);
      console.log('[handleSubmit] Résultat insertion Supabase', { insertData, error });
      if (error) {
        console.error("[handleSubmit] Erreur lors de l'ajout du film:", error, { newFilm });
        toast.error(`Erreur Supabase: ${error.message}${error.details ? ' (' + error.details + ')' : ''}`);
        throw error;
      }
      toast.success(`Film ajouté avec succès ! (id: ${newFilm.id})`);
      setShowConfirmation(true);
    } catch (error) {
      console.error("[handleSubmit] Exception:", error);
      toast.error("Impossible d'ajouter le film, veuillez réessayer");
    }
    setIsSubmitting(false);
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />
      {showConfirmation && (
        <div className="flex flex-col items-center justify-center py-6">
          <Button className="w-full max-w-xs mb-4" onClick={() => { setShowConfirmation(false); navigate('/'); }}>Retour à l’accueil</Button>
        </div>
      )}
      <main className="flex-1 px-4 py-8 md:px-6 md:py-10 container max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-medium">Ajouter un film</h2>
          <p className="text-muted-foreground mt-1">
            Enregistrez un nouveau film dans votre collection
          </p>
        </div>
        <div className="mb-8 p-4 rounded-lg bg-card border border-border/50 flex flex-col gap-2">
          <label htmlFor="titre" className="font-medium">Remplissage automatique par IA</label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Input
                id="titre"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Entrez le nom ou une description du film"
                required
                className="flex-1 bg-secondary border-secondary"
                disabled={iaLoading}
              />
              <Button type="button" variant="secondary" onClick={handleFindTitreOfficiel} disabled={titreOfficielLoading || iaLoading}>
                {titreOfficielLoading ? (
                  <svg className="inline animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : (
                  <>Trouver le vrai titre avec l'IA</>
                )}
              </Button>
            </div>
            {/* Suggestions TMDB si plusieurs résultats */}
            {showTmdbSuggestions && tmdbSuggestions.length > 1 && (
              <div className="mt-2 border rounded bg-muted p-2">
                <div className="mb-1 font-semibold text-sm">Plusieurs films trouvés, lequel correspond&nbsp;?</div>
                <div className="flex flex-wrap gap-2">
                  {tmdbSuggestions.slice(0, 6).map((movie) => (
                    <div key={movie.id} className="flex flex-col items-center border p-2 rounded w-32 bg-background">
                      <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'https://via.placeholder.com/100x150?text=Pas+d%27image'} alt={movie.title} className="w-20 h-28 object-cover rounded mb-1" />
                      <div className="text-xs font-medium text-center">{movie.title}</div>
                      <div className="text-xs text-muted-foreground">{movie.release_date ? movie.release_date.slice(0, 4) : '-'}</div>
                      <Button size="sm" className="mt-1 w-full" onClick={() => {
                        setTitre(movie.title);
                        setImage(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
                        setAnnee(movie.release_date ? movie.release_date.slice(0, 4) : '');
                        setSelectedTmdbMovie(movie);
                        setShowTmdbSuggestions(false);
                      }}>Choisir</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-row items-center gap-2 mt-1">
              <span className="text-xs font-medium text-muted-foreground">Titre officiel :</span>
              <span className="text-sm font-semibold text-primary">
                {titreOfficiel ? titreOfficiel : titreOfficielError ? <span className="text-red-500">{titreOfficielError}</span> : <span className="text-muted-foreground">-</span>}
              </span>
            </div>
            <Button type="button" onClick={handleIaGenerate} disabled={iaLoading || !titreOfficiel || titreOfficielLoading} className="mt-2 w-full">
              {iaLoading ? 'Génération...' : 'Générer le résumé avec IA'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Tape le nom du film, attends que le titre officiel soit trouvé, puis clique sur Générer pour remplir automatiquement la fiche complète !</p>
        </div>
        {/* Bouton Retour à l'accueil toujours visible en bas */}
        {resume && (
          <div className="flex flex-col gap-3 items-center">
            <h2 className="text-xl font-semibold text-primary mb-2">Fiche film générée automatiquement !</h2>
            <p className="text-muted-foreground text-center">
              Vous pouvez retrouver ce film dans votre collection.
            </p>
            <button
              className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </button>
          </div>
        )}
        {resume && (() => { setTimeout(() => navigate('/'), 1500); return null; })()}
        <div className="flex flex-col gap-4 pt-8">
          <Button 
            type="button" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AjouterFilm;
