import { getApi, toast, getStoredToken } from './config/_helper.js';

let api = null;
const PAGE_LIMIT = 10;
let currentPage = 1;
let currentStatusFilter = '';
let currentDateFrom = '';
let currentDateTo = '';
let currentBudgetMin = '';
let currentBudgetMax = '';
let currentSearchQuery = '';

// Escape HTML helper
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Format date helper
function formatDateShort(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusLower = String(status || 'new').toLowerCase();
    const badges = {
        new: '<span class="badge badge-dim bg-primary">New</span>',
        ongoing: '<span class="badge badge-dim bg-warning">Ongoing</span>',
        completed: '<span class="badge badge-dim bg-success">Completed</span>',
        cancelled: '<span class="badge badge-dim bg-danger">Cancelled</span>',
        open: '<span class="badge badge-dim bg-info">Open</span>',
        closed: '<span class="badge badge-dim bg-secondary">Closed</span>'
    };
    return badges[statusLower] || badges.new;
}

// Format currency
function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A';
    return '₦' + Number(amount).toLocaleString();
}

// Format large numbers with abbreviations (M for millions, B for billions)
function formatLargeNumber(amount) {
    if (!amount && amount !== 0) return '₦0';
    
    const num = Number(amount);
    
    if (num >= 1000000000) {
        // Billions
        const billions = num / 1000000000;
        return '₦' + (billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)) + 'B';
    } else if (num >= 1000000) {
        // Millions
        const millions = num / 1000000;
        return '₦' + (millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)) + 'M';
    } else if (num >= 1000) {
        // Thousands with comma
        return '₦' + num.toLocaleString();
    } else {
        return '₦' + num.toFixed(0);
    }
}

// Utility: clear validation errors
function clearValidationErrors(formEl) {
    if (!formEl) return;
    const invalids = formEl.querySelectorAll('.is-invalid');
    invalids.forEach(i => i.classList.remove('is-invalid'));
    const feedbacks = formEl.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(f => f.textContent = '');
}

// Utility: show validation errors
function showValidationErrors(formEl, errors) {
    if (!formEl || !errors) return;
    
    function setFieldError(fieldName, msg) {
        const ids = [`job-edit-${fieldName}`, fieldName];
        for (const id of ids) {
            const el = formEl.querySelector(`#${id}`);
            if (el) {
                el.classList.add('is-invalid');
                const fb = formEl.querySelector(`#error-${id}`) || el.parentElement.querySelector('.invalid-feedback');
                if (fb) fb.textContent = msg;
                return true;
            }
        }
        return false;
    }

    if (Array.isArray(errors)) {
        errors.forEach(e => {
            if (e && e.field && e.message) setFieldError(e.field, e.message);
        });
    } else if (typeof errors === 'object') {
        Object.keys(errors).forEach(k => {
            const v = errors[k];
            if (Array.isArray(v)) setFieldError(k, v.join(' '));
            else setFieldError(k, String(v));
        });
    }
}

// Skeleton loading styles
function ensureSkeletonStyles() {
    if (document.getElementById('skeleton-styles')) return;
    const s = document.createElement('style');
    s.id = 'skeleton-styles';
    s.textContent = `
        .skeleton-row td { padding: 12px 8px; }
        .skeleton { display:inline-block; width:100%; height:14px; background: linear-gradient(90deg,#eee,#f6f6f6,#eee); background-size:200% 100%; animation: shimmer 1.2s linear infinite; border-radius:4px }
        @keyframes shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
    `;
    document.head.appendChild(s);
}

// Show skeleton placeholders
function showSkeleton(count = 6) {
    ensureSkeletonStyles();
    const tbody = document.getElementById('job-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const tr = document.createElement('tr');
        tr.className = 'nk-tb-item skeleton-row';
        tr.innerHTML = `
            <td class="nk-tb-col"><span class="skeleton" style="width:50%"></span></td>
            <td class="nk-tb-col tb-col-xl"><span class="skeleton" style="width:40%"></span></td>
            <td class="nk-tb-col tb-col-md"><span class="skeleton" style="width:35%"></span></td>
            <td class="nk-tb-col tb-col-md"><span class="skeleton" style="width:40px;height:20px;"></span></td>
            <td class="nk-tb-col tb-col-md" style="width:120px;max-width:120px;padding-right:15px;"><span class="skeleton" style="width:80px"></span></td>
            <td class="nk-tb-col nk-tb-col-tools" style="width:100px;min-width:100px;text-align:right;"><span class="skeleton" style="width:80px;height:28px;"></span></td>
        `;
        tbody.appendChild(tr);
    }
}

