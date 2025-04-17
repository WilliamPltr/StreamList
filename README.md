# 🎬 StreamList.fr

**StreamList.fr** est une application web collaborative pour partager, noter et commenter des films entre amis. L’application s’appuie sur des APIs externes et un LLM pour enrichir les fiches films.

---

## ⚡ Fonctionnement & APIs

- **TMDB API** : Récupère les données officielles des films (titre, affiche, année, résumé, etc).
- **DeepSeek LLM** : Utilisé pour la génération IA (trouver le vrai titre, résumer, etc). DeepSeek est paramétré par défaut car il est économique, mais tu peux brancher un autre LLM si besoin.
- **Supabase** : Authentification et base de données utilisateurs/films.

---

## 🔑 Exemple de configuration `.env`

Crée un fichier `.env` à la racine du projet avec les variables suivantes :
```env
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxx

# TMDB
VITE_TMDB_API_KEY=xxxxxxx

# DeepSeek ou autre LLM (clé API, endpoint, etc)
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_DEEPSEEK_API_KEY=xxxxxxx

# (Tu peux ajouter d’autres variables selon ton fournisseur LLM)
```
**⚠️ N’oublie pas d’ajouter `.env` à ton `.gitignore` pour ne jamais versionner tes clés !**

---

# 👨‍💻 Utiliser StreamList.fr en LOCAL (PC/Mac)

### 1. Cloner le dépôt
```bash
git clone git@github.com:TON_USER/TON_REPO.git streamlist
cd streamlist
```

### 2. Préparer l’environnement
- Installe Node.js ≥ 18.x ([guide nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Installe les dépendances :
  ```bash
  npm install
  ```
- Crée le fichier `.env` (voir plus haut)

### 3. Lancer le site en développement
```bash
npm run dev
```
- Accède à [http://localhost:8080](http://localhost:8080) dans ton navigateur
- L’API DeepSeek et les requêtes TMDB fonctionneront si tes clés sont valides

### 4. (Optionnel) Build de production local
```bash
npm run build
npm run preview
```

---

# 🌍 Déployer sur un serveur Ubuntu (Oracle Cloud, VPS, etc)

### 1. Préparer le serveur
- Installe Node.js ≥ 18.x (`nvm` recommandé)
- Installe Nginx :
  ```bash
  sudo apt update && sudo apt install nginx
  ```
- Ouvre le port 80 (et 443 pour HTTPS) dans le firewall Oracle/Ubuntu

### 2. Cloner et configurer le projet
```bash
cd <emplacement_du_dossier>
sudo git clone git@github.com:TON_USER/TON_REPO.git streamlist
cd streamlist
sudo npm install
sudo cp .env.example .env  # ou crée le .env à la main
```

### 3. Build de production
```bash
sudo npm run build
sudo mkdir -p /var/www/streamlist/dist
sudo cp -r dist/* /var/www/streamlist/dist/
```

### 4. Configurer Nginx
```bash
sudo nano /etc/nginx/sites-available/streamlist
```
Exemple de config :
```nginx
server {
    listen 80;
    server_name streamlist.fr www.streamlist.fr;
    root /var/www/streamlist/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/streamlist /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Lier le domaine
- Chez ton registrar, ajoute un enregistrement A pointant vers l’IP du serveur pour `streamlist.fr` et `www.streamlist.fr`
- Attends la propagation DNS

### 6. Activer HTTPS (Let’s Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d streamlist.fr -d www.streamlist.fr
```

### 7. Mettre à jour le site (déploiement continu)
```bash
cd /var/www/streamlist
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/streamlist/dist/
sudo systemctl reload nginx
```

---

## 🛠️ Stack technique
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Supabase
- TMDB API
- DeepSeek (ou tout LLM compatible)
- Nginx

---

## 💡 Conseils & debug
- Pour plusieurs sites : chaque `server_name` doit être unique dans `/etc/nginx/sites-available/`
- Logs Nginx :
  - `sudo tail -f /var/log/nginx/error.log`
  - `sudo tail -f /var/log/nginx/access.log`
- Pour un backend Node.js : utilise `pm2` ou un service systemd
- Pour changer de LLM, adapte les variables d’API dans `.env`

---

## 🤝 Support
- [Nginx Docs](https://nginx.org/en/docs/)
- [Vite Deploy](https://vitejs.dev/guide/static-deploy.html)
- [Let’s Encrypt](https://letsencrypt.org/getting-started/)
- [TMDB Docs](https://developer.themoviedb.org/docs)
- [DeepSeek Docs](https://platform.deepseek.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Déployez, partagez et profitez de vos films sur https://streamlist.fr !** 🍿
