# 🔗 API Integration Guide

Dieses Dokument erklärt, wie du deine echte Casino-Backend-API mit dem Dashboard verbindest.

## 📋 Inhaltsverzeichnis

1. [API Requirements](#api-requirements)
2. [Backend-Implementierung](#backend-implementierung)
3. [Frontend-Integration](#frontend-integration)
4. [Testing](#testing)
5. [Fehlerbehandlung](#fehlerbehandlung)

---

## API Requirements

### Basis Endpoints

Dein Backend sollte folgende Endpoints bereitstellen:

#### 1. GET `/api/games` - Alle Spiele abrufen

**Query Parameter:**
```
?player=<name>           // Optional: Filtern nach Spieler
?game=<type>            // Optional: Filtern nach Spieltyp
?limit=100              // Optional: Anzahl Einträge
?offset=0               // Optional: Pagination
?startDate=2026-09-01   // Optional: Von Datum
&endDate=2026-09-07     // Optional: Bis Datum
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "game_123",
      "timestamp": "2026-09-07T14:30:00Z",
      "player": "Alex Schmidt",
      "game": "Roulette",
      "bet": 150,
      "result": "Gewonnen",
      "profit": 200,
      "duration": 45,
      "tableId": "table_01"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 100
}
```

#### 2. GET `/api/games/latest` - Neuestes Spiel (für Live Updates)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "game_789",
    "timestamp": "2026-09-07T14:35:12Z",
    "player": "Maria Müller",
    "game": "Blackjack",
    "bet": 100,
    "result": "Verloren",
    "profit": -100,
    "duration": 30
  }
}
```

#### 3. GET `/api/stats` - Aggregierte Statistiken

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalBets": 45230,
    "totalProfit": 3450,
    "totalGames": 450,
    "winRate": 48.5,
    "averageBet": 100.5,
    "maxBet": 500,
    "volatility": 125.4
  }
}
```

#### 4. GET `/api/players` - Spieler-Liste

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "player_001",
      "name": "Alex Schmidt",
      "totalBets": 5000,
      "totalProfit": 500,
      "gamesPlayed": 50,
      "joinDate": "2026-01-15"
    }
  ]
}
```

---

## Backend-Implementierung

### Node.js / Express Beispiel

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// CORS konfigurieren (WICHTIG für Frontend!)
app.use(cors({
  origin: [
    'http://localhost:8000',
    'https://crydo5-apps.github.io',
    'https://casino-db.crydo5.ch'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Datenbank-Connection (Beispiel mit MongoDB)
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

// Game Schema
const gameSchema = new mongoose.Schema({
  timestamp: Date,
  player: String,
  game: String, // 'Roulette', 'Slots', 'Blackjack', 'Poker'
  bet: Number,
  result: String, // 'Gewonnen', 'Verloren', 'Draw'
  profit: Number,
  duration: Number, // in Sekunden
  tableId: String
});

const Game = mongoose.model('Game', gameSchema);

// === ENDPOINTS ===

// 1. Alle Spiele abrufen
app.get('/api/games', async (req, res) => {
  try {
    const { player, game, limit = 100, offset = 0, startDate, endDate } = req.query;
    
    let query = {};
    
    if (player) query.player = player;
    if (game) query.game = game;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const games = await Game.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Game.countDocuments(query);
    
    res.json({
      success: true,
      data: games,
      total,
      page: Math.floor(offset / limit) + 1,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Neuestes Spiel (für Live-Updates)
app.get('/api/games/latest', async (req, res) => {
  try {
    const latestGame = await Game.findOne()
      .sort({ timestamp: -1 });
    
    if (!latestGame) {
      return res.status(404).json({ success: false, error: 'No games found' });
    }
    
    res.json({ success: true, data: latestGame });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Aggregierte Statistiken
app.get('/api/stats', async (req, res) => {
  try {
    const games = await Game.find();
    
    const totalBets = games.reduce((sum, g) => sum + g.bet, 0);
    const totalProfit = games.reduce((sum, g) => sum + g.profit, 0);
    const winCount = games.filter(g => g.result === 'Gewonnen').length;
    
    const profits = games.map(g => g.profit);
    const mean = totalProfit / games.length;
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / games.length;
    const volatility = Math.sqrt(variance);
    
    res.json({
      success: true,
      data: {
        totalBets,
        totalProfit,
        totalGames: games.length,
        winRate: (winCount / games.length * 100).toFixed(2),
        averageBet: (totalBets / games.length).toFixed(2),
        maxBet: Math.max(...games.map(g => g.bet)),
        volatility: volatility.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Spieler-Liste
app.get('/api/players', async (req, res) => {
  try {
    const players = await Game.aggregate([
      {
        $group: {
          _id: '$player',
          totalBets: { $sum: '$bet' },
          totalProfit: { $sum: '$profit' },
          gamesPlayed: { $sum: 1 }
        }
      },
      { $sort: { totalBets: -1 } }
    ]);
    
    const result = players.map(p => ({
      id: `player_${p._id}`,
      name: p._id,
      totalBets: p.totalBets,
      totalProfit: p.totalProfit,
      gamesPlayed: p.gamesPlayed,
      winRate: ((p.gamesPlayed > 0 ? 50 : 0)).toFixed(2) // Simplif.
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Casino API Server läuft auf Port ${PORT}`);
});
```

---

## Frontend-Integration

### Schritt 1: Konfiguration anpassen

Bearbeite `js/app.js`:

```javascript
const CONFIG = {
  itemsPerPage: 10,
  liveUpdateInterval: 3000,
  apiBaseUrl: 'https://api.crydo5.ch' // ← Deine API URL
};
```

### Schritt 2: API-Funktionen hinzufügen

Füge zu `js/app.js` hinzu:

```javascript
// ============================================
// API FUNKTIONEN
// ============================================