// Render empty state
function renderEmpty() {
    const tbody = document.getElementById('job-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr class="nk-tb-item"><td class="nk-tb-col" colspan="6" style="text-align:center; padding:40px;">No jobs found.</td></tr>';
    const paginationEl = document.getElementById('job-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
}

// Load job statistics/analytics
async function loadJobStats() {
    if (!api) api = await getApi();
    
    try {
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        
        // Fetch stats - if your backend has a /jobs/stats endpoint, use it
        // Otherwise, fetch all jobs and calculate stats client-side
        const res = await api.get('/jobs', { 
            params: { page: 1, limit: 1000 }, // Get all jobs for stats
            headers 
        });
        
        const body = res && res.data ? res.data : null;
        if (!body) return;
        
        let items = [];
        if (body.success && Array.isArray(body.data)) {
            items = body.data;
        } else if (Array.isArray(body.data)) {
            items = body.data;
        } else if (Array.isArray(body)) {
            items = body;
        }
        
        // Debug: log job statuses
        //consoleg('All job statuses:', items.map(j => ({ id: j._id || j.id, status: j.status })));
        
        // Calculate statistics
        const totalJobs = items.length;
        const openJobs = items.filter(j => (j.status || '').toLowerCase() === 'open').length;
        const closedJobs = items.filter(j => (j.status || '').toLowerCase() === 'closed').length;
        
        //consoleg('Stats:', { totalJobs, openJobs, closedJobs });
        
        // Calculate total budget (sum of all budgets)
        const totalBudget = items.reduce((sum, j) => sum + (j.budget || 0), 0);
        
        // Update UI
        const totalEl = document.getElementById('stat-total-jobs');
        if (totalEl) totalEl.textContent = totalJobs.toLocaleString();
        
        const openEl = document.getElementById('stat-open-jobs');
        if (openEl) openEl.textContent = openJobs.toLocaleString();
        
        const closedEl = document.getElementById('stat-closed-jobs');
        if (closedEl) closedEl.textContent = closedJobs.toLocaleString();
        
        const avgEl = document.getElementById('stat-avg-budget');
        if (avgEl) avgEl.textContent = formatLargeNumber(totalBudget);
        
    } catch (err) {
        console.error('Failed to load job statistics', err);
    }
}

// Load jobs from API
async function loadJobs(page = 1, limit = PAGE_LIMIT, statusFilter = '', dateFrom = '', dateTo = '', budgetMin = '', budgetMax = '', searchQuery = '') {
    if (!api) api = await getApi();
    
    try {
        showSkeleton(limit);
        
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        if (budgetMin) params.budgetMin = budgetMin;
        if (budgetMax) params.budgetMax = budgetMax;
        if (searchQuery) params.q = searchQuery;
        
        const headers = {};
        const token = getStoredToken();
        //consoleg('Token being sent:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        
        // Decode JWT to check role (without verification, just for debugging)
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                //consoleg('Token payload:', payload);
                //consoleg('User role:', payload.role || payload.user?.role || 'NO ROLE');
            } catch (e) {
                console.error('Failed to decode token:', e);
            }
        }
        
        if (token) headers.Authorization = 'Bearer ' + token;
        
        //consoleg('Request headers:', headers);
        //consoleg('Request URL:', api.defaults.baseURL + '/jobs');
        //consoleg('Full axios config:', { params, headers, baseURL: api.defaults.baseURL });
        
        const res = await api.get('/jobs', { params, headers });
        //consoleg('Jobs API Response:', res);
        //consoleg('Response Status:', res.status);
        //consoleg('Response Headers:', res.headers);
        //consoleg('Jobs Data:', res.data);
        const body = res && res.data ? res.data : null;
        
        if (!body) return renderEmpty();
        
        // Handle response structure: { success, data: [...], meta: {...} }
        let items = [];
        let meta = null;
        
        if (body.success && Array.isArray(body.data)) {
            items = body.data;
            meta = body.meta || body.pagination || null;
        } else if (Array.isArray(body.data)) {
            items = body.data;
            meta = body.meta || body.pagination || null;
        } else if (Array.isArray(body)) {
            items = body;
        }
        
        // Debug: check if clientDetails exists
        if (items.length > 0) {
            //consoleg('First job item:', items[0]);
            //consoleg('Has clientDetails?', !!items[0].clientDetails);
        }
        
        // If no meta, create one based on response
        if (!meta) {
            // Check response headers for total count
            const totalHeader = res.headers['x-total-count'] || res.headers['X-Total-Count'];
            const total = totalHeader ? parseInt(totalHeader) : items.length;
            
            meta = { 
                page: page, 
                limit: limit, 
                total: total,
                totalPages: Math.ceil(total / limit)
            };
        }
        
        //consoleg('Pagination meta:', meta);
        
        renderRows(items);
        renderPagination(meta.page || page, meta.limit || limit, meta.total || items.length);
    } catch (err) {
        console.error('Failed to load jobs', err);
        toast.error('Failed to load jobs');
        renderEmpty();
    }
}
// Render job rows
function renderRows(items) {
    const tbody = document.getElementById('job-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    items.forEach(job => {
        const id = job._id || job.id || '';
        const tr = document.createElement('tr');
        tr.className = 'nk-tb-item';
        tr.dataset.id = id;
        
        // Job Title
        const titleTd = document.createElement('td');
        titleTd.className = 'nk-tb-col';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'project-info';
        const titleH6 = document.createElement('h6');
        titleH6.className = 'title';
        titleH6.textContent = job.title || 'Untitled Job';
        titleDiv.appendChild(titleH6);
        titleTd.appendChild(titleDiv);
        
        // Client - handle clientDetails from admin API response
        const clientTd = document.createElement('td');
        clientTd.className = 'nk-tb-col tb-col-xl';
        const clientName = job.clientDetails?.name || job.client?.name || job.clientId?.name || 'Unknown';
        const clientEmail = job.clientDetails?.email || job.client?.email || '';
        
        if (clientEmail) {
            clientTd.innerHTML = `<span class="tb-lead">${escapeHtml(clientName)}</span><br><small class="text-muted">${escapeHtml(clientEmail)}</small>`;
        } else {
            clientTd.textContent = clientName;
        }
        
        // Trade - handle array or string
        const tradeTd = document.createElement('td');
        tradeTd.className = 'nk-tb-col tb-col-md';
        const tradeDisplay = Array.isArray(job.trade) ? job.trade.join(', ') : (job.trade || 'N/A');
        tradeTd.textContent = tradeDisplay;
        
        // Status
        const statusTd = document.createElement('td');
        statusTd.className = 'nk-tb-col tb-col-md';
        statusTd.innerHTML = getStatusBadge(job.status);
        
        // Budget
        const budgetTd = document.createElement('td');
        budgetTd.className = 'nk-tb-col tb-col-md';
        budgetTd.style.whiteSpace = 'nowrap';
        budgetTd.style.width = '120px';
        budgetTd.style.maxWidth = '120px';
        budgetTd.style.paddingRight = '15px';
        budgetTd.textContent = formatCurrency(job.budget);
        
        // Actions
        const actionsTd = document.createElement('td');
        actionsTd.className = 'nk-tb-col nk-tb-col-tools';
        actionsTd.style.whiteSpace = 'nowrap';
        actionsTd.style.textAlign = 'right';
        actionsTd.style.width = '100px';
        actionsTd.style.minWidth = '100px';
        const ul = document.createElement('ul');
        ul.className = 'nk-tb-actions gx-1';
        ul.style.justifyContent = 'flex-end';
        ul.style.display = 'flex';
        
        // View button
        const liView = document.createElement('li');
        const aView = document.createElement('a');
        aView.href = '#';
        aView.className = 'btn btn-sm btn-icon btn-trigger';
        aView.title = 'View Details';
        aView.innerHTML = '<em class="icon ni ni-eye"></em>';
        liView.appendChild(aView);
        
        // Edit button
        const liEdit = document.createElement('li');
        const aEdit = document.createElement('a');
        aEdit.href = '#';
        aEdit.className = 'btn btn-sm btn-icon btn-trigger';
        aEdit.title = 'Edit';
        aEdit.innerHTML = '<em class="icon ni ni-edit"></em>';
        liEdit.appendChild(aEdit);
        
        // Delete button
        const liDel = document.createElement('li');
        const aDel = document.createElement('a');
        aDel.href = '#';
        aDel.className = 'btn btn-sm btn-icon btn-trigger text-danger';
        aDel.title = 'Close Job';
        aDel.innerHTML = '<em class="icon ni ni-trash"></em>';
        liDel.appendChild(aDel);
        
        ul.appendChild(liView);
        ul.appendChild(liEdit);
        ul.appendChild(liDel);
        actionsTd.appendChild(ul);
        
        tr.appendChild(titleTd);
        tr.appendChild(clientTd);
        tr.appendChild(tradeTd);
        tr.appendChild(statusTd);
        tr.appendChild(budgetTd);
        tr.appendChild(actionsTd);
        
        tbody.appendChild(tr);
        
        // View handler
        aView.addEventListener('click', async (ev) => {
            ev.preventDefault();
            await showJobDetails(id, job);
        });
        
        // Edit handler
        aEdit.addEventListener('click', async (ev) => {
            ev.preventDefault();
            await openEditModal(job);
        });
        
        // Delete handler
        aDel.addEventListener('click', async (ev) => {
            ev.preventDefault();
            openCloseJobModal(id, job.title);
        });
    });
}

