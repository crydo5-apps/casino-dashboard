// ============================================
// CRYDO5 Casino Baden - Dashboard
// Echtzeit Spielerstatistiken & Spielhistorie
// ============================================

// Konfiguration
const CONFIG = {
  itemsPerPage: 10,
  liveUpdateInterval: 3000, // 3 Sekunden
  apiBaseUrl: null // Setze hier deine API URL, wenn verfügbar
};

// Spieler und Spiele
const PLAYERS = ['Alex Schmidt', 'Maria Müller', 'Hans Weber', 'Julia Klein', 'Thomas Braun', 'Sandra König', 'Peter Hoffmann', 'Claudia Sauer', 'Michael Wagner', 'Sophia Keller'];
const GAMES = ['Roulette', 'Slots', 'Blackjack', 'Poker'];
const RESULTS = ['Gewonnen', 'Verloren', 'Draw'];

// State
let allData = [];
let filteredData = [];
let liveUpdatesActive = true;
let updateInterval = null;
let currentPage = 1;

// ============================================
// INITIALISIERUNG
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  generateInitialData();
  populatePlayerFilter();
  setupEventListeners();
  applyFilters();
  startLiveUpdates();
});

// ============================================
// DATEN GENERIERUNG
// ============================================

function generateInitialData() {
  allData = [];
  for (let i = 0; i < 150; i++) {
    allData.push(generateGameRecord());
  }
  allData.sort((a, b) => b.date - a.date);
}

function generateGameRecord() {
  const bet = Math.floor(Math.random() * 500) + 50;
  const result = RESULTS[Math.floor(Math.random() * RESULTS.length)];
  let profit;

  if (result === 'Gewonnen') {
    profit = Math.floor(Math.random() * 300) + 50;
  } else if (result === 'Verloren') {
    profit = -(Math.floor(Math.random() * 400) + 20);
  } else {
    profit = 0;
  }

  const now = new Date();
  const pastHours = Math.floor(Math.random() * 24);
  const timestamp = new Date(now.getTime() - pastHours * 3600000 - Math.random() * 3600000);

  return {
    timestamp: timestamp.toLocaleString('de-DE'),
    game: GAMES[Math.floor(Math.random() * GAMES.length)],
    bet: bet,
    result: result,
    profit: profit,
    player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
    date: timestamp
  };
}

// ============================================
// LIVE UPDATES
// ============================================

function startLiveUpdates() {
  if (liveUpdatesActive) {
    updateInterval = setInterval(addRandomRecord, CONFIG.liveUpdateInterval);
  }
}

function addRandomRecord() {
  if (!liveUpdatesActive) return;

  const newRecord = generateGameRecord();
  allData.unshift(newRecord);
  applyFilters();
}

function toggleLiveUpdates() {
  liveUpdatesActive = !liveUpdatesActive;
  const btn = document.getElementById('liveToggle');
  const indicator = document.getElementById('liveStatus');

  if (liveUpdatesActive) {
    btn.textContent = '⏸ Updates stoppen';
    indicator.innerHTML = '<div class="live-dot"></div><span>LIVE</span>';
    startLiveUpdates();
  } else {
    btn.textContent = '▶ Updates starten';
    indicator.innerHTML = '<span style="color: #999;">OFFLINE</span>';
    clearInterval(updateInterval);
  }
}

// ============================================
// FILTER & SORTIERUNG
// ============================================

