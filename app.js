const STORAGE_KEY = 'cs-dos-campeoes-local-data-v5';
const LEGACY_STORAGE_KEYS = ['cs-dos-campeoes-local-data-v4'];
const MATCH_POINTS = 500;

const MAPS = [
  { id: 'inferno', name: 'Inferno', image: 'https://images.steamusercontent.com/ugc/2506897342782811667/BEA8679BFA4DB3A22C49EEA0D8D7A4D09F0C7E50/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Banana pegando fogo, smoke torta, granada no pé e gritaria sincera no Discord.' },
  { id: 'mirage', name: 'Mirage', image: 'https://images.steamusercontent.com/ugc/2059877063158746739/D855D1F3E66D2A4B9FBDA64E5E94AB7D2FC9D7C4/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'AWP no meio, três querendo pickar janela e um esquecendo a bomba no spawn.' },
  { id: 'nuke', name: 'Nuke', image: 'https://images.steamusercontent.com/ugc/2059877063158746626/628B369B41B72C345ABF09957F117A5DA95AA516/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Dois andares de confusão tática e sempre alguém perguntando por onde o cara passou.' },
  { id: 'ancient', name: 'Ancient', image: 'https://images.steamusercontent.com/ugc/2059877063158746519/65EFB8232FB13A612651E90D2990D8C4D15A5A43/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Pedra, fumaça, call esquisita e aquela sensação de que todo mundo está perdido junto.' },
  { id: 'anubis', name: 'Anubis', image: 'https://images.steamusercontent.com/ugc/2059877063158746482/6879F6D0FE2A4A2B0F653BB2FC5D5A25D7A84A97/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Água, porrada franca, avanço seco e fé de que agora vai.' },
  { id: 'dust2', name: 'Dust II', image: 'https://images.steamusercontent.com/ugc/2059877063158746588/418538AB71CA4A6E6C0466D26B857D3B6B534A31/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'O mapa da honra, do ego e da clássica frase: confia no meu pixel.' },
  { id: 'vertigo', name: 'Vertigo', image: 'https://images.steamusercontent.com/ugc/2059877063158746776/4B998C3D3E81047F84F4EC0F5900A6BD7C7AE0C1/?imw=1200&imh=675&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', description: 'Mapa pra separar os corajosos dos que tremem só de ouvir um passo na rampa.' }
];

const playerInput = document.getElementById('playerInput');
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

let players = [];
let isRolling = false;
let isMapRolling = false;
let currentDraw = null;
let currentMatch = null;
let editingMatchId = null;
let migrationNote = '';
let state = loadState();

function loadState() {
  const current = readStorageKey(STORAGE_KEY);
  const hasCurrentData = current && (current.playersDatabase?.length || current.history?.length || Object.keys(current.ranking || {}).length);
  if (hasCurrentData) {
    return normalizeStateShape(current);
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = readStorageKey(legacyKey);
    const hasLegacyData = legacy && (legacy.playersDatabase?.length || legacy.history?.length || Object.keys(legacy.ranking || {}).length);
    if (hasLegacyData) {
      const migrated = normalizeStateShape(legacy);
      migrateLegacyPlayersDatabase(migrated);
      saveRawState(migrated);
      migrationNote = `Dados antigos recuperados de ${legacyKey} e carregados com sucesso.`;
      return migrated;
    }
  }

  if (current) {
    return normalizeStateShape(current);
  }

  return { playersDatabase: [], ranking: {}, history: [] };
}

function readStorageKey(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved && typeof saved === 'object' ? saved : null;
  } catch (error) {
    console.error(`Falha ao carregar dados locais de ${key}`, error);
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
      return { name: entry, skill: 0 };
    }
    return {
      name: normalizeName(entry?.name || ''),
      skill: normalizeSkill(entry?.skill)
    };
  }).filter((entry) => entry.name);
}

function normalizeLegacyPlayersDatabase() {
  migrateLegacyPlayersDatabase(state);
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
  setSummary(`Mapa sorteado: ${finalMap.name}. Bora pra trocação sincera.`);

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
  return `${normalizeSkill(skill).toLocaleString('pt-BR')} CS2`;
}

