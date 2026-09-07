# 🚀 Deployment Guide - CRYDO5 Casino Baden Dashboard

## Voraussetzungen

- Git installiert
- GitHub Konto mit Zugriff auf `crydo5-apps` Organization
- SSH-Key konfiguriert (empfohlen) oder GitHub Personal Access Token

## 📦 GitHub Repository Setup

### 1. Repository initialisieren (first time only)

```bash
cd crydo5-casino-dashboard

# Initialisiere Git
git init

# Füge GitHub als Remote hinzu
git remote add origin https://github.com/crydo5-apps/crydo5-casino-baden-db.git

# Setze Initial Branch
git branch -M main

# Füge alle Dateien hinzu
git add .

# Erstelle ersten Commit
git commit -m "Initial commit: Casino Dashboard mit Live-Updates und PDF Export"

# Push zum Repository
git push -u origin main
```

### 2. Für zukünftige Updates

```bash
# Änderungen hinzufügen
git add .

# Commit mit aussagekräftiger Nachricht
git commit -m "Feature: [Beschreibung der Änderung]"

# Push
git push origin main
```

## 🌐 Hosting Optionen

### Option 1: GitHub Pages (Kostenlos, Empfohlen)

GitHub Pages hostet dein Repository automatisch als Website.

1. **Repository Settings öffnen**
   - Gehe zu `https://github.com/crydo5-apps/crydo5-casino-baden-db/settings`

2. **GitHub Pages aktivieren**
   - Scrolle zu "GitHub Pages" Sektion
   - Source: `main` branch
   - Folder: `/ (root)`
   - Klicke "Save"

3. **Deine Website ist live unter:**
   ```
   https://crydo5-apps.github.io/crydo5-casino-baden-db/
   ```

4. **Custom Domain (optional)**
   - Wenn du eine Custom Domain hast (z.B. `casino-db.crydo5.ch`)
   - In Settings → Custom domain eingeben
   - DNS-Records auf GitHub Pages zeigen lassen

### Option 2: Netlify (Kostenlos, Alternativ)

1. Gehe zu https://netlify.com
2. Klicke "New site from Git"
3. Wähle GitHub und das Repository
4. Build settings:
   - Build command: (leer lassen)
   - Publish directory: `.`
5. Deploy!

### Option 3: Vercel (Kostenlos, für TypeScript/Framework)

1. Gehe zu https://vercel.com
2. Import Project → GitHub
3. Wähle Repository
4. Deploy!

### Option 4: Eigener Server

```bash
# SSH in deinen Server
ssh user@server.com

# Clone Repository
git clone https://github.com/crydo5-apps/crydo5-casino-baden-db.git
cd crydo5-casino-baden-db

# Mit Nginx servieren
# Konfiguriere Nginx um auf diesen Ordner zu zeigen
# Beispiel: /etc/nginx/sites-available/casino-db

server {
    listen 80;
    server_name casino-db.crydo5.ch;
    
    root /home/user/crydo5-casino-baden-db;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # HTTPS mit Let's Encrypt (empfohlen)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/casino-db.crydo5.ch/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/casino-db.crydo5.ch/privkey.pem;
}

# Reload Nginx
sudo systemctl reload nginx
```

## 🔄 CI/CD Pipeline Setup (Optional)

### GitHub Actions Workflow

Erstelle `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

Dann pushen:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment"
git push
```

## 🔐 Sicherheit für Production

### 1. HTTPS erzwingen

```bash
# Bei GitHub Pages: Automatisch aktiviert
# Settings → Pages → Enforce HTTPS ✓
```

### 2. Environment Variables (wenn API vorhanden)

Erstelle `.env.example`:
```
VITE_API_URL=https://api.crydo5.ch
VITE_API_KEY=your_key_here
```

In GitHub: Settings → Secrets → Add new secret
```
API_URL = https://api.crydo5.ch
API_KEY = your_key_here
```

### 3. API CORS Headers (Backend)

```javascript
// Node.js/Express Beispiel
const cors = require('cors');

app.use(cors({
  origin: 'https://crydo5-apps.github.io',
  credentials: true
}));
```

## 📊 Monitoring & Analytics

### Google Analytics hinzufügen

Füge zu `index.html` hinzu (vor `</head>`):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 📈 Performance Monitoring

### Lighthouse Audit

```bash
# Mit Chrome
# 1. Öffne DevTools (F12)
# 2. Gehe zu Lighthouse Tab
# 3. Klicke "Generate report"
```

### Bundle Size Check

Da wir nur static HTML/CSS/JS verwenden:
- index.html: ~15 KB
- css/styles.css: ~12 KB
- js/app.js: ~25 KB
- **Total: ~52 KB** (sehr optimiert!)

## 🚨 Troubleshooting

### GitHub Pages zeigt alte Version

```bash
# Hard refresh (Ctrl+Shift+R oder Cmd+Shift+R)
# Oder Cache löschen und neu laden
```

### 404 errors bei refresh

Füge zur `index.html` hinzu:
```html
<meta property="og:url" content="index.html">
```

Oder nutze GitHub Pages mit Custom 404:
Erstelle `404.html` (kopiere `index.html`)

### CORS Fehler bei API-Aufrufen

Backend muss CORS-Header setzen:
```bash
Access-Control-Allow-Origin: https://crydo5-apps.github.io
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📋 Production Checklist

- [ ] Repository auf GitHub gepusht
- [ ] GitHub Pages aktiviert
- [ ] Custom Domain konfiguriert (wenn vorhanden)
- [ ] HTTPS erzwungen
- [ ] API-Endpoints konfiguriert
- [ ] Environment-Variablen gesetzt
- [ ] Lighthouse Audit durchgeführt
- [ ] Auf allen Browsern getestet
- [ ] Mobile responsiveness überprüft
- [ ] Sicherheits-Audit durchgeführt
- [ ] Monitoring/Analytics aktiviert
- [ ] Documentation aktualisiert

## 🔄 Regelmäßige Maintenance

### Wöchentlich
- GitHub Issues/PRs überprüfen
- Fehler-Logs prüfen

### Monatlich
- Dependencies aktualisieren
- Performance Audit durchführen
- Backup erstellen

### Jährlich
- Security Audit durchführen
- License überprüfen
- Architecture Review

## 📞 Support

Bei Deployment-Problemen:
1. Überprüfe GitHub Actions Logs
2. Schau in den Browser-Console (F12)
3. Teste lokal mit `python -m http.server 8000`
4. Erstelle GitHub Issue

---

**Viel Erfolg beim Deployment! 🚀**
