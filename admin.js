const ADMIN_STORAGE_KEY = 'cs-dos-campeoes-admin-v1';
const APP_STORAGE_KEY = 'cs-dos-campeoes-local-data-v7';
const APP_LEGACY_KEYS = ['cs-dos-campeoes-local-data-v6', 'cs-dos-campeoes-local-data-v5', 'cs-dos-campeoes-local-data-v4'];
const ADMIN_SESSION_KEY = 'cs-dos-campeoes-admin-session';
const MAX_LOGS = 250;
const supabaseConfig = window.CSTEAM_SUPABASE || null;
const supabaseClient = supabaseConfig?.client || null;

const adminLoginPanel = document.getElementById('adminLoginPanel');
const adminContent = document.getElementById('adminContent');
const adminUsernameInput = document.getElementById('adminUsernameInput');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminSessionBadge = document.getElementById('adminSessionBadge');
const adminCountValue = document.getElementById('adminCountValue');
const adminPlayersValue = document.getElementById('adminPlayersValue');
const adminMatchesValue = document.getElementById('adminMatchesValue');
const adminLogsValue = document.getElementById('adminLogsValue');
const newAdminUsernameInput = document.getElementById('newAdminUsernameInput');
const newAdminPasswordInput = document.getElementById('newAdminPasswordInput');
const createAdminBtn = document.getElementById('createAdminBtn');
const createAdminMessage = document.getElementById('createAdminMessage');
const adminList = document.getElementById('adminList');
const adminPlayerList = document.getElementById('adminPlayerList');
const adminResetDataBtn = document.getElementById('adminResetDataBtn');
const resetDataMessage = document.getElementById('resetDataMessage');
const adminLogList = document.getElementById('adminLogList');

let adminState = loadAdminState();
let appState = normalizeAppState(null);
let activeAdmin = getActiveAdmin();

function normalizeAdminState(raw) {
  return {
    admins: Array.isArray(raw?.admins) ? raw.admins : [],
    logs: Array.isArray(raw?.logs) ? raw.logs : []
  };
}

function normalizeAppState(raw) {
  return {
    playersDatabase: Array.isArray(raw?.playersDatabase) ? raw.playersDatabase : [],
    ranking: raw?.ranking || {},
    history: Array.isArray(raw?.history) ? raw.history : []
  };
}

function hasData(raw) {
  return !!(raw && (raw.playersDatabase?.length || raw.history?.length || Object.keys(raw.ranking || {}).length));
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function loadAdminState() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));
    const initial = normalizeAdminState(raw);
    ensureRootAdmin(initial);
    saveAdminState(initial);
    return initial;
  } catch {
    const initial = normalizeAdminState(null);
    ensureRootAdmin(initial);
    saveAdminState(initial);
    return initial;
  }
}

function ensureRootAdmin(target) {
  const existing = target.admins.find((admin) => admin.username.toLowerCase() === 'tarantine');
  const root = {
    id: existing?.id || 'root-admin-tarantine',
    username: 'Tarantine',
    password: 'Aspirine@010203040506',
    role: 'owner',
    createdAt: existing?.createdAt || new Date().toISOString()
  };

  target.admins = target.admins.filter((admin) => admin.username.toLowerCase() !== 'tarantine');
  target.admins.unshift(root);
}

function saveAdminState(state = adminState) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
}

function saveAppCache(state = appState) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}

async function loadRemoteAppState() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from(supabaseConfig.stateTable)
    .select('payload')
    .eq('id', supabaseConfig.stateRowId)
    .maybeSingle();

  if (error) {
    console.error('Falha ao carregar estado global.', error);
    return null;
  }

  return normalizeAppState(data?.payload || null);
}

async function saveRemoteAppState() {
  if (!supabaseClient) {
    saveAppCache();
    return;
  }

  const { error } = await supabaseClient
    .from(supabaseConfig.stateTable)
    .upsert({
      id: supabaseConfig.stateRowId,
      payload: appState,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) {
    console.error('Falha ao salvar estado global.', error);
    throw error;
  }

  saveAppCache();
}

async function loadAppState() {
  const remote = await loadRemoteAppState();
  if (hasData(remote)) {
    appState = normalizeAppState(remote);
    saveAppCache();
    return appState;
  }

  const current = readStorage(APP_STORAGE_KEY);
  if (hasData(current)) {
    appState = normalizeAppState(current);
    try {
      await saveRemoteAppState();
    } catch {}
    return appState;
  }

  for (const key of APP_LEGACY_KEYS) {
    const legacy = readStorage(key);
    if (hasData(legacy)) {
      appState = normalizeAppState(legacy);
      saveAppCache();
      try {
        await saveRemoteAppState();
      } catch {}
      return appState;
    }
  }

  appState = normalizeAppState(null);
  return appState;
}

function setSession(admin) {
  if (!admin) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    activeAdmin = null;
    return;
  }
  const safeSession = {
    id: admin.id,
    username: admin.username,
    role: admin.role
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(safeSession));
  activeAdmin = safeSession;
}

