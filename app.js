const STORAGE_KEY = 'cs-dos-campeoes-local-data-v7';
const LEGACY_STORAGE_KEYS = ['cs-dos-campeoes-local-data-v6', 'cs-dos-campeoes-local-data-v5', 'cs-dos-campeoes-local-data-v4'];
const MATCH_POINTS = 500;

const MAPS = [
  { id: 'inferno', name: 'Inferno', image: 'https://images.steamusercontent.com/ugc/2506897342782811667/BEA8679BFA4DB3A22C49EEA0D8D7A4D09F0C7E50/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Clássico, caótico, utilitária voando e amigo gritando no Discord.' },
  { id: 'mirage', name: 'Mirage', image: 'https://images.steamusercontent.com/ugc/2059877063158746739/D855D1F3E66D2A4B9FBDA64E5E94AB7D2FC9D7C4/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'AWP no meio, janela aberta e alguém esquecendo a bomba.' },
  { id: 'nuke', name: 'Nuke', image: 'https://images.steamusercontent.com/ugc/2059877063158746626/628B369B41B72C345ABF09957F117A5DA95AA516/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Dois andares de confusão tática e call torta.' },
  { id: 'ancient', name: 'Ancient', image: 'https://images.steamusercontent.com/ugc/2059877063158746519/65EFB8232FB13A612651E90D2990D8C4D15A5A43/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Pedra, fumaça e todo mundo meio perdido.' },
  { id: 'anubis', name: 'Anubis', image: 'https://images.steamusercontent.com/ugc/2059877063158746482/6879F6D0FE2A4A2B0F653BB2FC5D5A25D7A84A97/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Água, porrada seca e fé no avanço.' },
  { id: 'dust2', name: 'Dust II', image: 'https://images.steamusercontent.com/ugc/2059877063158746588/418538AB71CA4A6E6C0466D26B857D3B6B534A31/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'O mapa da honra, do ego e do pixel.' },
  { id: 'vertigo', name: 'Vertigo', image: 'https://images.steamusercontent.com/ugc/2059877063158746776/4B998C3D3E81047F84F4EC0F5900A6BD7C7AE0C1/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Pra separar quem tem coragem de quem treme na rampa.' }
];

const STEAM_FALLBACK_PROFILES = {
  'https://steamcommunity.com/id/tarantine/': {
    steamId64: '76561198076321923',
    personaName: 'TARANTINE',
    avatar: 'https://avatars.cloudflare.steamstatic.com/2ed4d1f2a8e81b7d7d0f7f59c8e0bfe4f4f2e862_full.jpg',
    steamUrl: 'https://steamcommunity.com/id/TARANTINE/'
  }
};

const steamProfileInput = document.getElementById('steamProfileInput');
const playerSkillInput = document.getElementById('playerSkillInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const autoAssembleBtn = document.getElementById('autoAssembleBtn');
const clearBtn = document.getElementById('clearBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const rerollBtn = document.getElementById('rerollBtn');
const addAfterDrawBtn = document.getElementById('addAfterDrawBtn');
const startMatchBtn = document.getElementById('startMatchBtn');
const ctWinBtn = document.getElementById('ctWinBtn');
const tWinBtn = document.getElementById('tWinBtn');
const resetHistoryBtn = document.getElementById('resetHistoryBtn');
const nextMapBtn = document.getElementById('nextMapBtn');
const randomMapBtn = document.getElementById('randomMapBtn');
const mapRoulette = document.getElementById('mapRoulette');
const mapRouletteName = document.getElementById('mapRouletteName');
const databasePlayerList = document.getElementById('databasePlayerList');
const databaseCount = document.getElementById('databaseCount');
const playerList = document.getElementById('playerList');
const playerCount = document.getElementById('playerCount');
const teamA = document.getElementById('teamA');
const teamB = document.getElementById('teamB');
const rouletteNames = document.getElementById('rouletteNames');
const statusPill = document.getElementById('statusPill');
const rankingList = document.getElementById('rankingList');
const historyList = document.getElementById('historyList');
const matchSummary = document.getElementById('matchSummary');
const mapSelect = document.getElementById('mapSelect');
const mapBannerImage = document.getElementById('mapBannerImage');
const mapNameDisplay = document.getElementById('mapNameDisplay');
const mapDescription = document.getElementById('mapDescription');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const editMapSelect = document.getElementById('editMapSelect');
const editWinnerSelect = document.getElementById('editWinnerSelect');
const editCtPlayers = document.getElementById('editCtPlayers');
const editTPlayers = document.getElementById('editTPlayers');
const ctAverageDisplay = document.getElementById('ctAverageDisplay');
const tAverageDisplay = document.getElementById('tAverageDisplay');
const balanceDiffDisplay = document.getElementById('balanceDiffDisplay');
const steamPreview = document.getElementById('steamPreview');
const steamPreviewAvatar = document.getElementById('steamPreviewAvatar');
const steamPreviewName = document.getElementById('steamPreviewName');
const steamPreviewUrl = document.getElementById('steamPreviewUrl');

let players = [];
let isRolling = false;
let isMapRolling = false;
let currentDraw = null;
let currentMatch = null;
let editingMatchId = null;
let steamPreviewData = null;
let state = loadState();

function loadState() {
  const current = readStorageKey(STORAGE_KEY);
  const hasCurrentData = current && (current.playersDatabase?.length || current.history?.length || Object.keys(current.ranking || {}).length);
  if (hasCurrentData) return normalizeStateShape(current);

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = readStorageKey(legacyKey);
    const hasLegacyData = legacy && (legacy.playersDatabase?.length || legacy.history?.length || Object.keys(legacy.ranking || {}).length);
    if (hasLegacyData) {
      const migrated = normalizeStateShape(legacy);
      migrateLegacyPlayersDatabase(migrated);
      saveRawState(migrated);
      return migrated;
    }
  }

  return { playersDatabase: [], ranking: {}, history: [] };
}

function readStorageKey(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved && typeof saved === 'object' ? saved : null;
  } catch (error) {
    console.error(`Falha ao carregar ${key}`, error);
    return null;
  }
}

function normalizeStateShape(raw) {
  return {
    playersDatabase: Array.isArray(raw.playersDatabase) ? raw.playersDatabase : [],
    ranking: raw.ranking || {},
    history: Array.isArray(raw.history) ? raw.history : []
  };
}

function saveRawState(rawState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rawState));
}

