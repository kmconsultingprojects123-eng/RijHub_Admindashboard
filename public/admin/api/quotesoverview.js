import { getApi, toast, getStoredToken } from './config/_helper.js';

// Frontend for All Quotes Overview - displays quotes with customer/artisan, items, and related booking/job details
let api = null;

// Small helper to escape HTML for safe text insertion
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Format currency
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '₦0.00';
    return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'proposed': '<span class="badge badge-sm badge-dot has-bg bg-warning d-inline-flex align-items-center"><span>Proposed</span></span>',
        'accepted': '<span class="badge badge-sm badge-dot has-bg bg-success d-inline-flex align-items-center"><span>Accepted</span></span>',
        'rejected': '<span class="badge badge-sm badge-dot has-bg bg-danger d-inline-flex align-items-center"><span>Rejected</span></span>'
    };
    return badges[status] || `<span class="badge badge-sm badge-dot has-bg bg-secondary d-inline-flex align-items-center"><span>${escapeHtml(status)}</span></span>`;
}

// Get type badge HTML
function getTypeBadge(type) {
    if (type === 'booking') {
        return '<span class="badge badge-sm badge-dot has-bg bg-info d-inline-flex align-items-center"><span>Direct Hire</span></span>';
    } else if (type === 'job') {
        return '<span class="badge badge-sm badge-dot has-bg bg-primary d-inline-flex align-items-center"><span>Job Bid</span></span>';
    }
    return `<span class="badge badge-sm badge-dot has-bg bg-secondary d-inline-flex align-items-center"><span>${escapeHtml(type)}</span></span>`;
}