// Show job details modal
async function showJobDetails(jobId, jobData = null) {
    try {
        let job;
        
        // If job data is passed (from table row), use it directly to preserve clientDetails
        if (jobData) {
            job = jobData;
            //consoleg('Using passed job data with clientDetails');
        } else {
            // Otherwise fetch from API
            const headers = {};
            const token = getStoredToken();
            if (token) headers.Authorization = 'Bearer ' + token;
            
            const res = await api.get('/jobs/' + encodeURIComponent(jobId), { headers });
            job = (res.data?.success && res.data?.data) ? res.data.data : (res.data?.data || res.data);
        }
        
        //consoleg('Job details response:', job);
        //consoleg('clientDetails:', job.clientDetails);
        //consoleg('client:', job.client);
        //consoleg('clientId:', job.clientId);
        //consoleg('typeof clientId:', typeof job.clientId);
        
        const content = document.getElementById('job-details-content');
        if (!content) return;
        
        // Extract client info (prioritize clientDetails from admin API)
        // Check if clientId is an object (populated) or just a string (ID)
        let clientName = 'Unknown';
        let clientEmail = '';
        let clientPhone = '';
        
        if (job.clientDetails && typeof job.clientDetails === 'object') {
            // Admin API should provide clientDetails
            clientName = job.clientDetails.name || job.clientDetails.fullName || 'Unknown';
            clientEmail = job.clientDetails.email || '';
            clientPhone = job.clientDetails.phone || job.clientDetails.phoneNumber || '';
        } else if (job.client && typeof job.client === 'object') {
            // Fallback to client if populated
            clientName = job.client.name || job.client.fullName || 'Unknown';
            clientEmail = job.client.email || '';
            clientPhone = job.client.phone || job.client.phoneNumber || '';
        } else if (job.clientId && typeof job.clientId === 'object') {
            // clientId might be populated as an object
            clientName = job.clientId.name || job.clientId.fullName || 'Unknown';
            clientEmail = job.clientId.email || '';
            clientPhone = job.clientId.phone || job.clientId.phoneNumber || '';
        } else if (typeof job.clientId === 'string') {
            // clientId is just an ID string - show it but indicate it's an ID
            clientName = `Client ID: ${job.clientId.substring(0, 8)}...`;
        }
        
        let clientInfo = escapeHtml(clientName);
        if (clientEmail) clientInfo += `<br><small class="text-muted">Email: ${escapeHtml(clientEmail)}</small>`;
        if (clientPhone) clientInfo += `<br><small class="text-muted">Phone: ${escapeHtml(clientPhone)}</small>`;
        
        // Handle trade array or string
        const tradeDisplay = Array.isArray(job.trade) ? job.trade.join(', ') : (job.trade || 'N/A');
        
        // Extract category info (prioritize categoryDetails from admin API)
        let categoryDisplay = 'N/A';
        if (job.categoryDetails && typeof job.categoryDetails === 'object') {
            categoryDisplay = escapeHtml(job.categoryDetails.name || 'N/A');
            if (job.categoryDetails.description) {
                categoryDisplay += ` <small class="text-muted">(${escapeHtml(job.categoryDetails.description)})</small>`;
            }
        } else if (job.categoryId && typeof job.categoryId === 'object') {
            categoryDisplay = escapeHtml(job.categoryId.name || 'N/A');
        } else if (typeof job.categoryId === 'string' && job.categoryId) {
            categoryDisplay = `<small class="text-muted">Category ID: ${job.categoryId.substring(0, 8)}...</small>`;
        }
        
        content.innerHTML = `
            <div class="row g-3">
                <div class="col-12">
                    <h5>${escapeHtml(job.title || 'Untitled Job')}</h5>
                    <div class="mt-2">${getStatusBadge(job.status)}</div>
                </div>
                <div class="col-md-6">
                    <strong>Client:</strong><br>${clientInfo}
                </div>
                <div class="col-md-6">
                    <strong>Trade:</strong> ${escapeHtml(tradeDisplay)}
                </div>
                <div class="col-md-6">
                    <strong>Category:</strong><br>${categoryDisplay}
                </div>
                <div class="col-md-6">
                    <strong>Budget:</strong> ${formatCurrency(job.budget)}
                </div>
                <div class="col-md-6">
                    <strong>Experience Level:</strong> ${escapeHtml(job.experienceLevel || 'N/A')}
                </div>
                <div class="col-md-6">
                    <strong>Location:</strong> ${escapeHtml(job.location?.address || job.location || 'N/A')}
                </div>
                <div class="col-md-6">
                    <strong>Created:</strong> ${formatDateShort(job.createdAt)}
                </div>
                <div class="col-md-6">
                    <strong>Status:</strong> ${getStatusBadge(job.status)}
                </div>
                <div class="col-12">
                    <strong>Description:</strong>
                    <p class="mt-2">${escapeHtml(job.description || 'No description provided')}</p>
                </div>
            </div>
        `;
        
        const modalEl = document.getElementById('jobDetailsModal');
        if (modalEl && window.bootstrap) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    } catch (err) {
        console.error('Failed to load job details', err);
        toast.error('Failed to load job details');
    }
}