function getActiveAdmin() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY));
    if (!raw?.id) return null;
    const exists = adminState.admins.find((admin) => admin.id === raw.id);
    return exists ? raw : null;
  } catch {
    return null;
  }
}

function showMessage(element, text, type = 'info') {
  element.textContent = text;
  element.className = `admin-message ${type}`;
}

function clearMessage(element) {
  element.textContent = '';
  element.className = 'admin-message';
}

function addLog(type, message, meta = {}) {
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    message,
    meta,
    admin: activeAdmin?.username || null,
    createdAt: new Date().toISOString()
  };

  adminState.logs.unshift(entry);
  adminState.logs = adminState.logs.slice(0, MAX_LOGS);
  saveAdminState();
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleString('pt-BR');
  } catch {
    return date;
  }
}

function getPlayerStats(name) {
  const record = appState.ranking?.[name] || { wins: 0, losses: 0, points: 0, matches: 0 };
  return {
    wins: Number(record.wins) || 0,
    losses: Number(record.losses) || 0,
    points: Number(record.points) || 0
  };
}

function renderAdminList() {
  if (!adminState.admins.length) {
    adminList.innerHTML = '<li class="empty-state">Nenhum administrador cadastrado.</li>';
    return;
  }

  adminList.innerHTML = adminState.admins.map((admin) => {
    const canRemove = activeAdmin?.role === 'owner' && admin.role !== 'owner';
    return `
      <li class="name-item db-item admin-user-item">
        <div class="db-player-main">
          <div class="admin-avatar-badge">${admin.role === 'owner' ? 'D' : 'A'}</div>
          <div class="db-player-meta">
            <strong>${escapeHtml(admin.username)}</strong>
            <span class="db-skill">${admin.role === 'owner' ? 'Dono principal' : 'Administrador'}</span>
          </div>
        </div>
        <div class="db-actions">
          ${canRemove ? `<button class="small-action remove-db-btn" data-remove-admin="${escapeHtml(admin.id)}">×</button>` : ''}
        </div>
      </li>
    `;
  }).join('');
}

function renderPlayers() {
  if (!appState.playersDatabase.length) {
    adminPlayerList.innerHTML = '<li class="empty-state">Nenhum jogador cadastrado.</li>';
    return;
  }

  adminPlayerList.innerHTML = appState.playersDatabase.map((player) => {
    const stats = getPlayerStats(player.name);
    return `
      <li class="name-item db-item admin-player-item">
        <div class="db-player-main">
          <img class="player-avatar" src="${escapeHtml(player.avatar || 'logo.png')}" alt="${escapeHtml(player.name)}" />
          <div class="db-player-meta">
            <strong>${escapeHtml(player.name)}</strong>
            <span class="db-skill">CSficação: ${(Number(player.skill) || 0).toLocaleString('pt-BR')}</span>
            <div class="player-stat-chips">
              <span class="player-stat-chip">${stats.wins} vitórias</span>
              <span class="player-stat-chip">${stats.losses} derrotas</span>
              <span class="player-stat-chip">${stats.points} pontos</span>
            </div>
          </div>
        </div>
        <div class="db-actions">
          <button class="small-action remove-db-btn" data-remove-player="${escapeHtml(player.name)}">×</button>
        </div>
      </li>
    `;
  }).join('');
}

