?const STORAGE_KEY = 'cs-dos-campeoes-local-data-v7';
const ADMIN_STORAGE_KEY = 'cs-dos-campeoes-admin-v1';
const ADMIN_SESSION_KEY = 'cs-dos-campeoes-admin-session';
const LEGACY_STORAGE_KEYS = ['cs-dos-campeoes-local-data-v6', 'cs-dos-campeoes-local-data-v5', 'cs-dos-campeoes-local-data-v4'];
const MATCH_POINTS = 500;
const supabaseConfig = window.CSTEAM_SUPABASE || null;
const supabaseClient = supabaseConfig?.client || null;

const MAPS = [
  { id: 'inferno', name: 'Inferno', image: 'maps/inferno.webp', logo: 'maps/inferno.webp', background: 'maps/backgroundmaps/Cs2_inferno_remake.webp', description: 'Banana pegando fogo, retake sofrido e a clássica trocação no bomb A.' },
  { id: 'mirage', name: 'Mirage', image: 'maps/mirage.webp', logo: 'maps/mirage.webp', background: 'maps/backgroundmaps/De_mirage_cs2.webp', description: 'Janela aberta, split explosivo e duelo seco no meio o round inteiro.' },
  { id: 'nuke', name: 'Nuke', image: 'maps/nuke.webp', logo: 'maps/nuke.webp', background: 'maps/backgroundmaps/Cs2nuke.webp', description: 'Vertical, tático e perfeito para fake, vent dive e call torta.' },
  { id: 'ancient', name: 'Ancient', image: 'maps/ancient.webp', logo: 'maps/ancient.webp', background: 'maps/backgroundmaps/De_ancient_cs2.webp', description: 'Pedra, utilitária pesada e avanço pressionando caverna o tempo todo.' },
  { id: 'anubis', name: 'Anubis', image: 'maps/anubis.webp', logo: 'maps/anubis.webp', background: 'maps/backgroundmaps/Anubis1.webp', description: '�?gua, entrada forte e rounds rápidos com muita pressão de mapa.' },
  { id: 'dust2', name: 'Dust II', image: 'maps/dust2.webp', logo: 'maps/dust2.webp', background: 'maps/backgroundmaps/Cs2_dust2.webp', description: 'O mapa mais clássico da rotação, com ego, pixel e bala cantando.' },
  { id: 'overpass', name: 'Overpass', image: 'maps/overpass.webp', logo: 'maps/overpass.webp', background: 'maps/backgroundmaps/Overpass_loading_screen.webp', description: 'Controle de mapa, banheiro brigado e clutch nas rotações longas.' }
];

const STEAM_FALLBACK_PROFILES = {
  'https://steamcommunity.com/id/tarantine/': {
    steamId64: '76561198076321923',
    personaName: 'TARANTINE',
    avatar: 'https://avatars.fastly.steamstatic.com/ae3624efee29ed79e60ee5643b93108c368dacc7_full.jpg',
    steamUrl: 'https://steamcommunity.com/id/TARANTINE/'
  }
};