function getPlayerRecord(name) {
  const normalized = normalizeName(name).toLowerCase();
  return state.playersDatabase.find((player) => player.name.toLowerCase() === normalized) || null;
}

function getPlayerSkill(name) {
  return getPlayerRecord(name)?.skill || 0;
}

function getUsedDrawNames() {
  if (!currentDraw) return [];
  return [...currentDraw.ct, ...currentDraw.t].map((name) => name.toLowerCase());
}

function getAvailablePlayersForDraw() {
  const used = getUsedDrawNames();
  return state.playersDatabase.filter((dbPlayer) => !used.includes(dbPlayer.name.toLowerCase()));
}

function addPlayerToDatabase(name, skill = 0) {
  const normalized = normalizeName(name);
  const normalizedSkill = normalizeSkill(skill);
  if (!normalized) return false;

  const existing = getPlayerRecord(normalized);
  if (existing) {
    existing.skill = normalizedSkill;
    ensurePlayersInRanking([normalized]);
    saveState();
    return 'updated';
  }

  state.playersDatabase.push({ name: normalized, skill: normalizedSkill });
  state.playersDatabase.sort((a, b) => a.name.localeCompare(b.name));
  ensurePlayersInRanking([normalized]);
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
  setSummary(`${normalized} foi removido da base de jogadores. O histórico e ranking antigos continuam salvos.`);
}

function ensurePlayersInRanking(names) {
  names.forEach((name) => {
    if (!state.ranking[name]) {
      state.ranking[name] = { points: 0, wins: 0, losses: 0, matches: 0 };
    }
    if (!getPlayerRecord(name)) {
      state.playersDatabase.push({ name, skill: 0 });
    }
  });
  state.playersDatabase.sort((a, b) => a.name.localeCompare(b.name));
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
  if (points >= 0) return 'Gold Nova';
  if (points >= -1500) return 'Prata Chorão';
  return 'Base do MM';
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
    item.className = 'name-item db-item skill-db-item';
    item.innerHTML = `
      <div class="db-player-main">
        <span>${escapeHtml(player.name)}</span>
        <small class="db-skill">${formatSkill(player.skill)}</small>
      </div>
      <div class="db-actions">
        <button class="small-action add-db-btn" data-name="${escapeHtml(player.name)}" ${(inLobby || players.length >= 10) ? 'disabled' : ''}>+</button>
        <button class="small-action edit-skill-btn" data-name="${escapeHtml(player.name)}">✎</button>
        <button class="small-action remove-db-btn" data-name="${escapeHtml(player.name)}">×</button>
      </div>
    `;
    databasePlayerList.appendChild(item);
  });
}

function renderPlayers() {
  playerCount.textContent = `${players.length} / 10`;
  playerList.innerHTML = '';

  if (players.length === 0) {
    playerList.innerHTML = '<li class="empty-state">Nenhum jogador no lobby ainda.</li>';
  }

  players.forEach((name, index) => {
    const item = document.createElement('li');
    item.className = 'name-item';
    item.innerHTML = `
      <div class="lobby-player-main">
        <span>${index + 1}. ${escapeHtml(name)}</span>
        <small class="db-skill">${formatSkill(getPlayerSkill(name))}</small>
      </div>
      <button class="remove-btn" data-index="${index}" aria-label="Remover ${escapeHtml(name)}">×</button>
    `;
    playerList.appendChild(item);
  });

  renderDatabasePlayers();
  updateControlStates();
}

function addPlayerToLobby(name) {
  const normalized = normalizeName(name);
  if (!normalized || players.length >= 10) return;
  if (players.some((player) => player.toLowerCase() === normalized.toLowerCase())) return;
  players.push(normalized);
  renderPlayers();
}

function editPlayerSkill(name) {
  const player = getPlayerRecord(name);
  if (!player) return;
  const value = window.prompt(`Digite a pontuação original do CS2 para ${player.name}:`, String(player.skill || 0));
  if (value === null) return;
  player.skill = normalizeSkill(value);
  saveState();
  renderDatabasePlayers();
  renderPlayers();
  renderTeams(currentDraw?.ct || [], currentDraw?.t || []);
  updateBalanceDisplay();
  setSummary(`Pontuação CS2 de ${player.name} atualizada para ${formatSkill(player.skill)}.`);
}