function applyFilters() {
  const playerFilter = document.getElementById('playerFilter').value;
  const gameFilter = document.getElementById('gameFilter').value;
  const sortFilter = document.getElementById('sortFilter').value;
  const timeFilter = document.getElementById('timeFilter').value;

  const now = new Date();
  let startDate = new Date(0);

  if (timeFilter === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timeFilter === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeFilter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  filteredData = allData.filter(d => {
    return (!playerFilter || d.player === playerFilter) &&
      (!gameFilter || d.game === gameFilter) &&
      new Date(d.date) >= startDate;
  });

  // Sortierung
  if (sortFilter === 'amount') {
    filteredData.sort((a, b) => b.bet - a.bet);
  } else if (sortFilter === 'profit') {
    filteredData.sort((a, b) => b.profit - a.profit);
  }

  currentPage = 1;
  updateStats();
  updateAdvancedStats();
  updateCharts();
  updateTable();
}

// ============================================
// STATISTIKEN UPDATE
// ============================================

function updateStats() {
  const totalBet = filteredData.reduce((sum, d) => sum + d.bet, 0);
  const totalProfit = filteredData.reduce((sum, d) => sum + d.profit, 0);
  const avgBet = Math.round(totalBet / filteredData.length || 0);
  const winRate = Math.round((filteredData.filter(d => d.result === 'Gewonnen').length / filteredData.length * 100) || 0);
  const totalGames = filteredData.length;
  const maxBet = Math.max(...filteredData.map(d => d.bet), 0);

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Gesamte Einsätze</div>
      <div class="stat-value">€${totalBet.toLocaleString('de-DE')}</div>
      <div class="stat-change">+15% heute</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Netto Gewinn/Verlust</div>
      <div class="stat-value ${totalProfit >= 0 ? 'positive' : 'negative'}">€${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('de-DE')}</div>
      <div class="stat-change">über Zeit</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ø Einsatz</div>
      <div class="stat-value">€${avgBet.toLocaleString('de-DE')}</div>
      <div class="stat-change">${totalGames} Spiele</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Gewinnquote</div>
      <div class="stat-value">${winRate}%</div>
      <div class="stat-change">${filteredData.filter(d => d.result === 'Gewonnen').length} Siege</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Höchster Einsatz</div>
      <div class="stat-value">€${maxBet.toLocaleString('de-DE')}</div>
      <div class="stat-change">Diese Sitzung</div>
    </div>
  `;
}

function updateAdvancedStats() {
  // Top Spieler
  const playerStats = {};
  filteredData.forEach(d => {
    if (!playerStats[d.player]) playerStats[d.player] = { bets: 0, profit: 0, count: 0 };
    playerStats[d.player].bets += d.bet;
    playerStats[d.player].profit += d.profit;
    playerStats[d.player].count += 1;
  });

  const topPlayers = Object.entries(playerStats)
    .sort((a, b) => b[1].bets - a[1].bets)
    .slice(0, 3);

  document.getElementById('topPlayers').innerHTML = topPlayers.map(([name, data]) => `
    <div class="stat-item">
      <span class="stat-item-label">${name}</span>
      <span class="stat-item-value">€${data.bets.toLocaleString('de-DE')}</span>
    </div>
  `).join('');

  // Spiel Performance
  const gameStats = {};
  GAMES.forEach(g => gameStats[g] = { bets: 0, wins: 0 });
  filteredData.forEach(d => {
    gameStats[d.game].bets += d.bet;
    if (d.result === 'Gewonnen') gameStats[d.game].wins += 1;
  });

  document.getElementById('gamePerf').innerHTML = Object.entries(gameStats)
    .sort((a, b) => b[1].bets - a[1].bets)
    .map(([game, data]) => `
      <div class="stat-item">
        <span class="stat-item-label">${game}</span>
        <span class="stat-item-value">${data.wins}/${Object.values(gameStats).reduce((s, g) => s + g.wins, 0)}</span>
      </div>
    `).join('');

  // Volatilität
  const profits = filteredData.map(d => d.profit);
  const mean = profits.reduce((a, b) => a + b, 0) / profits.length || 0;
  const variance = profits.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / profits.length || 0;
  const stdDev = Math.sqrt(variance);
  const volatility = Math.round(stdDev);

  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);

  document.getElementById('volatility').innerHTML = `
    <div class="stat-item">
      <span class="stat-item-label">Standardabw.</span>
      <span class="stat-item-value">€${volatility}</span>
    </div>
    <div class="stat-item">
      <span class="stat-item-label">Max. Gewinn</span>
      <span class="stat-item-value positive">€${maxProfit}</span>
    </div>
    <div class="stat-item">
      <span class="stat-item-label">Max. Verlust</span>
      <span class="stat-item-value negative">€${minProfit}</span>
    </div>
  `;
}

// ============================================
// DIAGRAMME
// ============================================

function updateCharts() {
  updateGameChart();
  updateTrendChart();
}

function updateGameChart() {
  const gameStats = {};
  GAMES.forEach(g => gameStats[g] = 0);
  filteredData.forEach(d => gameStats[d.game] += d.bet);

  const ctx = document.getElementById('gameChart').getContext('2d');
  if (window.gameChartInstance) window.gameChartInstance.destroy();

  window.gameChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(gameStats),
      datasets: [{
        label: 'Einsätze (€)',
        data: Object.values(gameStats),
        backgroundColor: ['#d4af37', '#4caf50', '#ff5722', '#9c27b0'],
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#999' }, grid: { color: '#333' } },
        x: { ticks: { color: '#999' }, grid: { display: false } }
      }
    }
  });
}

function updateTrendChart() {
  const last24Hours = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    last24Hours.push(hour);
  }

  const trendData = last24Hours.map(hour => {
    return filteredData
      .filter(d => new Date(d.date).getHours() === hour.getHours())
      .reduce((sum, d) => sum + d.profit, 0);
  });

  const ctx = document.getElementById('trendChart').getContext('2d');
  if (window.trendChartInstance) window.trendChartInstance.destroy();

  window.trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last24Hours.map(h => h.getHours() + ':00'),
      datasets: [{
        label: 'Gewinn/Verlust (€)',
        data: trendData,
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#d4af37',
        pointBorderColor: '#1a1a1a',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: '#999' }, grid: { color: '#333' } },
        x: { ticks: { color: '#999' }, grid: { display: false } }
      }
    }
  });
}

// ============================================
// TABELLE
// ============================================

function updateTable() {
  const start = (currentPage - 1) * CONFIG.itemsPerPage;
  const end = start + CONFIG.itemsPerPage;
  const pageData = filteredData.slice(start, end);

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = pageData.map((d, idx) => `
    <tr ${idx === 0 && liveUpdatesActive ? 'class="new-record"' : ''}>
      <td>${d.timestamp}</td>
      <td>${d.player}</td>
      <td><span class="game-badge game-${d.game.toLowerCase()}"> ${d.game}</span></td>
      <td class="amount">€${d.bet.toLocaleString('de-DE')}</td>
      <td>${d.result}</td>
      <td class="amount ${d.profit >= 0 ? 'positive' : 'negative'}">€${d.profit >= 0 ? '+' : ''}${d.profit.toLocaleString('de-DE')}</td>
    </tr>
  `).join('');

  document.getElementById('recordCount').textContent = `${filteredData.length} Einträge`;

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      updateTable();
      window.scrollTo({
        top: document.querySelector('.table-container').offsetTop - 100,
        behavior: 'smooth'
      });
    };
    pagination.appendChild(btn);
  }
}

// ============================================
// PDF EXPORT
// ============================================

function exportPDF() {
  const modal = document.getElementById('exportModal');
  modal.classList.add('active');

  setTimeout(() => {
    const element = document.querySelector('.dashboard');
    const timestamp = new Date().toLocaleString('de-DE').replace(/[,:\/\s]/g, '-');
    const filename = `Casino-Report_${timestamp}.pdf`;

    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      modal.classList.remove('active');
    }).catch(err => {
      console.error('PDF Export Fehler:', err);
      modal.classList.remove('active');
    });
  }, 500);
}

// ============================================
// UI SETUP
// ============================================

function populatePlayerFilter() {
  const playerSelect = document.getElementById('playerFilter');
  PLAYERS.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p;
    playerSelect.appendChild(option);
  });
}

function setupEventListeners() {
  document.getElementById('playerFilter').addEventListener('change', applyFilters);
  document.getElementById('gameFilter').addEventListener('change', applyFilters);
  document.getElementById('sortFilter').addEventListener('change', applyFilters);
  document.getElementById('timeFilter').addEventListener('change', applyFilters);
}

// ============================================
// API INTEGRATION (Beispiel)
// ============================================

// Ersetze generateGameRecord() mit dieser Funktion für echte Daten:
/*
async function addRecordFromAPI() {
  if (!liveUpdatesActive || !CONFIG.apiBaseUrl) return;

  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/games/latest`);
    const newGame = await response.json();

    allData.unshift({
      timestamp: new Date(newGame.timestamp).toLocaleString('de-DE'),
      game: newGame.game,
      bet: newGame.bet,
      result: newGame.result,
      profit: newGame.profit,
      player: newGame.player,
      date: new Date(newGame.timestamp)
    });

    applyFilters();
  } catch (error) {
    console.error('API Fehler:', error);
  }
}
*/