const STEAM_XML_PROXIES = [
  { name: 'AllOrigins', buildUrl: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  { name: 'CorsProxy', buildUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
  { name: 'Isomorphic', buildUrl: (url) => `https://cors.isomorphic-git.org/${url}` }
];
const STEAM_REQUEST_TIMEOUT = 8000;
const STEAM_PROXY_RETRY_COUNT = 2;

const steamProfileInput = document.getElementById('steamProfileInput');
const playerSkillInput = document.getElementById('playerSkillInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const autoAssembleBtn = document.getElementById('autoAssembleBtn');
const clearBtn = document.getElementById('clearBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const shuffleRandomBtn = document.getElementById('shuffleRandomBtn');
const rerollBtn = document.getElementById('rerollBtn');
const addAfterDrawBtn = document.getElementById('addAfterDrawBtn');
const startMatchBtn = document.getElementById('startMatchBtn');
const ctWinBtn = document.getElementById('ctWinBtn');
const tWinBtn = document.getElementById('tWinBtn');
const resetHistoryBtn = document.getElementById('resetHistoryBtn');
const historyAdminActions = document.getElementById('historyAdminActions');
const nextMapBtn = document.getElementById('nextMapBtn');
const randomMapBtn = document.getElementById('randomMapBtn');
const mapRoulette = document.getElementById('mapRoulette');
const databasePlayerList = document.getElementById('databasePlayerList');
const databaseCount = document.getElementById('databaseCount');
const playerList = document.getElementById('playerList');
const playerCount = document.getElementById('playerCount');
const teamA = document.getElementById('teamA');
const teamB = document.getElementById('teamB');
const rouletteNames = document.getElementById('rouletteNames');
const rouletteAvatarCloud = document.getElementById('rouletteAvatarCloud');
const rouletteDropZone = document.getElementById('rouletteDropZone');
const animationStage = document.getElementById('animationStage');
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
const skillModal = document.getElementById('skillModal');
const closeSkillModalBtn = document.getElementById('closeSkillModalBtn');
const saveSkillBtn = document.getElementById('saveSkillBtn');
const editSkillInput = document.getElementById('editSkillInput');
const skillModalPlayer = document.getElementById('skillModalPlayer');
const databasePanel = document.getElementById('databasePanel');
const databasePanelBody = document.getElementById('databasePanelBody');
const toggleDatabasePanelBtn = document.getElementById('toggleDatabasePanelBtn');

let players = [];
let isRolling = false;
let isMapRolling = false;
let currentDraw = null;
let currentDrawMode = 'balanced';
let currentMatch = null;
let editingMatchId = null;
let editingSkillPlayer = null;
let steamPreviewData = null;
let state = normalizeStateShape(null);
let audioContext = null;
let isDatabasePanelCollapsed = false;

function normalizeStateShape(raw) {
  return {
    playersDatabase: Array.isArray(raw?.playersDatabase) ? raw.playersDatabase : [],
    ranking: raw?.ranking || {},
    history: Array.isArray(raw?.history) ? raw.history : []
  };
}

function hasMeaningfulState(raw) {
  return !!(raw && (raw.playersDatabase?.length || raw.history?.length || Object.keys(raw.ranking || {}).length));
}

function readStorageKey(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved && typeof saved === 'object' ? saved : null;
  } catch {
    return null;
  }
}

function saveRawState(rawState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rawState));
}

function migrateLegacyPlayersDatabase(targetState) {
  targetState.playersDatabase = (targetState.playersDatabase || []).map((entry) => {
    if (typeof entry === 'string') {
      return { name: entry, skill: 0, avatar: '', steamUrl: '', steamId64: '' };
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

function readBestLocalState() {
  const current = readStorageKey(STORAGE_KEY);
  if (hasMeaningfulState(current)) return normalizeStateShape(current);
  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = readStorageKey(legacyKey);
    if (hasMeaningfulState(legacy)) {
      const migrated = normalizeStateShape(legacy);
      migrateLegacyPlayersDatabase(migrated);
      saveRawState(migrated);
      return migrated;
    }
  }
  return normalizeStateShape(null);
}

async function loadRemoteState() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient.from(supabaseConfig.stateTable).select('payload').eq('id', supabaseConfig.stateRowId).maybeSingle();
  if (error) {
    console.error('Falha ao carregar estado global.', error);
    return null;
  }
  return normalizeStateShape(data?.payload || null);
}

async function saveState() {
  saveRawState(state);
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from(supabaseConfig.stateTable).upsert({
    id: supabaseConfig.stateRowId,
    payload: state,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (error) {
    console.error('Falha ao salvar estado global.', error);
    throw error;
  }
}

async function loadState() {
  const localState = readBestLocalState();
  const remoteState = await loadRemoteState();
  if (hasMeaningfulState(remoteState)) {
    state = normalizeStateShape(remoteState);
    saveRawState(state);
    return state;
  }
  state = normalizeStateShape(localState);
  if (hasMeaningfulState(localState)) {
    try { await saveState(); } catch {}
  }
  return state;
}

function loadAdminState() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));
    return { admins: Array.isArray(raw?.admins) ? raw.admins : [], logs: Array.isArray(raw?.logs) ? raw.logs : [] };
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

function populateMapSelects() {
  const options = MAPS.map((map) => `<option value="${map.id}">${map.name}</option>`).join('');
  mapSelect.innerHTML = options;
  editMapSelect.innerHTML = options;
  if (!MAPS.some((map) => map.id === mapSelect.value)) mapSelect.value = MAPS[0].id;
  updateMapBanner();
}

function getMapById(id) {
  return MAPS.find((map) => map.id === id) || MAPS[0];
}

function applyMapTheme(map) {
  document.body.style.setProperty('--map-bg-image', `url('${map.background}')`);
}

function updateMapBanner() {
  const map = getMapById(mapSelect.value);
  applyMapTheme(map);
  mapBannerImage.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.62), rgba(0,0,0,.16)), url('${map.background}')`;
  mapBannerImage.style.setProperty('--map-banner-logo', `url('${map.logo}')`);
  mapNameDisplay.textContent = map.name;
  mapDescription.textContent = map.description;
}

function getCurrentMapIndex() {
  return Math.max(0, MAPS.findIndex((map) => map.id === mapSelect.value));
}

function goToNextMap() {
  const nextIndex = (getCurrentMapIndex() + 1) % MAPS.length;
  mapSelect.value = MAPS[nextIndex].id;
  updateMapBanner();
  setSummary(`Próximo mapa selecionado: ${MAPS[nextIndex].name}.`);
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function ensureAudioContext() { const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return null; if (!audioContext) audioContext = new AudioContextClass(); if (audioContext.state === 'suspended') audioContext.resume().catch(() => {}); return audioContext; }
function playTone(frequency, duration = 0.08, type = 'sine', volume = 0.03, delay = 0) { const ctx = ensureAudioContext(); if (!ctx) return; const start = ctx.currentTime + delay; const oscillator = ctx.createOscillator(); const gainNode = ctx.createGain(); oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start); gainNode.gain.setValueAtTime(0.0001, start); gainNode.gain.exponentialRampToValueAtTime(volume, start + 0.01); gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration); oscillator.connect(gainNode); gainNode.connect(ctx.destination); oscillator.start(start); oscillator.stop(start + duration + 0.02); }
function playDrawStartSound() { playTone(220, 0.09, 'sawtooth', 0.02, 0); playTone(330, 0.09, 'triangle', 0.02, 0.05); playTone(440, 0.12, 'sine', 0.018, 0.1); }
function playRevealSound(team) { if (team === 'ct') { playTone(420, 0.08, 'triangle', 0.026, 0); playTone(620, 0.1, 'sine', 0.02, 0.05); return; } playTone(260, 0.08, 'sawtooth', 0.026, 0); playTone(390, 0.1, 'triangle', 0.02, 0.05); }
function playFinalRevealSound() { playTone(392, 0.12, 'triangle', 0.025, 0); playTone(523, 0.14, 'triangle', 0.024, 0.08); playTone(659, 0.18, 'sine', 0.022, 0.16); }

function renderMapRouletteCards(activeMapId = '') {
  mapRoulette.innerHTML = `<div class="map-roulette-label">Sorteando mapa...</div><div class="map-roulette-track">${MAPS.map((map) => `<div class="map-roulette-card ${map.id === activeMapId ? 'is-active' : ''}" style="--card-map-logo:url('${map.logo}'); background-image:linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.58)), url('${map.background}')"><span>${map.name}</span></div>`).join('')}</div><div class="map-roulette-name">${getMapById(activeMapId || MAPS[0].id).name}</div>`;
}

async function animateRandomMap() { if (isMapRolling) return; isMapRolling = true; randomMapBtn.disabled = true; nextMapBtn.disabled = true; mapRoulette.classList.remove('hidden'); for (let i = 0; i < 16; i += 1) { const randomMap = MAPS[Math.floor(Math.random() * MAPS.length)]; renderMapRouletteCards(randomMap.id); await sleep(90 + i * 14); } const finalMap = MAPS[Math.floor(Math.random() * MAPS.length)]; mapSelect.value = finalMap.id; renderMapRouletteCards(finalMap.id); updateMapBanner(); setSummary(`Mapa sorteado: ${finalMap.name}.`); await sleep(900); mapRoulette.classList.add('hidden'); randomMapBtn.disabled = false; nextMapBtn.disabled = false; isMapRolling = false; }

function normalizeName(name) { return String(name || '').trim(); }
function normalizeSkill(skill) { const parsed = Number(skill); if (!Number.isFinite(parsed) || parsed < 0) return 0; return Math.round(parsed); }
function normalizeSteamUrl(url) { return String(url || '').trim(); }
function getFallbackProfile(profileUrl) { return STEAM_FALLBACK_PROFILES[normalizeSteamUrl(profileUrl).toLowerCase()] || null; }
function escapeHtml(str) { return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

function parseSteamProfileUrl(url) {
  const value = normalizeSteamUrl(url);
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (hostname !== 'steamcommunity.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    if (parts[0].toLowerCase() === 'profiles') return { type: 'profiles', value: parts[1], url: `https://steamcommunity.com/profiles/${parts[1]}/` };
    if (parts[0].toLowerCase() === 'id') return { type: 'id', value: parts[1], url: `https://steamcommunity.com/id/${parts[1]}/` };
    return null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(resource, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STEAM_REQUEST_TIMEOUT);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function parseSteamXmlProfile(xmlText, fallbackUrl = '') {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  const getValue = (tagName) => xml.querySelector(tagName)?.textContent?.trim() || '';
  const personaName = getValue('steamID');
  const steamId64 = getValue('steamID64');
  const avatar = getValue('avatarFull') || getValue('avatarMedium') || getValue('avatarIcon');
  const steamUrl = getValue('customURL') ? `https://steamcommunity.com/id/${getValue('customURL')}/` : fallbackUrl;
  if (!personaName) throw new Error('Perfil Steam sem nome visível.');
  return { personaName, steamId64, avatar, steamUrl };
}

async function resolveSteamProfile(profileUrl) { const parsed = parseSteamProfileUrl(profileUrl); if (!parsed) throw new Error('Use um link válido do perfil Steam (/id/ ou /profiles/).'); const fallback = getFallbackProfile(parsed.url); if (fallback) return fallback; const xmlUrl = `${parsed.url}?xml=1`; let lastError = null; for (const proxy of STEAM_XML_PROXIES) { for (let attempt = 0; attempt < STEAM_PROXY_RETRY_COUNT; attempt += 1) { try { const response = await fetchWithTimeout(proxy.buildUrl(xmlUrl), { headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8' } }); if (!response.ok) throw new Error(`${proxy.name} respondeu ${response.status}`); const xmlText = await response.text(); if (!xmlText || !xmlText.includes('<profile>')) throw new Error(`${proxy.name} não retornou XML Steam válido.`); return parseSteamXmlProfile(xmlText, parsed.url); } catch (error) { lastError = error; } } } throw new Error(lastError?.message || 'Não foi possível carregar o perfil Steam agora.'); }

function getPlayerRecord(name) { const normalized = normalizeName(name).toLowerCase(); return state.playersDatabase.find((player) => player.name.toLowerCase() === normalized) || null; }
function getPlayerSkill(name) { return getPlayerRecord(name)?.skill || 0; }
function getPlayerAvatar(name) { return getPlayerRecord(name)?.avatar || 'logo.png'; }
function getPlayerStats(name) { const record = state.ranking?.[name] || { wins: 0, losses: 0, points: 0, matches: 0 }; return { wins: Number(record.wins) || 0, losses: Number(record.losses) || 0, points: Number(record.points) || 0, matches: Number(record.matches) || 0 }; }
function getPlayerStatsHtml(name) { const stats = getPlayerStats(name); return `<div class="player-stat-chips"><span class="player-stat-chip">${stats.wins} vitórias</span><span class="player-stat-chip">${stats.losses} derrotas</span><span class="player-stat-chip">${stats.points} pontos</span></div>`; }
function ensurePlayersInRanking(names) { names.forEach((name) => { if (!state.ranking[name]) state.ranking[name] = { points: 0, wins: 0, losses: 0, matches: 0 }; }); }

async function addPlayerToDatabase(profile, skill = 0) {
  const normalizedName = normalizeName(profile.personaName);
  const normalizedSkill = normalizeSkill(skill);
  if (!normalizedName) return false;
  const existing = state.playersDatabase.find((player) => player.steamId64 && profile.steamId64 ? player.steamId64 === profile.steamId64 : player.name.toLowerCase() === normalizedName.toLowerCase());
  if (existing) {
    existing.name = normalizedName; existing.skill = normalizedSkill; existing.avatar = profile.avatar || existing.avatar || ''; existing.steamUrl = profile.steamUrl || existing.steamUrl || ''; existing.steamId64 = profile.steamId64 || existing.steamId64 || '';
    ensurePlayersInRanking([normalizedName]); await saveState(); addAdminLog('cadastro', `Perfil ${normalizedName} atualizado no cadastro.`, { player: normalizedName }); return 'updated';
  }
  state.playersDatabase.push({ name: normalizedName, skill: normalizedSkill, avatar: profile.avatar || '', steamUrl: profile.steamUrl || '', steamId64: profile.steamId64 || '' });
  state.playersDatabase.sort((a, b) => a.name.localeCompare(b.name)); ensurePlayersInRanking([normalizedName]); await saveState(); addAdminLog('cadastro', `Perfil ${normalizedName} cadastrado via Steam.`, { player: normalizedName }); return 'created';
}

async function updatePlayerSkill(name, newSkill) { const player = getPlayerRecord(name); if (!player) return false; player.skill = normalizeSkill(newSkill); await saveState(); addAdminLog('skill', `CSficação de ${player.name} atualizada para ${player.skill}.`, { player: player.name, skill: player.skill }); renderAll(); return true; }
function openSkillModal(name) { const player = getPlayerRecord(name); if (!player) return; editingSkillPlayer = player.name; editSkillInput.value = player.skill; skillModalPlayer.innerHTML = `<div class="skill-modal-player-card"><img class="skill-modal-avatar" src="${escapeHtml(player.avatar || 'logo.png')}" alt="${escapeHtml(player.name)}" /><div class="skill-modal-meta"><strong>${escapeHtml(player.name)}</strong><span>Atual: ${player.skill.toLocaleString('pt-BR')} CS</span></div></div>`; skillModal.classList.remove('hidden'); }
function closeSkillModal() { editingSkillPlayer = null; editSkillInput.value = ''; skillModalPlayer.innerHTML = ''; skillModal.classList.add('hidden'); }
async function saveSkillUpdate() { if (!editingSkillPlayer) return; const newSkill = normalizeSkill(editSkillInput.value); await updatePlayerSkill(editingSkillPlayer, newSkill); closeSkillModal(); setSummary(`CSficação de ${editingSkillPlayer} atualizada para ${newSkill.toLocaleString('pt-BR')}.`); }

async function removePlayerFromDatabase(name) {
  if (!isAdminLogged()) { setSummary('Apenas administradores podem remover jogadores cadastrados.'); return; }
  const normalized = normalizeName(name);
  state.playersDatabase = state.playersDatabase.filter((player) => player.name.toLowerCase() !== normalized.toLowerCase());
  players = players.filter((player) => player.toLowerCase() !== normalized.toLowerCase());
  if (currentDraw) { currentDraw.ct = currentDraw.ct.filter((player) => player.toLowerCase() !== normalized.toLowerCase()); currentDraw.t = currentDraw.t.filter((player) => player.toLowerCase() !== normalized.toLowerCase()); }
  await saveState(); addAdminLog('jogador', `${normalized} foi removido do cadastro principal.`, { player: normalized }); renderAll(); setSummary(`${normalized} foi removido.`);
}

function applyMatchResultToPlayer(name, didWin) { const player = state.ranking[name]; if (!player) return; player.matches += 1; if (didWin) { player.wins += 1; player.points += MATCH_POINTS; return; } player.losses += 1; player.points = Math.max(0, player.points - MATCH_POINTS); }
function recomputeRankingFromHistory() { const existingPlayers = state.playersDatabase.map((player) => player.name); state.ranking = {}; ensurePlayersInRanking(existingPlayers); state.history.forEach((match) => { const winners = match.winnerLabel === 'CT' ? match.ct : match.t; const losers = match.winnerLabel === 'CT' ? match.t : match.ct; ensurePlayersInRanking([...match.ct, ...match.t]); winners.forEach((name) => applyMatchResultToPlayer(name, true)); losers.forEach((name) => applyMatchResultToPlayer(name, false)); }); }
function setSummary(text, type = '') { matchSummary.textContent = text; matchSummary.classList.remove('victory'); if (type === 'victory') matchSummary.classList.add('victory'); }
function updateStatus(label) { statusPill.textContent = label; }
function triggerStageFlash(team) { animationStage.classList.remove('flash-ct', 'flash-t', 'flash-final'); void animationStage.offsetWidth; if (team === 'ct') return animationStage.classList.add('flash-ct'); if (team === 't') return animationStage.classList.add('flash-t'); animationStage.classList.add('flash-final'); }

function renderDatabasePlayers() {
  const totalPlayers = state.playersDatabase.length;
  const visiblePlayers = state.playersDatabase.slice(0, 10);
  databaseCount.textContent = totalPlayers > 10 ? `10 visíveis de ${totalPlayers}` : `${totalPlayers} cadastrados`;
  if (!totalPlayers) { databasePlayerList.innerHTML = '<li class="empty-state">Nenhum jogador cadastrado ainda.</li>'; return; }
  const adminVisible = isAdminLogged();
  databasePlayerList.innerHTML = visiblePlayers.map((player) => `<li class="name-item db-item"><div class="db-player-main"><img class="player-avatar" src="${escapeHtml(player.avatar || 'logo.png')}" alt="${escapeHtml(player.name)}" /><div class="db-player-meta"><strong>${escapeHtml(player.name)}</strong><span class="db-skill">CSficação: ${normalizeSkill(player.skill).toLocaleString('pt-BR')}</span>${getPlayerStatsHtml(player.name)}</div></div><div class="db-actions"><button class="small-action add-db-btn" data-add-db="${escapeHtml(player.name)}">+</button><button class="small-action edit-skill-btn" data-edit-skill="${escapeHtml(player.name)}">✎</button>${adminVisible ? `<button class="small-action remove-db-btn" data-remove-db="${escapeHtml(player.name)}">×</button>` : ''}</div></li>`).join('');
}

function renderPlayers() { playerCount.textContent = `${players.length} / 10`; if (!players.length) { playerList.innerHTML = '<li class="empty-state">Nenhum jogador no lobby ainda.</li>'; return; } playerList.innerHTML = players.map((name) => `<li class="name-item"><div class="lobby-player-main"><img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}" /><div class="db-player-meta"><strong>${escapeHtml(name)}</strong><span class="db-skill">CSficação: ${getPlayerSkill(name).toLocaleString('pt-BR')}</span></div></div><button class="remove-btn" data-remove-lobby="${escapeHtml(name)}">×</button></li>`).join(''); }
function calculateTeamAverage(team) { if (!team.length) return 0; return Math.round(team.reduce((sum, player) => sum + player.skill, 0) / team.length); }
function updateBalanceDisplays(ctTeam, tTeam) { const ctAvg = calculateTeamAverage(ctTeam); const tAvg = calculateTeamAverage(tTeam); ctAverageDisplay.textContent = ctAvg.toLocaleString('pt-BR'); tAverageDisplay.textContent = tAvg.toLocaleString('pt-BR'); balanceDiffDisplay.textContent = Math.abs(ctAvg - tAvg).toLocaleString('pt-BR'); }
function renderTeams(ctNames, tNames) { const renderTeam = (list, names) => { if (!names.length) { list.innerHTML = '<li class="empty-state">Ainda sem jogadores.</li>'; return; } list.innerHTML = names.map((name, index) => `<li class="team-item reveal-card" style="animation-delay:${index * 70}ms"><div class="lobby-player-main"><img class="lobby-avatar" src="${escapeHtml(getPlayerAvatar(name))}" alt="${escapeHtml(name)}" /><div class="db-player-meta"><strong>${escapeHtml(name)}</strong><span class="db-skill">CSficação: ${getPlayerSkill(name).toLocaleString('pt-BR')}</span></div></div></li>`).join(''); }; renderTeam(teamA, ctNames); renderTeam(teamB, tNames); updateBalanceDisplays(ctNames.map((name) => ({ name, skill: getPlayerSkill(name) })), tNames.map((name) => ({ name, skill: getPlayerSkill(name) }))); }
function getSortedRankingEntries() { const names = new Set([...state.playersDatabase.map((player) => player.name), ...Object.keys(state.ranking || {})]); ensurePlayersInRanking([...names]); return [...names].map((name) => ({ name, ...state.ranking[name] })).sort((a, b) => b.points !== a.points ? b.points - a.points : b.wins !== a.wins ? b.wins - a.wins : a.name.localeCompare(b.name)); }
function getRankTier(points) { if (points >= 10000) return 'Global Elite'; if (points >= 8000) return 'Supreme'; if (points >= 6500) return 'Legendary Eagle'; if (points >= 5000) return 'DMG'; if (points >= 3500) return 'Master Guardian'; if (points >= 2200) return 'Gold Nova'; return 'Silver'; }
function renderRanking() { const entries = getSortedRankingEntries(); if (!entries.length) { rankingList.innerHTML = '<li class="empty-state">Nenhum jogador no ranking ainda.</li>'; return; } rankingList.innerHTML = entries.map((entry, index) => `<li class="ranking-item ranking-item-rich"><div class="rank-emblem">#${index + 1}</div><div class="rank-player-block"><img class="rank-avatar" src="${escapeHtml(getPlayerAvatar(entry.name))}" alt="${escapeHtml(entry.name)}" /><div class="rank-player-meta"><div class="rank-name">${escapeHtml(entry.name)}</div><div class="rank-tier">${getRankTier(entry.points)} • ${entry.wins}V / ${entry.losses}D</div></div></div><div class="rank-right"><div class="rank-points">${entry.points.toLocaleString('pt-BR')}</div><div class="rank-meta">${entry.matches} partidas</div></div></li>`).join(''); }
function buildHistoryItem(match) { const recordedLabel = new Date(match.recordedAt).toLocaleString('pt-BR'); const drawModeLabel = match.drawMode === 'random' ? 'Normal' : 'Balanceado'; const map = getMapById(match.mapId || 'inferno'); return `<li class="history-item history-item-rich"><div class="history-map-thumb" style="--card-map-logo:url('${map.logo}'); background-image:linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.72)), url('${map.background}')"><span>${map.name}</span></div><div class="history-content"><div class="history-topline"><strong>${escapeHtml(match.mapName)}</strong><span>${recordedLabel}</span></div><div class="history-body"><span><strong>Modo:</strong> ${drawModeLabel}</span><span><strong>CT:</strong> ${escapeHtml(match.ct.join(', '))}</span><span><strong>TR:</strong> ${escapeHtml(match.t.join(', '))}</span><span><strong>Vencedor:</strong> ${match.winnerLabel}</span></div><div class="history-actions"><button class="ghost-btn compact-btn" data-edit-match="${match.id}">Editar</button></div></div></li>`; }
function updateAdminUiVisibility() { const adminVisible = isAdminLogged(); if (historyAdminActions) historyAdminActions.classList.toggle('hidden', !adminVisible); }
function renderHistory() { if (!state.history.length) { historyList.innerHTML = '<li class="empty-state">Nenhuma partida registrada ainda.</li>'; return; } historyList.innerHTML = [...state.history].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).map(buildHistoryItem).join(''); }
function getMapCardsHtml(pool, activeIndex = 0) { return pool.map((player, index) => { const angle = (360 / pool.length) * index; const offset = Math.abs(index - activeIndex) % pool.length; const depthClass = offset === 0 ? 'is-focus' : offset <= 2 ? 'is-near' : ''; const map = getMapById(player.mapId || mapSelect.value); return `<div class="roulette-avatar-node map-node ${depthClass}" style="--angle:${angle}deg; --card-map-logo:url('${map.logo}'); background-image:linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.66)), url('${map.background}')"><img src="${escapeHtml(player.avatar || 'logo.png')}" alt="${escapeHtml(player.name)}" /><span class="roulette-map-chip">${map.name}</span></div>`; }).join(''); }
function renderRouletteAvatarCloud(pool, activeIndex = 0) { rouletteAvatarCloud.innerHTML = getMapCardsHtml(pool, activeIndex); }
function clearRouletteAvatarCloud() { rouletteAvatarCloud.innerHTML = ''; rouletteAvatarCloud.classList.remove('is-active'); }
function clearDropZone() { rouletteDropZone.innerHTML = ''; }
async function runDrawAnimation(pool, modeLabel) { rouletteNames.textContent = modeLabel; rouletteAvatarCloud.classList.add('is-active'); playDrawStartSound(); for (let i = 0; i < 18; i += 1) { renderRouletteAvatarCloud(pool, i % pool.length); await sleep(80 + i * 10); } }
async function runTeamReveal(draw) { clearDropZone(); const revealOrder = [...draw.ct.map((name) => ({ side: 'ct', name })), ...draw.t.map((name) => ({ side: 't', name }))]; for (const [index, item] of revealOrder.entries()) { const revealMap = getMapById(draw.mapId || mapSelect.value); const card = document.createElement('div'); card.className = `drop-card ${item.side}`; card.style.animationDelay = `${index * 90}ms`; card.style.setProperty('--card-map-logo', `url('${revealMap.logo}')`); card.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.78)), url('${revealMap.background}')`; card.innerHTML = `<img src="${escapeHtml(getPlayerAvatar(item.name))}" alt="${escapeHtml(item.name)}" /><strong>${escapeHtml(item.name)}</strong><span>${item.side === 'ct' ? 'CT' : 'TR'}</span>`; rouletteDropZone.appendChild(card); playRevealSound(item.side); triggerStageFlash(item.side); await sleep(190); } triggerStageFlash('final'); playFinalRevealSound(); }
function pickBalancedTeams(selectedPlayers) { const sorted = [...selectedPlayers].sort((a, b) => b.skill - a.skill); const ct = []; const t = []; let ctScore = 0; let tScore = 0; sorted.forEach((player) => { if (ct.length >= 5) { t.push(player); tScore += player.skill; return; } if (t.length >= 5) { ct.push(player); ctScore += player.skill; return; } if (ctScore <= tScore) { ct.push(player); ctScore += player.skill; } else { t.push(player); tScore += player.skill; } }); return { ct, t }; }
function shuffleArray(array) { const cloned = [...array]; for (let i = cloned.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [cloned[i], cloned[j]] = [cloned[j], cloned[i]]; } return cloned; }
function buildDrawFromNames(names, mode = 'balanced') { const selectedPlayers = names.map((name) => ({ name, skill: getPlayerSkill(name), avatar: getPlayerAvatar(name), mapId: mapSelect.value })); const drafted = mode === 'random' ? { ct: shuffleArray(selectedPlayers).slice(0, 5), t: shuffleArray(selectedPlayers).slice(5, 10) } : pickBalancedTeams(selectedPlayers); return { mode, mapId: mapSelect.value, mapName: getMapById(mapSelect.value).name, ct: drafted.ct.map((player) => player.name), t: drafted.t.map((player) => player.name) }; }
async function drawTeams(mode = 'balanced') { if (isRolling) return; if (players.length !== 10) { setSummary('O lobby precisa ter exatamente 10 jogadores.'); return; } isRolling = true; currentDrawMode = mode; updateStatus('Sorteando'); clearDropZone(); const draw = buildDrawFromNames(players, mode); currentDraw = draw; const pool = [...draw.ct, ...draw.t].map((name) => ({ name, avatar: getPlayerAvatar(name), mapId: draw.mapId })); await runDrawAnimation(pool, mode === 'random' ? 'SORTEIO NORMAL' : 'SORTEIO BALANCEADO'); renderTeams(draw.ct, draw.t); await runTeamReveal(draw); updateStatus('Times prontos'); setSummary(`Times sorteados no modo ${mode === 'random' ? 'normal' : 'balanceado'} em ${draw.mapName}.`); isRolling = false; }
function addPlayerToLobby(name) { const normalized = normalizeName(name); if (!normalized || players.includes(normalized) || players.length >= 10) return; players.push(normalized); renderPlayers(); }
function removePlayerFromLobby(name) { players = players.filter((player) => player !== name); renderPlayers(); }
function autoAssembleLobby() { const available = shuffleArray(state.playersDatabase.map((player) => player.name)); players = available.slice(0, 10); renderPlayers(); setSummary('Lobby montado automaticamente com 10 jogadores.'); }
function clearLobby() { players = []; currentDraw = null; currentMatch = null; renderPlayers(); renderTeams([], []); clearRouletteAvatarCloud(); clearDropZone(); updateStatus('Aguardando'); setSummary('Lobby limpo.'); }
function syncDatabasePanelUi() { if (!databasePanel || !toggleDatabasePanelBtn) return; databasePanel.classList.toggle('is-collapsed', isDatabasePanelCollapsed); if (databasePanelBody) databasePanelBody.hidden = isDatabasePanelCollapsed; toggleDatabasePanelBtn.textContent = isDatabasePanelCollapsed ? 'Mostrar' : 'Ocultar'; toggleDatabasePanelBtn.setAttribute('aria-expanded', String(!isDatabasePanelCollapsed)); }
function toggleDatabasePanel() { isDatabasePanelCollapsed = !isDatabasePanelCollapsed; syncDatabasePanelUi(); }
function startMatch() { if (!currentDraw) { setSummary('Sorteie os times antes de começar a partida.'); return; } currentMatch = { ...currentDraw, startedAt: new Date().toISOString() }; updateStatus('Partida em andamento'); setSummary(`Partida iniciada em ${currentMatch.mapName}.`); }
async function finishMatch(winnerLabel) { if (!currentMatch) { setSummary('Nenhuma partida ativa no momento.'); return; } const match = { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`, mapId: currentMatch.mapId, mapName: currentMatch.mapName, ct: [...currentMatch.ct], t: [...currentMatch.t], winnerLabel, drawMode: currentMatch.mode, recordedAt: new Date().toISOString() }; state.history.push(match); recomputeRankingFromHistory(); await saveState(); addAdminLog('partida', `Partida registrada: ${winnerLabel} venceu em ${match.mapName}.`, { winner: winnerLabel, map: match.mapName }); currentMatch = null; renderRanking(); renderHistory(); updateStatus('Resultado salvo'); setSummary(`${winnerLabel} venceu em ${match.mapName}.`, 'victory'); }
function openEditModal(matchId) { const match = state.history.find((entry) => entry.id === matchId); if (!match) return; editingMatchId = matchId; editMapSelect.value = match.mapId || MAPS[0].id; editWinnerSelect.value = match.winnerLabel; editCtPlayers.value = match.ct.join('\n'); editTPlayers.value = match.t.join('\n'); editModal.classList.remove('hidden'); }
function closeEditModal() { editingMatchId = null; editModal.classList.add('hidden'); }
async function saveEditedMatch() { const match = state.history.find((entry) => entry.id === editingMatchId); if (!match) return; match.mapId = editMapSelect.value; match.mapName = getMapById(editMapSelect.value).name; match.winnerLabel = editWinnerSelect.value; match.ct = editCtPlayers.value.split('\n').map(normalizeName).filter(Boolean); match.t = editTPlayers.value.split('\n').map(normalizeName).filter(Boolean); recomputeRankingFromHistory(); await saveState(); addAdminLog('partida-edicao', `Partida ${match.id} editada.`, { id: match.id, winner: match.winnerLabel, map: match.mapName }); renderAll(); closeEditModal(); setSummary('Partida atualizada com sucesso.'); }
async function resetAllData() { if (!isAdminLogged()) { setSummary('Apenas administradores podem resetar os dados.'); return; } const confirmed = window.confirm('Tem certeza que deseja resetar todos os dados do site?'); if (!confirmed) return; state = normalizeStateShape(null); players = []; currentDraw = null; currentMatch = null; await saveState(); addAdminLog('reset', 'Todos os dados do site foram resetados.'); renderAll(); setSummary('Todos os dados foram resetados.'); }
function renderAll() { renderDatabasePlayers(); renderPlayers(); renderTeams(currentDraw?.ct || [], currentDraw?.t || []); renderRanking(); renderHistory(); updateAdminUiVisibility(); }

async function handleSteamRegister() { const steamUrl = normalizeSteamUrl(steamProfileInput.value); const skill = normalizeSkill(playerSkillInput.value); if (!steamUrl) { setSummary('Cole um link do perfil Steam para cadastrar.'); return; } addPlayerBtn.disabled = true; addPlayerBtn.textContent = 'Buscando...'; try { const profile = await resolveSteamProfile(steamUrl); steamPreviewData = profile; steamPreviewAvatar.src = profile.avatar || 'logo.png'; steamPreviewName.textContent = profile.personaName; steamPreviewUrl.textContent = profile.steamUrl || steamUrl; steamPreview.classList.remove('hidden'); const result = await addPlayerToDatabase(profile, skill); renderAll(); setSummary(result === 'updated' ? `${profile.personaName} já existia e foi atualizado.` : `${profile.personaName} foi cadastrado com sucesso.`); steamProfileInput.value = ''; playerSkillInput.value = ''; } catch (error) { console.error(error); setSummary(error.message || 'Não foi possível cadastrar o perfil Steam.'); } finally { addPlayerBtn.disabled = false; addPlayerBtn.textContent = 'Cadastrar'; } }

function bindEvents() {
  if (toggleDatabasePanelBtn) toggleDatabasePanelBtn.addEventListener('click', toggleDatabasePanel);
  addPlayerBtn.addEventListener('click', handleSteamRegister);
  steamProfileInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') handleSteamRegister(); });
  playerSkillInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') handleSteamRegister(); });
  autoAssembleBtn.addEventListener('click', autoAssembleLobby);
  clearBtn.addEventListener('click', clearLobby);
  shuffleBtn.addEventListener('click', () => drawTeams('balanced'));
  shuffleRandomBtn.addEventListener('click', () => drawTeams('random'));
  rerollBtn.addEventListener('click', () => drawTeams(currentDrawMode || 'balanced'));
  addAfterDrawBtn.addEventListener('click', () => setSummary('Use o painel de jogadores cadastrados para completar o lobby antes do sorteio.'));
  startMatchBtn.addEventListener('click', startMatch);
  ctWinBtn.addEventListener('click', () => finishMatch('CT'));
  tWinBtn.addEventListener('click', () => finishMatch('T'));
  resetHistoryBtn?.addEventListener('click', resetAllData);
  nextMapBtn.addEventListener('click', goToNextMap);
  randomMapBtn.addEventListener('click', animateRandomMap);
  mapSelect.addEventListener('change', updateMapBanner);
  closeModalBtn.addEventListener('click', closeEditModal);
  saveEditBtn.addEventListener('click', saveEditedMatch);
  closeSkillModalBtn.addEventListener('click', closeSkillModal);
  saveSkillBtn.addEventListener('click', saveSkillUpdate);
  databasePlayerList.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-db]');
    if (addButton) addPlayerToLobby(addButton.getAttribute('data-add-db'));
    const editButton = event.target.closest('[data-edit-skill]');
    if (editButton) openSkillModal(editButton.getAttribute('data-edit-skill'));
    const removeButton = event.target.closest('[data-remove-db]');
    if (removeButton) removePlayerFromDatabase(removeButton.getAttribute('data-remove-db'));
  });
  playerList.addEventListener('click', (event) => { const removeButton = event.target.closest('[data-remove-lobby]'); if (removeButton) removePlayerFromLobby(removeButton.getAttribute('data-remove-lobby')); });
  historyList.addEventListener('click', (event) => { const editButton = event.target.closest('[data-edit-match]'); if (editButton) openEditModal(editButton.getAttribute('data-edit-match')); });
}

async function bootstrap() {
  await loadState();
  populateMapSelects();
  renderMapRouletteCards(MAPS[0].id);
  bindEvents();
  syncDatabasePanelUi();
  renderAll();
  if (supabaseClient) {
    supabaseClient.channel('csteam-state-sync').on('postgres_changes', { event: '*', schema: 'public', table: supabaseConfig.stateTable, filter: `id=eq.${supabaseConfig.stateRowId}` }, async () => { await loadState(); renderAll(); }).subscribe();
  }
}

bootstrap();

