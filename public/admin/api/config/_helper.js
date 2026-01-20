// helpers/apiConfig.js
// Uses global axios (loaded from CDN)

// ──────────────────────────────────────────────────
// 1. CONFIG LOADER (Singleton)
// ──────────────────────────────────────────────────
let configPromise = null;
let config = null;

export async function getApiBaseUrl() {
  if (config?.apiBaseUrl) return config.apiBaseUrl;
  if (configPromise) return await configPromise;

  configPromise = axios.get('/aa/public/admin/api/config/config.json')
    .then(response => {
      // console.log('Config response:', response);
      config = response.data;
      if (!config.apiBaseUrl) {
        throw new Error('config.json is missing "apiBaseUrl" field');
      }
      console.log('API Config loaded:', config.apiBaseUrl);
      return config.apiBaseUrl;
    })
    .catch(err => {
      console.error('Failed to load config.json:', err.message);
      toast.error('Cannot load app configuration');
      throw err;
    });

  return await configPromise;
}

export async function getConfig() {
  await getApiBaseUrl();
  return config;
}

export async function getApi() {
  const baseURL = await getApiBaseUrl();
  const instance = axios.create({
    baseURL,
    withCredentials: false,
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000 // 30 seconds timeout
  });

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        // Server responded with error status
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // Request made but no response received
        console.error('API No Response:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          message: 'Server did not respond. Check if server is running and CORS is configured.'
        });
      } else {
        console.error('API Request Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// ──────────────────────────────────────────────────
// 2.5. FRONTEND AUTH HELPERS
// ──────────────────────────────────────────────────
/**
 * Try to read a stored JWT token from cookie or localStorage.
 * Returns token string or null.
 */
export function getStoredToken() {
  console.log('🔍 [HELPER] getStoredToken called');
  
  // Check token cookie first
  try {
    const match = document.cookie.match('(^|;)\\s*' + 'token' + '\\s*=\\s*([^;]+)');
    if (match) {
      const token = decodeURIComponent(match.pop());
      console.log('✅ [HELPER] Token found in cookie:', token.substring(0, 20) + '...');
      return token;
    }
    console.log('⚠️ [HELPER] No token in cookie');
  } catch (e) {
    console.error('❌ [HELPER] Error reading cookie:', e);
  }

  // Check localStorage for token
  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ [HELPER] Token found in localStorage:', token.substring(0, 20) + '...');
      return token;
    }
    console.log('⚠️ [HELPER] No token in localStorage');
  } catch (e) {
    console.error('❌ [HELPER] Error reading localStorage:', e);
  }

  // Fallback to generic token keys
  try {
    const match = document.cookie.match('(^|;)\\s*' + 'token' + '\\s*=\\s*([^;]+)');
    if (match) return decodeURIComponent(match.pop());
  } catch (e) {
    // ignore
  }

  try {
    const keys = ['token', 'niels_user_token', 'auth_token', 'accessToken', 'access_token'];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Store a token in localStorage and cookie for artisan admin.
 */
export function setStoredToken(token) {
  try { 
    localStorage.setItem('token', token); 
  } catch (e) { /* ignore */ }
  
  try { 
    // Set cookie with 7 days expiry
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = 'token=' + encodeURIComponent(token) + 
                      '; Path=/; Expires=' + expires.toUTCString() + '; SameSite=Lax'; 
  } catch (e) { /* ignore */ }
  
  // Fallback generic keys
  try { localStorage.setItem('token', token); } catch (e) { /* ignore */ }
  try { document.cookie = 'token=' + encodeURIComponent(token) + '; Path=/; SameSite=Lax'; } catch (e) { /* ignore */ }
}

/**
 * Check whether the frontend considers the user logged in.
 * If `validateWithServer` is true this will call the API endpoint
 * `/auth/verify` (GET) with `Authorization: Bearer <token>` to confirm validity.
 * Returns boolean.
 */
export async function isFrontendLoggedIn({ validateWithServer = false } = {}) {
  const token = getStoredToken();
  if (!token) return false;
  if (!validateWithServer) return true;

  try {
    const api = await getApi();
    const resp = await api.get('/auth/verify', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Token verification response:', resp.data);
    // Accept several response shapes (depends on your API)
    if (!resp || !resp.data) return false;
    const d = resp.data;
    return !!(d.success || d.valid || d.authenticated || d.isAuthenticated || d.user);
  } catch (err) {
    return false;
  }
}

/**
 * Remove stored frontend token (cookie + localStorage keys)
 */
export function logoutFrontend() {
  // Remove artisan admin token
  try {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  } catch (e) {}
  try { localStorage.removeItem('token'); } catch (e) {}
  
  // Remove generic tokens
  try {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  } catch (e) {}
  try { localStorage.removeItem('token'); } catch (e) {}
  try { localStorage.removeItem('niels_user_token'); } catch (e) {}
  try { localStorage.removeItem('auth_token'); } catch (e) {}
  try { localStorage.removeItem('accessToken'); } catch (e) {}
  try { localStorage.removeItem('access_token'); } catch (e) {}
}

// ──────────────────────────────────────────────────
// 2. ANDROID-STYLE TOAST SYSTEM
// ──────────────────────────────────────────────────
const toast = (function () {
  // Create toast container once
  const container = document.createElement('div');
  container.id = 'custom-toast-container';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
    fontFamily: 'system-ui, sans-serif'
  });
  document.body.appendChild(container);

  function createToast(message, type = 'info', duration = 3000) {
    const toastEl = document.createElement('div');
    const bgColor = {
      success: '#4caf50',
      error: '#f44336',
      info: '#2196f3',
      warning: '#ff9800'
    }[type] || '#333';

    Object.assign(toastEl.style, {
      minWidth: '250px',
      maxWidth: '90vw',
      padding: '14px 20px',
      borderRadius: '50px',
      backgroundColor: bgColor,
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '15px',
      fontWeight: '500',
      opacity: '0',
      transform: 'translateY(100px)',
      transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      pointerEvents: 'auto',
      cursor: 'pointer'
    });

    toastEl.textContent = message;

    container.appendChild(toastEl);

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateY(0)';
    });

    // Auto remove
    const timeout = setTimeout(() => remove(), duration);

    // Click to dismiss
    toastEl.onclick = () => {
      clearTimeout(timeout);
      remove();
    };

    function remove() {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(100px)';
      toastEl.addEventListener('transitionend', () => {
        if (toastEl.parentNode) container.removeChild(toastEl);
      });
    }
  }

  return {
    success: (msg, duration) => createToast(msg, 'success', duration),
    error:   (msg, duration) => createToast(msg, 'error', duration || 5000),
    info:    (msg, duration) => createToast(msg, 'info', duration),
    warning: (msg, duration) => createToast(msg, 'warning', duration)
  };
})();

// Export toast so you can use it anywhere
export { toast };