// Open edit modal
async function openEditModal(job) {
    const editForm = document.getElementById('jobEditForm');
    if (!editForm) return;
    
    clearValidationErrors(editForm);
    
    document.getElementById('job-edit-id').value = job._id || job.id || '';
    document.getElementById('job-edit-title').value = job.title || '';
    document.getElementById('job-edit-description').value = job.description || '';
    document.getElementById('job-edit-trade').value = job.trade || '';
    document.getElementById('job-edit-status').value = job.status || 'new';
    document.getElementById('job-edit-budget').value = job.budget || '';
    document.getElementById('job-edit-experience').value = job.experienceLevel || '';
    
    const modalEl = document.getElementById('jobEditModal');
    if (modalEl && window.bootstrap) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// Delete/close job
async function deleteJob(jobId) {
    try {
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        
        //consoleg('Closing job:', jobId);
        const response = await api.delete('/jobs/' + encodeURIComponent(jobId), { headers });
        //consoleg('Close job response:', response.data);
        
        toast.success('Job closed successfully');
        
        // Reload both stats and jobs list
        await Promise.all([
            loadJobStats(),
            loadJobs(currentPage, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery)
        ]);
    } catch (err) {
        console.error('Failed to close job', err);
        const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to close job';
        toast.error(msg);
    }
}

// Open close job modal
function openCloseJobModal(jobId, jobTitle) {
    const modal = document.getElementById('closeJobModal');
    const titleEl = document.getElementById('close-job-title');
    const confirmBtn = document.getElementById('confirm-close-job');
    
    if (!modal || !titleEl || !confirmBtn) return;
    
    titleEl.textContent = jobTitle || 'this job';
    
    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        // Get modal instance before calling deleteJob
        let bsModal = null;
        if (window.bootstrap) {
            bsModal = bootstrap.Modal.getInstance(modal);
        }
        
        await deleteJob(jobId);
        
        // Close the modal after operation completes
        if (bsModal) {
            bsModal.hide();
        } else if (window.bootstrap) {
            // Fallback: try to get instance again
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
        }
    });
    
    // Show the modal
    if (window.bootstrap) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Render pagination
