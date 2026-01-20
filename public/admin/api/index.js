import { getApi, toast, getStoredToken } from './config/_helper.js';

// Admin Dashboard - Platform Overview
let api = null;

// Helper functions
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '₦0.00';
    return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-sm bg-warning">Pending</span>',
        'approved': '<span class="badge badge-sm bg-success">Approved</span>',
        'rejected': '<span class="badge badge-sm bg-danger">Rejected</span>',
        'completed': '<span class="badge badge-sm bg-success">Completed</span>',
        'in-progress': '<span class="badge badge-sm bg-info">In Progress</span>',
        'cancelled': '<span class="badge badge-sm bg-danger">Cancelled</span>',
        'open': '<span class="badge badge-sm bg-primary">Open</span>',
        'filled': '<span class="badge badge-sm bg-success">Filled</span>',
        'closed': '<span class="badge badge-sm bg-secondary">Closed</span>',
        'proposed': '<span class="badge badge-sm bg-info">Proposed</span>',
        'accepted': '<span class="badge badge-sm bg-success">Accepted</span>'
    };
    return badges[status] || `<span class="badge badge-sm bg-secondary">${escapeHtml(status)}</span>`;
}

(async function () {
    api = await getApi();
    
    // Attach authorization token
    try {
        const token = getStoredToken();
        if (token) {
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }
    } catch (e) {
        console.warn('Failed to attach token to API', e);
    }
    
    // Load dashboard data
    loadDashboard();
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboard();
        });
    }
})();

// Load Dashboard Data
async function loadDashboard() {
    try {
        // Show loading state
        showLoading();
        
        // Fetch central feed data
        const response = await api.get('/admin/central', { params: { limit: 10 } });
        //console.log('Dashboard response:', response);
        
        const data = response.data?.data || {};
        const summary = data.summary || {};
        const counts = summary.counts || {};
        const recent = data.recent || {};
        
        // Update summary cards
        updateSummaryCards(counts);
        
        // Render top artisans
        if (summary.topArtisansByJobs) {
            renderTopArtisans(summary.topArtisansByJobs);
        }
        
        // Render recent sections
        if (recent.bookings) renderRecentBookings(recent.bookings);
        if (recent.users) renderRecentUsers(recent.users);
        if (recent.jobs) renderRecentJobs(recent.jobs);
        if (recent.quotes) renderRecentQuotes(recent.quotes);
        
        // Load pending verifications separately
        await loadPendingVerifications();
        
        // Load revenue data
        await loadRevenueData();
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        hideLoading();
        toast.error('Error loading dashboard data');
    }
}

// Show/Hide Loading
function showLoading() {
    const loaders = document.querySelectorAll('.dashboard-loader');
    loaders.forEach(loader => loader.style.display = 'flex');
}

function hideLoading() {
    const loaders = document.querySelectorAll('.dashboard-loader');
    loaders.forEach(loader => loader.style.display = 'none');
}

