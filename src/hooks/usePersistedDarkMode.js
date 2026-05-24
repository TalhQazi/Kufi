import { useState, useEffect, useCallback } from 'react';
import api from '../api';

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

function getCurrentUserId() {
  const user = getCurrentUser();
  return user?._id || user?.id || null;
}

function getStorageKey(scope) {
  const userId = getCurrentUserId();
  if (!userId || !scope) return null;
  return `kufi-dark-mode-${scope}-${userId}`;
}

function readStoredDarkMode(scope) {
  try {
    const user = getCurrentUser();
    if (user && typeof user.darkMode === 'boolean') {
      return user.darkMode;
    }

    const key = getStorageKey(scope);
    if (!key) return false;
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function writeLocalDarkMode(scope, enabled) {
  const key = getStorageKey(scope);
  if (key) {
    localStorage.setItem(key, enabled ? 'true' : 'false');
  }

  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return;
    const user = JSON.parse(raw);
    user.darkMode = enabled;
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function panelScopeForRole(role) {
  if (role === 'admin') return 'admin';
  if (role === 'supplier') return 'supplier';
  return null;
}

/** Call after login so the panel can render the saved theme before the API fetch completes. */
export function cacheDarkModeForUser(user) {
  const scope = panelScopeForRole(user?.role);
  if (!user || !scope) return;

  const userId = user._id || user.id;
  if (!userId) return;

  const enabled = Boolean(user.darkMode);
  localStorage.setItem(`kufi-dark-mode-${scope}-${userId}`, enabled ? 'true' : 'false');
  localStorage.setItem('currentUser', JSON.stringify({ ...user, darkMode: enabled }));
}

/**
 * Persists dark mode per user account on the server (syncs across devices),
 * with localStorage as a fast cache for the current browser.
 */
export function usePersistedDarkMode(scope) {
  const userId = getCurrentUserId();

  const [darkMode, setDarkMode] = useState(() => readStoredDarkMode(scope));

  useEffect(() => {
    setDarkMode(readStoredDarkMode(scope));

    if (!userId) return;

    let cancelled = false;

    api
      .get('/auth/preferences')
      .then(({ data }) => {
        if (cancelled) return;
        const serverDarkMode = Boolean(data?.darkMode);
        setDarkMode(serverDarkMode);
        writeLocalDarkMode(scope, serverDarkMode);
      })
      .catch(() => {
        // Keep cached/local value when offline
      });

    return () => {
      cancelled = true;
    };
  }, [scope, userId]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      writeLocalDarkMode(scope, next);
      api.patch('/auth/preferences', { darkMode: next }).catch(() => {});
      return next;
    });
  }, [scope]);

  return [darkMode, toggleDarkMode, setDarkMode];
}