async function fetchGamesFromAPI(filters = {}) {
  try {
    const params = new URLSearchParams({
      limit: 200,
      ...filters
    });
    
    const response = await fetch(
      `${CONFIG.apiBaseUrl}/api/games?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}` // Optional
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Fehler beim Abrufen von Spielen:', error);
    return [];
  }
}

async function fetchLatestGameFromAPI() {
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/games/latest`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const json = await response.json();
    
    if (json.success && json.data) {
      return {
        timestamp: new Date(json.data.timestamp).toLocaleString('de-DE'),
        game: json.data.game,
        bet: json.data.bet,
        result: json.data.result,
        profit: json.data.profit,
        player: json.data.player,
        date: new Date(json.data.timestamp)
      };
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des neuesten Spiels:', error);
    return null;
  }
}

async function fetchStatsFromAPI() {
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen von Statistiken:', error);
    return null;
  }
}

// Helper: Auth Token abrufen
function getAuthToken() {
  // Z.B. aus localStorage
  return localStorage.getItem('authToken') || '';
}
```

### Schritt 3: Initiale Daten aus API laden

Ersetze in `app.js` die `generateInitialData()` Funktion:

```javascript
async function generateInitialData() {
  if (CONFIG.apiBaseUrl) {
    // Echte Daten von API
    allData = await fetchGamesFromAPI();
    if (!allData.length) {
      console.warn('Keine Daten von API, verwende Fallback');
      allData = generateFallbackData();
    }
  } else {
    // Fallback: Fake Daten
    allData = generateFallbackData();
  }
  
  allData.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateFallbackData() {
  const data = [];
  for (let i = 0; i < 150; i++) {
    data.push(generateGameRecord());
  }
  return data;
}
```

### Schritt 4: Live-Updates mit API

Ersetze die `startLiveUpdates()` Funktion:

```javascript
function startLiveUpdates() {
  if (liveUpdatesActive) {
    updateInterval = setInterval(async () => {
      if (CONFIG.apiBaseUrl) {
        const newGame = await fetchLatestGameFromAPI();
        if (newGame && newGame.id !== allData[0]?.id) {
          allData.unshift(newGame);
          applyFilters();
        }
      } else {
        addRandomRecord(); // Fallback
      }
    }, CONFIG.liveUpdateInterval);
  }
}
```

---

## Testing

### Mit cURL testen

```bash
# Alle Spiele
curl -X GET "http://localhost:3000/api/games?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Neuestes Spiel
curl -X GET "http://localhost:3000/api/games/latest" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Statistiken
curl -X GET "http://localhost:3000/api/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Spieler
curl -X GET "http://localhost:3000/api/players" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mit Postman

1. Importiere diese Collection: [Postman Link]
2. Setze `{{base_url}}` Environment-Variable
3. Teste jeden Endpoint

### Browser Console

```javascript
// Teste API-Aufrufe direkt
fetch('http://localhost:3000/api/games?limit=10')
  .then(r => r.json())
  .then(d => console.log(d));
```

---

## Fehlerbehandlung

### HTTP Status Codes

```javascript
// In deiner API solltest du diese Codes zurückgeben:

200 OK                  // Erfolgreiche Anfrage
400 Bad Request        // Ungültige Parameter
401 Unauthorized       // Authentifizierung erforderlich
403 Forbidden          // Zugriff verweigert
404 Not Found          // Ressource nicht gefunden
500 Server Error       // Backend-Fehler
503 Service Unavailable // Server down
```

### Frontend Error Handling

```javascript
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      switch (response.status) {
        case 401:
          // Token erneuern oder re-login
          alert('Authentifizierung erforderlich');
          break;
        case 403:
          alert('Zugriff verweigert');
          break;
        case 404:
          alert('Daten nicht gefunden');
          break;
        case 500:
          alert('Server-Fehler. Bitte später versuchen');
          break;
        default:
          alert(`Fehler: ${response.status}`);
      }
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    alert('Verbindungsfehler. Überprüfe deine Internetverbindung');
    return null;
  }
}
```

### Retry-Logik

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      
      if (response.status >= 500) {
        // Server-Fehler → retry
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}
```

---

## Sicherheit

### Authentication

```javascript
// Login
async function login(username, password) {
  const response = await fetch(`${CONFIG.apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const { token } = await response.json();
  localStorage.setItem('authToken', token);
}

// Token in Requests verwenden
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
};
```

### HTTPS Only

```javascript
// In Production nur HTTPS erlauben
if (location.protocol !== 'https:' && !location.hostname.includes('localhost')) {
  location.protocol = 'https:';
}
```

### Rate Limiting

```javascript
// Frontend-seitige Rate Limiting
const requestQueue = [];
const maxRequests = 10;
const timeWindow = 60000; // 1 Minute

function checkRateLimit() {
  const now = Date.now();
  requestQueue = requestQueue.filter(time => now - time < timeWindow);
  
  if (requestQueue.length >= maxRequests) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }
  
  requestQueue.push(now);
}
```

---

## Production Checklist

- [ ] API-URL in Umgebungsvariable gespeichert
- [ ] CORS korrekt konfiguriert
- [ ] HTTPS erzwungen
- [ ] Authentication implementiert
- [ ] Error Handling vollständig
- [ ] Rate Limiting aktiviert
- [ ] Datenvalidierung auf beiden Seiten
- [ ] Logging/Monitoring eingerichtet
- [ ] Load-Tests durchgeführt

---

**Viel Erfolg beim API-Integration! 🚀**