// Update Summary Cards
function updateSummaryCards(counts) {
    const totalArtisans = counts.artisans || 0;
    const totalCustomers = (counts.users || 0) - totalArtisans; // Users minus artisans = customers
    
    document.getElementById('totalArtisans').textContent = formatNumber(totalArtisans);
    document.getElementById('totalCustomers').textContent = formatNumber(totalCustomers);
    document.getElementById('totalJobs').textContent = formatNumber(counts.bookings || 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(counts.transactionsTotal || 0);
}

// Render Top Artisans
function renderTopArtisans(artisans) {
    const container = document.getElementById('top-artisans-list');
    if (!container) return;
    
    // Remove existing rows
    const existingRows = container.querySelectorAll('.nk-tb-item');
    existingRows.forEach(row => row.remove());
    
    if (!artisans || artisans.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'nk-tb-item';
        emptyDiv.innerHTML = '<div class="nk-tb-col"><p class="text-muted text-center py-3">No artisans yet</p></div>';
        container.appendChild(emptyDiv);
        return;
    }
    
    artisans.slice(0, 5).forEach((artisan, index) => {
        const user = artisan.userId || {};
        const profileImg = user.profileImage?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User');
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <span class="tb-lead fw-bold">#${index + 1}</span>
            </div>
            <div class="nk-tb-col">
                <div class="user-card">
                    <div class="user-avatar xs bg-primary">
                        <img src="${escapeHtml(profileImg)}" alt="${escapeHtml(user.name || 'User')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <div class="user-info">
                        <span class="tb-lead">${escapeHtml(user.name || 'Unknown')}</span>
                        <span class="text-soft">${escapeHtml(user.email || 'N/A')}</span>
                    </div>
                </div>
            </div>
            <div class="nk-tb-col text-end">
                <span class="badge badge-dim bg-outline-primary">${artisan.totalJobs || 0} jobs</span>
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Render Recent Bookings
function renderRecentBookings(bookings) {
    const container = document.getElementById('recent-bookings-list');
    if (!container) return;
    
    const existingRows = container.querySelectorAll('.nk-tb-item');
    existingRows.forEach(row => row.remove());
    
    if (!bookings || bookings.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'nk-tb-item';
        emptyDiv.innerHTML = '<div class="nk-tb-col"><p class="text-muted text-center py-3">No recent bookings</p></div>';
        container.appendChild(emptyDiv);
        return;
    }
    
    bookings.slice(0, 5).forEach(booking => {
        const customer = booking.customerId || {};
        const artisan = booking.artisanId || {};
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <span class="tb-lead">${escapeHtml(booking.service || 'N/A')}</span>
                <span class="text-soft">${escapeHtml(customer.name || 'Unknown')}</span>
            </div>
            <div class="nk-tb-col">
                <span class="text-soft">${escapeHtml(artisan.name || 'N/A')}</span>
            </div>
            <div class="nk-tb-col">
                <span class="tb-amount">${formatCurrency(booking.price || 0)}</span>
            </div>
            <div class="nk-tb-col text-end">
                ${getStatusBadge(booking.status)}
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Render Recent Users
function renderRecentUsers(users) {
    const container = document.getElementById('recent-users-list');
    if (!container) return;
    
    const existingRows = container.querySelectorAll('.nk-tb-item');
    existingRows.forEach(row => row.remove());
    
    if (!users || users.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'nk-tb-item';
        emptyDiv.innerHTML = '<div class="nk-tb-col"><p class="text-muted text-center py-3">No recent users</p></div>';
        container.appendChild(emptyDiv);
        return;
    }
    
    users.slice(0, 5).forEach(user => {
        const profileImg = user.profileImage?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User');
        const roleBadge = user.role === 'artisan' ? 'bg-primary' : 'bg-info';
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <div class="user-card">
                    <div class="user-avatar xs bg-primary">
                        <img src="${escapeHtml(profileImg)}" alt="${escapeHtml(user.name || 'User')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <div class="user-info">
                        <span class="tb-lead">${escapeHtml(user.name || 'Unknown')}</span>
                        <span class="text-soft">${escapeHtml(user.email || 'N/A')}</span>
                    </div>
                </div>
            </div>
            <div class="nk-tb-col">
                <span class="badge badge-sm ${roleBadge}">${escapeHtml(user.role || 'customer')}</span>
            </div>
            <div class="nk-tb-col text-end">
                <span class="text-soft">${formatDate(user.createdAt)}</span>
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Render Recent Jobs
function renderRecentJobs(jobs) {
    const container = document.getElementById('recent-jobs-list');
    if (!container) return;
    
    const existingRows = container.querySelectorAll('.nk-tb-item');
    existingRows.forEach(row => row.remove());
    
    if (!jobs || jobs.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'nk-tb-item';
        emptyDiv.innerHTML = '<div class="nk-tb-col"><p class="text-muted text-center py-3">No recent jobs</p></div>';
        container.appendChild(emptyDiv);
        return;
    }
    
    jobs.slice(0, 5).forEach(job => {
        const client = job.clientId || {};
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <span class="tb-lead">${escapeHtml(job.title || 'N/A')}</span>
                <span class="text-soft">${escapeHtml(client.name || 'Unknown')}</span>
            </div>
            <div class="nk-tb-col">
                <span class="text-soft">${escapeHtml(job.category || 'N/A')}</span>
            </div>
            <div class="nk-tb-col">
                ${getStatusBadge(job.status)}
            </div>
            <div class="nk-tb-col text-end">
                <span class="text-soft">${formatDate(job.createdAt)}</span>
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Render Recent Quotes
function renderRecentQuotes(quotes) {
    const container = document.getElementById('recent-quotes-list');
    if (!container) return;
    
    const existingRows = container.querySelectorAll('.nk-tb-item');
    existingRows.forEach(row => row.remove());
    
    if (!quotes || quotes.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'nk-tb-item';
        emptyDiv.innerHTML = '<div class="nk-tb-col"><p class="text-muted text-center py-3">No recent quotes</p></div>';
        container.appendChild(emptyDiv);
        return;
    }
    
    quotes.slice(0, 5).forEach(quote => {
        const artisan = quote.artisanId || {};
        const customer = quote.customerId || {};
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <span class="tb-lead">${escapeHtml(artisan.name || 'Unknown')}</span>
                <span class="text-soft">to ${escapeHtml(customer.name || 'Unknown')}</span>
            </div>
            <div class="nk-tb-col">
                <span class="tb-amount">${formatCurrency(quote.total || 0)}</span>
            </div>
            <div class="nk-tb-col">
                ${getStatusBadge(quote.status)}
            </div>
            <div class="nk-tb-col text-end">
                <span class="text-soft">${formatDate(quote.createdAt)}</span>
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Load Pending Verifications
async function loadPendingVerifications() {
    try {
        // Fetch artisan profiles with pending KYC
        const response = await api.get('/artisans', { 
            params: { 
                page: 1, 
                limit: 10,
                kycVerified: 'false'
            } 
        });
        
        const artisans = response.data?.data || [];
        const pending = artisans.filter(a => {
            const kyc = a.kycDetails || {};
            return kyc.status === 'pending';
        });
        
        const pendingCount = pending.length;
        document.getElementById('pendingVerifications').textContent = formatNumber(pendingCount);
        renderPendingVerifications(pending);
        
    } catch (error) {
        console.error('Error loading pending verifications:', error);
    }
}

// Render Pending Verifications
function renderPendingVerifications(artisans) {
    const container = document.getElementById('pending-verifications-list');
    if (!container) return;
    
    const existingRows = container.querySelectorAll('.nk-tb-item');
    existingRows.forEach(row => row.remove());
    
    if (!artisans || artisans.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'nk-tb-item';
        emptyDiv.innerHTML = '<div class="nk-tb-col"><p class="text-muted text-center py-3">No pending verifications</p></div>';
        container.appendChild(emptyDiv);
        return;
    }
    
    artisans.slice(0, 5).forEach(artisan => {
        const user = artisan.artisanAuthDetails || artisan.userId || {};
        const profileImg = user.profileImage?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User');
        const kyc = artisan.kycDetails || {};
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <div class="user-card">
                    <div class="user-avatar xs bg-primary">
                        <img src="${escapeHtml(profileImg)}" alt="${escapeHtml(user.name || 'User')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <div class="user-info">
                        <span class="tb-lead">${escapeHtml(user.name || 'Unknown')}</span>
                        <span class="text-soft">${escapeHtml(user.email || 'N/A')}</span>
                    </div>
                </div>
            </div>
            <div class="nk-tb-col">
                <span class="text-soft">${escapeHtml(artisan.trade?.[0] || 'N/A')}</span>
            </div>
            <div class="nk-tb-col">
                ${getStatusBadge(kyc.status || 'pending')}
            </div>
            <div class="nk-tb-col text-end">
                <a href="/artisanadmin/artisanKYCdetail/?id=${artisan._id}" class="btn btn-sm btn-primary">Review</a>
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Load Revenue Data
async function loadRevenueData() {
    try {
        // Fetch wallet data for revenue calculations
        const response = await api.get('/admin/wallets', { 
            params: { 
                page: 1, 
                limit: 1000 // Get all for calculations
            } 
        });
        
        const wallets = response.data?.data || [];
        
        // Calculate totals
        const totalEarned = wallets.reduce((sum, w) => sum + (w.totalEarned || 0), 0);
        const completedJobs = wallets.reduce((sum, w) => sum + (w.totalJobs || 0), 0);
        
        // Assuming 10% platform commission
        const commission = totalEarned * 0.10;
        
        document.getElementById('totalRevenue').textContent = formatCurrency(totalEarned);
        document.getElementById('jobsCompleted').textContent = formatNumber(completedJobs);
        document.getElementById('totalCommission').textContent = formatCurrency(commission);
        
    } catch (error) {
        console.error('Error loading revenue data:', error);
    }
}

// Expose functions to window for inline onclick handlers
window.loadDashboard = loadDashboard;