function addPlayerToDraw(teamKey, playerName) {
  if (!currentDraw || currentMatch) return;

  const normalized = normalizeName(playerName);
  if (!normalized) return;

  const alreadyUsed = getUsedDrawNames().includes(normalized.toLowerCase());
  if (alreadyUsed) {
    setSummary(`${normalized} já está em um dos times sorteados.`);
    return;
  }

  currentDraw[teamKey].push(normalized);
  renderTeams(currentDraw.ct, currentDraw.t);
  updateBalanceDisplay();
  setSummary(`${normalized} foi adicionado ao ${teamKey === 'ct' ? 'CT' : 'TR'}.`);
}

function addPlayerAfterDraw() {
  if (!currentDraw) {
    setSummary('Primeiro sorteie os times para poder ajustar depois.');
    return;
  }

  const available = getAvailablePlayersForDraw()[0];
  if (!available) {
    setSummary('Não existe jogador livre na base para adicionar depois do sorteio.');
    return;
  }

  if (currentDraw.ct.length <= currentDraw.t.length) {
    addPlayerToDraw('ct', available.name);
  } else {
    addPlayerToDraw('t', available.name);
  }
}

function removePlayerFromDraw(teamKey, index) {
  if (!currentDraw) return;
  currentDraw[teamKey].splice(index, 1);
  renderTeams(currentDraw.ct, currentDraw.t);
  updateBalanceDisplay();
  setSummary('Jogador removido do time sorteado. Você pode adicionar outro no mesmo card do time.');
}

function getBalancedTeams(playerNames) {
  const playerPool = playerNames.map((name) => ({ name, skill: getPlayerSkill(name) }));
  const sorted = [...playerPool].sort((a, b) => b.skill - a.skill);
  const ct = [];
  const t = [];
  let ctTotal = 0;
  let tTotal = 0;

  sorted.forEach((player) => {
    const shouldGoCt = ct.length < 5 && (t.length >= 5 || ctTotal <= tTotal);
    if (shouldGoCt) {
      ct.push(player.name);
      ctTotal += player.skill;
    } else {
      t.push(player.name);
      tTotal += player.skill;
    }
  });

  return { ct, t };
}

function renderTeams(left = [], right = []) {
  renderTeamList(teamA, left, 'CT', 'ct');
  renderTeamList(teamB, right, 'TR', 't');
  updateBalanceDisplay();
}

function renderTeamList(container, names, prefix, teamKey) {
  container.innerHTML = '';
  const canEdit = Boolean(currentDraw) && !currentMatch;

  if (!names.length && !canEdit) {
    container.innerHTML = '<li class="empty-state">Aguardando sorteio...</li>';
    return;
  }

  names.forEach((name, index) => {
    const li = document.createElement('li');
    li.className = 'team-item team-item-editable';
    li.style.animationDelay = `${index * 70}ms`;
    li.innerHTML = `
      <div class="team-player-main">
        <span>${prefix} ${index + 1}</span>
        <span>${escapeHtml(name)}</span>
        <small class="db-skill">${formatSkill(getPlayerSkill(name))}</small>
      </div>
      ${canEdit ? `<button class="remove-team-player-btn" data-team="${teamKey}" data-index="${index}">×</button>` : ''}
    `;
    container.appendChild(li);
  });

  if (canEdit) {
    const availablePlayers = getAvailablePlayersForDraw();
    const addItem = document.createElement('li');
    addItem.className = 'team-item team-add-slot';

    if (availablePlayers.length) {
      addItem.innerHTML = `
        <span class="team-add-label">Adicionar</span>
        <select class="team-add-select" data-team="${teamKey}">
          <option value="">Escolher jogador</option>
          ${availablePlayers.map((player) => `<option value="${escapeHtml(player.name)}">${escapeHtml(player.name)} • ${formatSkill(player.skill)}</option>`).join('')}
        </select>
        <button class="add-team-player-btn" data-team="${teamKey}">+</button>
      `;
    } else {
      addItem.innerHTML = `
        <span class="team-add-label">Adicionar</span>
        <span class="team-add-empty">Sem jogador livre</span>
        <button class="add-team-player-btn" data-team="${teamKey}" disabled>+</button>
      `;
    }

    container.appendChild(addItem);
  }
}

