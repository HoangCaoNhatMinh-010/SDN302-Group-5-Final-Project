const TOKEN_KEY = 'clinic-token';

export function getToken() {
  if (typeof window === 'undefined') return null;

  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) return token;

  try {
    const persisted = JSON.parse(window.localStorage.getItem('clinic-auth') || 'null');
    return persisted?.state?.token || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem('clinic-auth');
  }
}