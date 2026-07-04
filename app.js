const STORAGE_KEY = 'cs-dos-campeoes-local-data-v7';
const ADMIN_STORAGE_KEY = 'cs-dos-campeoes-admin-v1';
const ADMIN_SESSION_KEY = 'cs-dos-campeoes-admin-session';
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
    avatar: 'https://avatars.fastly.steamstatic.com/ae3624efee29ed79e60ee5643b93108c368dacc7_full.jpg',
    steamUrl: 'https://steamcommunity.com/id/TARANTINE/'
  },
};

const STEAM_XML_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://cors.isomorphic-git.org/${url}`
];

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

function loadAdminState() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));
    return {
      admins: Array.isArray(raw?.admins) ? raw.admins : [],
      logs: Array.isArray(raw?.logs) ? raw.logs : []
    };
  } catch {
    return { admins: [], logs: [] };
  }
}

function saveAdminState(adminState) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminState));
}

function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY));
  } catch {
    return null;
  }
}

function isAdminLogged() {
  const session = getAdminSession();
  const adminState = loadAdminState();
  return !!(session?.id && adminState.admins.some((admin) => admin.id === session.id));
}

function addAdminLog(type, message, meta = {}) {
  const adminState = loadAdminState();
  const session = getAdminSession();
  adminState.logs.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    message,
    meta,
    admin: session?.username || null,
    createdAt: new Date().toISOString()
  });
  adminState.logs = adminState.logs.slice(0, 250);
  saveAdminState(adminState);
}

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
    playersDatabase: Array.isArray(raw?.playersDatabase) ? raw.playersDatabase : [],
    ranking: raw?.ranking || {},
    history: Array.isArray(raw?.history) ? raw.history : []
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

function getXmlTextContent(xmlDoc, tagName) {
  return xmlDoc.querySelector(tagName)?.textContent?.trim() || '';
}

function parseSteamProfileXml(xmlText, fallbackUrl) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Resposta inválida da Steam.');
  }

  const steamId64 = getXmlTextContent(xmlDoc, 'steamID64');
  const personaName = getXmlTextContent(xmlDoc, 'steamID');
  const avatar = getXmlTextContent(xmlDoc, 'avatarFull') || getXmlTextContent(xmlDoc, 'avatarMedium') || getXmlTextContent(xmlDoc, 'avatarIcon');
  const profileUrl = getXmlTextContent(xmlDoc, 'customURL')
    ? `https://steamcommunity.com/id/${getXmlTextContent(xmlDoc, 'customURL')}/`
    : (steamId64 ? `https://steamcommunity.com/profiles/${steamId64}/` : fallbackUrl);

  if (!steamId64 || !personaName) {
    throw new Error('Perfil Steam sem dados públicos suficientes.');
  }

  return {
    steamId64,
    personaName,
    avatar,
    steamUrl: profileUrl
  };
}