function renderLogs() {
  const combinedLogs = [
    ...adminState.logs,
    ...appState.history.map((match) => ({
      id: `match-${match.id}`,
      type: 'partida',
      message: `${match.winnerLabel} venceu em ${match.mapName || match.map || 'Mapa desconhecido'}`,
      meta: { ct: match.ct, t: match.t },
      admin: null,
      createdAt: match.recordedAt || match.date || new Date().toISOString()
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!combinedLogs.length) {
    adminLogList.innerHTML = '<li class="empty-state">Nenhum log ainda.</li>';
    return;
  }

  adminLogList.innerHTML = combinedLogs.map((entry) => `
    <li class="history-item admin-log-item">
      <div class="admin-log-topline">
        <strong>${escapeHtml(entry.type)}</strong>
        <span>${escapeHtml(formatDate(entry.createdAt))}</span>
      </div>
      <div class="admin-log-message">${escapeHtml(entry.message)}</div>
      <div class="admin-log-meta">${entry.admin ? `por ${escapeHtml(entry.admin)}` : 'registro automático'}</div>
    </li>
  `).join('');
}

function updateOverview() {
  adminCountValue.textContent = String(adminState.admins.length);
  adminPlayersValue.textContent = String(appState.playersDatabase.length);
  adminMatchesValue.textContent = String(appState.history.length);
  adminLogsValue.textContent = String(adminState.logs.length + appState.history.length);
  adminSessionBadge.textContent = activeAdmin ? `${activeAdmin.username} · ${activeAdmin.role === 'owner' ? 'Dono' : 'Admin'}` : 'Logado';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function refreshAdminView() {
  await loadAppState();
  adminState = loadAdminState();
  activeAdmin = getActiveAdmin();

  const isLogged = !!activeAdmin;
  adminLoginPanel.classList.toggle('hidden', isLogged);
  adminContent.classList.toggle('hidden', !isLogged);

  if (!isLogged) return;

  updateOverview();
  renderAdminList();
  renderPlayers();
  renderLogs();
}

async function handleLogin() {
  const username = adminUsernameInput.value.trim();
  const password = adminPasswordInput.value;

  const found = adminState.admins.find((admin) => admin.username.toLowerCase() === username.toLowerCase() && admin.password === password);
  if (!found) {
    showMessage(adminLoginMessage, 'Login ou senha inválidos.', 'error');
    return;
  }

  setSession(found);
  addLog('login', `Login administrativo realizado por ${found.username}.`);
  clearMessage(adminLoginMessage);
  adminUsernameInput.value = '';
  adminPasswordInput.value = '';
  await refreshAdminView();
}

async function handleCreateAdmin() {
  clearMessage(createAdminMessage);
  const username = newAdminUsernameInput.value.trim();
  const password = newAdminPasswordInput.value;

  if (!username || !password) {
    showMessage(createAdminMessage, 'Preencha login e senha do novo admin.', 'error');
    return;
  }

  if (adminState.admins.some((admin) => admin.username.toLowerCase() === username.toLowerCase())) {
    showMessage(createAdminMessage, 'Já existe um administrador com esse login.', 'error');
    return;
  }

  const newAdmin = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    username,
    password,
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  adminState.admins.push(newAdmin);
  saveAdminState();
  addLog('admin', `Administrador ${username} foi cadastrado.`);
  newAdminUsernameInput.value = '';
  newAdminPasswordInput.value = '';
  showMessage(createAdminMessage, 'Administrador cadastrado com sucesso.', 'success');
  await refreshAdminView();
}

async function removeAdmin(id) {
  const admin = adminState.admins.find((entry) => entry.id === id);
  if (!admin || admin.role === 'owner') return;

  adminState.admins = adminState.admins.filter((entry) => entry.id !== id);
  saveAdminState();
  addLog('admin', `Administrador ${admin.username} foi removido.`);
  await refreshAdminView();
}

async function removePlayer(name) {
  const target = appState.playersDatabase.find((player) => player.name === name);
  if (!target) return;

  appState.playersDatabase = appState.playersDatabase.filter((player) => player.name !== name);
  await saveRemoteAppState();
  addLog('jogador', `Jogador ${name} foi removido do cadastro.`);
  await refreshAdminView();
}

async function resetAllData() {
  const confirmed = window.confirm('Tem certeza que deseja resetar todos os dados do site? Essa ação remove jogadores, ranking e histórico.');
  if (!confirmed) return;

  appState = normalizeAppState(null);
  await saveRemoteAppState();
  addLog('reset', 'Todos os dados do site foram resetados.');
  showMessage(resetDataMessage, 'Dados resetados com sucesso.', 'success');
  await refreshAdminView();
}

adminLoginBtn?.addEventListener('click', handleLogin);
adminPasswordInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleLogin();
});
adminLogoutBtn?.addEventListener('click', async () => {
  addLog('logout', `Logout realizado por ${activeAdmin?.username || 'admin'}.`);
  setSession(null);
  await refreshAdminView();
});
createAdminBtn?.addEventListener('click', handleCreateAdmin);
adminResetDataBtn?.addEventListener('click', resetAllData);

adminList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-admin]');
  if (!button) return;
  removeAdmin(button.getAttribute('data-remove-admin'));
});

adminPlayerList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-player]');
  if (!button) return;
  const playerName = button.getAttribute('data-remove-player');
  const confirmed = window.confirm(`Remover ${playerName} dos jogadores cadastrados?`);
  if (!confirmed) return;
  removePlayer(playerName);
});

refreshAdminView();
