const elements = {
  status: document.getElementById('status'),
  logout: document.getElementById('logout-form'),
  sessionPill: document.getElementById('session-pill'),
  providerBadge: document.getElementById('provider-badge'),
  userAvatar: document.getElementById('user-avatar'),
  userName: document.getElementById('user-name'),
  userEmail: document.getElementById('user-email'),
  userSubject: document.getElementById('user-subject'),
  sessionState: document.getElementById('session-state'),
  lastCheck: document.getElementById('last-check'),
  loginTitle: document.getElementById('login-title'),
  loginCopy: document.getElementById('login-copy')
};

function setSessionMode(mode) {
  document.body.dataset.session = mode;
}

function setStatus(message, state) {
  elements.status.textContent = message;
  elements.status.dataset.state = state;
  elements.status.setAttribute('aria-busy', 'false');
}

function updateBadges(text) {
  elements.sessionPill.textContent = text;
  elements.providerBadge.textContent = text;
}

function updateLastCheck() {
  elements.lastCheck.textContent = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function providerName(issuer) {
  if (issuer === 'https://accounts.google.com' || issuer === 'accounts.google.com') return 'Google';
  if (issuer === 'https://github.com') return 'GitHub';
  return 'Conta externa';
}

function initials(value) {
  const parts = String(value || 'JA').trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map(part => part[0]).join('');
  return letters ? letters.toUpperCase() : 'JA';
}

function renderGuest() {
  setSessionMode('guest');
  updateBadges('Sem sessão');
  elements.userAvatar.textContent = 'JA';
  elements.userName.textContent = 'Visitante';
  elements.userEmail.textContent = 'Entre com Google ou GitHub para continuar.';
  elements.userSubject.textContent = '-';
  elements.sessionState.textContent = 'Não autenticado';
  elements.loginTitle.textContent = 'Login disponível';
  elements.loginCopy.textContent = 'Escolha Google ou GitHub para iniciar o fluxo OAuth.';
  elements.logout.hidden = true;
  updateLastCheck();
  setStatus('Nenhuma sessão ativa neste navegador.', 'guest');
}

function renderUser(user) {
  const name = user.displayName || user.email || user.subject || 'Usuário autenticado';
  const provider = providerName(user.issuer);

  setSessionMode('active');
  updateBadges(provider);
  elements.userAvatar.textContent = initials(name);
  elements.userName.textContent = name;
  elements.userEmail.textContent = user.email || 'E-mail não informado pelo provedor.';
  elements.userSubject.textContent = user.subject || '-';
  elements.sessionState.textContent = 'Autenticado';
  elements.loginTitle.textContent = 'Sessão ativa';
  elements.loginCopy.textContent = 'Você já está conectado. Use o botão de sair quando terminar.';
  elements.logout.hidden = false;
  updateLastCheck();
  setStatus('Você está conectado com ' + provider + '.', 'active');
}

function renderError() {
  setSessionMode('error');
  updateBadges('Erro');
  elements.userAvatar.textContent = '!';
  elements.userName.textContent = 'Sessão indisponível';
  elements.userEmail.textContent = 'Não foi possível consultar /api/me agora.';
  elements.userSubject.textContent = '-';
  elements.sessionState.textContent = 'Erro na consulta';
  elements.loginTitle.textContent = 'Tente novamente';
  elements.loginCopy.textContent = 'Atualize a página ou faça login de novo se a sessão expirou.';
  elements.logout.hidden = true;
  updateLastCheck();
  setStatus('Não foi possível consultar sua sessão. Atualize a página para tentar novamente.', 'error');
}

async function updateSession() {
  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
      cache: 'no-store'
    });

    if (response.status === 401) {
      renderGuest();
      return;
    }

    if (!response.ok) throw new Error('session unavailable');
    renderUser(await response.json());
  } catch {
    renderError();
  }
}

updateSession();
