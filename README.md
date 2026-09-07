# 🎰 CRYDO5 Casino Baden - Dashboard

Echtzeit Spielerstatistiken und Spielhistorie Dashboard für das CRYDO5 Casino Baden.

## ✨ Features

### 📊 Echtzeit Statistiken
- Gesamte Einsätze
- Netto Gewinn/Verlust
- Durchschnittliche Einsatzgröße
- Gewinnquote
- Höchster Einsatz

### 📈 Erweiterte Analysen
- **Top Spieler** – Ranking nach Gesamteinsätzen
- **Spiel Performance** – Win/Loss Ratio pro Spieltyp
- **Volatilität** – Statistische Risikoanalyse mit Standardabweichung, Max. Gewinn/Verlust

### 🔄 Live-Updates
- Automatische Updates alle 3 Sekunden
- Live-Indikator mit Puls-Animation
- Toggle zum Starten/Stoppen der Updates

### 📥 PDF Export
- Kompletter Report Export
- Alle Statistiken und Diagramme
- Professionelle Formatierung
- Automatische Benennung mit Datum/Uhrzeit

### 📊 Visualisierungen
- Bar Chart: Einsätze nach Spiel
- Line Chart: Gewinn/Verlust Trend (24h)
- Interaktive Diagramme mit Chart.js

### 🎯 Filterung & Sortierung
- Nach Spieler filtern
- Nach Spieltyp filtern (Roulette, Slots, Blackjack, Poker)
- Nach Zeitraum filtern (Heute, Diese Woche, Dieser Monat)
- Sortierung nach Datum, Einsatz oder Gewinn/Verlust

### 📋 Spielhistorie
- Detaillierte Tabelle mit allen Spielen
- Timestamp, Spieler, Spiel, Einsatz, Ergebnis, Gewinn/Verlust
- Farbcodierte Spiel-Badges
- Paginierung (10 Einträge pro Seite)
- Neue Einträge werden hervorgehoben

## 🚀 Installation

### Lokal starten

1. **Projekt klonen oder herunterladen**
```bash
git clone https://github.com/crydo5-apps/crydo5-casino-baden-db.git
cd crydo5-casino-baden-db
```

2. **Mit Live-Server öffnen** (empfohlen)
```bash
# Mit Python
python -m http.server 8000

# Oder mit Node.js http-server
npx http-server

# Oder mit VS Code Live Server Extension
# Rechtsklick auf index.html → "Open with Live Server"
```

3. **Im Browser öffnen**
```
http://localhost:8000
```

### Direkt öffnen
Einfach `index.html` im Browser öffnen (keine externen Dependencies außer CDN-Libraries)

## 📁 Projektstruktur

```
crydo5-casino-baden-db/
├── index.html          # Hauptdatei
├── css/
│   └── styles.css      # Styling
├── js/
│   └── app.js          # JavaScript Logik
├── assets/             # Bilder, Icons (optional)
├── README.md           # Diese Datei
├── package.json        # Projekt-Metadaten
└── .gitignore          # Git-Ignorregeln
```

## 🔧 Konfiguration

### API Integration

Um echte Daten von deiner Casino-API zu verwenden, bearbeite `js/app.js`:

```javascript
// In app.js Zeile ~10
const CONFIG = {
  itemsPerPage: 10,
  liveUpdateInterval: 3000,
  apiBaseUrl: 'https://dein-casino-api.com' // ← Setze hier deine API URL
};
```

Dann nutze die API-Funktion (Beispiel am Ende von `app.js`):

```javascript
// Ersetze die addRandomRecord Funktion in startLiveUpdates():
const newRecord = await fetchLatestGameFromAPI();
allData.unshift(newRecord);
applyFilters();
```

### API Endpoint Anforderungen

Deine API sollte folgendes JSON-Format zurückgeben:

```json
{
  "timestamp": "2026-09-07T14:30:00Z",
  "player": "Alex Schmidt",
  "game": "Roulette",
  "bet": 150,
  "result": "Gewonnen",
  "profit": 200
}
```

### Spieler anpassen

In `js/app.js` Zeile ~17:
```javascript
const PLAYERS = ['Alex Schmidt', 'Maria Müller', ...];
```

### Aktualisierungsintervall ändern

In `js/app.js` Zeile ~10:
```javascript
liveUpdateInterval: 3000  // In Millisekunden (3000 = 3 Sekunden)
```

## 📊 Dashboard Bereiche

### 1. Header
- Titel und Beschreibung
- Live-Indikator
- PDF Export Button
- Live Updates Toggle

