import { getApi, toast, getStoredToken } from './config/_helper.js';

// Admin Management - manage admin accounts, roles, and permissions
let api = null;
const PAGE_LIMIT = 20;
let currentPage = 1;
let currentRoleFilter = '';
let searchQuery = '';

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

function formatDate(d) {
    if (!d) return 'N/A';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

// Skeleton loading
function ensureSkeletonStyles() {
    if (document.getElementById('skeleton-styles')) return;
    const s = document.createElement('style');
    s.id = 'skeleton-styles';
    s.textContent = `
        .skeleton-row .nk-tb-col { padding: 12px 8px; }
        .skeleton { display:inline-block; width:100%; height:14px; background: linear-gradient(90deg,#eee,#f6f6f6,#eee); background-size:200% 100%; animation: shimmer 1.2s linear infinite; border-radius:4px }
        @keyframes shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
    `;
    document.head.appendChild(s);
}

function showSkeleton(count = 10) {
    ensureSkeletonStyles();
    const table = document.getElementById('admin-table');
    if (!table) return;
    
    // Remove existing data rows (keep header)
    const existingRows = table.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
    existingRows.forEach(row => row.remove());
    
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'nk-tb-item skeleton-row';
        div.innerHTML = `
            <div class="nk-tb-col"><span class="skeleton" style="width:150px"></span></div>
            <div class="nk-tb-col tb-col-mb"><span class="skeleton" style="width:180px"></span></div>
            <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:80px"></span></div>
            <div class="nk-tb-col nk-tb-col-tools"><span class="skeleton" style="width:80px;height:28px;"></span></div>
        `;
        table.appendChild(div);
    }
}

function renderEmpty() {
    const table = document.getElementById('admin-table');
    if (!table) return;
    
    // Remove existing data rows (keep header)
    const existingRows = table.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
    existingRows.forEach(row => row.remove());
    
    // Add empty message
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'nk-tb-item';
    emptyDiv.innerHTML = `
        <div class="nk-tb-col" colspan="6" style="text-align:center; padding:40px;">
            <em class="icon ni ni-users" style="font-size: 48px; opacity: 0.3;"></em>
            <p class="mt-2">No admins found.</p>
        </div>
    `;
    table.appendChild(emptyDiv);
    
    const paginationEl = document.getElementById('admin-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
}

// Update stats cards
function updateStatsCards(admins, total = null) {
    const totalEl = document.getElementById('total-admins');
    const recentEl = document.getElementById('recent-admins');

    if (totalEl) totalEl.textContent = total !== null ? total : admins.length;

    // Calculate recent admins (last 7 days, if createdAt exists)
    if (recentEl) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = admins.filter(admin => {
            if (!admin.createdAt) return false;
            const createdDate = new Date(admin.createdAt);
            return createdDate >= sevenDaysAgo;
        }).length;
        recentEl.textContent = recentCount;
    }
}

// Initialize
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
    
    // Role filter
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
        roleFilter.addEventListener('change', (e) => {
            currentRoleFilter = e.target.value;
            currentPage = 1;
            loadAdmins(1, PAGE_LIMIT, currentRoleFilter, searchQuery);
        });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value;
                currentPage = 1;
                loadAdmins(1, PAGE_LIMIT, currentRoleFilter, searchQuery);
            }, 500);
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAdmins(currentPage, PAGE_LIMIT, currentRoleFilter, searchQuery);
        });
    }

    // Page select dropdown
    const pageSelect = document.getElementById('page-select');
    if (pageSelect) {
        pageSelect.addEventListener('change', (e) => {
            currentPage = parseInt(e.target.value);
            loadAdmins(currentPage, PAGE_LIMIT, currentRoleFilter, searchQuery);
        });
    }

    // Add admin form
    const addAdminForm = document.getElementById('addAdminForm');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createAdmin();
        });
    }

    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            await confirmDeleteAdmin();
        });
    }

    // Initial load
    await loadAdmins(1, PAGE_LIMIT, '', '');
})();

// Load admins
async function loadAdmins(page = 1, limit = PAGE_LIMIT, roleFilter = '', search = '') {
    if (!api) api = await getApi();

    try {
        showSkeleton(limit);
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        //console.log(token);
        const params = { page, limit };
        if (roleFilter) params.role = roleFilter;
        if (search) params.search = search;

        const res = await api.get('/admin/admins', { params, headers });
        //console.log('Admins response:', res.data);

        const body = res && res.data ? res.data : null;
        if (!body || !body.success) return renderEmpty();

        const items = body.data || [];
        //console.log('Admins loaded:', items.length);

        if (items.length === 0) return renderEmpty();

        // Use pagination object from response
        const pagination = body.pagination || { page: page, limit: limit, total: items.length, pages: 1 };
        
        updateStatsCards(items, pagination.total);
        renderRows(items);
        renderPagination(pagination.page, pagination.limit, pagination.total);
    } catch (err) {
        console.error('Failed to load admins', err);
        renderEmpty();
        toast.error('Failed to load admins: ' + (err.response?.data?.message || err.message));
    }
}

