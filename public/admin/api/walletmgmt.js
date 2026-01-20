import { getApi, toast, getStoredToken } from './config/_helper.js';

// Wallet Management - monitor user wallets, balances, and financial activity
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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getRoleBadge(role) {
    const badges = {
        'artisan': '<span class="badge badge-sm bg-primary">Artisan</span>',
        'customer': '<span class="badge badge-sm bg-info">Customer</span>',
        'admin': '<span class="badge badge-sm bg-danger">Admin</span>'
    };
    return badges[role] || `<span class="badge badge-sm bg-secondary">${escapeHtml(role)}</span>`;
}

// State variables
let currentPage = 1;
const PAGE_LIMIT = 5;
let currentRole = '';
let currentSortBy = 'balance';
let currentSortOrder = 'desc';
let searchQuery = '';

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
    
    // Load initial data
    loadWallets();
    
    // Search input with debounce
    let searchTimeout;
    document.getElementById('wallet-search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            currentPage = 1;
            loadWallets();
        }, 500);
    });
    
    // Role filter
    document.getElementById('roleFilter').addEventListener('change', (e) => {
        currentRole = e.target.value;
        currentPage = 1;
        loadWallets();
    });
    
    // Sort by filter
    document.getElementById('sortByFilter').addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        currentPage = 1;
        loadWallets();
    });
    
    // Sort order filter
    document.getElementById('sortOrderFilter').addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        currentPage = 1;
        loadWallets();
    });
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadWallets();
    });
})();

// Load Wallets
async function loadWallets(page = currentPage) {
    const container = document.getElementById('wallets-table');
    
    // Remove existing data rows (keep the header)
    const existingRows = container.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
    existingRows.forEach(row => row.remove());
    
    // Add loading spinner
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'nk-tb-item';
    loadingDiv.innerHTML = '<div class="nk-tb-col" colspan="7"><div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div></div>';
    container.appendChild(loadingDiv);
    
    try {
        const params = {
            page,
            limit: PAGE_LIMIT,
            sortBy: currentSortBy,
            sortOrder: currentSortOrder
        };
        
        if (currentRole) params.role = currentRole;
        if (searchQuery) params.search = searchQuery;
        
        const response = await api.get('/admin/wallets', { params });
        console.log('Wallets response:', response);
        
        const wallets = response.data?.data || [];
        const pagination = response.data?.pagination || {};
        
        // Remove loading spinner
        loadingDiv.remove();
        
        if (wallets.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'nk-tb-item';
            emptyDiv.innerHTML = '<div class="nk-tb-col" colspan="7"><div class="text-center py-4"><p class="text-muted">No wallets found.</p></div></div>';
            container.appendChild(emptyDiv);
            return;
        }
        
        // Update summary cards
        updateSummaryCards(wallets, pagination);
        
        // Render table rows
        renderWalletsTable(wallets);
        
        // Render pagination
        renderPagination(pagination);
        
    } catch (error) {
        console.error('Error loading wallets:', error);
        loadingDiv.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'nk-tb-item';
        errorDiv.innerHTML = '<div class="nk-tb-col" colspan="7"><div class="alert alert-danger">Error loading wallets. Please try again.</div></div>';
        container.appendChild(errorDiv);
        toast.error('Error loading wallets');
    }
}

// Update Summary Cards
function updateSummaryCards(wallets, pagination) {
    const totalCount = pagination.total || wallets.length;
    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalEarned = wallets.reduce((sum, w) => sum + (w.totalEarned || 0), 0);
    const totalSpent = wallets.reduce((sum, w) => sum + (w.totalSpent || 0), 0);
    
    document.getElementById('totalWallets').textContent = totalCount.toLocaleString();
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('totalEarned').textContent = formatCurrency(totalEarned);
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
}