function renderPagination(page, limit, total) {
    const paginationEl = document.getElementById('job-pagination');
    if (!paginationEl) return;
    
    currentPage = Number(page) || 1;
    const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || PAGE_LIMIT)));
    const frag = document.createDocumentFragment();
    
    function makeLi(label, disabled, pageNum) {
        const li = document.createElement('li');
        li.className = 'page-item' + (disabled ? ' disabled' : '');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = label;
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (!disabled) loadJobs(pageNum, limit, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
        });
        li.appendChild(a);
        return li;
    }
    
    frag.appendChild(makeLi('Prev', page <= 1, page - 1));
    
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === page ? ' active' : '');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = String(i);
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            loadJobs(i, limit, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
        });
        li.appendChild(a);
        frag.appendChild(li);
    }
    
    frag.appendChild(makeLi('Next', page >= totalPages, page + 1));
    
    paginationEl.innerHTML = '';
    paginationEl.appendChild(frag);
}

// Initialize
(async function init() {
    try {
        api = await getApi();
        
        // Attach token to API instance
        const token = getStoredToken();
        if (token) {
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }
        
        // Set table layout to fixed for consistent column widths
        const jobTable = document.querySelector('.nk-tb-list');
        if (jobTable) {
            jobTable.style.tableLayout = 'fixed';
            jobTable.style.width = '100%';
        }
        
        // Search input handler with debounce
        const searchInput = document.getElementById('job-search-input');
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentSearchQuery = e.target.value.trim();
                    loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
                }, 500); // 500ms debounce
            });
        }
        
        // Status filter select
        const statusFilter = document.getElementById('job-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                currentStatusFilter = e.target.value;
                loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
            });
        }
        
        // Filtered By dropdown links
        const filterLinks = document.querySelectorAll('.link-list-opt a[data-status]');
        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const status = e.currentTarget.getAttribute('data-status');
                currentStatusFilter = status || '';
                // Update select dropdown to match
                if (statusFilter) statusFilter.value = currentStatusFilter;
                loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
            });
        });
        
        // Budget filter handlers
        const applyBudgetFilter = document.getElementById('apply-budget-filter');
        if (applyBudgetFilter) {
            applyBudgetFilter.addEventListener('click', (e) => {
                e.preventDefault();
                currentBudgetMin = document.getElementById('filter-budget-min').value;
                currentBudgetMax = document.getElementById('filter-budget-max').value;
                loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
            });
        }
        
        const clearBudgetFilter = document.getElementById('clear-budget-filter');
        if (clearBudgetFilter) {
            clearBudgetFilter.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('filter-budget-min').value = '';
                document.getElementById('filter-budget-max').value = '';
                currentBudgetMin = '';
                currentBudgetMax = '';
                loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
            });
        }
        
        // Date filter handlers
        const applyDateFilter = document.getElementById('apply-date-filter');
        if (applyDateFilter) {
            applyDateFilter.addEventListener('click', (e) => {
                e.preventDefault();
                currentDateFrom = document.getElementById('filter-date-from').value;
                currentDateTo = document.getElementById('filter-date-to').value;
                loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
            });
        }
        
        const clearDateFilter = document.getElementById('clear-date-filter');
        if (clearDateFilter) {
            clearDateFilter.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('filter-date-from').value = '';
                document.getElementById('filter-date-to').value = '';
                currentDateFrom = '';
                currentDateTo = '';
                loadJobs(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
            });
        }
        
        // Edit form submission
        const editForm = document.getElementById('jobEditForm');
        if (editForm) {
            editForm.addEventListener('submit', async (ev) => {
                ev.preventDefault();
                clearValidationErrors(editForm);
                
                const id = document.getElementById('job-edit-id').value;
                const payload = {
                    title: document.getElementById('job-edit-title').value,
                    description: document.getElementById('job-edit-description').value,
                    trade: document.getElementById('job-edit-trade').value,
                    status: document.getElementById('job-edit-status').value,
                    budget: document.getElementById('job-edit-budget').value,
                    experienceLevel: document.getElementById('job-edit-experience').value
                };
                
                try {
                    const headers = {};
                    const token = getStoredToken();
                    if (token) headers.Authorization = 'Bearer ' + token;
                    
                    await api.put('/jobs/' + encodeURIComponent(id), payload, { headers });
                    
                    const modalEl = document.getElementById('jobEditModal');
                    if (modalEl && window.bootstrap) {
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) modal.hide();
                    }
                    
                    toast.success('Job updated successfully');
                    await loadJobs(currentPage, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo, currentBudgetMin, currentBudgetMax, currentSearchQuery);
                } catch (err) {
                    if (err?.response?.status === 401) {
                        toast.error('Unauthorized');
                        return;
                    }
                    const body = err?.response?.data || {};
                    const errors = body.errors || body.error || body.validation || body;
                    showValidationErrors(editForm, errors);
                    if (!errors) toast.error('Update failed');
                }
            });
        }
        
        // Initial load
        await Promise.all([
            loadJobStats(),
            loadJobs(1, PAGE_LIMIT)
        ]);
    } catch (err) {
        console.error('Initialization failed', err);
        toast.error('Failed to initialize');
    }
})();