function renderRanking() {
  rankingList.innerHTML = '';
  const entries = Object.entries(state.ranking)
    .sort((a, b) => {
      if (b[1].points !== a[1].points) return b[1].points - a[1].points;
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      return a[0].localeCompare(b[0]);
    });

  if (!entries.length) {
    rankingList.innerHTML = '<li class="empty-state">Ainda não existe ranking salvo.</li>';
    return;
  }

  entries.forEach(([name, data], index) => {
    const item = document.createElement('li');
    item.className = 'ranking-item';
    const pointsClass = data.points >= 0 ? 'rank-points positive' : 'rank-points negative';
    item.innerHTML = `
      <div class="rank-emblem"><span>#${index + 1}</span></div>
      <div>
        <div class="rank-name">${escapeHtml(name)}</div>
        <div class="rank-meta">${data.wins}V • ${data.losses}D • ${data.matches} partidas • ${formatSkill(getPlayerSkill(name))}</div>
      </div>
      <div class="rank-right">
        <div class="${pointsClass}">${formatPoints(data.points)}</div>
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

  state.history.slice().reverse().forEach((match) => {
    const map = getMapById(match.mapId);
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-card-top">
        <span class="history-map">${escapeHtml(map.name)}</span>
        <span class="history-date">${new Date(match.timestamp).toLocaleString('pt-BR')}</span>
      </div>
      <div class="history-result">${match.winnerLabel === 'CT' ? 'CT venceu' : 'TR venceu'} • Vencedores +${MATCH_POINTS} / Derrotados até -${MATCH_POINTS}</div>
      <div class="history-teams">
        <div class="history-team-row"><strong>CT:</strong> ${escapeHtml(match.ct.join(', '))}</div>
        <div class="history-team-row"><strong>TR:</strong> ${escapeHtml(match.t.join(', '))}</div>
      </div>
      <div class="history-actions">
        <button class="edit-btn" data-id="${match.id}">Editar Registro</button>
      </div>
    `;
    historyList.appendChild(item);
  });
}

function updateControlStates() {
  shuffleBtn.disabled = players.length !== 10 || isRolling || Boolean(currentMatch);
  rerollBtn.disabled = !currentDraw || Boolean(currentMatch) || isRolling;
  addAfterDrawBtn.disabled = !currentDraw || Boolean(currentMatch);
  startMatchBtn.disabled = !currentDraw || Boolean(currentMatch) || isRolling || currentDraw.ct.length === 0 || currentDraw.t.length === 0;
  ctWinBtn.disabled = !currentMatch;
  tWinBtn.disabled = !currentMatch;
  autoAssembleBtn.disabled = state.playersDatabase.length < 10;
}

function saveNewDatabasePlayer() {
  const name = normalizeName(playerInput.value);
  const skill = normalizeSkill(playerSkillInput.value);
  if (!name) return;

  const result = addPlayerToDatabase(name, skill);
  playerInput.value = '';
  playerSkillInput.value = '';
  renderDatabasePlayers();
  renderRanking();
  updateControlStates();

  if (result === 'updated') {
    setSummary(`${name} já existia e teve a pontuação CS2 atualizada para ${formatSkill(skill)}.`);
  } else {
    setSummary(`${name} foi cadastrado com rating original de ${formatSkill(skill)}.`);
  }
}

function clearAll() {
  players = [];
  currentDraw = null;
  currentMatch = null;
  renderPlayers();
  renderTeams();
  rouletteNames.textContent = 'PRONTO';
  statusPill.textContent = 'Aguardando';
  statusPill.className = 'status-pill';
  setSummary('Nenhuma partida ativa. Sorteie os times primeiro e depois comece o jogo.');
  updateControlStates();
}