function saveState() {
  saveRawState(state);
}

function migrateLegacyPlayersDatabase(targetState) {
  targetState.playersDatabase = (targetState.playersDatabase || []).map((entry) => {
    if (typeof entry === 'string') {
      return {
        name: entry,
        skill: 0,
        avatar: '',
        steamUrl: '',
        steamId64: ''
      };
    }

    return {
      name: normalizeName(entry?.personaName || entry?.name || ''),
      skill: normalizeSkill(entry?.skill),
      avatar: entry?.avatar || '',
      steamUrl: normalizeSteamUrl(entry?.steamUrl || ''),
      steamId64: entry?.steamId64 || ''
    };
  }).filter((entry) => entry.name);
}

function populateMapSelects() {
  const options = MAPS.map((map) => `<option value="${map.id}">${map.name}</option>`).join('');
  mapSelect.innerHTML = options;
  editMapSelect.innerHTML = options;
  mapSelect.value = 'inferno';
  updateMapBanner();
}

function getMapById(id) {
  return MAPS.find((map) => map.id === id) || MAPS[0];
}

function updateMapBanner() {
  const map = getMapById(mapSelect.value);
  mapBannerImage.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.42), rgba(0,0,0,.1)), url('${map.image}')`;
  mapNameDisplay.textContent = map.name;
  mapDescription.textContent = map.description;
}

function getCurrentMapIndex() {
  return Math.max(0, MAPS.findIndex((map) => map.id === mapSelect.value));
}

function goToNextMap() {
  const currentIndex = getCurrentMapIndex();
  const nextIndex = (currentIndex + 1) % MAPS.length;
  mapSelect.value = MAPS[nextIndex].id;
  updateMapBanner();
  setSummary(`Próximo mapa selecionado: ${MAPS[nextIndex].name}.`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateRandomMap() {
  if (isMapRolling) return;
  isMapRolling = true;
  randomMapBtn.disabled = true;
  nextMapBtn.disabled = true;
  mapRoulette.classList.remove('hidden');

  for (let i = 0; i < 18; i++) {
    const randomMap = MAPS[Math.floor(Math.random() * MAPS.length)];
    mapRouletteName.textContent = randomMap.name;
    await sleep(80 + i * 12);
  }

  const finalMap = MAPS[Math.floor(Math.random() * MAPS.length)];
  mapSelect.value = finalMap.id;
  mapRouletteName.textContent = finalMap.name;
  updateMapBanner();
  setSummary(`Mapa sorteado: ${finalMap.name}.`);

  await sleep(700);
  mapRoulette.classList.add('hidden');
  randomMapBtn.disabled = false;
  nextMapBtn.disabled = false;
  isMapRolling = false;
}

function normalizeName(name) {
  return String(name || '').trim();
}

function normalizeSkill(skill) {
  const parsed = Number(skill);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}

function formatSkill(skill) {
  return `${normalizeSkill(skill).toLocaleString('pt-BR')} CS`;
}

function normalizeSteamUrl(url) {
  return String(url || '').trim();
}

function getFallbackProfile(profileUrl) {
  const normalized = normalizeSteamUrl(profileUrl).toLowerCase();
  return STEAM_FALLBACK_PROFILES[normalized] || null;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseSteamProfileUrl(url) {
  const value = normalizeSteamUrl(url);
  if (!value) return null;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (hostname !== 'steamcommunity.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    if (parts[0].toLowerCase() === 'profiles') {
      return { type: 'profiles', value: parts[1], url: `https://steamcommunity.com/profiles/${parts[1]}/` };
    }

    if (parts[0].toLowerCase() === 'id') {
      return { type: 'id', value: parts[1], url: `https://steamcommunity.com/id/${parts[1]}/` };
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchSteamProfile(profileUrl) {
  const parsed = parseSteamProfileUrl(profileUrl);
  if (!parsed) {
    throw new Error('Use um link válido do perfil Steam.');
  }

  const fallback = getFallbackProfile(parsed.url);
  if (fallback) {
    return fallback;
  }

  throw new Error('Carregamento automático indisponível no momento para este perfil.');
}

function setSteamPreview(data) {
  steamPreviewData = data;
  if (!data) {
    steamPreview.classList.add('hidden');
    steamPreviewAvatar.src = '';
    steamPreviewName.textContent = 'Perfil encontrado';
    steamPreviewUrl.textContent = '';
    return;
  }

  steamPreview.classList.remove('hidden');
  steamPreviewAvatar.src = data.avatar || 'logo.png';
  steamPreviewName.textContent = data.personaName;
  steamPreviewUrl.textContent = data.steamUrl || '';
}

function getPlayerRecord(name) {
  const normalized = normalizeName(name).toLowerCase();
  return state.playersDatabase.find((player) => player.name.toLowerCase() === normalized) || null;
}

function getPlayerSkill(name) {
  return getPlayerRecord(name)?.skill || 0;
}

function getPlayerAvatar(name) {
  return getPlayerRecord(name)?.avatar || 'logo.png';
}

function getPlayerStats(name) {
  const record = state.ranking?.[name] || { wins: 0, losses: 0, points: 0, matches: 0 };
  return {
    wins: Number(record.wins) || 0,
    losses: Number(record.losses) || 0,
    points: Number(record.points) || 0,
    matches: Number(record.matches) || 0
  };
}

function getPlayerStatsHtml(name) {
  const stats = getPlayerStats(name);
  return `
    <div class="player-stat-chips">
      <span class="player-stat-chip">${stats.wins} vitórias</span>
      <span class="player-stat-chip">${stats.losses} derrotas</span>
      <span class="player-stat-chip">${stats.points} pontos</span>
    </div>
  `;
}

function addPlayerToDatabase(profile, skill = 0) {
  const normalizedName = normalizeName(profile.personaName);
  const normalizedSkill = normalizeSkill(skill);
  if (!normalizedName) return false;

  const existing = state.playersDatabase.find((player) => {
    return player.steamId64 && profile.steamId64
      ? player.steamId64 === profile.steamId64
      : player.name.toLowerCase() === normalizedName.toLowerCase();
  });

  if (existing) {
    existing.name = normalizedName;
    existing.skill = normalizedSkill;
    existing.avatar = profile.avatar || existing.avatar || '';
    existing.steamUrl = profile.steamUrl || existing.steamUrl || '';
    existing.steamId64 = profile.steamId64 || existing.steamId64 || '';
    ensurePlayersInRanking([normalizedName]);
    saveState();
    return 'updated';
  }

  state.playersDatabase.push({
    name: normalizedName,
    skill: normalizedSkill,
    avatar: profile.avatar || '',
    steamUrl: profile.steamUrl || '',
    steamId64: profile.steamId64 || ''
  });
  state.playersDatabase.sort((a, b) => a.name.localeCompare(b.name));
  ensurePlayersInRanking([normalizedName]);
  saveState();
  return 'created';
}

function removePlayerFromDatabase(name) {
  const normalized = normalizeName(name);
  state.playersDatabase = state.playersDatabase.filter((player) => player.name.toLowerCase() !== normalized.toLowerCase());
  players = players.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
  if (currentDraw) {
    currentDraw.ct = currentDraw.ct.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
    currentDraw.t = currentDraw.t.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
  }
  saveState();
  renderDatabasePlayers();
  renderPlayers();
  renderTeams(currentDraw?.ct || [], currentDraw?.t || []);
  renderRanking();
  setSummary(`${normalized} foi removido.`);
}

function ensurePlayersInRanking(names) {
  names.forEach((name) => {
    if (!state.ranking[name]) {
      state.ranking[name] = { points: 0, wins: 0, losses: 0, matches: 0 };
    }
  });
}

function applyMatchResultToPlayer(name, didWin) {
  const player = state.ranking[name];
  if (!player) return;
  player.matches += 1;
  if (didWin) {
    player.wins += 1;
    player.points += MATCH_POINTS;
    return;
  }
  player.losses += 1;
  player.points = Math.max(0, player.points - MATCH_POINTS);
}

function recomputeRankingFromHistory() {
  const existingPlayers = state.playersDatabase.map((player) => player.name);
  state.ranking = {};
  ensurePlayersInRanking(existingPlayers);

  state.history.forEach((match) => {
    const winners = match.winnerLabel === 'CT' ? match.ct : match.t;
    const losers = match.winnerLabel === 'CT' ? match.t : match.ct;
    ensurePlayersInRanking([...match.ct, ...match.t]);
    winners.forEach((name) => applyMatchResultToPlayer(name, true));
    losers.forEach((name) => applyMatchResultToPlayer(name, false));
  });

  saveState();
}

function getTierLabel(points) {
  if (points >= 5000) return 'Global Elite';
  if (points >= 3500) return 'Supremo';
  if (points >= 2500) return 'Águia Lendária';
  if (points >= 1500) return 'AK Brabíssimo';
  if (points >= 500) return 'Guardião Mestre';
  return 'Gold Nova';
}

function setSummary(text, isVictory = false) {
  matchSummary.textContent = text;
  matchSummary.classList.toggle('victory', isVictory);
}

function getAverageSkill(team) {
  if (!team.length) return 0;
  const total = team.reduce((sum, playerName) => sum + getPlayerSkill(playerName), 0);
  return Math.round(total / team.length);
}

function updateBalanceDisplay() {
  const ctAverage = currentDraw ? getAverageSkill(currentDraw.ct) : 0;
  const tAverage = currentDraw ? getAverageSkill(currentDraw.t) : 0;
  const diff = Math.abs(ctAverage - tAverage);
  ctAverageDisplay.textContent = ctAverage.toLocaleString('pt-BR');
  tAverageDisplay.textContent = tAverage.toLocaleString('pt-BR');
  balanceDiffDisplay.textContent = diff.toLocaleString('pt-BR');
}

function renderDatabasePlayers() {
  databaseCount.textContent = `${state.playersDatabase.length} cadastrados`;
  databasePlayerList.innerHTML = '';

  if (!state.playersDatabase.length) {
    databasePlayerList.innerHTML = '<li class="empty-state">Nenhum jogador cadastrado ainda.</li>';
    return;
  }

  state.playersDatabase.forEach((player) => {
    const inLobby = players.some((name) => name.toLowerCase() === player.name.toLowerCase());
    const item = document.createElement('li');
    item.className = 'name-item db-item';
    item.innerHTML = `
      <div class="db-player-main">
        <img class="player-avatar" src="${escapeHtml(player.avatar || 'logo.png')}" alt="${escapeHtml(player.name)}">
        <div class="db-player-meta">
          <strong>${escapeHtml(player.name)}</strong>
          <small class="db-skill">CSficação: ${formatSkill(player.skill)}</small>
          ${getPlayerStatsHtml(player.name)}
        </div>
      </div>
      <div class="db-actions">
        <button class="small-action add-db-btn" data-name="${escapeHtml(player.name)}" ${(inLobby || players.length >= 10) ? 'disabled' : ''}>+</button>
        <button class="small-action remove-db-btn" data-name="${escapeHtml(player.name)}">×</button>
      </div>
    `;
    databasePlayerList.appendChild(item);
  });
}

function renderPlayers() {
  playerCount.textContent = `${players.length} / 10`;
  playerList.innerHTML = '';

  if (!players.length) {
    playerList.innerHTML = '<li class="empty-state">Nenhum jogador no lobby ainda.</li>';
  }

  players.forEach((name, index) => {
    const item = document.createElement('li');
    item.className = 'name-item';
    item.innerHTML = `
      <div class="lobby-player-main">
        <img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}">
        <div class="db-player-meta">
          <strong>${index + 1}. ${escapeHtml(name)}</strong>
          <small class="db-skill">CSficação: ${formatSkill(getPlayerSkill(name))}</small>
        </div>
      </div>
      <button class="remove-btn" data-index="${index}" aria-label="Remover ${escapeHtml(name)}">×</button>
    `;
    playerList.appendChild(item);
  });

  renderDatabasePlayers();
  updateBalanceDisplay();
}

function renderTeams(ct, t) {
  teamA.innerHTML = '';
  teamB.innerHTML = '';

  if (!ct.length && !t.length) {
    teamA.innerHTML = '<li class="empty-state">Time CT vazio.</li>';
    teamB.innerHTML = '<li class="empty-state">Time TR vazio.</li>';
    updateBalanceDisplay();
    return;
  }

  ct.forEach((name) => {
    const item = document.createElement('li');
    item.className = 'team-item';
    item.innerHTML = `
      <div class="lobby-player-main">
        <img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}">
        <div class="db-player-meta">
          <strong>${escapeHtml(name)}</strong>
          <small class="db-skill">CSficação: ${formatSkill(getPlayerSkill(name))}</small>
        </div>
      </div>
    `;
    teamA.appendChild(item);
  });

  t.forEach((name) => {
    const item = document.createElement('li');
    item.className = 'team-item';
    item.innerHTML = `
      <div class="lobby-player-main">
        <img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}">
        <div class="db-player-meta">
          <strong>${escapeHtml(name)}</strong>
          <small class="db-skill">CSficação: ${formatSkill(getPlayerSkill(name))}</small>
        </div>
      </div>
    `;
    teamB.appendChild(item);
  });

  updateBalanceDisplay();
}

function renderRanking() {
  rankingList.innerHTML = '';
  const entries = Object.entries(state.ranking || {}).sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
    return a[0].localeCompare(b[0]);
  });

  if (!entries.length) {
    rankingList.innerHTML = '<li class="empty-state">Ainda não existe ranking salvo.</li>';
    return;
  }

  entries.forEach(([name, data], index) => {
    const pointsClass = data.points >= 0 ? 'rank-points positive' : 'rank-points negative';
    const item = document.createElement('li');
    item.className = 'ranking-item';
    item.innerHTML = `
      <div class="rank-emblem"><span>#${index + 1}</span></div>
      <div>
        <div class="rank-name">${escapeHtml(name)}</div>
        <div class="rank-meta">${data.wins}V • ${data.losses}D • ${data.matches} partidas</div>
      </div>
      <div class="rank-right">
        <div class="${pointsClass}">${data.points > 0 ? '+' : ''}${data.points}</div>
        <div class="rank-tier">${getTierLabel(data.points)}</div>
      </div>
    `;
    rankingList.appendChild(item);
  });
}