// Render Wallets Table
function renderWalletsTable(wallets) {
    const container = document.getElementById('wallets-table');
    
    // Remove existing data rows (keep the header)
    const existingRows = container.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
    existingRows.forEach(row => row.remove());
    
    if (!wallets || wallets.length === 0) {
        const emptyRow = document.createElement('div');
        emptyRow.className = 'nk-tb-item';
        emptyRow.innerHTML = '<div class="nk-tb-col" colspan="7"><div class="text-center py-4"><span class="text-muted">No wallets found</span></div></div>';
        container.appendChild(emptyRow);
        return;
    }
    
    wallets.forEach(wallet => {
        const user = wallet.userId || {};
        const profileImg = user.profileImage?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User');
        const verifiedIcon = user.kycVerified ? '<em class="icon ni ni-check-circle-fill text-success" title="KYC Verified"></em>' : '';
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'nk-tb-item';
        rowDiv.innerHTML = `
            <div class="nk-tb-col">
                <div class="user-card">
                    <div class="user-avatar sm bg-primary">
                        <img src="${escapeHtml(profileImg)}" alt="${escapeHtml(user.name || 'User')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <div class="user-info">
                        <span class="tb-lead">${escapeHtml(user.name || 'Unknown')} ${verifiedIcon}</span>
                        <span class="text-soft">${escapeHtml(user.email || 'N/A')}</span>
                    </div>
                </div>
            </div>
            <div class="nk-tb-col">
                ${getRoleBadge(user.role)}
            </div>
            <div class="nk-tb-col">
                <span class="tb-lead">${formatCurrency(wallet.balance || 0)}</span>
            </div>
            <div class="nk-tb-col">
                <span class="text-success">${formatCurrency(wallet.totalEarned || 0)}</span>
            </div>
            <div class="nk-tb-col">
                <span class="text-warning">${formatCurrency(wallet.totalSpent || 0)}</span>
            </div>
            <div class="nk-tb-col">
                <span class="badge badge-dim bg-outline-secondary">${wallet.totalJobs || 0}</span>
            </div>
            <div class="nk-tb-col nk-tb-col-tools">
                <ul class="nk-tb-actions gx-1">
                    <li>
                        <div class="drodown">
                            <a href="#" class="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown"><em class="icon ni ni-more-h"></em></a>
                            <div class="dropdown-menu dropdown-menu-end">
                                <ul class="link-list-opt no-bdr">
                                    <li><a href="#" onclick="window.viewWalletDetails('${user._id}'); return false;"><em class="icon ni ni-eye"></em><span>View Details</span></a></li>
                                    <li><a href="#" onclick="window.viewTransactions('${user._id}'); return false;"><em class="icon ni ni-list"></em><span>Transactions</span></a></li>
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        `;
        container.appendChild(rowDiv);
    });
}

