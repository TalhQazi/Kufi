import axios from 'axios';

// Live view / production: uses Vercel backend by default. For local backend, set VITE_API_URL in .env.local
const API_BASE_URL =
  import.meta.env.VITE_API_URL || '/api';
// settings of api route
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const resolveAuthToken = () => {
    try {
        const candidates = [
            localStorage.getItem('authToken'),
            localStorage.getItem('token'),
            localStorage.getItem('adminToken'),
            localStorage.getItem('accessToken'),
        ].filter(Boolean)

        for (const candidate of candidates) {
            const raw = String(candidate).trim()
            if (!raw) continue

            // If token accidentally stored as JSON: { token: "..." }
            if (raw.startsWith('{') && raw.endsWith('}')) {
                try {
                    const parsed = JSON.parse(raw)
                    const parsedToken = parsed?.token || parsed?.accessToken
                    if (parsedToken) return String(parsedToken).trim()
                } catch {
                    // ignore
                }
            }

            return raw
        }
    } catch {
        return ''
    }
    return ''
}

// Exposed so "save before the page goes away" code paths (pagehide /
// visibilitychange) can build a keepalive fetch, which axios cannot do.
export const getAuthToken = resolveAuthToken;
export const getApiBaseUrl = () => String(API_BASE_URL || '').replace(/\/$/, '');

/**
 * Turn a server-relative asset path (e.g. `/api/blogs/<id>/image`, `/uploads/x.jpg`)
 * into something the browser can load, whether the backend is same-origin behind the
 * dev proxy or a separate deployment addressed by VITE_API_URL.
 *
 * Absolute URLs and data: URIs are returned untouched.
 */
export function resolveAssetUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
    if (!raw.startsWith('/')) return raw;

    // Strip the trailing `/api` so a path that already contains it is not doubled.
    const origin = getApiBaseUrl().replace(/\/api$/, '');
    return `${origin}${raw}`;
}

/** Fired when the backend rejects our token, so the app can drop to a logged-out state. */
export const SESSION_EXPIRED_EVENT = 'kufi_session_expired';

const SESSION_STORAGE_KEYS = [
    'authToken',
    'token',
    'adminToken',
    'accessToken',
    'currentUser',
    'userRole',
];

export function clearStoredSession() {
    try {
        SESSION_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
        // ignore
    }
}

/**
 * True when a JWT is absent, malformed, or past its `exp`.
 *
 * Tokens are issued with expiresIn 360000s (~4.2 days) while `currentUser` and
 * `userRole` live in localStorage indefinitely. Without this check the app treats a
 * long-idle user as signed in, renders their panel, and then every API call returns
 * 401 — which looks exactly like "my data disappeared".
 */
export function isTokenExpired(token) {
    const raw = String(token || '').trim();
    if (!raw) return true;

    const parts = raw.split('.');
    if (parts.length !== 3) return true;

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
        if (!payload || typeof payload.exp !== 'number') return false; // no exp claim = no expiry
        // 30s of leeway for clock skew.
        return Date.now() >= payload.exp * 1000 - 30000;
    } catch {
        return true;
    }
}

export function hasValidSession() {
    return !isTokenExpired(resolveAuthToken());
}

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = resolveAuthToken();
        if (token) {
            config.headers = config.headers || {}
            // Support both common auth header styles used by different backends
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// A 401 means the token is missing/expired/invalid (the backend uses 403 for
// insufficient role). Drop the dead session and tell the app, so the user is asked to
// sign in again instead of staring at a panel where every request silently fails.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = String(error?.config?.url || '');
        // A failed login/registration attempt is not an expired session.
        const isAuthAttempt = /\/auth\/(login|register|forgot|reset)/i.test(url);

        if (status === 401 && !isAuthAttempt) {
            clearStoredSession();
            try {
                window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
            } catch {
                // ignore
            }
        }
        return Promise.reject(error);
    }
);

export default api;
