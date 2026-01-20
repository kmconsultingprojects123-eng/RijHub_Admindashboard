import { getApi, toast, getStoredToken } from './config/_helper.js';

// Frontend for All Bookings Overview - displays bookings with customer/artisan, quotes, and job details
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
        'pending': '<span class="badge badge-sm badge-dot has-bg bg-warning d-inline-flex align-items-center"><span>Pending</span></span>',
        'accepted': '<span class="badge badge-sm badge-dot has-bg bg-info d-inline-flex align-items-center"><span>Accepted</span></span>',
        'in-progress': '<span class="badge badge-sm badge-dot has-bg bg-primary d-inline-flex align-items-center"><span>In Progress</span></span>',
        'completed': '<span class="badge badge-sm badge-dot has-bg bg-success d-inline-flex align-items-center"><span>Completed</span></span>',
        'cancelled': '<span class="badge badge-sm badge-dot has-bg bg-danger d-inline-flex align-items-center"><span>Cancelled</span></span>'
    };
    return badges[status] || `<span class="badge badge-sm badge-dot has-bg bg-secondary d-inline-flex align-items-center"><span>${escapeHtml(status)}</span></span>`;
}

(async function () {
    const tableContainer = document.getElementById('bookings-table');
    const paginationEl = document.getElementById('bookings-pagination');
    const searchInput = document.getElementById('booking-search-input');
    
    let currentPage = 1;
    const PAGE_LIMIT = 20;
    let currentFilter = 'all';
    let searchQuery = '';
    
    try {
        api = await getApi();
        // ensure axios instance includes stored token (if any)
        try {
            const token = getStoredToken();
            if (token) {
                api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            }
        } catch (e) { console.warn('failed attaching token to api', e); }
        
        // Load bookings function
        async function loadBookings(page = 1, limit = PAGE_LIMIT, status = 'all', query = '') {
            if (!api) api = await getApi();
            try {
                showSkeleton(limit);
                const params = { page, limit, includeDetails: true };
                if (status && status !== 'all') params.status = status;
                if (query) params.q = query;
                
                const res = await api.get('/admin/bookings', { params });
                console.log('Bookings response:', res);
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
                console.error('Failed to load bookings', err);
                if (typeof toast !== 'undefined') toast.error('Failed to load bookings');
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
            emptyDiv.innerHTML = '<div class="nk-tb-col" style="text-align:center;padding:40px;width:100%;grid-column:1/-1;"><em class="icon ni ni-inbox" style="font-size:48px;opacity:0.3"></em><p class="mt-3">No bookings found.</p></div>';
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
                    <div class="nk-tb-col tb-col-lg"><span class="skeleton" style="width:150px"></span></div>
                    <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:80px"></span></div>
                    <div class="nk-tb-col tb-col-md"><span class="skeleton" style="width:90px"></span></div>
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
            items.forEach(booking => {
                const id = booking._id || booking.id || '';
                const div = document.createElement('div');
                div.className = 'nk-tb-item';
                div.dataset.id = id;

                // Booking ID column
                const idCol = document.createElement('div');
                idCol.className = 'nk-tb-col';
                idCol.innerHTML = `<span class="tb-lead"><a href="#" class="text-primary">#${id.substring(id.length - 6)}</a></span>`;

                // Customer column
                const customerCol = document.createElement('div');
                customerCol.className = 'nk-tb-col tb-col-mb';
                const customer = booking.customerId || {};
                customerCol.innerHTML = `
                    <div class="user-card">
                        <div class="user-avatar bg-primary" style="border-radius: 50%; overflow: hidden; width: 32px; height: 32px; flex-shrink: 0;">
                            ${customer.profileImage && customer.profileImage.url 
                                ? `<img src="${escapeHtml(customer.profileImage.url)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                : `<span>${(customer.name || 'U').charAt(0).toUpperCase()}</span>`}
                        </div>
                        <div class="user-info" style="margin-left: 12px;">
                            <span class="tb-lead">${escapeHtml(customer.name || 'N/A')}</span>
                            <span>${escapeHtml(customer.email || '')}</span>
                        </div>
                    </div>
                `;

                // Artisan column
                const artisanCol = document.createElement('div');
                artisanCol.className = 'nk-tb-col tb-col-md';
                const artisan = booking.artisanId || {};
                artisanCol.innerHTML = `
                    <div class="user-card">
                        <div class="user-avatar bg-success" style="border-radius: 50%; overflow: hidden; width: 32px; height: 32px; flex-shrink: 0;">
                            ${artisan.profileImage && artisan.profileImage.url 
                                ? `<img src="${escapeHtml(artisan.profileImage.url)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                : `<span>${(artisan.name || 'A').charAt(0).toUpperCase()}</span>`}
                        </div>
                        <div class="user-info" style="margin-left: 12px;">
                            <span class="tb-lead">${escapeHtml(artisan.name || 'N/A')}</span>
                            <span>${escapeHtml(artisan.email || '')}</span>
                        </div>
                    </div>
                `;

                // Service column - handle job or direct service
                const serviceCol = document.createElement('div');
                serviceCol.className = 'nk-tb-col tb-col-lg';
                let serviceText = 'Direct Hire';
                if (booking.job && booking.job.title) {
                    serviceText = booking.job.title;
                } else if (booking.service) {
                    serviceText = booking.service;
                }
                serviceCol.innerHTML = `<span class="tb-lead">${escapeHtml(serviceText)}</span>`;

                // Price column
                const priceCol = document.createElement('div');
                priceCol.className = 'nk-tb-col tb-col-md';
                priceCol.innerHTML = `<span class="tb-amount">${formatCurrency(booking.price || 0)}</span>`;

                // Status column
                const statusCol = document.createElement('div');
                statusCol.className = 'nk-tb-col tb-col-md';
                statusCol.innerHTML = getStatusBadge(booking.status);

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
                                        <li><a href="#" class="view-details-btn" data-booking-id="${escapeHtml(id)}"><em class="icon ni ni-eye"></em><span>View Details</span></a></li>
                                        <li><a href="#" class="view-quotes-btn"><em class="icon ni ni-file-text"></em><span>View Quotes (${booking.quotes ? booking.quotes.length : 0})</span></a></li>
                                        ${booking.job ? `<li><a href="/aa/jobdetails?id=${escapeHtml(booking.job._id || booking.job)}"><em class="icon ni ni-briefcase"></em><span>View Job</span></a></li>` : ''}
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                `;

                div.appendChild(idCol);
                div.appendChild(customerCol);
                div.appendChild(artisanCol);
                div.appendChild(serviceCol);
                div.appendChild(priceCol);
                div.appendChild(statusCol);
                div.appendChild(actionsCol);

                tableContainer.appendChild(div);

                // Add event listener for view details
                const viewDetailsBtn = actionsCol.querySelector('.view-details-btn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        showBookingDetails(booking);
                    });
                }

                // Add event listener for view quotes
                const viewQuotesBtn = actionsCol.querySelector('.view-quotes-btn');
                if (viewQuotesBtn) {
                    viewQuotesBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        showQuotesModal(booking);
                    });
                }
            });
        }

        // Show booking details modal
        function showBookingDetails(booking) {
            const modal = document.getElementById('bookingDetailsModal');
            const content = document.getElementById('bookingDetailsContent');
            if (!modal || !content) return;

            const customer = booking.customerId || {};
            const artisan = booking.artisanId || {};
            const job = booking.job;

            let serviceInfo = 'Direct Hire';
            if (job && job.title) {
                serviceInfo = `<a href="/aa/jobdetails?id=${escapeHtml(job._id || job)}" class="text-primary">${escapeHtml(job.title)}</a>`;
            } else if (booking.service) {
                serviceInfo = escapeHtml(booking.service);
            }

            content.innerHTML = `
                <!-- Nav Tabs -->
                <ul class="nav nav-tabs nav-tabs-card mb-4" id="bookingTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details-pane" type="button" role="tab">
                            <em class="icon ni ni-list"></em><span>Details</span>
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="chat-tab" data-bs-toggle="tab" data-bs-target="#chat-pane" type="button" role="tab">
                            <em class="icon ni ni-chat"></em><span>Chat History</span>
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="bookingTabContent">
                    <!-- Details Tab -->
                    <div class="tab-pane fade show active" id="details-pane" role="tabpanel">
                <div class="row g-4">
                    <!-- Header Card with Booking ID and Status -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-1">Booking ID</h6>
                                    <h4 class="mb-0">#${escapeHtml(booking._id).substring(booking._id.length - 8).toUpperCase()}</h4>
                                </div>
                                <div class="text-end">
                                    <h6 class="text-muted mb-2">Status</h6>
                                    ${getStatusBadge(booking.status)}
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

                    <!-- Booking Information -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-calendar-booking me-2"></em>Booking Information</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Service Type</span>
                                            <strong>${serviceInfo}</strong>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Price</span>
                                            <strong class="text-primary" style="font-size: 1.2em;">${formatCurrency(booking.price || 0)}</strong>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Payment Status</span>
                                            <span class="badge badge-${booking.paymentStatus === 'paid' ? 'success' : 'warning'}">${escapeHtml(booking.paymentStatus || 'N/A')}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Scheduled Date</span>
                                            <strong>${formatDate(booking.schedule)}</strong>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Created At</span>
                                            <span>${formatDate(booking.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                            <span class="text-muted">Total Quotes</span>
                                            <span class="badge badge-primary">${booking.quotes ? booking.quotes.length : 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Info -->
                    <div class="col-12">
                        <div class="card card-bordered">
                            <div class="card-body">
                                <h6 class="card-title mb-3"><em class="icon ni ni-info me-2"></em>Additional Information</h6>
                                <div class="row g-2">
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Awaiting Review</small>
                                        <strong>${booking.awaitingReview ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Reviewed</small>
                                        <strong>${booking.reviewed ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Refund Status</small>
                                        <strong>${escapeHtml(booking.refundStatus || 'none')}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="col-12">
                        <div class="d-flex gap-2 justify-content-end">
                            ${booking.quotes && booking.quotes.length > 0 ? `<button class="btn btn-outline-primary">View Quotes (${booking.quotes.length})</button>` : ''}
                            ${job ? `<a href="/aa/jobdetails?id=${escapeHtml(job._id || job)}" class="btn btn-primary">View Job Details</a>` : ''}
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
                    </div>

                    <!-- Chat Tab -->
                    <div class="tab-pane fade" id="chat-pane" role="tabpanel">
                        <div id="chat-loading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-3 text-muted">Loading chat messages...</p>
                        </div>
                        <div id="chat-container" style="display:none;">
                            <div class="card card-bordered">
                                <div class="card-body p-0">
                                    <div id="chat-messages" style="max-height: 500px; overflow-y: auto; padding: 1.5rem;">
                                        <!-- Messages will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="chat-error" style="display:none;" class="text-center py-5">
                            <em class="icon ni ni-alert-circle" style="font-size: 48px; opacity: 0.3;"></em>
                            <p class="mt-3 text-muted">No chat history available for this booking.</p>
                        </div>
                    </div>
                </div>
            `;

            // Show modal
            if (window.bootstrap) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
                
                // Set up chat tab event listener
                const chatTab = document.getElementById('chat-tab');
                if (chatTab) {
                    chatTab.addEventListener('shown.bs.tab', async function () {
                        await loadChatHistory(booking._id);
                    });
                }
            }
        }

        // Load chat history for a booking
        async function loadChatHistory(bookingId) {
            const chatLoading = document.getElementById('chat-loading');
            const chatContainer = document.getElementById('chat-container');
            const chatMessages = document.getElementById('chat-messages');
            const chatError = document.getElementById('chat-error');

            if (!chatMessages) return;

            // Show loading
            if (chatLoading) chatLoading.style.display = 'block';
            if (chatContainer) chatContainer.style.display = 'none';
            if (chatError) chatError.style.display = 'none';

            try {
                const res = await api.get(`/chat/booking/${bookingId}`);
                const data = res.data;

                if (chatLoading) chatLoading.style.display = 'none';

                if (!data || !data.success || !data.data || !data.data.messages || data.data.messages.length === 0) {
                    if (chatError) chatError.style.display = 'block';
                    return;
                }

                const chat = data.data;
                const messages = chat.messages || [];

                // Render messages
                chatMessages.innerHTML = '';
                messages.forEach((msg, index) => {
                    const isCustomer = msg.senderId === chat.customerId;
                    const sender = isCustomer ? chat.customer : chat.artisan;
                    const senderName = sender?.name || 'Unknown';
                    const senderImage = sender?.profileImage?.url;
                    const msgTime = formatDate(msg.timestamp);

                    const messageDiv = document.createElement('div');
                    messageDiv.className = `d-flex ${isCustomer ? 'justify-content-start' : 'justify-content-end'} mb-3`;
                    messageDiv.innerHTML = `
                        <div class="d-flex ${isCustomer ? 'flex-row' : 'flex-row-reverse'} align-items-start" style="max-width: 70%;">
                            <div class="user-avatar ${isCustomer ? 'bg-primary' : 'bg-success'} me-2 ms-2" style="border-radius: 50%; overflow: hidden; width: 36px; height: 36px; flex-shrink: 0;">
                                ${senderImage 
                                    ? `<img src="${escapeHtml(senderImage)}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` 
                                    : `<span style="font-size: 14px;">${senderName.charAt(0).toUpperCase()}</span>`}
                            </div>
                            <div>
                                <div class="card ${isCustomer ? 'bg-light' : 'bg-primary text-white'}" style="border-radius: 12px;">
                                    <div class="card-body p-2 px-3">
                                        <p class="mb-0" style="word-wrap: break-word;">${escapeHtml(msg.message || msg.text || '')}</p>
                                    </div>
                                </div>
                                <small class="text-muted d-block mt-1 ${isCustomer ? 'text-start' : 'text-end'}">${senderName} • ${msgTime}</small>
                            </div>
                        </div>
                    `;
                    chatMessages.appendChild(messageDiv);
                });

                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;

                if (chatContainer) chatContainer.style.display = 'block';

            } catch (err) {
                console.error('Failed to load chat:', err);
                if (chatLoading) chatLoading.style.display = 'none';
                if (chatError) chatError.style.display = 'block';
            }
        }

        // Show quotes modal
        function showQuotesModal(booking) {
            const modal = document.getElementById('quotesModal');
            const content = document.getElementById('quotesModalContent');
            if (!modal || !content) return;

            const quotes = booking.quotes || [];

            if (quotes.length === 0) {
                content.innerHTML = `
                    <div class="text-center py-5">
                        <em class="icon ni ni-file-text" style="font-size: 64px; opacity: 0.2;"></em>
                        <h6 class="mt-3 text-muted">No quotes available for this booking</h6>
                    </div>
                `;
            } else {
                // Render quotes
                const quotesHtml = quotes.map((quote, index) => {
                    const items = quote.items || [];
                    const itemsHtml = items.map(item => `
                        <tr>
                            <td class="tb-col">
                                <span class="fw-medium">${escapeHtml(item.description || 'N/A')}</span>
                            </td>
                            <td class="tb-col text-center">
                                <span>${item.quantity || 1}</span>
                            </td>
                            <td class="tb-col text-end">
                                <span class="fw-medium">${formatCurrency(item.price || 0)}</span>
                            </td>
                            <td class="tb-col text-end">
                                <span class="fw-bold">${formatCurrency((item.quantity || 1) * (item.price || 0))}</span>
                            </td>
                        </tr>
                    `).join('');

                    const statusBadge = quote.status === 'accepted' ? 'success' : 
                                       quote.status === 'rejected' ? 'danger' : 
                                       quote.status === 'proposed' ? 'warning' : 'secondary';

                    return `
                        <div class="card card-bordered mb-3">
                            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <em class="icon ni ni-file-docs me-2"></em>Quote #${index + 1}
                                    ${quote.quoteId ? `<span class="text-muted fs-7">(${escapeHtml(quote.quoteId)})</span>` : ''}
                                </h6>
                                <span class="badge badge-${statusBadge} badge-sm">${escapeHtml(quote.status || 'N/A').toUpperCase()}</span>
                            </div>
                            <div class="card-body">
                                ${quote.artisanId ? `
                                    <div class="mb-3 d-flex align-items-center">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin-right: 12px; flex-shrink: 0;">
                                            <img src="${escapeHtml(quote.artisanId.profilePicture || '/public/assets/images/avatar/default.jpg')}" 
                                                 alt="${escapeHtml(quote.artisanId.firstName || 'Artisan')}" 
                                                 style="width: 100%; height: 100%; object-fit: cover;">
                                        </div>
                                        <div>
                                            <div class="fw-medium">${escapeHtml(quote.artisanId.firstName || '')} ${escapeHtml(quote.artisanId.lastName || '')}</div>
                                            <small class="text-muted">Artisan</small>
                                        </div>
                                    </div>
                                ` : ''}

                                ${quote.message ? `
                                    <div class="alert alert-light mb-3">
                                        <strong class="d-block mb-1"><em class="icon ni ni-chat-circle me-1"></em>Message:</strong>
                                        <p class="mb-0 text-muted">${escapeHtml(quote.message)}</p>
                                    </div>
                                ` : ''}

                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Description</th>
                                                <th class="text-center" style="width: 100px;">Quantity</th>
                                                <th class="text-end" style="width: 120px;">Unit Price</th>
                                                <th class="text-end" style="width: 140px;">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHtml || '<tr><td colspan="4" class="text-center text-muted">No items</td></tr>'}
                                        </tbody>
                                        <tfoot class="table-light">
                                            <tr>
                                                <td colspan="3" class="text-end fw-bold">Quote Total:</td>
                                                <td class="text-end fw-bold" style="font-size: 1.1em; color: #1ee0ac;">
                                                    ${formatCurrency(quote.total || 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div class="row mt-3">
                                    ${quote.createdAt ? `
                                        <div class="col-md-6">
                                            <small class="text-muted d-block"><em class="icon ni ni-calendar me-1"></em>Created:</small>
                                            <span>${formatDate(quote.createdAt)}</span>
                                        </div>
                                    ` : ''}
                                    ${quote.updatedAt ? `
                                        <div class="col-md-6">
                                            <small class="text-muted d-block"><em class="icon ni ni-calendar-check me-1"></em>Updated:</small>
                                            <span>${formatDate(quote.updatedAt)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                content.innerHTML = `
                    <div class="mb-3">
                        <div class="alert alert-info d-flex align-items-center">
                            <em class="icon ni ni-info me-2" style="font-size: 20px;"></em>
                            <div>
                                <strong>Booking: ${escapeHtml(booking.bookingId || 'N/A')}</strong>
                                <div class="text-muted">Total Quotes: ${quotes.length}</div>
                            </div>
                        </div>
                    </div>
                    ${quotesHtml}
                    <div class="text-end mt-3">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                    </div>
                `;
            }

            // Show modal
            if (window.bootstrap) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        }

        // Show booking summary modal
        async function showBookingSummary() {
            const modal = document.getElementById('bookingSummaryModal');
            const content = document.getElementById('bookingSummaryContent');
            if (!modal || !content) return;

            // Show modal with loading state
            if (window.bootstrap) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }

            try {
                // Fetch all bookings without pagination to get accurate stats
                const res = await api.get('/admin/bookings', { 
                    params: { page: 1, limit: 10000, includeDetails: true } 
                });
                const data = res.data;

                if (!data || !data.success || !data.data) {
                    throw new Error('Failed to fetch booking data');
                }

                const bookings = data.data;
                const totalBookings = data.pagination?.total || bookings.length;

                // Calculate statistics
                const stats = {
                    total: totalBookings,
                    totalPrice: 0,
                    pending: 0,
                    accepted: 0,
                    inProgress: 0,
                    completed: 0,
                    cancelled: 0,
                    withChats: 0,
                    directHire: 0
                };

                bookings.forEach(booking => {
                    // Total price
                    stats.totalPrice += booking.price || 0;

                    // Status counts
                    switch(booking.status) {
                        case 'pending': stats.pending++; break;
                        case 'accepted': stats.accepted++; break;
                        case 'in-progress': stats.inProgress++; break;
                        case 'completed': stats.completed++; break;
                        case 'cancelled': stats.cancelled++; break;
                    }

                    // Bookings with chats
                    if (booking.quotes && booking.quotes.length > 0) {
                        stats.withChats++;
                    }

                    // Direct hire (no job)
                    if (!booking.job) {
                        stats.directHire++;
                    }
                });

                // Render summary
                content.innerHTML = `
                    <div class="row g-4">
                        <!-- Total Bookings -->
                        <div class="col-md-4">
                            <div class="card card-bordered h-100" style="border-left: 4px solid #6576ff;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="text-muted mb-2">Total Bookings</h6>
                                            <h2 class="mb-0" style="color: #6576ff;">${stats.total.toLocaleString()}</h2>
                                        </div>
                                        <div class="icon-circle" style="width: 50px; height: 50px; background: rgba(101, 118, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <em class="icon ni ni-calendar-booking" style="font-size: 24px; color: #6576ff;"></em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Total Revenue -->
                        <div class="col-md-4">
                            <div class="card card-bordered h-100" style="border-left: 4px solid #1ee0ac;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="text-muted mb-2">Total Revenue</h6>
                                            <h2 class="mb-0" style="color: #1ee0ac;">${formatCurrency(stats.totalPrice)}</h2>
                                        </div>
                                        <div class="icon-circle" style="width: 50px; height: 50px; background: rgba(30, 224, 172, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <em class="icon ni ni-coins" style="font-size: 24px; color: #1ee0ac;"></em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Direct Hire -->
                        <div class="col-md-4">
                            <div class="card card-bordered h-100" style="border-left: 4px solid #816bff;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="text-muted mb-2">Direct Hire Bookings</h6>
                                            <h2 class="mb-0" style="color: #816bff;">${stats.directHire.toLocaleString()}</h2>
                                            <small class="text-muted">${((stats.directHire / stats.total) * 100).toFixed(1)}% of total</small>
                                        </div>
                                        <div class="icon-circle" style="width: 50px; height: 50px; background: rgba(129, 107, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <em class="icon ni ni-user-check" style="font-size: 24px; color: #816bff;"></em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Status Breakdown -->
                        <div class="col-12">
                            <div class="card card-bordered">
                                <div class="card-body">
                                    <h6 class="card-title mb-3"><em class="icon ni ni-activity me-2"></em>Booking Status Breakdown</h6>
                                    <div class="row g-3">
                                        <div class="col-md-2 col-6">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-warning mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.pending}</h4>
                                                <small class="text-muted">Pending</small>
                                            </div>
                                        </div>
                                        <div class="col-md-2 col-6">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-info mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.accepted}</h4>
                                                <small class="text-muted">Accepted</small>
                                            </div>
                                        </div>
                                        <div class="col-md-2 col-6">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-primary mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.inProgress}</h4>
                                                <small class="text-muted">In Progress</small>
                                            </div>
                                        </div>
                                        <div class="col-md-2 col-6">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-success mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.completed}</h4>
                                                <small class="text-muted">Completed</small>
                                            </div>
                                        </div>
                                        <div class="col-md-2 col-6">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-danger mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.cancelled}</h4>
                                                <small class="text-muted">Cancelled</small>
                                            </div>
                                        </div>
                                        <div class="col-md-2 col-6">
                                            <div class="text-center p-3 bg-light rounded">
                                                <div class="badge badge-dot badge-secondary mb-2" style="font-size: 1.2em;">●</div>
                                                <h4 class="mb-0">${stats.total - stats.directHire}</h4>
                                                <small class="text-muted">Job Marketplace</small>
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
                                    <h6 class="card-title mb-3"><em class="icon ni ni-chat-circle me-2"></em>Communication</h6>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-2">
                                        <span>Bookings with Quotes</span>
                                        <strong>${stats.withChats}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                        <span>Bookings without Quotes</span>
                                        <strong>${stats.total - stats.withChats}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card card-bordered h-100">
                                <div class="card-body">
                                    <h6 class="card-title mb-3"><em class="icon ni ni-trend-up me-2"></em>Performance</h6>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-2">
                                        <span>Average Booking Value</span>
                                        <strong>${formatCurrency(stats.total > 0 ? stats.totalPrice / stats.total : 0)}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                        <span>Completion Rate</span>
                                        <strong>${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%</strong>
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
                console.error('Failed to load booking summary:', err);
                content.innerHTML = `
                    <div class="text-center py-5">
                        <em class="icon ni ni-alert-circle" style="font-size: 48px; opacity: 0.3;"></em>
                        <p class="mt-3 text-muted">Failed to load booking summary. Please try again.</p>
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
                    if (!disabled) loadBookings(pageNum, limit, currentFilter, searchQuery);
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
                    loadBookings(i, limit, currentFilter, searchQuery);
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
                    loadBookings(1, PAGE_LIMIT, currentFilter, searchQuery);
                }, 500);
            });
        }

        // Filter functionality
        const filterLinks = document.querySelectorAll('[data-filter]');
        filterLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                currentFilter = this.dataset.filter;
                currentPage = 1;
                loadBookings(1, PAGE_LIMIT, currentFilter, searchQuery);
            });
        });

        // Booking Summary button
        const summaryBtn = document.getElementById('bookingSummaryBtn');
        if (summaryBtn) {
            summaryBtn.addEventListener('click', async function () {
                await showBookingSummary();
            });
        }

        // Initial load
        await loadBookings(1, PAGE_LIMIT);

    } catch (error) {
        console.error('Initialization error:', error);
        if (typeof toast !== 'undefined') toast.error('Failed to initialize bookings page');
    }

})();