// Render admin rows
function renderRows(items) {
    const table = document.getElementById('admin-table');
    if (!table) return;
    
    // Remove existing data rows (keep header)
    const existingRows = table.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
    existingRows.forEach(row => row.remove());

    items.forEach(admin => {
        const id = admin._id || admin.id || '';
        const div = document.createElement('div');
        div.className = 'nk-tb-item';
        div.dataset.id = id;

        // Admin Info
        const userCol = document.createElement('div');
        userCol.className = 'nk-tb-col';
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar xs bg-primary';
        const initials = (admin.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        avatar.innerHTML = `<span>${escapeHtml(initials)}</span>`;
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `<span class="tb-lead">${escapeHtml(admin.name || 'Unknown')}</span>`;
        userCard.appendChild(avatar);
        userCard.appendChild(userInfo);
        userCol.appendChild(userCard);

        // Email
        const emailCol = document.createElement('div');
        emailCol.className = 'nk-tb-col tb-col-mb';
        emailCol.innerHTML = `<span>${escapeHtml(admin.email || 'N/A')}</span>`;

        // Role/Permissions
        const roleCol = document.createElement('div');
        roleCol.className = 'nk-tb-col tb-col-md';
        const permissions = admin.permissions || admin.role || 'admin';
        const permissionsStr = typeof permissions === 'string' ? permissions : String(permissions);
        const isSuperAdmin = permissionsStr === 'super-admin' || permissionsStr.toLowerCase().includes('super');
        const roleClass = isSuperAdmin ? 'badge-dim bg-danger' : 'badge-dim bg-primary';
        const roleText = isSuperAdmin ? 'Super Admin' : 'Admin';
        roleCol.innerHTML = `<span class="badge ${roleClass}">${roleText}</span>`;

        // Actions
        const actionsCol = document.createElement('div');
        actionsCol.className = 'nk-tb-col nk-tb-col-tools';
        actionsCol.innerHTML = `
            <ul class="nk-tb-actions gx-1">
                <li>
                    <div class="drodown">
                        <a href="#" class="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown">
                            <em class="icon ni ni-more-h"></em>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end">
                            <ul class="link-list-opt no-bdr">
                                <li><a href="#" class="edit-admin" data-id="${id}"><em class="icon ni ni-edit"></em><span>Edit</span></a></li>
                                <li><a href="#" class="view-admin" data-id="${id}"><em class="icon ni ni-eye"></em><span>View Details</span></a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="delete-admin" data-id="${id}"><em class="icon ni ni-trash"></em><span>Delete</span></a></li>
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
        `;

        div.appendChild(userCol);
        div.appendChild(emailCol);
        div.appendChild(roleCol);
        div.appendChild(actionsCol);
        table.appendChild(div);
    });

    attachActionListeners();
}

// Attach action listeners
function attachActionListeners() {
    document.querySelectorAll('.edit-admin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showEditModal(btn.dataset.id);
        });
    });

    document.querySelectorAll('.delete-admin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            deleteAdmin(btn.dataset.id);
        });
    });

    document.querySelectorAll('.view-admin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            viewAdminDetails(btn.dataset.id);
        });
    });
}

// Create admin
async function createAdmin() {
    const name = document.getElementById('admin-name').value;
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const role = document.getElementById('admin-role').value;

    // Get permissions
    const permissions = {};
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        permissions[cb.value] = true;
    });

    try {
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;

        await api.post('/admin/create', {
            name, email, password, role, permissions
        }, { headers });

        toast.success('Admin created successfully');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAdminModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addAdminForm').reset();
        
        // Reload list
        loadAdmins(1, PAGE_LIMIT, currentRoleFilter, searchQuery);
    } catch (err) {
        console.error('Failed to create admin', err);
        toast.error('Failed to create admin: ' + (err.response?.data?.message || err.message));
    }
}

// Show edit modal
function showEditModal(adminId) {
    toast.info('Edit functionality coming soon');
}

// Delete admin
let adminToDelete = null;