function renderHistory() {
  historyList.innerHTML = '';

  if (!state.history.length) {
    historyList.innerHTML = '<li class="empty-state">Nenhuma partida registrada ainda.</li>';
    return;
  }

  [...state.history].reverse().forEach((match) => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-header">
        <strong>${escapeHtml(match.mapName)}</strong>
        <span class="small-pill">${escapeHtml(match.winnerLabel)}</span>
      </div>
      <p class="panel-text">${escapeHtml(match.ct.join(', '))}</p>
      <p class="panel-text">${escapeHtml(match.t.join(', '))}</p>
      <div class="actions-row">
        <button class="ghost-btn edit-history-btn" data-id="${escapeHtml(match.id)}">Editar</button>
      </div>
    `;
    historyList.appendChild(item);
  });
}

function addPlayerToLobby(name) {
  if (players.length >= 10) {
    setSummary('O lobby já está cheio.');
    return;
  }
  if (players.some((player) => player.toLowerCase() === name.toLowerCase())) {
    setSummary(`${name} já está no lobby.`);
    return;
  }
  players.push(name);
  renderPlayers();
}

function removePlayerFromLobby(index) {
  players.splice(index, 1);
  renderPlayers();
}

function autoAssembleLobby() {
  const available = state.playersDatabase
    .map((player) => player.name)
    .filter((name) => !players.some((current) => current.toLowerCase() === name.toLowerCase()));

  while (players.length < 10 && available.length) {
    const randomIndex = Math.floor(Math.random() * available.length);
    players.push(available.splice(randomIndex, 1)[0]);
  }

  renderPlayers();
}

function shuffleArray(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBalancedTeams(list) {
  const sorted = [...list].sort((a, b) => getPlayerSkill(b) - getPlayerSkill(a));
  const ct = [];
  const t = [];
  let ctScore = 0;
  let tScore = 0;

  sorted.forEach((player) => {
    const playerSkill = getPlayerSkill(player);
    if (ct.length >= 5) {
      t.push(player);
      tScore += playerSkill;
      return;
    }
    if (t.length >= 5) {
      ct.push(player);
      ctScore += playerSkill;
      return;
    }
    if (ctScore <= tScore) {
      ct.push(player);
      ctScore += playerSkill;
    } else {
      t.push(player);
      tScore += playerSkill;
    }
  });

  return { ct, t };
}

async function animateDraw() {
  if (players.length !== 10) {
    setSummary('O lobby precisa ter 10 jogadores para sortear os times.');
    return;
  }
  if (isRolling) return;

  isRolling = true;
  shuffleBtn.disabled = true;
  rerollBtn.disabled = true;
  rouletteNames.textContent = 'SORTEANDO';

  for (let i = 0; i < 16; i += 1) {
    rouletteNames.textContent = shuffleArray(players).slice(0, 3).join(' • ');
    await sleep(80 + i * 12);
  }

  currentDraw = buildBalancedTeams(players);
  renderTeams(currentDraw.ct, currentDraw.t);
  rouletteNames.textContent = 'TIMES PRONTOS';
  statusPill.textContent = 'Times sorteados';
  setSummary('Times sorteados. Confira os dois lados e comece a partida.');

  shuffleBtn.disabled = false;
  rerollBtn.disabled = false;
  isRolling = false;
}

function startMatch() {
  if (!currentDraw || currentDraw.ct.length !== 5 || currentDraw.t.length !== 5) {
    setSummary('Sorteie os times antes de começar a partida.');
    return;
  }

  currentMatch = {
    id: crypto.randomUUID(),
    mapId: mapSelect.value,
    mapName: getMapById(mapSelect.value).name,
    ct: [...currentDraw.ct],
    t: [...currentDraw.t],
    createdAt: new Date().toISOString(),
    winnerLabel: ''
  };

  statusPill.textContent = 'Partida em andamento';
  setSummary(`Partida iniciada em ${currentMatch.mapName}.`);
}

function finalizeMatch(winnerLabel) {
  if (!currentMatch) {
    setSummary('Comece a partida antes de registrar o vencedor.');
    return;
  }

  currentMatch.winnerLabel = winnerLabel;
  state.history.push({ ...currentMatch });

  ensurePlayersInRanking([...currentMatch.ct, ...currentMatch.t]);
  const winners = winnerLabel === 'CT' ? currentMatch.ct : currentMatch.t;
  const losers = winnerLabel === 'CT' ? currentMatch.t : currentMatch.ct;
  winners.forEach((name) => applyMatchResultToPlayer(name, true));
  losers.forEach((name) => applyMatchResultToPlayer(name, false));

  saveState();
  renderDatabasePlayers();
  renderRanking();
  renderHistory();
  statusPill.textContent = 'Partida finalizada';
  setSummary(`${winnerLabel} venceu em ${currentMatch.mapName}. Ranking atualizado.`, true);
  currentMatch = null;
}

function openEditModal(matchId) {
  const match = state.history.find((entry) => entry.id === matchId);
  if (!match) return;
  editingMatchId = matchId;
  editMapSelect.value = match.mapId;
  editWinnerSelect.value = match.winnerLabel;
  editCtPlayers.value = match.ct.join('\n');
  editTPlayers.value = match.t.join('\n');
  editModal.classList.remove('hidden');
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editingMatchId = null;
}

function saveEditedMatch() {
  const match = state.history.find((entry) => entry.id === editingMatchId);
  if (!match) return;

  match.mapId = editMapSelect.value;
  match.mapName = getMapById(editMapSelect.value).name;
  match.winnerLabel = editWinnerSelect.value;
  match.ct = editCtPlayers.value.split('\n').map((entry) => normalizeName(entry)).filter(Boolean);
  match.t = editTPlayers.value.split('\n').map((entry) => normalizeName(entry)).filter(Boolean);

  recomputeRankingFromHistory();
  renderDatabasePlayers();
  renderRanking();
  renderHistory();
  closeEditModal();
  setSummary('Partida editada com sucesso.');
}

async function handleSteamLookupPreview() {
  const url = steamProfileInput.value.trim();
  if (!url) {
    setSteamPreview(null);
    return;
  }

  steamPreview.classList.remove('hidden');
  steamPreviewAvatar.src = 'logo.png';
  steamPreviewName.textContent = 'Carregando perfil Steam...';
  steamPreviewUrl.textContent = '';

  try {
    const profile = await fetchSteamProfile(url);
    setSteamPreview({ ...profile, inputUrl: normalizeSteamUrl(url) });
    setSummary(`Perfil carregado: ${profile.personaName}.`);
  } catch (error) {
    setSteamPreview(null);
    setSummary(error.message || 'Não foi possível ler esse perfil Steam agora.');
  }
}

async function handleAddPlayer() {
  const steamUrl = steamProfileInput.value.trim();
  const skill = playerSkillInput.value;

  if (!steamUrl) {
    setSummary('Cole o link do perfil Steam antes de cadastrar.');
    return;
  }

  addPlayerBtn.disabled = true;
  addPlayerBtn.textContent = 'Carregando...';
  setSummary('Buscando dados do perfil Steam...');

  try {
    const normalizedInput = normalizeSteamUrl(steamUrl);
    const profile = steamPreviewData && steamPreviewData.inputUrl === normalizedInput
      ? steamPreviewData
      : { ...(await fetchSteamProfile(steamUrl)), inputUrl: normalizedInput };

    const result = addPlayerToDatabase(profile, skill);
    renderDatabasePlayers();
    renderRanking();
    setSteamPreview(profile);
    steamProfileInput.value = profile.steamUrl;
    playerSkillInput.value = '';

    if (result === 'updated') {
      setSummary(`${profile.personaName} já existia e foi atualizado.`);
    } else {
      setSummary(`${profile.personaName} foi cadastrado com sucesso.`);
    }
  } catch (error) {
    setSummary(error.message || 'Não foi possível cadastrar esse perfil Steam.');
  } finally {
    addPlayerBtn.disabled = false;
    addPlayerBtn.textContent = 'Cadastrar';
  }
}

function resetAllData() {
  if (!window.confirm('Tem certeza que deseja resetar todos os dados locais?')) return;
  state = { playersDatabase: [], ranking: {}, history: [] };
  players = [];
  currentDraw = null;
  currentMatch = null;
  saveState();
  renderEverything();
  setSummary('Todos os dados locais foram resetados.');
}

function wireEvents() {
  addPlayerBtn.addEventListener('click', handleAddPlayer);
  steamProfileInput.addEventListener('change', handleSteamLookupPreview);
  steamProfileInput.addEventListener('blur', handleSteamLookupPreview);
  autoAssembleBtn.addEventListener('click', autoAssembleLobby);
  clearBtn.addEventListener('click', () => {
    players = [];
    currentDraw = null;
    renderPlayers();
    renderTeams([], []);
    setSummary('Lobby limpo.');
  });
  shuffleBtn.addEventListener('click', animateDraw);
  rerollBtn.addEventListener('click', animateDraw);
  addAfterDrawBtn.addEventListener('click', () => setSummary('Adicione mais jogadores ao lobby antes do próximo sorteio.'));
  startMatchBtn.addEventListener('click', startMatch);
  ctWinBtn.addEventListener('click', () => finalizeMatch('CT'));
  tWinBtn.addEventListener('click', () => finalizeMatch('TR'));
  resetHistoryBtn.addEventListener('click', resetAllData);
  nextMapBtn.addEventListener('click', goToNextMap);
  randomMapBtn.addEventListener('click', animateRandomMap);
  mapSelect.addEventListener('change', updateMapBanner);
  closeModalBtn.addEventListener('click', closeEditModal);
  saveEditBtn.addEventListener('click', saveEditedMatch);
  editModal.addEventListener('click', (event) => {
    if (event.target === editModal) closeEditModal();
  });

  databasePlayerList.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-db-btn');
    if (addButton) {
      addPlayerToLobby(addButton.dataset.name);
      return;
    }

    const removeButton = event.target.closest('.remove-db-btn');
    if (removeButton) {
      removePlayerFromDatabase(removeButton.dataset.name);
    }
  });

  playerList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-btn');
    if (!removeButton) return;
    removePlayerFromLobby(Number(removeButton.dataset.index));
  });

  historyList.addEventListener('click', (event) => {
    const editButton = event.target.closest('.edit-history-btn');
    if (!editButton) return;
    openEditModal(editButton.dataset.id);
  });

  window.addEventListener('storage', () => {
    state = loadState();
    renderEverything();
  });
}

function renderEverything() {
  populateMapSelects();
  renderDatabasePlayers();
  renderPlayers();
  renderTeams(currentDraw?.ct || [], currentDraw?.t || []);
  renderRanking();
  renderHistory();
  updateBalanceDisplay();
}

wireEvents();
renderEverything();
setSummary('Cole o link do perfil Steam e cadastre a galera rapidamente.');
