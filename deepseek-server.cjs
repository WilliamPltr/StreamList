// Mini serveur Express pour relayer DeepSeek et logger les requêtes
const express = require('express');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = 3001;
const LOG_FILE = '/tmp/deepseek_api.log';
const DEEPSEEK_API_KEY = "sk-a028a61e642e41608c01466a10ef5341";

function writeLog(msg) {
  const log = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, log); } catch (e) { /* ignore */ }
  console.log(msg);
}

app.use(cors());
app.use(express.json({limit: '1mb'}));

app.post('/deepseek', async (req, res) => {
  writeLog('[DeepSeek API] Requête reçue');
  writeLog('[DeepSeek API] Body reçu: ' + JSON.stringify(req.body));
  try {
    const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(req.body)
    });
    const rawText = await deepseekRes.text();
    writeLog('[DeepSeek API] Réponse brute DeepSeek: ' + rawText);
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      writeLog('[DeepSeek API] Erreur de parsing JSON: ' + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
      return res.status(500).json({ error: 'Erreur de parsing JSON DeepSeek', raw: rawText });
    }
    res.status(200).json(data);
  } catch (err) {
    writeLog('[DeepSeek API] Erreur générale: ' + (err instanceof Error ? err.message : String(err)));
    res.status(500).json({ error: 'Erreur serveur DeepSeek', details: err });
  }
});

app.listen(PORT, () => {
  writeLog(`[DeepSeek API] Serveur Express lancé sur port ${PORT}`);
});
