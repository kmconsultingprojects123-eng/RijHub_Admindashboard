// Auth Middleware for Client-Side JWT Protection
// This script should be included in all protected admin pages

(function() {
    'use strict';
    
    // Configuration
    const TOKEN_KEY = 'token';
    const LOGIN_URL = '/aa/login/';
    let API_BASE_URL = null;
    
    // Load API base URL from config
    async function loadApiBase() {
        if (API_BASE_URL) return API_BASE_URL;
        try {
            const response = await fetch('/aa/public/admin/api/config/config.json');
            const config = await response.json();
            API_BASE_URL = config.apiBaseUrl;
            return API_BASE_URL;
        } catch (error) {
            console.error('Failed to load API config:', error);
            API_BASE_URL = 'https://rijhub.com/api'; // Fallback
            return API_BASE_URL;
        }
    }
    
    // Get token from localStorage
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }
    
    // Set token in localStorage and cookie
    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
        // Also set in cookie for PHP middleware to read
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
    
    // Remove token from localStorage and cookie
    function removeToken() {
        localStorage.removeItem(TOKEN_KEY);
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    // Decode JWT payload (without verification)
    function decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload;
        } catch (e) {
            return null;
        }
    }
    
    // Check if token is expired
    function isTokenExpired(payload) {
        if (!payload || !payload.exp) return true;
        return payload.exp * 1000 < Date.now(); // Convert to milliseconds
    }
    
    // Verify token with backend
    async function verifyToken(token) {
        try {
            const apiBase = await loadApiBase();
            const verifyUrl = `${apiBase}/api/auth/verify`;
            console.log('🌐 [AUTH] Calling API:', verifyUrl);
            
            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 [AUTH] API Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                console.error('❌ [AUTH] API returned non-OK status:', response.status);
                return false;
            }
            
            const data = await response.json();
            console.log('📥 [AUTH] API Response data:', data);
            
            const isValid = data.success && data.payload && data.payload.role === 'admin';
            console.log('🔐 [AUTH] Token validation result:', isValid);
            
            return isValid;
        } catch (error) {
            console.error('❌ [AUTH] Token verification failed with error:', error);
            return false;
        }
    }
    
    // Main authentication check
    async function checkAuth() {
        const token = getToken();
        console.log('Auth Middleware - Retrieved token:', token);
        // No token found
        if (!token) {
            redirectToLogin();
            return;
        }
        
        // Decode token
        const payload = decodeJWT(token);
        
        // Invalid token format
        if (!payload) {
            removeToken();
            redirectToLogin();
            return;
        }
        
        // Check if token is expired
        if (isTokenExpired(payload)) {
            removeToken();
            redirectToLogin();
            return;
        }
        
        // Check role
        if (payload.role !== 'admin') {
            console.error('❌ [AUTH] Invalid role:', payload.role);
            removeToken();
            redirectToLogin();
            return;
        }
        
        console.log('✅ [AUTH] All client-side checks passed!');
        
        // Optional: Verify with backend (COMMENTED OUT - not needed if PHP middleware handles it)
        // const isValid = await verifyToken(token);
        // if (!isValid) {
        //     console.error('❌ [AUTH] Backend verification failed');
        //     removeToken();
        //     redirectToLogin();
        //     return;
        // }
        
        console.log('🎉 [AUTH] Authentication complete - user is authenticated');
        
        // Token is valid - user is authenticated
        return payload;
    }
    
    // Redirect to login page
    function redirectToLogin() {
        console.log('🔄 [AUTH] Redirecting to login page:', LOGIN_URL);
        window.location.href = LOGIN_URL;
    }
    
    // Initialize authentication check
    async function init() {
        const currentPath = window.location.pathname;
        console.log('🔒 [AUTH] Initializing auth check for path:', currentPath);
        
        // Skip auth check on login/register pages
        if (currentPath.includes('/login') || currentPath.includes('/register')) {
            console.log('⏭️ [AUTH] Skipping auth check - on login/register page');
            return;
        }
        
        console.log('🔐 [AUTH] Running authentication check...');
        // Check authentication
        await checkAuth();
    }
    
    // Expose functions to window for use in other scripts
    window.authMiddleware = {
        getToken,
        setToken,
        removeToken,
        decodeJWT,
        isTokenExpired,
        verifyToken,
        checkAuth,
        redirectToLogin
    };
    
    // Auto-run authentication check when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