function autoAssembleLobby() {
  if (state.playersDatabase.length < 10) return;
  const shuffled = shuffleArray(state.playersDatabase.map((player) => player.name));
  players = shuffled.slice(0, 10);
  renderPlayers();
  setSummary('Lobby montado automaticamente com 10 jogadores cadastrados.');
}

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function animateDraw() {
  if (players.length !== 10 || isRolling || currentMatch) return;

  isRolling = true;
  currentDraw = null;
  updateControlStates();
  statusPill.textContent = 'Sorteando';
  statusPill.className = 'status-pill live';
  setSummary(`Balanceando os times pelo rating do CS2 em ${getMapById(mapSelect.value).name}...`);
  renderTeams();

  const cycles = 26;
  for (let i = 0; i < cycles; i++) {
    const sample = shuffleArray(players).slice(0, 2).join('  •  ');
    rouletteNames.textContent = sample;
    await sleep(70 + i * 10);
  }

  const balanced = getBalancedTeams(players);
  currentDraw = { ct: balanced.ct, t: balanced.t, createdAt: Date.now(), mapId: mapSelect.value };
  ensurePlayersInRanking(players);
  saveState();

  const ctAverage = getAverageSkill(currentDraw.ct);
  const tAverage = getAverageSkill(currentDraw.t);
  const diff = Math.abs(ctAverage - tAverage);

  rouletteNames.textContent = 'TIMES BALANCEADOS';
  renderTeams(currentDraw.ct, currentDraw.t);
  statusPill.textContent = 'Pronto';
  statusPill.className = 'status-pill done';
  setSummary(`Times balanceados por rating CS2. Média CT: ${ctAverage.toLocaleString('pt-BR')} • Média TR: ${tAverage.toLocaleString('pt-BR')} • Diferença: ${diff.toLocaleString('pt-BR')}.`);

  isRolling = false;
  updateControlStates();
  renderRanking();
}

function rerollTeams() {
  if (!currentDraw || currentMatch) return;
  players = [...currentDraw.ct, ...currentDraw.t];
  animateDraw();
}

function startMatch() {
  if (!currentDraw || currentMatch) return;
  currentMatch = { ...currentDraw, startedAt: Date.now() };
  statusPill.textContent = 'Partida Ao Vivo';
  statusPill.className = 'status-pill started';
  rouletteNames.textContent = 'VALENDO';
  setSummary(`Partida iniciada em ${getMapById(currentMatch.mapId).name}. Agora é bala, smoke e gritaria.`);
  updateControlStates();
}

function registerWinner(winnerSide) {
  if (!currentMatch) return;

  ensurePlayersInRanking([...currentMatch.ct, ...currentMatch.t]);
  state.history.push({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    winnerLabel: winnerSide,
    mapId: currentMatch.mapId,
    ct: [...currentMatch.ct],
    t: [...currentMatch.t]
  });

  recomputeRankingFromHistory();
  renderDatabasePlayers();
  renderRanking();
  renderHistory();

  statusPill.textContent = 'Resultado Salvo';
  statusPill.className = 'status-pill done';
  rouletteNames.textContent = winnerSide === 'CT' ? 'CT AMASSOU' : 'TR AMASSOU';
  setSummary(`${winnerSide === 'CT' ? 'CT' : 'TR'} venceu em ${getMapById(currentMatch.mapId).name}. Quem estava zerado não ficou negativo.`, true);

  currentMatch = null;
  currentDraw = null;
  updateControlStates();
  renderTeams();
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
  editingMatchId = null;
  editModal.classList.add('hidden');
}

function saveMatchEdit() {
  if (!editingMatchId) return;
  const match = state.history.find((entry) => entry.id === editingMatchId);
  if (!match) return;

  const ct = parsePlayerLines(editCtPlayers.value);
  const t = parsePlayerLines(editTPlayers.value);

  if (ct.length !== 5 || t.length !== 5) {
    alert('Cada time precisa ter exatamente 5 jogadores.');
    return;
  }

  const allPlayers = [...ct, ...t];
  const unique = new Set(allPlayers.map((name) => name.toLowerCase()));
  if (unique.size !== 10) {
    alert('Os 10 jogadores precisam ser únicos entre os dois times.');
    return;
  }

  ensurePlayersInRanking(allPlayers);
  match.mapId = editMapSelect.value;
  match.winnerLabel = editWinnerSelect.value;
  match.ct = ct;
  match.t = t;

  recomputeRankingFromHistory();
  renderDatabasePlayers();
  renderRanking();
  renderHistory();
  closeEditModal();
  setSummary('Registro editado com sucesso. O ranking foi recalculado com piso em zero para derrotas.');
}

