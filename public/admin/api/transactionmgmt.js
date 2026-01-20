import { getApi, toast, getStoredToken } from './config/_helper.js';

let api = null;
const PAGE_LIMIT = 20;
let currentPage = 1;
let currentStatusFilter = '';
let currentDateFrom = '';
let currentDateTo = '';

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
function formatDate(d) {
    if (!d) return 'N/A';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format currency
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '₦0.00';
    return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-dot bg-warning">Pending</span>',
        'holding': '<span class="badge badge-dot bg-info">Holding</span>',
        'released': '<span class="badge badge-dot bg-primary">Released</span>',
        'paid': '<span class="badge badge-dot bg-success">Paid</span>',
        'refunded': '<span class="badge badge-dot bg-danger">Refunded</span>'
    };
    return badges[status] || '<span class="badge badge-dot bg-secondary">Unknown</span>';
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
function showSkeleton(count = 10) {
    ensureSkeletonStyles();
    const tbody = document.getElementById('transaction-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const tr = document.createElement('tr');
        tr.className = 'tb-odr-item skeleton-row';
        tr.innerHTML = `
            <td class="tb-odr-info">
                <span class="skeleton" style="width:100px"></span><br>
                <span class="skeleton" style="width:150px;margin-top:4px"></span>
            </td>
            <td class="tb-odr-amount">
                <span class="skeleton" style="width:80px"></span><br>
                <span class="skeleton" style="width:60px;margin-top:4px"></span>
            </td>
            <td class="tb-odr-action"><span class="skeleton" style="width:80px;height:28px;"></span></td>
        `;
        tbody.appendChild(tr);
    }
}

