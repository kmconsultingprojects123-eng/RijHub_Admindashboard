/**
 * Admin Logout Handler
 * Clears authentication tokens and redirects to login
 */

import { getApiBaseUrl, toast } from './config/_helper.js';

/**
 * Perform complete logout
 * - Calls backend logout endpoint (optional)
 * - Clears localStorage tokens
 * - Clears cookie tokens
 * - Redirects to login page
 */
export async function performLogout() {
    try {
        // Optional: Call backend logout endpoint to invalidate token
        const apiBase = getApiBaseUrl();
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                await fetch(`${apiBase}/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err) {
                // Continue logout even if backend call fails
                console.warn('Backend logout failed:', err);
            }
        }
        
        // Clear all tokens from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('access_token');
        
        // Clear all cookies
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        
        // Show success message
        toast.success('Logged out successfully');
        
        // Redirect to login page after short delay
        setTimeout(() => {
            window.location.href = '/aa/login/';
        }, 500);
        
    } catch (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed. Redirecting...');
        
        // Force redirect even on error
        setTimeout(() => {
            window.location.href = '/aa/login/';
        }, 1000);
    }
}

/**
 * Initialize logout buttons
 * Attach click handlers to all logout links/buttons
 */
function initLogoutButtons() {
    // Find all logout links
    const logoutLinks = document.querySelectorAll('[data-logout], [href*="logout"], [href="#logout"]');
    
    logoutLinks.forEach(link => {
        // Skip already initialized
        if (link.dataset.logoutInitialized) return;
        link.dataset.logoutInitialized = 'true';
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show confirmation dialog
            if (confirm('Are you sure you want to logout?')) {
                performLogout();
            }
        });
    });
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoutButtons);
} else {
    initLogoutButtons();
}

// Expose globally for manual logout calls
window.adminLogout = performLogout;