function parsePlayerLines(text) {
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

function resetLocalData() {
  localStorage.removeItem(STORAGE_KEY);
  state = { playersDatabase: [], ranking: {}, history: [] };
  players = [];
  currentDraw = null;
  currentMatch = null;
  renderDatabasePlayers();
  renderPlayers();
  renderTeams();
  renderRanking();
  renderHistory();
  updateControlStates();
  setSummary('Dados locais resetados. A lenda foi apagada, por enquanto.');
}

function formatPoints(points) {
  const sign = points > 0 ? '+' : '';
  return `${sign}${points}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

addPlayerBtn.addEventListener('click', saveNewDatabasePlayer);
autoAssembleBtn.addEventListener('click', autoAssembleLobby);
clearBtn.addEventListener('click', clearAll);
shuffleBtn.addEventListener('click', animateDraw);
rerollBtn.addEventListener('click', rerollTeams);
addAfterDrawBtn.addEventListener('click', addPlayerAfterDraw);
startMatchBtn.addEventListener('click', startMatch);
ctWinBtn.addEventListener('click', () => registerWinner('CT'));
tWinBtn.addEventListener('click', () => registerWinner('T'));
resetHistoryBtn.addEventListener('click', resetLocalData);
closeModalBtn.addEventListener('click', closeEditModal);
saveEditBtn.addEventListener('click', saveMatchEdit);
mapSelect.addEventListener('change', updateMapBanner);
nextMapBtn.addEventListener('click', goToNextMap);
randomMapBtn.addEventListener('click', animateRandomMap);

playerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') saveNewDatabasePlayer();
});

playerSkillInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') saveNewDatabasePlayer();
});

databasePlayerList.addEventListener('click', (event) => {
  const addBtn = event.target.closest('.add-db-btn');
  if (addBtn) {
    addPlayerToLobby(addBtn.dataset.name);
    return;
  }

  const editBtn = event.target.closest('.edit-skill-btn');
  if (editBtn) {
    editPlayerSkill(editBtn.dataset.name);
    return;
  }

  const removeBtn = event.target.closest('.remove-db-btn');
  if (removeBtn) {
    removePlayerFromDatabase(removeBtn.dataset.name);
  }
});

playerList.addEventListener('click', (event) => {
  const btn = event.target.closest('.remove-btn');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  players.splice(index, 1);
  renderPlayers();
});

function handleTeamListClick(event, teamKey) {
  const removeBtn = event.target.closest('.remove-team-player-btn');
  if (removeBtn) {
    removePlayerFromDraw(teamKey, Number(removeBtn.dataset.index));
    return;
  }

  const addBtn = event.target.closest('.add-team-player-btn');
  if (!addBtn) return;
  const container = addBtn.closest('.team-add-slot');
  const select = container?.querySelector('.team-add-select');
  if (!select || !select.value) {
    setSummary('Escolha um jogador antes de adicionar no time.');
    return;
  }
  addPlayerToDraw(teamKey, select.value);
}

teamA.addEventListener('click', (event) => handleTeamListClick(event, 'ct'));
teamB.addEventListener('click', (event) => handleTeamListClick(event, 't'));

historyList.addEventListener('click', (event) => {
  const btn = event.target.closest('.edit-btn');
  if (!btn) return;
  openEditModal(btn.dataset.id);
});

editModal.addEventListener('click', (event) => {
  if (event.target === editModal) closeEditModal();
});

normalizeLegacyPlayersDatabase();
populateMapSelects();
renderDatabasePlayers();
renderPlayers();
renderTeams();
recomputeRankingFromHistory();
renderRanking();
renderHistory();
updateControlStates();
setSummary(migrationNote || 'Nenhuma partida ativa. Sorteie os times primeiro e depois comece o jogo.');