// Render empty state
function renderEmpty() {
    const tbody = document.getElementById('transaction-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr class="tb-odr-item"><td colspan="3" style="text-align:center; padding:40px;">No transactions found.</td></tr>';
    const paginationEl = document.getElementById('transaction-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
}

// Update stats cards
function updateStatsCards(allItems) {
    // Calculate stats from all items (not just current page)
    const totalTransactions = allItems.length;
    let totalAmount = 0;
    let holdingAmount = 0;
    let paidAmount = 0;

    allItems.forEach(tx => {
        totalAmount += tx.amount || 0;
        if (tx.status === 'holding') {
            holdingAmount += tx.amount || 0;
        } else if (tx.status === 'paid') {
            paidAmount += tx.amount || 0;
        }
    });

    // Update DOM elements
    const totalEl = document.getElementById('total-transactions');
    const totalAmtEl = document.getElementById('total-amount');
    const holdingEl = document.getElementById('holding-amount');
    const paidEl = document.getElementById('paid-amount');

    if (totalEl) totalEl.textContent = totalTransactions;
    if (totalAmtEl) totalAmtEl.textContent = formatCurrency(totalAmount);
    if (holdingEl) holdingEl.textContent = formatCurrency(holdingAmount);
    if (paidEl) paidEl.textContent = formatCurrency(paidAmount);
}

// Load transactions
async function loadTransactions(page = 1, limit = PAGE_LIMIT, statusFilter = '', dateFrom = '', dateTo = '') {
    if (!api) api = await getApi();

    try {
        showSkeleton(limit);
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;

        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (dateFrom) params.startDate = dateFrom;
        if (dateTo) params.endDate = dateTo;

        const res = await api.get('/transactions/', { params, headers });
        console.log('Transactions response:', res.data);

        const body = res && res.data ? res.data : null;
        if (!body) return renderEmpty();

        let items = [];
        if (body.success && Array.isArray(body.data)) {
            items = body.data;
        } else if (Array.isArray(body.data)) {
            items = body.data;
        } else if (Array.isArray(body)) {
            items = body;
        }

        console.log('Total transactions:', items.length);

        // Update stats cards with current filtered items
        updateStatsCards(items);

        if (items.length === 0) {
            return renderEmpty();
        }

        const meta = body.meta || { page: page, limit: limit, total: items.length };

        renderRows(items);
        renderPagination(meta.page || page, meta.limit || limit, meta.total || items.length);
    } catch (err) {
        console.error('Failed to load transactions', err);
        renderEmpty();
        toast.error('Failed to load transactions: ' + (err.response?.data?.message || err.message));
    }
}

// Render transaction rows
function renderRows(items) {
    const tbody = document.getElementById('transaction-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    items.forEach(transaction => {
        const id = transaction._id || transaction.id || '';
        const tr = document.createElement('tr');
        tr.className = 'tb-odr-item';
        tr.dataset.id = id;

        // Transaction Info Column
        const infoTd = document.createElement('td');
        infoTd.className = 'tb-odr-info';

        const idSpan = document.createElement('span');
        idSpan.className = 'tb-odr-id';
        const idLink = document.createElement('a');
        idLink.href = '#';
        idLink.textContent = '#' + id.substring(0, 8).toUpperCase();
        idLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTransactionDetail(id, transaction);
        });
        idSpan.appendChild(idLink);

        const dateSpan = document.createElement('span');
        dateSpan.className = 'tb-odr-date';
        dateSpan.textContent = formatDate(transaction.createdAt);

        // Payer and Payee info
        const payerName = transaction.payerId?.name || 'Unknown';
        const payeeName = transaction.payeeId?.name || 'Not Assigned';
        const participantsDiv = document.createElement('div');
        participantsDiv.className = 'tb-odr-date text-muted';
        participantsDiv.style.fontSize = '0.85rem';
        
        // Show different format if payee exists
        if (transaction.payeeId) {
            participantsDiv.innerHTML = `${escapeHtml(payerName)} → ${escapeHtml(payeeName)}`;
        } else {
            participantsDiv.innerHTML = `${escapeHtml(payerName)} <span class="text-soft">(No artisan assigned)</span>`;
        }

        infoTd.appendChild(idSpan);
        infoTd.appendChild(dateSpan);
        infoTd.appendChild(participantsDiv);

        // Amount Column
        const amountTd = document.createElement('td');
        amountTd.className = 'tb-odr-amount';

        const totalSpan = document.createElement('span');
        totalSpan.className = 'tb-odr-total';
        const amountSpan = document.createElement('span');
        amountSpan.className = 'amount';
        amountSpan.textContent = formatCurrency(transaction.amount);
        totalSpan.appendChild(amountSpan);

        const statusSpan = document.createElement('span');
        statusSpan.className = 'tb-odr-status d-none d-md-inline-block';
        statusSpan.innerHTML = getStatusBadge(transaction.status);

        // Company fee display
        if (transaction.companyFee) {
            const feeDiv = document.createElement('div');
            feeDiv.className = 'text-muted';
            feeDiv.style.fontSize = '0.85rem';
            feeDiv.textContent = `Fee: ${formatCurrency(transaction.companyFee)}`;
            amountTd.appendChild(totalSpan);
            amountTd.appendChild(statusSpan);
            amountTd.appendChild(feeDiv);
        } else {
            amountTd.appendChild(totalSpan);
            amountTd.appendChild(statusSpan);
        }

        // Action Column
        const actionTd = document.createElement('td');
        actionTd.className = 'tb-odr-action';

        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'tb-odr-btns d-none d-sm-inline';

        const viewBtn = document.createElement('a');
        viewBtn.href = '#';
        viewBtn.className = 'btn btn-dim btn-sm btn-primary';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showTransactionDetail(id, transaction);
        });

        btnsDiv.appendChild(viewBtn);
        actionTd.appendChild(btnsDiv);

        // Mobile view button
        const mobileBtn = document.createElement('a');
        mobileBtn.href = '#';
        mobileBtn.className = 'btn btn-pd-auto d-sm-none';
        mobileBtn.innerHTML = '<em class="icon ni ni-chevron-right"></em>';
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showTransactionDetail(id, transaction);
        });
        actionTd.appendChild(mobileBtn);

        tr.appendChild(infoTd);
        tr.appendChild(amountTd);
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
    });
}

