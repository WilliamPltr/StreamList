// Endpoint API Next.js pour relayer les requêtes DeepSeek de façon sécurisée
import type { NextApiRequest, NextApiResponse } from 'next';

const DEEPSEEK_API_KEY = "sk-a028a61e642e41608c01466a10ef5341";

import fs from 'fs';
const LOG_FILE = '/tmp/deepseek_api.log';
function writeLog(msg: string) {
  const log = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, log); } catch (e) { /* ignore */ }
  console.log(msg);
}

// File d’attente simple en mémoire (max 2 requêtes simultanées)
const MAX_CONCURRENT = 2;
let current = 0;
const queue: Array<() => void> = [];

function acquireSlot() {
  return new Promise<void>((resolve, reject) => {
    if (current < MAX_CONCURRENT) {
      current++;
      writeLog(`[QUEUE] Slot acquis immédiatement (${current}/${MAX_CONCURRENT})`);
      resolve();
    } else {
      writeLog(`[QUEUE] File saturée (${current}/${MAX_CONCURRENT}), en attente…`);
      queue.push(resolve);
    }
  });
}
function releaseSlot() {
  current = Math.max(0, current - 1);
  writeLog(`[QUEUE] Slot libéré (${current}/${MAX_CONCURRENT})`);
  if (queue.length > 0) {
    const next = queue.shift();
    if (next) {
      current++;
      writeLog(`[QUEUE] Slot attribué à une requête en attente (${current}/${MAX_CONCURRENT})`);
      next();
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    writeLog(`[DeepSeek API] Mauvaise méthode: ${req.method}`);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  let slotAcquired = false;
  try {
    // Essayez d’acquérir un slot, sinon 429
    let slotPromise = acquireSlot();
    let slotTimeout = setTimeout(() => {
      if (!slotAcquired) {
        writeLog('[QUEUE] Timeout file d’attente (>10s), requête rejetée');
        res.status(429).json({ error: 'Trop de requêtes en cours, veuillez réessayer dans quelques secondes.' });
      }
    }, 10000);
    await slotPromise;
    slotAcquired = true;
    clearTimeout(slotTimeout);

    writeLog('[DeepSeek API] Requête reçue');
    const body = req.body;
    writeLog('[DeepSeek API] Body reçu: ' + JSON.stringify(body));

    // Timeout explicite pour la requête DeepSeek
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      writeLog('[DeepSeek API] Timeout DeepSeek (40s)');
    }, 40000);
    let deepseekRes, rawText;
    try {
      deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      rawText = await deepseekRes.text();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        writeLog('[DeepSeek API] Timeout/Abort DeepSeek');
        releaseSlot();
        return res.status(504).json({ error: 'Timeout DeepSeek (>40s)' });
      } else {
        writeLog('[DeepSeek API] Erreur réseau DeepSeek: ' + (err instanceof Error ? err.message : String(err)));
        releaseSlot();
        return res.status(502).json({ error: 'Erreur réseau DeepSeek', details: err });
      }
    } finally {
      clearTimeout(timeout);
    }
    writeLog('[DeepSeek API] Réponse brute DeepSeek: ' + rawText);
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      writeLog('[DeepSeek API] Erreur de parsing JSON: ' + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
      releaseSlot();
      return res.status(500).json({ error: 'Erreur de parsing JSON DeepSeek', raw: rawText });
    }
    res.status(200).json(data);
    releaseSlot();
  } catch (err) {
    if (!slotAcquired) {
      // La réponse 429 a déjà été envoyée
      return;
    }
    writeLog('[DeepSeek API] Erreur générale: ' + (err instanceof Error ? err.message : String(err)));
    releaseSlot();
    res.status(500).json({ error: 'Erreur serveur DeepSeek', details: err });
  }
}

