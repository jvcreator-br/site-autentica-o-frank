async function updateSession() {
  const status = document.getElementById('status');
  const logout = document.getElementById('logout-form');

  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
      cache: 'no-store'
    });

    if (response.status === 401) {
      status.textContent = 'Você ainda não entrou. Escolha uma das opções acima.';
      status.dataset.state = 'guest';
      return;
    }

    if (!response.ok) throw new Error('session unavailable');
    const user = await response.json();
    const name = user.displayName || user.email || user.subject;
    status.textContent = 'Você está conectado como ' + name + '.';
    status.dataset.state = 'active';
    logout.hidden = false;
  } catch {
    status.textContent = 'Não foi possível consultar sua sessão. Atualize a página para tentar novamente.';
    status.dataset.state = 'error';
  } finally {
    status.setAttribute('aria-busy', 'false');
  }
}

updateSession();