// Show transaction detail modal
async function showTransactionDetail(transactionId, transactionData = null) {
    try {
        let transaction;

        if (transactionData) {
            transaction = transactionData;
        } else {
            const headers = {};
            const token = getStoredToken();
            if (token) headers.Authorization = 'Bearer ' + token;

            const res = await api.get('/transactions/' + encodeURIComponent(transactionId), { headers });
            transaction = (res.data?.success && res.data?.data) ? res.data.data : (res.data?.data || res.data);
        }

        console.log('Transaction detail:', transaction);

        // Build modal content
        const modal = document.getElementById('transactionDetailModal');
        const contentEl = document.getElementById('transaction-detail-content');
        if (!contentEl) return;

        const payerName = transaction.payerId?.name || 'Unknown';
        const payerEmail = transaction.payerId?.email || 'N/A';
        const payeeName = transaction.payeeId?.name || 'Not Assigned';
        const payeeEmail = transaction.payeeId?.email || 'N/A';
        const bookingId = transaction.bookingId?._id || transaction.bookingId || 'N/A';
        const bookingStatus = transaction.bookingId?.status || 'N/A';
        const serviceDate = transaction.bookingId?.serviceDate || null;
        const quoteId = transaction.quoteId || null;

        contentEl.innerHTML = `
            <div class="row g-3">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5>Transaction #${escapeHtml(transaction._id || '').substring(0, 12).toUpperCase()}</h5>
                        ${getStatusBadge(transaction.status)}
                    </div>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Amount</label>
                    <h4 class="text-primary">${formatCurrency(transaction.amount)}</h4>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Company Fee</label>
                    <h4>${formatCurrency(transaction.companyFee || 0)}</h4>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Payer</label>
                    <p class="mb-0"><strong>${escapeHtml(payerName)}</strong><br><small>${escapeHtml(payerEmail)}</small></p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Payee (Artisan)</label>
                    <p class="mb-0">
                        <strong>${escapeHtml(payeeName)}</strong>
                        ${transaction.payeeId ? `<br><small>${escapeHtml(payeeEmail)}</small>` : '<br><small class="text-soft">No artisan assigned yet</small>'}
                    </p>
                </div>
                ${bookingId !== 'N/A' ? `
                <div class="col-md-6">
                    <label class="form-label text-muted">Booking ID</label>
                    <p>${escapeHtml(String(bookingId).substring(0, 12).toUpperCase())}<br>
                    <small class="text-muted">Status: ${escapeHtml(bookingStatus)}</small></p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Service Date</label>
                    <p>${serviceDate ? formatDate(serviceDate) : 'N/A'}</p>
                </div>
                ` : ''}
                ${quoteId ? `
                <div class="col-md-6">
                    <label class="form-label text-muted">Quote ID</label>
                    <p>${escapeHtml(String(quoteId).substring(0, 12).toUpperCase())}</p>
                </div>
                ` : ''}
                <div class="col-md-6">
                    <label class="form-label text-muted">Payment Gateway Ref</label>
                    <p>${escapeHtml(transaction.paymentGatewayRef || 'N/A')}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Refund Status</label>
                    <p>${escapeHtml(transaction.refundStatus || 'none')}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Transfer Status</label>
                    <p>${escapeHtml(transaction.transferStatus || 'none')}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">Created At</label>
                    <p>${formatDate(transaction.createdAt)}</p>
                </div>
                ${transaction.releasedAt ? `
                <div class="col-md-6">
                    <label class="form-label text-muted">Released At</label>
                    <p>${formatDate(transaction.releasedAt)}</p>
                </div>
                ` : ''}
            </div>
        `;

        // Show modal using Bootstrap
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } catch (err) {
        console.error('Failed to load transaction detail', err);
        toast.error('Failed to load transaction detail');
    }
}

// Render pagination
function renderPagination(page, limit, total) {
    const paginationEl = document.getElementById('transaction-pagination');
    if (!paginationEl) return;

    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let html = '<ul class="pagination justify-content-center justify-content-md-start">';

    // Previous button
    if (page > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${page - 1}">Prev</a></li>`;
    }

    // Page numbers
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

    // Next button
    if (page < totalPages) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">Next</a></li>`;
    }

    html += '</ul>';
    paginationEl.innerHTML = html;

    // Attach click handlers
    paginationEl.querySelectorAll('a[data-page]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const pg = parseInt(a.dataset.page);
            currentPage = pg;
            loadTransactions(pg, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo);
        });
    });
}

// Initialize
(async () => {
    try {
        api = await getApi();
        const token = getStoredToken();
        if (token) {
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }

        // Status filter functionality
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                currentStatusFilter = e.target.value;
                currentPage = 1;
                loadTransactions(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo);
            });

            // For Select2 compatibility
            if (window.jQuery && jQuery(statusFilter).hasClass('js-select2')) {
                jQuery(statusFilter).on('change', function() {
                    currentStatusFilter = this.value;
                    currentPage = 1;
                    loadTransactions(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo);
                });
            }
        }

        // Date filter functionality
        const dateFromInput = document.getElementById('date-from');
        const dateToInput = document.getElementById('date-to');
        const clearDateBtn = document.getElementById('clear-date-filter');

        if (dateFromInput) {
            dateFromInput.addEventListener('change', (e) => {
                currentDateFrom = e.target.value;
                currentPage = 1;
                loadTransactions(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo);
            });
        }

        if (dateToInput) {
            dateToInput.addEventListener('change', (e) => {
                currentDateTo = e.target.value;
                currentPage = 1;
                loadTransactions(1, PAGE_LIMIT, currentStatusFilter, currentDateFrom, currentDateTo);
            });
        }

        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', () => {
                currentDateFrom = '';
                currentDateTo = '';
                if (dateFromInput) dateFromInput.value = '';
                if (dateToInput) dateToInput.value = '';
                currentPage = 1;
                loadTransactions(1, PAGE_LIMIT, currentStatusFilter, '', '');
            });
        }

        // Initial load
        await loadTransactions(1, PAGE_LIMIT, '', '', '');
    } catch (err) {
        console.error('Initialization failed', err);
        toast.error('Failed to initialize');
    }
})();