// Render Pagination
function renderPagination(pagination) {
    const container = document.getElementById('wallets-pagination');
    const { page = 1, pages = 1, total = 0 } = pagination;
    
    if (pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (page > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="window.goToPage(${page - 1}); return false;">Prev</a></li>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
            const active = i === page ? 'active' : '';
            html += `<li class="page-item ${active}"><a class="page-link" href="#" onclick="window.goToPage(${i}); return false;">${i}</a></li>`;
        } else if (i === page - 3 || i === page + 3) {
            html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
    }
    
    // Next button
    if (page < pages) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="window.goToPage(${page + 1}); return false;">Next</a></li>`;
    }
    
    container.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    loadWallets(page);
}

// View Wallet Details
async function viewWalletDetails(userId) {
    try {
        const response = await api.get(`/admin/wallets/${userId}`);
        const data = response.data?.data || {};
        
        const user = data.userId || {};
        const wallet = data;
        const stats = data.statistics || {};
        const recentTxs = data.recentTransactions || [];
        
        const profileImg = user.profileImage?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User');
        const verifiedIcon = user.kycVerified ? '<em class="icon ni ni-check-circle-fill text-success"></em>' : '<em class="icon ni ni-alert-circle text-warning"></em>';
        
        const content = `
            <div class="row g-3">
                <!-- User Info -->
                <div class="col-md-4">
                    <div class="card card-bordered">
                        <div class="card-inner text-center">
                            <div class="user-avatar xl bg-primary mb-3">
                                <img src="${escapeHtml(profileImg)}" alt="${escapeHtml(user.name || 'User')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                            </div>
                            <h5>${escapeHtml(user.name || 'Unknown')} ${verifiedIcon}</h5>
                            <p class="text-soft">${escapeHtml(user.email || 'N/A')}</p>
                            <p class="text-soft"><em class="icon ni ni-call"></em> ${escapeHtml(user.phone || 'N/A')}</p>
                            ${getRoleBadge(user.role)}
                            <p class="text-soft mt-2"><small>Joined ${formatDate(user.createdAt)}</small></p>
                        </div>
                    </div>
                </div>
                
                <!-- Wallet Stats -->
                <div class="col-md-8">
                    <div class="card card-bordered">
                        <div class="card-inner">
                            <h6 class="title mb-3">Wallet Statistics</h6>
                            <div class="row g-3">
                                <div class="col-6">
                                    <div class="sub-text">Current Balance</div>
                                    <div class="lead-text text-primary">${formatCurrency(wallet.balance || 0)}</div>
                                </div>
                                <div class="col-6">
                                    <div class="sub-text">Total Earned</div>
                                    <div class="lead-text text-success">${formatCurrency(wallet.totalEarned || 0)}</div>
                                </div>
                                <div class="col-6">
                                    <div class="sub-text">Total Spent</div>
                                    <div class="lead-text text-warning">${formatCurrency(wallet.totalSpent || 0)}</div>
                                </div>
                                <div class="col-6">
                                    <div class="sub-text">Net Activity</div>
                                    <div class="lead-text">${formatCurrency(stats.netActivity || 0)}</div>
                                </div>
                                <div class="col-6">
                                    <div class="sub-text">Total Jobs</div>
                                    <div class="lead-text">${wallet.totalJobs || 0}</div>
                                </div>
                                <div class="col-6">
                                    <div class="sub-text">Last Updated</div>
                                    <div class="lead-text">${formatDate(wallet.lastUpdated)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${wallet.payoutDetails ? `
                    <div class="card card-bordered mt-3">
                        <div class="card-inner">
                            <h6 class="title mb-3">Payout Details</h6>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>Account Name</span>
                                    <strong>${escapeHtml(wallet.payoutDetails.name || 'N/A')}</strong>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>Account Number</span>
                                    <strong>${escapeHtml(wallet.payoutDetails.account_number || 'N/A')}</strong>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>Bank</span>
                                    <strong>${escapeHtml(wallet.payoutDetails.bank_name || 'N/A')}</strong>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>Paystack Recipient</span>
                                    <span class="badge ${wallet.paystackRecipientCode ? 'bg-success' : 'bg-secondary'}">${wallet.paystackRecipientCode ? 'Active' : 'Not Set'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    ` : `
                    <div class="card card-bordered mt-3">
                        <div class="card-inner">
                            <div class="alert alert-warning mb-0">
                                <em class="icon ni ni-info"></em>
                                <span>No payout details configured</span>
                            </div>
                        </div>
                    </div>
                    `}
                </div>
                
                <!-- Recent Transactions -->
                <div class="col-12">
                    <div class="card card-bordered">
                        <div class="card-inner">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="title">Recent Transactions</h6>
                                <button class="btn btn-sm btn-primary" onclick="window.viewTransactions('${user._id}')">View All</button>
                            </div>
                            ${recentTxs.length > 0 ? `
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${recentTxs.map(tx => `
                                        <tr>
                                            <td><span class="badge ${tx.type === 'credit' ? 'bg-success' : 'bg-warning'}">${tx.type}</span></td>
                                            <td>${formatCurrency(tx.amount || 0)}</td>
                                            <td>${escapeHtml(tx.description || 'N/A')}</td>
                                            <td><span class="badge bg-${tx.status === 'completed' ? 'success' : 'warning'}">${tx.status}</span></td>
                                            <td>${formatDate(tx.createdAt)}</td>
                                        </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ` : '<p class="text-muted text-center">No recent transactions</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('walletDetailsContent').innerHTML = content;
        const modal = new bootstrap.Modal(document.getElementById('walletDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading wallet details:', error);
        toast.error('Error loading wallet details');
    }
}

// View Transactions (placeholder - would need transaction endpoint)
function viewTransactions(userId) {
    toast.info('Transaction history feature - connect to /admin/transactions endpoint');
    // This would require implementing the full transactions modal with API call
}

// Make functions globally available
window.goToPage = goToPage;
window.viewWalletDetails = viewWalletDetails;
window.viewTransactions = viewTransactions;