(async function () {
    const tableContainer = document.getElementById('quotes-table');
    const paginationEl = document.getElementById('quotes-pagination');
    const searchInput = document.getElementById('quote-search-input');
    
    let currentPage = 1;
    const PAGE_LIMIT = 20;
    let currentTypeFilter = 'all';
    let currentStatusFilter = 'all';
    let searchQuery = '';
    let currentJobFilter = null;
    let allJobs = [];
    let startDate = '';
    let endDate = '';
    
    try {
        api = await getApi();
        // ensure axios instance includes stored token (if any)
        try {
            const token = getStoredToken();
            if (token) {
                api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            }
        } catch (e) { console.warn('failed attaching token to api', e); }
        
        // Load quotes function
        async function loadQuotes(page = 1, limit = PAGE_LIMIT, typeFilter = 'all', statusFilter = 'all', query = '', jobId = null, startDateFilter = '', endDateFilter = '') {
            if (!api) api = await getApi();
            try {
                showSkeleton(limit);
                const params = { page, limit };
                if (typeFilter && typeFilter !== 'all') params.type = typeFilter;
                if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
                if (query) params.search = query;
                if (jobId) params.jobId = jobId;
                if (startDateFilter) params.startDate = startDateFilter;
                if (endDateFilter) params.endDate = endDateFilter;
                
                const res = await api.get('/admin/quotes', { params });
                console.log('Quotes response:', res);
                const body = res && res.data ? res.data : null;
                if (!body || !body.success) return renderEmpty();
                
                const items = Array.isArray(body.data) ? body.data : [];
                
                if (items.length === 0) {
                    return renderEmpty();
                }
                
                const pagination = body.pagination || { page: page, limit: limit, total: items.length, pages: 1 };
                renderRows(items);
                renderPagination(pagination.page || page, pagination.limit || limit, pagination.total || items.length);
            } catch (err) {
                console.error('Failed to load quotes', err);
                if (typeof toast !== 'undefined') toast.error('Failed to load quotes');
                renderEmpty();
            }
        }

        function renderEmpty() {
            if (!tableContainer) return;
            // Remove all items except the header
            const items = tableContainer.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
            items.forEach(item => item.remove());
            // Add empty message
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'nk-tb-item';
            emptyDiv.innerHTML = '<div class="nk-tb-col" style="text-align:center;padding:40px;width:100%;grid-column:1/-1;"><em class="icon ni ni-inbox" style="font-size:48px;opacity:0.3"></em><p class="mt-3">No quotes found.</p></div>';
            tableContainer.appendChild(emptyDiv);
            if (paginationEl) paginationEl.innerHTML = '';
        }

        function ensureSkeletonStyles() {
            if (document.getElementById('skeleton-styles')) return;
            const s = document.createElement('style');
            s.id = 'skeleton-styles';
            s.textContent = `
                .skeleton-row { padding: 12px 8px; }
                .skeleton { display:inline-block; width:100%; height:14px; background: linear-gradient(90deg,#eee,#f6f6f6,#eee); background-size:200% 100%; animation: shimmer 1.2s linear infinite; border-radius:4px }
                @keyframes shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
            `;
            document.head.appendChild(s);
        }

        function showSkeleton(count = 6) {
            ensureSkeletonStyles();
            if (!tableContainer) return;
            // Remove all items except the header
            const items = tableContainer.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
            items.forEach(item => item.remove());
            for (let i = 0; i < count; i++) {
                const div = document.createElement('div');
                div.className = 'nk-tb-item skeleton-row';
                div.innerHTML = `
                    <div class="nk-tb-col"><span class="skeleton" style="width:80px"></span></div>
                    <div class="nk-tb-col tb-col-mb"><span class="skeleton" style="width:120px"></span></div>
                    <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:120px"></span></div>
                    <div class="nk-tb-col tb-col-lg"><span class="skeleton" style="width:100px"></span></div>
                    <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:80px"></span></div>
                    <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:90px"></span></div>
                    <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:100px"></span></div>
                    <div class="nk-tb-col nk-tb-col-tools"><span class="skeleton" style="width:80px"></span></div>
                `;
                tableContainer.appendChild(div);
            }
        }

        function renderRows(items) {
            if (!tableContainer) return;
            // Remove all items except the header
            const existingItems = tableContainer.querySelectorAll('.nk-tb-item:not(.nk-tb-head)');
            existingItems.forEach(item => item.remove());
            items.forEach(quote => {
                const id = quote._id || quote.id || '';
                const div = document.createElement('div');
                div.className = 'nk-tb-item';
                div.dataset.id = id;

                // Quote ID column
                const idCol = document.createElement('div');
                idCol.className = 'nk-tb-col';
                idCol.innerHTML = `<span class="tb-lead"><a href="#" class="text-primary">#${id.substring(id.length - 6)}</a></span>`;

                // Customer column
                const customerCol = document.createElement('div');
                customerCol.className = 'nk-tb-col tb-col-mb';
                const customer = quote.customerId || {};
                customerCol.innerHTML = `
                    <div class="user-card">
                        <div class="user-avatar bg-primary" style="border-radius: 50%; overflow: hidden; width: 32px; height: 32px; flex-shrink: 0;">
                            ${customer.profileImage && customer.profileImage.url 
                                ? `<img src="${escapeHtml(customer.profileImage.url)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                : `<span>${(customer.name || 'U').charAt(0).toUpperCase()}</span>`}
                        </div>
                        <div class="user-info">
                            <span class="tb-lead">${escapeHtml(customer.name || 'N/A')}</span>
                            <span>${escapeHtml(customer.email || '')}</span>
                        </div>
                    </div>
                `;

                // Artisan column
                const artisanCol = document.createElement('div');
                artisanCol.className = 'nk-tb-col tb-col-md';
                const artisan = quote.artisanId || {};
                artisanCol.innerHTML = `
                    <div class="user-card">
                        <div class="user-avatar bg-success" style="border-radius: 50%; overflow: hidden; width: 32px; height: 32px; flex-shrink: 0;">
                            ${artisan.profileImage && artisan.profileImage.url 
                                ? `<img src="${escapeHtml(artisan.profileImage.url)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                : `<span>${(artisan.name || 'A').charAt(0).toUpperCase()}</span>`}
                        </div>
                        <div class="user-info">
                            <span class="tb-lead">${escapeHtml(artisan.name || 'N/A')}</span>
                            <span>${escapeHtml(artisan.email || '')}</span>
                        </div>
                    </div>
                `;

                // Type column
                const typeCol = document.createElement('div');
                typeCol.className = 'nk-tb-col tb-col-lg';
                const quoteType = quote.quoteType || (quote.bookingId ? 'booking' : 'job');
                typeCol.innerHTML = getTypeBadge(quoteType);

                // Total column
                const totalCol = document.createElement('div');
                totalCol.className = 'nk-tb-col tb-col-md';
                totalCol.innerHTML = `<span class="tb-amount">${formatCurrency(quote.total || 0)}</span>`;

                // Status column
                const statusCol = document.createElement('div');
                statusCol.className = 'nk-tb-col tb-col-md';
                statusCol.innerHTML = getStatusBadge(quote.status);

                // Created column
                const createdCol = document.createElement('div');
                createdCol.className = 'nk-tb-col tb-col-md';
                createdCol.innerHTML = `<span class="tb-date">${formatDate(quote.createdAt)}</span>`;

                // Actions column
                const actionsCol = document.createElement('div');
                actionsCol.className = 'nk-tb-col nk-tb-col-tools text-end';
                actionsCol.innerHTML = `
                    <ul class="nk-tb-actions gx-1">
                        <li>
                            <div class="drodown">
                                <a href="#" class="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown"><em class="icon ni ni-more-h"></em></a>
                                <div class="dropdown-menu dropdown-menu-end">
                                    <ul class="link-list-opt no-bdr">
                                        <li><a href="#" class="view-details-btn" data-quote-id="${escapeHtml(id)}"><em class="icon ni ni-eye"></em><span>View Details</span></a></li>
                                        ${quote.bookingId ? `<li><a href="/aa/bookingdetails?id=${escapeHtml(quote.bookingId._id || quote.bookingId)}"><em class="icon ni ni-calendar"></em><span>View Booking</span></a></li>` : ''}
                                        ${quote.jobId ? `<li><a href="#" class="view-job-btn"><em class="icon ni ni-briefcase"></em><span>View Job</span></a></li>` : ''}
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                `;

                div.appendChild(idCol);
                div.appendChild(customerCol);
                div.appendChild(artisanCol);
                div.appendChild(typeCol);
                div.appendChild(totalCol);
                div.appendChild(statusCol);
                div.appendChild(createdCol);
                div.appendChild(actionsCol);

                tableContainer.appendChild(div);

                // Add event listener for view details
                const viewDetailsBtn = actionsCol.querySelector('.view-details-btn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        showQuoteDetails(quote);
                    });
                }

                // Add event listener for view job
                const viewJobBtn = actionsCol.querySelector('.view-job-btn');
                if (viewJobBtn && quote.jobId) {
                    viewJobBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        showJobDetails(quote.jobId);
                    });
                }
            });
        }

        // Load and display jobs for filtering
        async function loadJobsForFilter(searchQuery = '') {
            const modal = document.getElementById('jobsFilterModal');
            const content = document.getElementById('jobsFilterContent');
            if (!content) return;

            try {
                // Show loading state
                content.innerHTML = `
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3 text-muted">Loading jobs...</p>
                    </div>
                `;

                // Fetch jobs from API
                const params = { page: 1, limit: 1000 };
                if (searchQuery) params.search = searchQuery;
                const res = await api.get('/admin/jobs', { params });
                const data = res.data;

                if (!data || !data.success || !data.data || data.data.length === 0) {
                    content.innerHTML = `
                        <div class="text-center py-5">
                            <em class="icon ni ni-inbox" style="font-size: 48px; opacity: 0.3;"></em>
                            <p class="mt-3 text-muted">No jobs found.</p>
                        </div>
                    `;
                    return;
                }

                allJobs = data.data;
                renderJobsList(allJobs);

            } catch (err) {
                console.error('Failed to load jobs:', err);
                content.innerHTML = `
                    <div class="text-center py-5">
                        <em class="icon ni ni-alert-circle" style="font-size: 48px; opacity: 0.3;"></em>
                        <p class="mt-3 text-muted">Failed to load jobs. Please try again.</p>
                        <button class="btn btn-primary mt-3" onclick="location.reload()">Retry</button>
                    </div>
                `;
            }
        }

        // Render jobs list in filter modal
        function renderJobsList(jobs) {
            const content = document.getElementById('jobsFilterContent');
            if (!content) return;

            if (jobs.length === 0) {
                content.innerHTML = `
                    <div class="text-center py-5">
                        <em class="icon ni ni-inbox" style="font-size: 48px; opacity: 0.3;"></em>
                        <p class="mt-3 text-muted">No jobs found matching your search.</p>
                    </div>
                `;
                return;
            }

            const jobsHtml = jobs.map(job => {
                const jobId = job._id || job.id || '';
                const title = job.title || 'Untitled Job';
                const location = job.location || 'N/A';
                const budget = job.budget || 0;
                const status = job.status || 'N/A';
                const description = job.description || 'No description';
                const isActive = currentJobFilter === jobId;

                return `
                    <div class="card card-bordered mb-2 job-filter-item ${isActive ? 'border-primary' : ''}" data-job-id="${escapeHtml(jobId)}" style="cursor: pointer; transition: all 0.2s;">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h6 class="mb-2">
                                        ${isActive ? '<em class="icon ni ni-check-circle-fill text-primary me-1"></em>' : ''}
                                        ${escapeHtml(title)}
                                    </h6>
                                    <p class="text-muted small mb-2" style="max-height: 40px; overflow: hidden;">${escapeHtml(description).substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <span class="badge badge-dim badge-sm badge-outline-primary">
                                            <em class="icon ni ni-map-pin me-1"></em>${escapeHtml(location)}
                                        </span>
                                        <span class="badge badge-dim badge-sm badge-outline-success">
                                            <em class="icon ni ni-coins me-1"></em>${formatCurrency(budget)}
                                        </span>
                                        <span class="badge badge-dim badge-sm badge-outline-info">
                                            ${escapeHtml(status).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div class="text-end ms-2">
                                    <small class="text-muted d-block">#${escapeHtml(jobId).substring(jobId.length - 6).toUpperCase()}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            content.innerHTML = jobsHtml;

            // Add click handlers
            content.querySelectorAll('.job-filter-item').forEach(item => {
                item.addEventListener('click', function() {
                    const jobId = this.dataset.jobId;
                    const job = allJobs.find(j => (j._id || j.id) === jobId);
                    if (job) {
                        applyJobFilter(job);
                    }
                });

                // Add hover effect
                item.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('border-primary')) {
                        this.style.borderColor = '#e5e9f2';
                        this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    }
                });
                item.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('border-primary')) {
                        this.style.borderColor = '';
                        this.style.boxShadow = '';
                    }
                });
            });
        }

        // Apply job filter
        function applyJobFilter(job) {
            const jobId = job._id || job.id;
            currentJobFilter = jobId;
            currentPage = 1;
            
            // Update active filter indicator
            const filterIndicator = document.getElementById('activeJobFilter');
            const filterText = document.getElementById('activeJobFilterText');
            if (filterIndicator && filterText) {
                filterText.textContent = `Filtering by: ${job.title || 'Job'}`;
                filterIndicator.style.display = 'block';
            }

            // Close modal
            const modal = document.getElementById('jobsFilterModal');
            if (modal && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }

            // Reload quotes with job filter
            loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
            
            if (typeof toast !== 'undefined') {
                toast.success(`Showing quotes for: ${job.title}`);
            }
        }

        // Clear job filter
        function clearJobFilter() {
            currentJobFilter = null;
            currentPage = 1;
            
            // Hide filter indicator
            const filterIndicator = document.getElementById('activeJobFilter');
            if (filterIndicator) {
                filterIndicator.style.display = 'none';
            }

            // Reload quotes without job filter
            loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, null, startDate, endDate);
            
            if (typeof toast !== 'undefined') {
                toast.info('Job filter cleared');
            }
        }

        // Show job details modal
        function showJobDetails(job) {
            const modal = document.getElementById('jobDetailsModal');
            const content = document.getElementById('jobDetailsContent');
            if (!modal || !content) return;

            const jobId = job._id || job;
            const title = job.title || 'N/A';
            const description = job.description || 'No description provided';
            const location = job.location || 'N/A';
            const budget = job.budget || 0;
            const status = job.status || 'N/A';
            const createdAt = job.createdAt || '';

            content.innerHTML = `
                <div class="row g-4">
                    <!-- Job Header -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <h4 class="mb-2">${escapeHtml(title)}</h4>
                                        <div class="d-flex gap-3 flex-wrap">
                                            <span class="badge badge-dim badge-sm badge-outline-primary">
                                                <em class="icon ni ni-map-pin me-1"></em>${escapeHtml(location)}
                                            </span>
                                            <span class="badge badge-dim badge-sm badge-outline-success">
                                                <em class="icon ni ni-coins me-1"></em>${formatCurrency(budget)}
                                            </span>
                                            <span class="badge badge-dim badge-sm badge-outline-info">
                                                <em class="icon ni ni-signal me-1"></em>${escapeHtml(status).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <small class="text-muted d-block mb-1">Job ID</small>
                                        <strong class="text-primary">#${escapeHtml(jobId).substring(jobId.length - 8).toUpperCase()}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Job Description -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3">
                                    <em class="icon ni ni-file-text me-2"></em>Job Description
                                </h6>
                                <p class="text-muted" style="white-space: pre-wrap; line-height: 1.8;">${escapeHtml(description)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Job Details Grid -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3">
                                    <em class="icon ni ni-info me-2"></em>Job Information
                                </h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="p-3 bg-light rounded">
                                            <div class="d-flex align-items-center">
                                                <div class="icon-circle me-3" style="width: 40px; height: 40px; background: rgba(101, 118, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                                    <em class="icon ni ni-map-pin" style="font-size: 18px; color: #6576ff;"></em>
                                                </div>
                                                <div>
                                                    <small class="text-muted d-block">Location</small>
                                                    <strong>${escapeHtml(location)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="p-3 bg-light rounded">
                                            <div class="d-flex align-items-center">
                                                <div class="icon-circle me-3" style="width: 40px; height: 40px; background: rgba(30, 224, 172, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                                    <em class="icon ni ni-coins" style="font-size: 18px; color: #1ee0ac;"></em>
                                                </div>
                                                <div>
                                                    <small class="text-muted d-block">Budget</small>
                                                    <strong style="color: #1ee0ac;">${formatCurrency(budget)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="p-3 bg-light rounded">
                                            <div class="d-flex align-items-center">
                                                <div class="icon-circle me-3" style="width: 40px; height: 40px; background: rgba(129, 107, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                                    <em class="icon ni ni-signal" style="font-size: 18px; color: #816bff;"></em>
                                                </div>
                                                <div>
                                                    <small class="text-muted d-block">Status</small>
                                                    <strong class="text-capitalize">${escapeHtml(status)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    ${createdAt ? `
                                    <div class="col-md-6">
                                        <div class="p-3 bg-light rounded">
                                            <div class="d-flex align-items-center">
                                                <div class="icon-circle me-3" style="width: 40px; height: 40px; background: rgba(255, 171, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                                    <em class="icon ni ni-calendar" style="font-size: 18px; color: #ffab00;"></em>
                                                </div>
                                                <div>
                                                    <small class="text-muted d-block">Posted On</small>
                                                    <strong>${formatDate(createdAt)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="col-12">
                        <div class="d-flex gap-2 justify-content-end">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;

            // Show modal
            if (window.bootstrap) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        }

        // Show quote details modal
        function showQuoteDetails(quote) {
            const modal = document.getElementById('quoteDetailsModal');
            const content = document.getElementById('quoteDetailsContent');
            if (!modal || !content) return;

            const customer = quote.customerId || {};
            const artisan = quote.artisanId || {};
            const booking = quote.bookingId;
            const job = quote.jobId;
            const items = quote.items || [];
            const notes = quote.notes || '';

            // Build items table HTML
            const itemsHtml = items.length > 0 ? items.map((item, index) => `
                <tr>
                    <td class="tb-col">${index + 1}</td>
                    <td class="tb-col">
                        <span class="fw-medium">${escapeHtml(item.description || item.name || 'N/A')}</span>
                    </td>
                    <td class="tb-col text-center">
                        <span>${item.quantity || item.qty || 1}</span>
                    </td>
                    <td class="tb-col text-end">
                        <span class="fw-medium">${formatCurrency(item.price || item.cost || 0)}</span>
                    </td>
                    <td class="tb-col text-end">
                        <span class="fw-bold">${formatCurrency((item.quantity || item.qty || 1) * (item.price || item.cost || 0))}</span>
                    </td>
                </tr>
            `).join('') : `<tr><td colspan="5" class="text-center text-muted py-3">No items added to this quote</td></tr>`;

            // Build notes section if available
            const notesHtml = notes ? `
                <div class="col-12">
                    <div class="card card-bordered">
                        <div class="card-body">
                            <h6 class="card-title mb-3"><em class="icon ni ni-notes me-2"></em>Quote Notes</h6>
                            <p class="text-muted mb-0">${escapeHtml(notes)}</p>
                        </div>
                    </div>
                </div>
            ` : '';

            content.innerHTML = `
                <div class="row g-4">
                    <!-- Header Card with Quote ID and Status -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-1">Quote ID</h6>
                                    <h4 class="mb-0">#${escapeHtml(quote._id).substring(quote._id.length - 8).toUpperCase()}</h4>
                                </div>
                                <div class="text-end">
                                    <h6 class="text-muted mb-2">Status</h6>
                                    ${getStatusBadge(quote.status)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Information -->
                    <div class="col-md-6">
                        <div class="card card-bordered h-100">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-user me-2"></em>Customer Information</h6>
                                <div class="d-flex align-items-center mb-3">
                                    <div class="user-avatar user-avatar-lg bg-primary me-3" style="border-radius: 50%; overflow: hidden; width: 60px; height: 60px;">
                                        ${customer.profileImage && customer.profileImage.url 
                                            ? `<img src="${escapeHtml(customer.profileImage.url)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                            : `<span style="font-size: 24px;">${(customer.name || 'U').charAt(0).toUpperCase()}</span>`}
                                    </div>
                                    <div>
                                        <h6 class="mb-0">${escapeHtml(customer.name || 'N/A')}</h6>
                                        <span class="text-muted small">${escapeHtml(customer.email || '')}</span>
                                    </div>
                                </div>
                                <ul class="list-unstyled">
                                    <li class="mb-2"><em class="icon ni ni-call text-primary me-2"></em>${escapeHtml(customer.phone || 'N/A')}</li>
                                    <li><em class="icon ni ni-user-circle text-primary me-2"></em>Customer ID: ${escapeHtml(customer._id || 'N/A')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Artisan Information -->
                    <div class="col-md-6">
                        <div class="card card-bordered h-100">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-user-check me-2"></em>Artisan Information</h6>
                                <div class="d-flex align-items-center mb-3">
                                    <div class="user-avatar user-avatar-lg bg-success me-3" style="border-radius: 50%; overflow: hidden; width: 60px; height: 60px;">
                                        ${artisan.profileImage && artisan.profileImage.url 
                                            ? `<img src="${escapeHtml(artisan.profileImage.url)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                            : `<span style="font-size: 24px;">${(artisan.name || 'A').charAt(0).toUpperCase()}</span>`}
                                    </div>
                                    <div>
                                        <h6 class="mb-0">${escapeHtml(artisan.name || 'N/A')}</h6>
                                        <span class="text-muted small">${escapeHtml(artisan.email || '')}</span>
                                    </div>
                                </div>
                                <ul class="list-unstyled">
                                    <li class="mb-2"><em class="icon ni ni-call text-success me-2"></em>${escapeHtml(artisan.phone || 'N/A')}</li>
                                    <li><em class="icon ni ni-user-circle text-success me-2"></em>Artisan ID: ${escapeHtml(artisan._id || 'N/A')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Quote Items -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-file-docs me-2"></em>Quote Items</h6>
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead class="table-light">
                                            <tr>
                                                <th style="width: 50px;">#</th>
                                                <th>Description</th>
                                                <th class="text-center" style="width: 100px;">Quantity</th>
                                                <th class="text-end" style="width: 120px;">Unit Price</th>
                                                <th class="text-end" style="width: 140px;">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHtml}
                                        </tbody>
                                        <tfoot class="table-light">
                                            ${quote.serviceCharge ? `
                                            <tr>
                                                <td colspan="4" class="text-end fw-medium">Service Charge:</td>
                                                <td class="text-end fw-medium">${formatCurrency(quote.serviceCharge)}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td colspan="4" class="text-end fw-bold">Quote Total:</td>
                                                <td class="text-end fw-bold" style="font-size: 1.1em; color: #1ee0ac;">
                                                    ${formatCurrency(quote.total || 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${notesHtml}

                    <!-- Quote Information -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-info me-2"></em>Quote Information</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Quote Type</span>
                                            ${getTypeBadge(quote.quoteType || 'booking')}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Status</span>
                                            ${getStatusBadge(quote.status)}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Created At</span>
                                            <strong>${formatDate(quote.createdAt)}</strong>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Updated At</span>
                                            <strong>${formatDate(quote.updatedAt)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Related Booking/Job -->
                    ${booking || job ? `
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-link me-2"></em>Related ${booking ? 'Booking' : 'Job'}</h6>
                                ${booking ? `
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <small class="text-muted d-block mb-1">Booking ID</small>
                                        <strong><a href="/aa/bookingdetails?id=${escapeHtml(booking._id || booking)}" class="text-primary">#${escapeHtml((booking._id || booking).substring((booking._id || booking).length - 6))}</a></strong>
                                    </div>
                                    ${booking.status ? `
                                    <div class="col-md-6">
                                        <small class="text-muted d-block mb-1">Booking Status</small>
                                        <strong>${escapeHtml(booking.status).toUpperCase()}</strong>
                                    </div>
                                    ` : ''}
                                    ${booking.service ? `
                                    <div class="col-12">
                                        <small class="text-muted d-block mb-1">Service</small>
                                        <strong>${escapeHtml(booking.service)}</strong>
                                    </div>
                                    ` : ''}
                                </div>
                                ` : ''}
                                ${job ? `
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <small class="text-muted d-block mb-1">Job ID</small>
                                        <strong><a href="/aa/jobdetails?id=${escapeHtml(job._id || job)}" class="text-primary">#${escapeHtml((job._id || job).substring((job._id || job).length - 6))}</a></strong>
                                    </div>
                                    ${job.status ? `
                                    <div class="col-md-6">
                                        <small class="text-muted d-block mb-1">Job Status</small>
                                        <strong>${escapeHtml(job.status).toUpperCase()}</strong>
                                    </div>
                                    ` : ''}
                                    ${job.title ? `
                                    <div class="col-12">
                                        <small class="text-muted d-block mb-1">Job Title</small>
                                        <strong>${escapeHtml(job.title)}</strong>
                                    </div>
                                    ` : ''}
                                    ${job.description ? `
                                    <div class="col-12">
                                        <small class="text-muted d-block mb-1">Job Description</small>
                                        <p class="mb-0 text-muted">${escapeHtml(job.description).substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
                                    </div>
                                    ` : ''}
                                    ${job.location ? `
                                    <div class="col-md-6">
                                        <small class="text-muted d-block mb-1">Location</small>
                                        <strong>${escapeHtml(job.location)}</strong>
                                    </div>
                                    ` : ''}
                                    ${job.budget ? `
                                    <div class="col-md-6">
                                        <small class="text-muted d-block mb-1">Budget</small>
                                        <strong>${formatCurrency(job.budget)}</strong>
                                    </div>
                                    ` : ''}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div class="col-12">
                        <div class="d-flex gap-2 justify-content-end">
                            ${booking ? `<a href="/aa/bookingdetails?id=${escapeHtml(booking._id || booking)}" class="btn btn-outline-primary">View Booking</a>` : ''}
                            ${job ? `<a href="/aa/jobdetails?id=${escapeHtml(job._id || job)}" class="btn btn-outline-primary">View Job</a>` : ''}
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;

            // Show modal
            if (window.bootstrap) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        }

        // Show quote summary modal
        async function showQuoteSummary() {
            const modal = document.getElementById('quoteSummaryModal');
            const content = document.getElementById('quoteSummaryContent');
            if (!modal || !content) return;

            // Show modal with loading state
            if (window.bootstrap) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }

            content.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading quote statistics...</p>
                </div>
            `;

            try {
                // Fetch all quotes without pagination to get accurate stats
                const res = await api.get('/admin/quotes', { 
                    params: { page: 1, limit: 10000 } 
                });
                const data = res.data;

                if (!data || !data.success || !data.data) {
                    throw new Error('Failed to fetch quote data');
                }

                const quotes = data.data;
                const totalQuotes = data.pagination?.total || quotes.length;

                // Calculate statistics
                const stats = {
                    total: totalQuotes,
                    totalValue: 0,
                    booking: 0,
                    job: 0,
                    proposed: 0,
                    accepted: 0,
                    rejected: 0
                };

                quotes.forEach(quote => {
                    // Total value
                    stats.totalValue += quote.total || 0;

                    // Type counts
                    if (quote.quoteType === 'booking') {
                        stats.booking++;
                    } else if (quote.quoteType === 'job') {
                        stats.job++;
                    }

                    // Status counts
                    switch(quote.status) {
                        case 'proposed': stats.proposed++; break;
                        case 'accepted': stats.accepted++; break;
                        case 'rejected': stats.rejected++; break;
                    }
                });

                const averageQuote = stats.total > 0 ? stats.totalValue / stats.total : 0;

                // Render summary
                content.innerHTML = `
                    <div class="row g-4">
                        <!-- Total Quotes -->
                        <div class="col-md-4">
                            <div class="card card-bordered h-100" style="border-left: 4px solid #6576ff;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="text-muted mb-2">Total Quotes</h6>
                                            <h2 class="mb-0" style="color: #6576ff;">${stats.total.toLocaleString()}</h2>
                                        </div>
                                        <div class="icon-circle" style="width: 50px; height: 50px; background: rgba(101, 118, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <em class="icon ni ni-file-docs" style="font-size: 24px; color: #6576ff;"></em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Total Value -->
                        <div class="col-md-4">
                            <div class="card card-bordered h-100" style="border-left: 4px solid #1ee0ac;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="text-muted mb-2">Total Value</h6>
                                            <h2 class="mb-0" style="color: #1ee0ac;">${formatCurrency(stats.totalValue)}</h2>
                                        </div>
                                        <div class="icon-circle" style="width: 50px; height: 50px; background: rgba(30, 224, 172, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <em class="icon ni ni-coins" style="font-size: 24px; color: #1ee0ac;"></em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Average Quote -->
                        <div class="col-md-4">
                            <div class="card card-bordered h-100" style="border-left: 4px solid #816bff;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="text-muted mb-2">Average Quote</h6>
                                            <h2 class="mb-0" style="color: #816bff;">${formatCurrency(averageQuote)}</h2>
                                        </div>
                                        <div class="icon-circle" style="width: 50px; height: 50px; background: rgba(129, 107, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <em class="icon ni ni-bar-chart" style="font-size: 24px; color: #816bff;"></em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Type Breakdown -->
                        <div class="col-12">
                            <div class="card card-bordered">
                                <div class="card-body">
                                    <h6 class="card-title mb-3"><em class="icon ni ni-layers me-2"></em>Quote Type Breakdown</h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="text-center p-4 bg-light rounded">
                                                ${getTypeBadge('booking')}
                                                <h3 class="mt-3 mb-0">${stats.booking}</h3>
                                                <small class="text-muted">${stats.total > 0 ? ((stats.booking / stats.total) * 100).toFixed(1) : 0}% of total</small>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="text-center p-4 bg-light rounded">
                                                ${getTypeBadge('job')}
                                                <h3 class="mt-3 mb-0">${stats.job}</h3>
                                                <small class="text-muted">${stats.total > 0 ? ((stats.job / stats.total) * 100).toFixed(1) : 0}% of total</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Status Breakdown -->
                        <div class="col-12">
                            <div class="card card-bordered">
                                <div class="card-body">
                                    <h6 class="card-title mb-3"><em class="icon ni ni-activity me-2"></em>Quote Status Breakdown</h6>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-warning mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.proposed}</h4>
                                                <small class="text-muted">Proposed</small>
                                                <div class="progress mt-2" style="height: 6px;">
                                                    <div class="progress-bar bg-warning" role="progressbar" style="width: ${stats.total > 0 ? (stats.proposed / stats.total) * 100 : 0}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-success mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.accepted}</h4>
                                                <small class="text-muted">Accepted</small>
                                                <div class="progress mt-2" style="height: 6px;">
                                                    <div class="progress-bar bg-success" role="progressbar" style="width: ${stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-danger mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.rejected}</h4>
                                                <small class="text-muted">Rejected</small>
                                                <div class="progress mt-2" style="height: 6px;">
                                                    <div class="progress-bar bg-danger" role="progressbar" style="width: ${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Insights -->
                        <div class="col-md-6">
                            <div class="card card-bordered h-100">
                                <div class="card-body">
                                    <h6 class="card-title mb-3"><em class="icon ni ni-trend-up me-2"></em>Performance Metrics</h6>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-2">
                                        <span>Acceptance Rate</span>
                                        <strong>${stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0}%</strong>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                        <span>Rejection Rate</span>
                                        <strong>${stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card card-bordered h-100">
                                <div class="card-body">
                                    <h6 class="card-title mb-3"><em class="icon ni ni-info me-2"></em>Value Analysis</h6>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-2">
                                        <span>Average Direct Hire Quote</span>
                                        <strong>${formatCurrency(stats.booking > 0 ? stats.totalValue / stats.booking : 0)}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                        <span>Average Job Bid Quote</span>
                                        <strong>${formatCurrency(stats.job > 0 ? stats.totalValue / stats.job : 0)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Close Button -->
                        <div class="col-12">
                            <div class="text-end">
                                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                `;

            } catch (err) {
                console.error('Failed to load quote summary:', err);
                content.innerHTML = `
                    <div class="text-center py-5">
                        <em class="icon ni ni-alert-circle" style="font-size: 48px; opacity: 0.3;"></em>
                        <p class="mt-3 text-muted">Failed to load quote summary. Please try again.</p>
                        <button type="button" class="btn btn-primary mt-3" onclick="location.reload()">Retry</button>
                    </div>
                `;
            }
        }

        function renderPagination(page, limit, total) {
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
                    if (!disabled) loadQuotes(pageNum, limit, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
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
                    loadQuotes(i, limit, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
                });
                li.appendChild(a);
                frag.appendChild(li);
            }

            frag.appendChild(makeLi('Next', page >= totalPages, page + 1));

            paginationEl.innerHTML = '';
            paginationEl.appendChild(frag);
        }

        // Search functionality
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function (e) {
                clearTimeout(searchTimeout);
                searchQuery = e.target.value.trim();
                searchTimeout = setTimeout(() => {
                    currentPage = 1;
                    loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
                }, 500);
            });
        }

        // Date filter functionality
        const startDateInput = document.getElementById('start-date-filter');
        const endDateInput = document.getElementById('end-date-filter');
        
        if (startDateInput) {
            startDateInput.addEventListener('change', function (e) {
                startDate = e.target.value;
                currentPage = 1;
                loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
            });
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', function (e) {
                endDate = e.target.value;
                currentPage = 1;
                loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
            });
        }

        // Type filter functionality
        const typeFilterLinks = document.querySelectorAll('[data-type-filter]');
        typeFilterLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                currentTypeFilter = this.dataset.typeFilter;
                currentPage = 1;
                loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
                
                // Update active state
                typeFilterLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Status filter functionality
        const statusFilterLinks = document.querySelectorAll('[data-status-filter]');
        statusFilterLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                currentStatusFilter = this.dataset.statusFilter;
                currentPage = 1;
                loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, startDate, endDate);
                
                // Update active state
                statusFilterLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Combined filter functionality (for data-filter attribute)
        const filterLinks = document.querySelectorAll('[data-filter]');
        filterLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const filterValue = this.dataset.filter;
                
                // Check if it's a type filter or status filter
                if (['all', 'booking', 'job'].includes(filterValue)) {
                    currentTypeFilter = filterValue;
                } else if (['proposed', 'accepted', 'rejected'].includes(filterValue)) {
                    currentStatusFilter = filterValue;
                } else if (filterValue === 'all') {
                    currentTypeFilter = 'all';
                    currentStatusFilter = 'all';
                }
                
                currentPage = 1;
                loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter);
                
                // Update active state
                filterLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Advanced Filter button - show jobs filter modal
        const advancedFilterBtn = document.getElementById('advancedFilterBtn');
        if (advancedFilterBtn) {
            advancedFilterBtn.addEventListener('click', async function () {
                const modal = document.getElementById('jobsFilterModal');
                if (modal && window.bootstrap) {
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                    // Load jobs when modal is shown
                    await loadJobsForFilter();
                }
            });
        }

        // Job filter search functionality
        const jobFilterSearch = document.getElementById('job-filter-search');
        if (jobFilterSearch) {
            let jobSearchTimeout;
            jobFilterSearch.addEventListener('input', function (e) {
                clearTimeout(jobSearchTimeout);
                const query = e.target.value.trim().toLowerCase();
                jobSearchTimeout = setTimeout(() => {
                    if (query) {
                        const filtered = allJobs.filter(job => {
                            const title = (job.title || '').toLowerCase();
                            const location = (job.location || '').toLowerCase();
                            const description = (job.description || '').toLowerCase();
                            return title.includes(query) || location.includes(query) || description.includes(query);
                        });
                        renderJobsList(filtered);
                    } else {
                        renderJobsList(allJobs);
                    }
                }, 300);
            });
        }

        // Clear job filter button
        const clearJobFilterBtn = document.getElementById('clearJobFilter');
        if (clearJobFilterBtn) {
            clearJobFilterBtn.addEventListener('click', function (e) {
                e.preventDefault();
                clearJobFilter();
            });
        }

        // Clear date filters button
        const clearDateFiltersBtn = document.getElementById('clearDateFilters');
        if (clearDateFiltersBtn) {
            clearDateFiltersBtn.addEventListener('click', function (e) {
                e.preventDefault();
                startDate = '';
                endDate = '';
                if (startDateInput) startDateInput.value = '';
                if (endDateInput) endDateInput.value = '';
                currentPage = 1;
                loadQuotes(1, PAGE_LIMIT, currentTypeFilter, currentStatusFilter, searchQuery, currentJobFilter, '', '');
                if (typeof toast !== 'undefined') {
                    toast.info('Date filters cleared');
                }
            });
        }

        // Quote Summary button
        const summaryBtn = document.getElementById('quoteSummaryBtn');
        if (summaryBtn) {
            summaryBtn.addEventListener('click', async function () {
                await showQuoteSummary();
            });
        }

        // Initial load
        await loadQuotes(1, PAGE_LIMIT);

    } catch (error) {
        console.error('Initialization error:', error);
        if (typeof toast !== 'undefined') toast.error('Failed to initialize quotes page');
    }

})();