function deleteAdmin(adminId) {
    // Get admin info for display
    const table = document.getElementById('admin-table');
    const row = table?.querySelector(`[data-id="${adminId}"]`);
    
    let adminName = 'this admin';
    let adminEmail = '';
    
    if (row) {
        const nameEl = row.querySelector('.tb-lead');
        const emailEl = row.querySelector('.nk-tb-col.tb-col-mb span');
        if (nameEl) adminName = nameEl.textContent;
        if (emailEl) adminEmail = emailEl.textContent;
    }
    
    // Set global variable
    adminToDelete = adminId;
    
    // Update modal content
    const infoEl = document.getElementById('deleteAdminInfo');
    if (infoEl) {
        infoEl.innerHTML = `
            <strong>${escapeHtml(adminName)}</strong>
            ${adminEmail ? `<br><small class="text-muted">${escapeHtml(adminEmail)}</small>` : ''}
        `;
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('deleteAdminModal'));
    modal.show();
}

// Confirm delete admin
async function confirmDeleteAdmin() {
    if (!adminToDelete) return;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const originalText = confirmBtn.innerHTML;
    
    try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Deleting...';
        
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;

        await api.delete(`/admin/admins/${adminToDelete}`, { headers });
        toast.success('Admin deleted successfully');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAdminModal'));
        modal.hide();
        
        // Reload list
        loadAdmins(currentPage, PAGE_LIMIT, currentRoleFilter, searchQuery);
        
        adminToDelete = null;
    } catch (err) {
        console.error('Failed to delete admin', err);
        toast.error('Failed to delete admin: ' + (err.response?.data?.message || err.message));
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
    }
}

// View admin details
async function viewAdminDetails(adminId) {
    try {
        const modal = new bootstrap.Modal(document.getElementById('viewAdminModal'));
        const contentEl = document.getElementById('viewAdminContent');
        
        // Show loading
        contentEl.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        modal.show();
        
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;

        // Fetch admin details from the list (or make API call if endpoint exists)
        const res = await api.get('/admin/admins', { headers });
        const admins = res.data?.data || [];
        const admin = admins.find(a => (a._id || a.id) === adminId);
        
        if (!admin) {
            contentEl.innerHTML = '<div class="alert alert-warning">Admin not found</div>';
            return;
        }
        
        const permissions = admin.permissions || admin.role || 'admin';
        const permissionsStr = typeof permissions === 'string' ? permissions : String(permissions);
        const isSuperAdmin = permissionsStr === 'super-admin' || permissionsStr.toLowerCase().includes('super');
        
        contentEl.innerHTML = `
            <div class="row gy-3">
                <div class="col-12 text-center">
                    <div class="user-avatar lg bg-primary">
                        <span>${escapeHtml((admin.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2))}</span>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card card-bordered">
                        <ul class="data-list is-compact">
                            <li class="data-item">
                                <div class="data-col">
                                    <div class="data-label">Full Name</div>
                                    <div class="data-value">${escapeHtml(admin.name || 'N/A')}</div>
                                </div>
                            </li>
                            <li class="data-item">
                                <div class="data-col">
                                    <div class="data-label">Email</div>
                                    <div class="data-value">${escapeHtml(admin.email || 'N/A')}</div>
                                </div>
                            </li>
                            <li class="data-item">
                                <div class="data-col">
                                    <div class="data-label">Role</div>
                                    <div class="data-value">
                                        <span class="badge ${isSuperAdmin ? 'badge-dim bg-danger' : 'badge-dim bg-primary'}">
                                            ${isSuperAdmin ? 'Super Admin' : 'Admin'}
                                        </span>
                                    </div>
                                </div>
                            </li>
                            <li class="data-item">
                                <div class="data-col">
                                    <div class="data-label">Admin ID</div>
                                    <div class="data-value text-soft">${escapeHtml(admin._id || admin.id || 'N/A')}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Failed to load admin details', err);
        toast.error('Failed to load admin details: ' + (err.response?.data?.message || err.message));
    }
}

// Render pagination
function renderPagination(page, limit, total) {
    const paginationEl = document.getElementById('admin-pagination');
    if (!paginationEl) return;

    const totalPages = Math.ceil(total / limit);
    
    const pageSelect = document.getElementById('page-select');
    if (pageSelect) {
        pageSelect.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === page) option.selected = true;
            pageSelect.appendChild(option);
        }
    }
    
    const totalPagesEl = document.getElementById('total-pages');
    if (totalPagesEl) totalPagesEl.textContent = totalPages;

    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let html = '<ul class="pagination justify-content-center justify-content-md-start">';

    if (page > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${page - 1}">Prev</a></li>`;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    if (start > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
        if (start > 2) html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }

    for (let i = start; i <= end; i++) {
        if (i === page) {
            html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
        } else {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
    }

    if (end < totalPages) {
        if (end < totalPages - 1) html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }

    if (page < totalPages) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">Next</a></li>`;
    }

    html += '</ul>';
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('a[data-page]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const pg = parseInt(a.dataset.page);
            currentPage = pg;
            loadAdmins(pg, PAGE_LIMIT, currentRoleFilter, searchQuery);
        });
    });
}