### 2. Haupt-Statistiken (5 Cards)
- Gesamte Einsätze
- Netto Gewinn/Verlust
- Durchschnittlicher Einsatz
- Gewinnquote
- Höchster Einsatz

### 3. Filter & Steuerung
- Spieler-Filter Dropdown
- Spiel-Filter Dropdown
- Sortierung (Datum, Einsatz, Gewinn/Verlust)
- Zeitraum-Filter (Heute, Woche, Monat)

### 4. Erweiterte Statistiken
- **Top Spieler**: Top 3 nach Einsätzen
- **Spiel Performance**: Win/Loss Ratio pro Spieltyp
- **Volatilität**: Standardabweichung, Max Gewinn/Verlust

### 5. Diagramme
- Bar Chart: Einsätze nach Spieltyp
- Line Chart: Gewinn/Verlust Trend (letzte 24h)

### 6. Spielhistorie Tabelle
- Vollständige Aufzeichnung aller Spiele
- Sortierbar nach Spalten
- Paginierung
- Neue Einträge werden hervorgehoben

## 🎨 Design & Styling

### Farbschema
- **Hintergrund**: Tiefes Dunkelbraun (#0f0f0f)
- **Primär Akzent**: Gold (#d4af37) – wie deine Kronleuchter
- **Sekundär Akzent**: Grün (#4caf50) – Gewinn/Live
- **Rot**: Verlust (#ff6b6b)

### Responsive Design
- Desktop (1200px+): Volle Multi-Column Layouts
- Tablet (768px-1199px): 2-Column Layouts
- Mobile (<768px): Single Column, Touch-optimiert

### Dunkelmodus
Automatisch bei `prefers-color-scheme: dark` (CSS)

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🛠 Technologie Stack

- **HTML5** – Struktur
- **CSS3** – Styling (Flexbox, Grid)
- **JavaScript (ES6+)** – Logik
- **Chart.js 4.4** – Diagramme (CDN)
- **html2pdf 0.10** – PDF Export (CDN)

Keine Build-Tools oder Node.js Dependencies erforderlich!

## 🔐 Sicherheit

- ✅ Nur Client-seitige Verarbeitung (für Fake-Daten)
- ✅ Keine sensiblen Daten im lokalen Storage
- ✅ CORS-ready für API Integration
- ✅ Content Security Policy kompatibel

**Wichtig**: Bei echten Spielerdaten:
- Verwende HTTPS für API-Aufrufe
- Implementiere Authentifizierung/Autorisierung
- Verschlüssele vertrauliche Daten
- Folge GDPR/Datenschutzbestimmungen

## 📝 Logs & Debugging

Öffne die Browser-Console (F12) für:
- Errors und Warnings
- API-Aufrufe
- Performance-Messungen

```javascript
// Konsole debuggen:
console.log('filteredData:', filteredData);
console.log('Fehler bei API:', error);
```

## 🚀 Performance

- **Initiales Laden**: ~200ms (nur JS/CSS)
- **Live Update**: ~50ms (Daten hinzufügen + Re-render)
- **PDF Export**: ~2-3s (abhängig von Datenmenge)
- **Diagramm-Re-render**: ~100ms

Optimierungen:
- Chart-Instanzen werden zerstört/neu erstellt (nicht aktualisiert)
- DOM-Batch-Updates
- Debouncing bei Filteränderungen nicht notwendig (Events sind sparsam)

## 🐛 Known Issues

- PDF Export kann bei sehr vielen Daten langsam sein
- Mobile Safari: Pagination kann eng werden

## 📈 Zukünftige Features

- [ ] Echtzeit WebSocket-Verbindung
- [ ] Admin-Panel für Spieler-Management
- [ ] Export zu Excel/CSV
- [ ] Benutzer-Authentifizierung
- [ ] Mehrsprachige UI (EN, IT, FR)
- [ ] Dunkelmodus Toggle
- [ ] Mobile App (React Native)
- [ ] Benachrichtigungen (High Bets, Big Wins)

## 📞 Support & Kontakt

- **Repository**: https://github.com/crydo5-apps/crydo5-casino-baden-db
- **Issues**: GitHub Issues verwenden
- **Email**: support@crydo5.ch

## 📄 Lizenz

Proprietary - CRYDO5 GmbH
Nicht für öffentliche Nutzung freigegeben.

## 🙏 Danksagungen

- Chart.js für die großartige Visualisierungsbibliothek
- html2pdf für PDF-Export Funktionalität

---

**Entwickelt für CRYDO5 Casino Baden mit ❤️**