async function fetchSteamXmlThroughProxies(targetUrl) {
  let lastError = null;

  for (const buildProxyUrl of STEAM_XML_PROXIES) {
    const proxyUrl = buildProxyUrl(targetUrl);
    try {
      const response = await fetch(proxyUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!text || text.includes('<title>Access Denied</title>')) {
        throw new Error('Resposta vazia ou bloqueada.');
      }
      return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Falha ao consultar a Steam.');
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

  const xmlUrl = `${parsed.url}?xml=1`;
  try {
    const xmlText = await fetchSteamXmlThroughProxies(xmlUrl);
    return parseSteamProfileXml(xmlText, parsed.url);
  } catch {
    if (parsed.type === 'profiles') {
      return {
        steamId64: parsed.value,
        personaName: `Steam ${parsed.value.slice(-6)}`,
        avatar: 'logo.png',
        steamUrl: parsed.url
      };
    }
    throw new Error('Não foi possível carregar esse perfil Steam agora. Se o perfil for privado, a Steam pode bloquear os dados.');
  }
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
    addAdminLog('cadastro', `Perfil ${normalizedName} atualizado no cadastro.`, { player: normalizedName });
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
  addAdminLog('cadastro', `Perfil ${normalizedName} cadastrado via Steam.`, { player: normalizedName });
  return 'created';
}

function removePlayerFromDatabase(name) {
  if (!isAdminLogged()) {
    setSummary('Apenas administradores podem remover jogadores cadastrados.');
    return;
  }

  const normalized = normalizeName(name);
  state.playersDatabase = state.playersDatabase.filter((player) => player.name.toLowerCase() !== normalized.toLowerCase());
  players = players.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
  if (currentDraw) {
    currentDraw.ct = currentDraw.ct.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
    currentDraw.t = currentDraw.t.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
  }
  saveState();
  addAdminLog('jogador', `${normalized} foi removido do cadastro principal.`, { player: normalized });
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
}

function setSummary(text, type = '') {
  matchSummary.textContent = text;
  matchSummary.classList.remove('victory');
  if (type === 'victory') {
    matchSummary.classList.add('victory');
  }
}

function updateStatus(label) {
  statusPill.textContent = label;
}

function renderDatabasePlayers() {
  databaseCount.textContent = `${state.playersDatabase.length} cadastrados`;
  if (!state.playersDatabase.length) {
    databasePlayerList.innerHTML = '<li class="empty-state">Nenhum jogador cadastrado ainda.</li>';
    return;
  }

  const adminVisible = isAdminLogged();
  databasePlayerList.innerHTML = state.playersDatabase.map((player) => `
    <li class="name-item db-item">
      <div class="db-player-main">
        <img class="player-avatar" src="${escapeHtml(player.avatar || 'logo.png')}" alt="${escapeHtml(player.name)}" />
        <div class="db-player-meta">
          <strong>${escapeHtml(player.name)}</strong>
          <span class="db-skill">CSficação: ${normalizeSkill(player.skill).toLocaleString('pt-BR')}</span>
          ${getPlayerStatsHtml(player.name)}
        </div>
      </div>
      <div class="db-actions">
        <button class="small-action add-db-btn" data-add-db="${escapeHtml(player.name)}">+</button>
        ${adminVisible ? `<button class="small-action remove-db-btn" data-remove-db="${escapeHtml(player.name)}">×</button>` : ''}
      </div>
    </li>
  `).join('');
}

function renderPlayers() {
  playerCount.textContent = `${players.length} / 10`;
  if (!players.length) {
    playerList.innerHTML = '<li class="empty-state">Nenhum jogador no lobby ainda.</li>';
    return;
  }

  playerList.innerHTML = players.map((name) => `
    <li class="name-item">
      <div class="lobby-player-main">
        <img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}" />
        <div class="db-player-meta">
          <strong>${escapeHtml(name)}</strong>
          <span class="db-skill">CSficação: ${getPlayerSkill(name).toLocaleString('pt-BR')}</span>
        </div>
      </div>
      <button class="remove-btn" data-remove-lobby="${escapeHtml(name)}">×</button>
    </li>
  `).join('');
}

function calculateTeamAverage(team) {
  if (!team.length) return 0;
  const total = team.reduce((sum, player) => sum + player.skill, 0);
  return Math.round(total / team.length);
}

function updateBalanceDisplays(ctTeam, tTeam) {
  const ctAvg = calculateTeamAverage(ctTeam);
  const tAvg = calculateTeamAverage(tTeam);
  ctAverageDisplay.textContent = ctAvg.toLocaleString('pt-BR');
  tAverageDisplay.textContent = tAvg.toLocaleString('pt-BR');
  balanceDiffDisplay.textContent = Math.abs(ctAvg - tAvg).toLocaleString('pt-BR');
}

function renderTeams(ctNames, tNames) {
  const renderTeam = (list, names) => {
    if (!names.length) {
      list.innerHTML = '<li class="empty-state">Ainda sem jogadores.</li>';
      return;
    }

    list.innerHTML = names.map((name) => `
      <li class="team-item">
        <div class="lobby-player-main">
          <img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}" />
          <div class="db-player-meta">
            <strong>${escapeHtml(name)}</strong>
            <span class="db-skill">CSficação: ${getPlayerSkill(name).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </li>
    `).join('');
  };

  renderTeam(teamA, ctNames);
  renderTeam(teamB, tNames);

  const ctSkillTeam = ctNames.map((name) => ({ name, skill: getPlayerSkill(name) }));
  const tSkillTeam = tNames.map((name) => ({ name, skill: getPlayerSkill(name) }));
  updateBalanceDisplays(ctSkillTeam, tSkillTeam);
}

function getSortedRankingEntries() {
  const names = new Set([
    ...state.playersDatabase.map((player) => player.name),
    ...Object.keys(state.ranking || {})
  ]);

  ensurePlayersInRanking([...names]);

  return [...names].map((name) => ({
    name,
    ...state.ranking[name]
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name);
  });
}

function getRankTier(points) {
  if (points >= 10000) return 'Global Elite';
  if (points >= 8000) return 'Supreme';
  if (points >= 6500) return 'Legendary Eagle';
  if (points >= 5000) return 'DMG';
  if (points >= 3500) return 'Master Guardian';
  if (points >= 2200) return 'Gold Nova';
  return 'Silver';
}

function renderRanking() {
  const entries = getSortedRankingEntries();
  if (!entries.length) {
    rankingList.innerHTML = '<li class="empty-state">Nenhum jogador no ranking ainda.</li>';
    return;
  }

  rankingList.innerHTML = entries.map((entry, index) => `
    <li class="ranking-item">
      <div class="rank-emblem">#${index + 1}</div>
      <div>
        <div class="rank-name">${escapeHtml(entry.name)}</div>
        <div class="rank-tier">${getRankTier(entry.points)} · ${entry.wins}V / ${entry.losses}D</div>
      </div>
      <div class="rank-right">
        <div class="rank-points">${entry.points.toLocaleString('pt-BR')}</div>
        <div class="rank-meta">${entry.matches} partidas</div>
      </div>
    </li>
  `).join('');
}

function buildHistoryItem(match) {
  const recordedLabel = new Date(match.recordedAt).toLocaleString('pt-BR');

  return `
    <li class="history-item">
      <div class="history-topline">
        <strong>${escapeHtml(match.mapName)}</strong>
        <span>${recordedLabel}</span>
      </div>
      <div class="history-body">
        <span><strong>CT:</strong> ${escapeHtml(match.ct.join(', '))}</span>
        <span><strong>TR:</strong> ${escapeHtml(match.t.join(', '))}</span>
        <span><strong>Vencedor:</strong> ${match.winnerLabel}</span>
      </div>
      <div class="history-actions">
        <button class="ghost-btn compact-btn" data-edit-match="${match.id}">Editar</button>
      </div>
    </li>
  `;
}

function renderHistory() {
  if (!state.history.length) {
    historyList.innerHTML = '<li class="empty-state">Nenhuma partida registrada ainda.</li>';
    return;
  }

  historyList.innerHTML = [...state.history]
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    .map(buildHistoryItem)
    .join('');
}

function startRouletteAnimation(pool) {
  const sample = pool.map((player) => player.name);
  let index = 0;
  rouletteNames.textContent = 'SORTEANDO';
  return setInterval(() => {
    rouletteNames.textContent = sample.slice(index, index + 4).join(' • ') || sample.join(' • ');
    index = (index + 1) % sample.length;
  }, 120);
}

function createBalancedTeams() {
  const enriched = players.map((name) => ({ name, skill: getPlayerSkill(name) }));
  const sorted = [...enriched].sort((a, b) => b.skill - a.skill);
  const ct = [];
  const t = [];

  sorted.forEach((player, index) => {
    const ctAvg = calculateTeamAverage(ct);
    const tAvg = calculateTeamAverage(t);

    if (ct.length >= 5) {
      t.push(player);
      return;
    }

    if (t.length >= 5) {
      ct.push(player);
      return;
    }

    if (index % 2 === 0) {
      (ctAvg <= tAvg ? ct : t).push(player);
    } else {
      (ctAvg > tAvg ? ct : t).push(player);
    }
  });

  return {
    ct: ct.map((player) => player.name),
    t: t.map((player) => player.name),
    ctPlayers: ct,
    tPlayers: t
  };
}

async function drawTeams() {
  if (players.length !== 10) {
    setSummary('O lobby precisa ter exatamente 10 jogadores para sortear os times.');
    return;
  }

  if (isRolling) return;
  isRolling = true;
  updateStatus('Sorteando');
  shuffleBtn.disabled = true;
  rerollBtn.disabled = true;

  const pool = players.map((name) => ({ name, skill: getPlayerSkill(name) }));
  const animation = startRouletteAnimation(pool);
  await sleep(1800);
  clearInterval(animation);

  currentDraw = createBalancedTeams();
  renderTeams(currentDraw.ct, currentDraw.t);
  rouletteNames.textContent = `${currentDraw.ct.join(' • ')}  VS  ${currentDraw.t.join(' • ')}`;
  setSummary(`Times sorteados em ${getMapById(mapSelect.value).name}. CT média ${calculateTeamAverage(currentDraw.ctPlayers)} / TR média ${calculateTeamAverage(currentDraw.tPlayers)}.`);
  updateStatus('Times prontos');
  shuffleBtn.disabled = false;
  rerollBtn.disabled = false;
  isRolling = false;
}

function startMatch() {
  if (!currentDraw) {
    setSummary('Sorteie os times antes de começar a partida.');
    return;
  }

  currentMatch = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mapId: mapSelect.value,
    mapName: getMapById(mapSelect.value).name,
    ct: [...currentDraw.ct],
    t: [...currentDraw.t],
    startedAt: new Date().toISOString()
  };

  updateStatus('Partida em andamento');
  setSummary(`Partida iniciada em ${currentMatch.mapName}. Quando terminar, registre o vencedor.`);
}

function finishMatch(winnerLabel) {
  if (!currentMatch) {
    setSummary('Comece a partida antes de registrar o vencedor.');
    return;
  }

  const finished = {
    ...currentMatch,
    winnerLabel,
    recordedAt: new Date().toISOString()
  };

  state.history.push(finished);
  recomputeRankingFromHistory();
  saveState();
  addAdminLog('partida', `${winnerLabel} venceu em ${finished.mapName}.`, { map: finished.mapName, winner: winnerLabel });
  renderHistory();
  renderRanking();
  renderDatabasePlayers();
  currentMatch = null;
  updateStatus('Resultado salvo');
  const winners = winnerLabel === 'CT' ? finished.ct.join(', ') : finished.t.join(', ');
  setSummary(`${winnerLabel} venceu em ${finished.mapName}. Vencedores: ${winners}.`, 'victory');
}

function addPlayerToLobby(name) {
  const normalized = normalizeName(name);
  if (!normalized) return;
  if (players.includes(normalized)) {
    setSummary(`${normalized} já está no lobby.`);
    return;
  }
  if (players.length >= 10) {
    setSummary('O lobby já está completo com 10 jogadores.');
    return;
  }
  players.push(normalized);
  renderPlayers();
}

function autoAssembleLobby() {
  if (state.playersDatabase.length < 10) {
    setSummary('Você precisa ter pelo menos 10 jogadores cadastrados para auto montar o lobby.');
    return;
  }
  players = state.playersDatabase.slice(0, 10).map((player) => player.name);
  renderPlayers();
  setSummary('Lobby montado automaticamente com os 10 primeiros jogadores cadastrados.');
}

function clearLobby() {
  players = [];
  currentDraw = null;
  currentMatch = null;
  renderPlayers();
  renderTeams([], []);
  updateStatus('Aguardando');
  rouletteNames.textContent = 'PRONTO';
  setSummary('Lobby limpo.');
}

function resetAllData() {
  if (!isAdminLogged()) {
    setSummary('Apenas administradores podem resetar os dados.');
    return;
  }

  const confirmed = window.confirm('Tem certeza que deseja resetar todos os dados?');
  if (!confirmed) return;

  state = { playersDatabase: [], ranking: {}, history: [] };
  players = [];
  currentDraw = null;
  currentMatch = null;
  saveState();
  addAdminLog('reset', 'Todos os dados do site foram resetados.');
  renderDatabasePlayers();
  renderPlayers();
  renderTeams([], []);
  renderHistory();
  renderRanking();
  updateStatus('Resetado');
  rouletteNames.textContent = 'PRONTO';
  setSummary('Todos os dados foram resetados.');
}

function openEditModal(matchId) {
  const match = state.history.find((item) => item.id === matchId);
  if (!match) return;
  editingMatchId = match.id;
  editMapSelect.value = match.mapId;
  editWinnerSelect.value = match.winnerLabel;
  editCtPlayers.value = match.ct.join('\n');
  editTPlayers.value = match.t.join('\n');
  editModal.classList.remove('hidden');
}

function closeEditModal() {
  editingMatchId = null;
  editModal.classList.add('hidden');
}

function saveEditedMatch() {
  if (!editingMatchId) return;
  const target = state.history.find((item) => item.id === editingMatchId);
  if (!target) return;

  target.mapId = editMapSelect.value;
  target.mapName = getMapById(editMapSelect.value).name;
  target.winnerLabel = editWinnerSelect.value;
  target.ct = editCtPlayers.value.split('\n').map(normalizeName).filter(Boolean);
  target.t = editTPlayers.value.split('\n').map(normalizeName).filter(Boolean);
  recomputeRankingFromHistory();
  saveState();
  addAdminLog('edicao', `Partida em ${target.mapName} foi editada.`, { matchId: target.id });
  renderHistory();
  renderRanking();
  renderDatabasePlayers();
  closeEditModal();
  setSummary('Registro da partida atualizado.');
}

async function handleSteamRegister() {
  const url = steamProfileInput.value.trim();
  const skill = normalizeSkill(playerSkillInput.value);
  if (!url) {
    setSummary('Cole o link do perfil Steam antes de cadastrar.');
    return;
  }

  addPlayerBtn.disabled = true;
  addPlayerBtn.textContent = 'Carregando...';
  setSteamPreview({ personaName: 'Carregando perfil Steam...', avatar: 'logo.png', steamUrl: '' });

  try {
    const profile = await fetchSteamProfile(url);
    setSteamPreview(profile);
    const action = addPlayerToDatabase(profile, skill);
    renderDatabasePlayers();
    renderRanking();
    steamProfileInput.value = '';
    playerSkillInput.value = '';
    setSummary(action === 'created'
      ? `${profile.personaName} foi cadastrado com sucesso.`
      : `${profile.personaName} já existia e foi atualizado.`);
  } catch (error) {
    setSteamPreview(null);
    setSummary(error.message || 'Não foi possível carregar o perfil Steam.');
  } finally {
    addPlayerBtn.disabled = false;
    addPlayerBtn.textContent = 'Cadastrar';
  }
}

function bindEvents() {
  addPlayerBtn.addEventListener('click', handleSteamRegister);
  autoAssembleBtn.addEventListener('click', autoAssembleLobby);
  clearBtn.addEventListener('click', clearLobby);
  shuffleBtn.addEventListener('click', drawTeams);
  rerollBtn.addEventListener('click', drawTeams);
  addAfterDrawBtn.addEventListener('click', () => {
    setSummary('Adicione manualmente mais jogadores ao lobby, se precisar refazer depois.');
  });
  startMatchBtn.addEventListener('click', startMatch);
  ctWinBtn.addEventListener('click', () => finishMatch('CT'));
  tWinBtn.addEventListener('click', () => finishMatch('TR'));
  resetHistoryBtn.addEventListener('click', resetAllData);
  nextMapBtn.addEventListener('click', goToNextMap);
  randomMapBtn.addEventListener('click', animateRandomMap);
  mapSelect.addEventListener('change', updateMapBanner);
  closeModalBtn.addEventListener('click', closeEditModal);
  saveEditBtn.addEventListener('click', saveEditedMatch);

  databasePlayerList.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-db]');
    if (addButton) {
      addPlayerToLobby(addButton.getAttribute('data-add-db'));
      return;
    }

    const removeButton = event.target.closest('[data-remove-db]');
    if (removeButton) {
      const playerName = removeButton.getAttribute('data-remove-db');
      const confirmed = window.confirm(`Remover ${playerName} dos jogadores cadastrados?`);
      if (!confirmed) return;
      removePlayerFromDatabase(playerName);
    }
  });

  playerList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-lobby]');
    if (!removeButton) return;
    const playerName = removeButton.getAttribute('data-remove-lobby');
    players = players.filter((name) => name !== playerName);
    renderPlayers();
  });

  historyList.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-match]');
    if (!editButton) return;
    openEditModal(editButton.getAttribute('data-edit-match'));
  });
}

function bootstrap() {
  populateMapSelects();
  recomputeRankingFromHistory();
  renderDatabasePlayers();
  renderPlayers();
  renderTeams([], []);
  renderRanking();
  renderHistory();
  setSummary('Cadastre os jogadores, monte o lobby e sorteie os times.');
  updateStatus('Aguardando');
  bindEvents();
}

bootstrap();