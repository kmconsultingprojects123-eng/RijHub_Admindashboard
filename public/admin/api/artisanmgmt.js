import { getApi, toast, getStoredToken } from './config/_helper.js';

let api = null;
const PAGE_LIMIT = 10;
let currentPage = 1;
let currentSearchQuery = '';
let currentVerificationFilter = ''; // '', 'verified', 'unverified'
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
function formatDateShort(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get verification badge
function getVerificationBadge(verified) {
    if (verified) {
        return '<span class="badge badge-dim bg-success"><em class="icon ni ni-check-circle"></em> Verified</span>';
    }
    return '<span class="badge badge-dim bg-warning"><em class="icon ni ni-alert-circle"></em> Pending</span>';
}

// Get rating stars
function getRatingStars(rating) {
    if (!rating && rating !== 0) return '<span class="text-muted">No ratings</span>';
    const stars = Math.round(rating);
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < stars) {
            html += '<em class="icon ni ni-star-fill text-warning"></em>';
        } else {
            html += '<em class="icon ni ni-star text-muted"></em>';
        }
    }
    html += ` <span class="text-muted">(${rating.toFixed(1)})</span>`;
    return html;
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
    const tbody = document.getElementById('artisan-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const tr = document.createElement('tr');
        tr.className = 'nk-tb-item skeleton-row';
        tr.innerHTML = `
            <td class="nk-tb-col"><span class="skeleton" style="width:60%"></span></td>
            <td class="nk-tb-col tb-col-md"><span class="skeleton" style="width:80%"></span></td>
            <td class="nk-tb-col tb-col-lg"><span class="skeleton" style="width:50%"></span></td>
            <td class="nk-tb-col tb-col-md"><span class="skeleton" style="width:60px;height:20px;"></span></td>
            <td class="nk-tb-col tb-col-md"><span class="skeleton" style="width:70px;height:20px;"></span></td>
            <td class="nk-tb-col nk-tb-col-tools text-end"><span class="skeleton" style="width:80px;height:28px;"></span></td>
        `;
        tbody.appendChild(tr);
    }
}

// Render empty state
function renderEmpty() {
    const tbody = document.getElementById('artisan-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr class="nk-tb-item"><td class="nk-tb-col" colspan="6" style="text-align:center; padding:40px;">No artisans found.</td></tr>';
    const paginationEl = document.getElementById('artisan-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
}

// Update stats cards
function updateStatsCards(items) {
    const totalArtisans = items.length;
    let verifiedCount = 0;
    let unverifiedCount = 0;

    items.forEach(artisan => {
        const isVerified = !!(artisan.verified || artisan.user?.kycVerified);
        if (isVerified) {
            verifiedCount++;
        } else {
            unverifiedCount++;
        }
    });

    // Update DOM elements
    const totalEl = document.getElementById('total-artisans');
    const verifiedEl = document.getElementById('verified-artisans');
    const unverifiedEl = document.getElementById('unverified-artisans');

    if (totalEl) totalEl.textContent = totalArtisans;
    if (verifiedEl) verifiedEl.textContent = verifiedCount;
    if (unverifiedEl) unverifiedEl.textContent = unverifiedCount;
}

// Load artisans
async function loadArtisans(page = 1, limit = PAGE_LIMIT, q = '', verificationFilter = '', dateFrom = '', dateTo = '') {
    if (!api) api = await getApi();

    try {
        showSkeleton(limit);
        const headers = {};
        const token = getStoredToken();
        if (token) headers.Authorization = 'Bearer ' + token;

        const params = { page, limit };
        if (q) params.q = q;
        // Try server-side filtering first
        if (verificationFilter === 'verified') {
            params.verified = true;
        } else if (verificationFilter === 'unverified') {
            params.verified = false;
        }

        const res = await api.get('/artisans', { params, headers });
        //console.log('Artisans response:', res.data);
        //console.log('Verification filter:', verificationFilter);

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

        //console.log('Total items before filtering:', items.length);

        // Client-side search filtering (by name or skills) - intelligent search
        if (q) {
            // Normalize search query: remove spaces, hyphens, special chars, lowercase
            const normalizeText = (text) => {
                return text.toLowerCase()
                    .replace(/[\s\-_.,;:!?'"]/g, '')  // Remove spaces and common punctuation
                    .replace(/[^\w]/g, '');            // Remove any remaining non-word characters
            };
            
            const searchNormalized = normalizeText(q);
            
            items = items.filter(artisan => {
                const userName = artisan.user?.name || artisan.artisanAuthDetails?.name || '';
                const userEmail = artisan.user?.email || artisan.artisanAuthDetails?.email || '';
                const skills = artisan.trade || [];
                const skillsText = Array.isArray(skills) ? skills.join(' ') : '';
                
                // Normalize all searchable fields
                const userNameNormalized = normalizeText(userName);
                const userEmailNormalized = normalizeText(userEmail);
                const skillsNormalized = normalizeText(skillsText);
                
                return userNameNormalized.includes(searchNormalized) || 
                       userEmailNormalized.includes(searchNormalized) || 
                       skillsNormalized.includes(searchNormalized);
            });
        }

        // Client-side verification filtering
        if (verificationFilter) {
            items = items.filter(artisan => {
                const isVerified = !!(artisan.verified || artisan.user?.kycVerified);
                //console.log('Artisan:', artisan.user?.name || 'Unknown', 'Verified:', isVerified);
                
                if (verificationFilter === 'verified') {
                    return isVerified === true;
                } else if (verificationFilter === 'unverified') {
                    return isVerified === false;
                }
                return true;
            });
        }

        // Client-side date filtering
        if (dateFrom || dateTo) {
            items = items.filter(artisan => {
                const artisanDate = artisan.createdAt || artisan.user?.createdAt || artisan.joinedAt;
                if (!artisanDate) return false;
                
                const date = new Date(artisanDate);
                const fromDate = dateFrom ? new Date(dateFrom) : null;
                const toDate = dateTo ? new Date(dateTo) : null;
                
                // Set time to start/end of day for accurate comparison
                if (fromDate) fromDate.setHours(0, 0, 0, 0);
                if (toDate) toDate.setHours(23, 59, 59, 999);
                
                if (fromDate && toDate) {
                    return date >= fromDate && date <= toDate;
                } else if (fromDate) {
                    return date >= fromDate;
                } else if (toDate) {
                    return date <= toDate;
                }
                return true;
            });
        }

        //console.log('Total items after filtering:', items.length);

        // Update stats cards with all items (before pagination)
        updateStatsCards(items);

        if (items.length === 0) {
            return renderEmpty();
        }

        const meta = body.meta || body.pagination || { page: page, limit: limit, total: items.length };

        // If no meta, try from headers
        if (!meta.total) {
            const totalHeader = res.headers['x-total-count'] || res.headers['X-Total-Count'];
            if (totalHeader) {
                meta.total = parseInt(totalHeader);
                meta.totalPages = Math.ceil(meta.total / limit);
            }
        }

        renderRows(items);
        renderPagination(meta.page || page, meta.limit || limit, meta.total || items.length);
    } catch (err) {
        console.error('Failed to load artisans', err);
        toast.error('Failed to load artisans');
        renderEmpty();
    }
}

// Render artisan rows
function renderRows(items) {
    const tbody = document.getElementById('artisan-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    items.forEach(artisan => {
        const id = artisan._id || artisan.id || '';
        const tr = document.createElement('tr');
        tr.className = 'nk-tb-item';
        tr.dataset.id = id;

        // Artisan name/avatar
        const nameTd = document.createElement('td');
        nameTd.className = 'nk-tb-col';
        const userCard = document.createElement('div');
        userCard.className = 'user-card';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar sm bg-primary';
        const userName = artisan.user?.name || artisan.artisanAuthDetails?.name || '';
        const userEmail = artisan.user?.email || artisan.artisanAuthDetails?.email || '';
        const initials = (userName || userEmail || 'A').substring(0, 2).toUpperCase();
        avatar.innerHTML = `<span>${escapeHtml(initials)}</span>`;

        const userNameDiv = document.createElement('div');
        userNameDiv.className = 'user-info';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'tb-lead';
        nameSpan.textContent = userName || userEmail || 'Unknown';
        const emailDiv = document.createElement('div');
        emailDiv.className = 'sub-text';
        emailDiv.textContent = userEmail || '';
        userNameDiv.appendChild(nameSpan);
        userNameDiv.appendChild(emailDiv);

        userCard.appendChild(avatar);
        userCard.appendChild(userNameDiv);
        nameTd.appendChild(userCard);

        // Skills (using trade field)
        const skillsTd = document.createElement('td');
        skillsTd.className = 'nk-tb-col tb-col-md';
        const skills = artisan.trade || [];
        if (Array.isArray(skills) && skills.length > 0) {
            const skillsText = skills.slice(0, 3).join(', ');
            skillsTd.innerHTML = `<span class="tb-sub">${escapeHtml(skillsText)}${skills.length > 3 ? ` +${skills.length - 3}` : ''}</span>`;
        } else {
            skillsTd.innerHTML = '<span class="text-muted">No trade listed</span>';
        }

        // Location
        const locationTd = document.createElement('td');
        locationTd.className = 'nk-tb-col tb-col-lg';
        const location = artisan.serviceArea?.address || '';
        locationTd.innerHTML = location ? `<span class="tb-sub">${escapeHtml(location)}</span>` : '<span class="text-muted">Not set</span>';

        // Rating
        const ratingTd = document.createElement('td');
        ratingTd.className = 'nk-tb-col tb-col-md';
        const rating = artisan.rating || artisan.reviewsSummary?.avgRating || 0;
        ratingTd.innerHTML = getRatingStars(rating);

        // Verification
        const verificationTd = document.createElement('td');
        verificationTd.className = 'nk-tb-col tb-col-md';
        const verified = artisan.verified || artisan.user?.kycVerified || false;
        verificationTd.innerHTML = getVerificationBadge(verified);

        // Actions
        const actionsTd = document.createElement('td');
        actionsTd.className = 'nk-tb-col nk-tb-col-tools text-end';
        const ul = document.createElement('ul');
        ul.className = 'nk-tb-actions gx-1';
        ul.style.justifyContent = 'flex-end';
        ul.style.display = 'flex';

        // View profile button
        const liView = document.createElement('li');
        const aView = document.createElement('a');
        aView.href = '#';
        aView.className = 'btn btn-sm btn-icon btn-trigger';
        aView.title = 'View Profile';
        aView.innerHTML = '<em class="icon ni ni-eye"></em>';
        liView.appendChild(aView);

        ul.appendChild(liView);
        actionsTd.appendChild(ul);

        tr.appendChild(nameTd);
        tr.appendChild(skillsTd);
        tr.appendChild(locationTd);
        tr.appendChild(ratingTd);
        tr.appendChild(verificationTd);
        tr.appendChild(actionsTd);

        tbody.appendChild(tr);

        // View handler
        aView.addEventListener('click', async (ev) => {
            ev.preventDefault();
            await showArtisanProfile(id, artisan);
        });
    });
}

// Show artisan profile modal

async function showArtisanProfile(artisanId, artisanData = null) {
    try {
        let artisan;

        if (artisanData) {
            artisan = artisanData;
        } else {
            const headers = {};
            const token = getStoredToken();
            if (token) headers.Authorization = 'Bearer ' + token;

            const res = await api.get('/users/' + encodeURIComponent(artisanId), { headers });
            artisan = (res.data?.success && res.data?.data) ? res.data.data : (res.data?.data || res.data);
        }

        //console.log('Artisan profile:', artisan);

        const contentEl = document.getElementById('artisan-review-content');
        if (!contentEl) return;

        const userName = artisan.user?.name || artisan.artisanAuthDetails?.name || 'Unknown';
        const userEmail = artisan.user?.email || artisan.artisanAuthDetails?.email || '';
        const userPhone = artisan.user?.phone || artisan.artisanAuthDetails?.phone || '';
        const skills = artisan.trade || [];
        const portfolio = artisan.portfolio || [];
        const certifications = artisan.certifications || [];
        const bio = artisan.bio || 'No bio provided';
        const location = artisan.serviceArea?.address || 'Not specified';
        const experience = artisan.experience || 0;
        const rating = artisan.rating || artisan.reviewsSummary?.avgRating || 0;
        const verified = artisan.verified || artisan.user?.kycVerified || false;
        const kycDetails = artisan.kycDetails || null;
        const bookingsStats = artisan.bookingsStats || { total: 0, completed: 0 };
        const pricing = artisan.pricing || null;
        const rankLevel = artisan.rankLevel || 'Bronze';
        const joinedDate = artisan.createdAt || artisan.user?.createdAt || artisan.joinedAt || null;
        const availability = artisan.availability || [];
        const analytics = artisan.analytics || { views: 0, leads: 0 };
        const responseRate = artisan.responseRate || 0;
        const completionRate = artisan.completionRate || 0;

        const carouselId = 'portfolio-carousel-' + artisanId;
        const totalSteps = (Array.isArray(certifications) && certifications.length > 0) ? 5 : 4;

        let html = `
            <style>
                .artisan-profile-wrapper {
                    background: linear-gradient(135deg, rgba(162,0,37,0.03) 0%, rgba(214,92,116,0.03) 100%);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    min-height: 600px;
                }
                
                .wizard-steps {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    position: relative;
                    padding: 0 1rem;
                }
                
                .wizard-steps::before {
                    content: '';
                    position: absolute;
                    top: 24px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: rgba(162,0,37,0.1);
                    z-index: 0;
                }
                
                .wizard-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    position: relative;
                    z-index: 1;
                    flex: 1;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .step-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid rgba(162,0,37,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    color: #64748b;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                
                .wizard-step.active .step-circle {
                    background: linear-gradient(135deg, #a20025 0%, #d65c74 100%);
                    border-color: transparent;
                    color: white;
                    transform: scale(1.1);
                    box-shadow: 0 4px 16px rgba(162,0,37,0.3);
                }
                
                .wizard-step.completed .step-circle {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-color: transparent;
                    color: white;
                }
                
                .step-label {
                    font-size: 0.813rem;
                    font-weight: 600;
                    color: #64748b;
                    text-align: center;
                    white-space: nowrap;
                    transition: all 0.3s ease;
                }
                
                .wizard-step.active .step-label {
                    color: #a20025;
                    font-weight: 700;
                }
                
                .wizard-step.completed .step-label {
                    color: #10b981;
                }
                
                .wizard-content {
                    position: relative;
                    min-height: 400px;
                }
                
                .wizard-step-content {
                    display: none;
                    animation: fadeIn 0.4s ease;
                }
                
                .wizard-step-content.active {
                    display: block;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .wizard-navigation {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid rgba(162,0,37,0.1);
                    gap: 1rem;
                }
                
                .wizard-nav-btn {
                    padding: 0.875rem 2rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.938rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .wizard-nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                
                .wizard-nav-btn.btn-prev {
                    background: white;
                    color: #64748b;
                    border: 2px solid rgba(162,0,37,0.2);
                }
                
                .wizard-nav-btn.btn-prev:hover:not(:disabled) {
                    background: rgba(162,0,37,0.05);
                    border-color: #a20025;
                    color: #a20025;
                    transform: translateX(-4px);
                }
                
                .wizard-nav-btn.btn-next {
                    background: linear-gradient(135deg, #a20025 0%, #d65c74 100%);
                    color: white;
                    box-shadow: 0 4px 16px rgba(162,0,37,0.2);
                }
                
                .wizard-nav-btn.btn-next:hover:not(:disabled) {
                    transform: translateX(4px);
                    box-shadow: 0 6px 20px rgba(162,0,37,0.3);
                }
                
                .wizard-step-indicator {
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 600;
                }
                
                .artisan-profile-header {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    padding: 2.5rem;
                    border-radius: 1rem;
                    color: white;
                    margin-bottom: 2rem;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    position: relative;
                    overflow: hidden;
                }
                
                .artisan-profile-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(162,0,37,0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                
                .artisan-profile-header .user-avatar {
                    width: 90px;
                    height: 90px;
                    font-size: 2.25rem;
                    background: linear-gradient(135deg, #a20025 0%, #d65c74 100%) !important;
                    border: 4px solid rgba(255,255,255,0.2);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    position: relative;
                    z-index: 1;
                }
                
                .profile-header-content {
                    position: relative;
                    z-index: 1;
                }
                
                .profile-name {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    letter-spacing: -0.5px;
                }
                
                .profile-contact {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.9rem;
                    backdrop-filter: blur(10px);
                }
                
                .profile-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    align-items: flex-end;
                }
                
                .action-btn-wrapper {
                    margin-top: 1rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid rgba(162,0,37,0.1);
                }
                
                .action-btn {
                    width: 100%;
                    padding: 1rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-size: 1rem;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .action-btn-verify {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                }
                
                .action-btn-verify:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(16,185,129,0.4);
                }
                
                .action-btn-unverify {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                }
                
                .action-btn-unverify:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(239,68,68,0.4);
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .stat-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem 1.25rem;
                    text-align: center;
                    border: 1px solid rgba(162,0,37,0.1);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #a20025 0%, #d65c74 100%);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(162,0,37,0.12);
                    border-color: rgba(162,0,37,0.2);
                }
                
                .stat-card:hover::before {
                    transform: scaleX(1);
                }
                
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 0.75rem;
                    background: linear-gradient(135deg, rgba(162,0,37,0.1) 0%, rgba(214,92,116,0.1) 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: #a20025;
                }
                
                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0.5rem 0 0.25rem;
                    line-height: 1;
                }
                
                .stat-label {
                    font-size: 0.813rem;
                    color: #64748b;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin: 0;
                }
                
                .content-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.75rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(162,0,37,0.08);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                }
                
                .content-card:hover {
                    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                }
                
                .section-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 2px solid rgba(162,0,37,0.1);
                }
                
                .section-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #a20025 0%, #d65c74 100%);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1rem;
                }
                
                .info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 0.75rem 0;
                }
                
                .info-row:not(:last-child) {
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .info-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, rgba(162,0,37,0.08) 0%, rgba(214,92,116,0.08) 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #a20025;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
                
                .info-content {
                    flex: 1;
                }
                
                .info-label {
                    font-size: 0.813rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.25rem;
                }
                
                .info-value {
                    font-size: 1rem;
                    color: #1a1a1a;
                    font-weight: 500;
                    line-height: 1.5;
                }
                
                .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .pricing-card {
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                    border: 2px solid rgba(162,0,37,0.1);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .pricing-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(162,0,37,0.05) 0%, transparent 70%);
                }
                
                .pricing-card:hover {
                    transform: translateY(-4px);
                    border-color: #a20025;
                    box-shadow: 0 8px 24px rgba(162,0,37,0.12);
                }
                
                .pricing-icon {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #a20025 0%, #d65c74 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }
                
                .pricing-label {
                    font-size: 0.813rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.5rem;
                }
                
                .pricing-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }
                
                .skill-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, rgba(162,0,37,0.1) 0%, rgba(214,92,116,0.05) 100%);
                    color: #a20025;
                    border: 1px solid rgba(162,0,37,0.2);
                    border-radius: 2rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin: 0.25rem;
                    transition: all 0.3s ease;
                }
                
                .skill-badge:hover {
                    background: linear-gradient(135deg, #a20025 0%, #d65c74 100%);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(162,0,37,0.2);
                }
                
                .cert-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: white;
                    color: #a20025;
                    border: 2px solid rgba(162,0,37,0.2);
                    border-radius: 2rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin: 0.25rem;
                    transition: all 0.3s ease;
                }
                
                .cert-badge:hover {
                    background: linear-gradient(135deg, #d65c74 0%, #a20025 100%);
                    color: white;
                    border-color: transparent;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(214,92,116,0.3);
                }
                
                .portfolio-item {
                    background: white;
                    border: 1px solid rgba(162,0,37,0.08);
                    border-radius: 1rem;
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                }
                
                .portfolio-item:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    transform: translateY(-4px);
                }
                
                .portfolio-header {
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                    border-bottom: 1px solid rgba(162,0,37,0.08);
                }
                
                .portfolio-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                }
                
                .portfolio-description {
                    font-size: 0.938rem;
                    color: #64748b;
                    line-height: 1.6;
                    margin: 0;
                }
                
                .portfolio-carousel {
                    position: relative;
                }
                
                .portfolio-carousel .carousel-item img {
                    width: 100%;
                    height: 350px;
                    object-fit: cover;
                }
                
                .portfolio-carousel .carousel-control-prev,
                .portfolio-carousel .carousel-control-next {
                    width: 48px;
                    height: 48px;
                    background: rgba(26,26,26,0.8);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                
                .portfolio-item:hover .carousel-control-prev,
                .portfolio-item:hover .carousel-control-next {
                    opacity: 1;
                }
                
                .portfolio-carousel .carousel-control-prev:hover,
                .portfolio-carousel .carousel-control-next:hover {
                    background: #a20025;
                    transform: translateY(-50%) scale(1.1);
                }
                
                .portfolio-carousel .carousel-indicators {
                    margin-bottom: 1rem;
                }
                
                .portfolio-carousel .carousel-indicators button {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: rgba(255,255,255,0.5);
                    border: none;
                    margin: 0 4px;
                }
                
                .portfolio-carousel .carousel-indicators button.active {
                    background-color: #a20025;
                    width: 24px;
                    border-radius: 4px;
                }
                
                .kyc-card {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    border-radius: 1rem;
                    padding: 2rem;
                    color: white;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    position: relative;
                    overflow: hidden;
                }
                
                .kyc-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -25%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(162,0,37,0.2) 0%, transparent 70%);
                    pointer-events: none;
                }
                
                .kyc-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    position: relative;
                    z-index: 1;
                }
                
                .kyc-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                    padding: 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .kyc-icon {
                    width: 44px;
                    height: 44px;
                    background: rgba(162,0,37,0.3);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }
                
                .kyc-content {
                    flex: 1;
                }
                
                .kyc-label {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.25rem;
                }
                
                .kyc-value {
                    font-size: 1rem;
                    color: white;
                    font-weight: 600;
                }
                
                .badge-verified {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 2px 8px rgba(16,185,129,0.2);
                }
                
                .badge-pending {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 2px 8px rgba(245,158,11,0.2);
                }
                
                .badge-rank {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    box-shadow: 0 2px 8px rgba(59,130,246,0.2);
                }
                
                @media (max-width: 992px) {
                    .artisan-profile-wrapper {
                        padding: 1rem;
                    }
                    
                    .wizard-steps {
                        padding: 0 0.5rem;
                        margin-bottom: 2rem;
                    }
                    
                    .step-circle {
                        width: 40px;
                        height: 40px;
                        font-size: 1rem;
                    }
                    
                    .step-label {
                        font-size: 0.75rem;
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .artisan-profile-header {
                        padding: 1.5rem;
                    }
                    
                    .artisan-profile-header .user-avatar {
                        width: 70px;
                        height: 70px;
                        font-size: 1.75rem;
                    }
                    
                    .profile-name {
                        font-size: 1.5rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .artisan-profile-wrapper {
                        padding: 0.75rem;
                        min-height: auto;
                    }
                    
                    .wizard-steps {
                        padding: 0;
                        margin-bottom: 1.5rem;
                        overflow-x: auto;
                        justify-content: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .wizard-steps::before {
                        display: none;
                    }
                    
                    .wizard-step {
                        flex: 0 0 auto;
                        min-width: 60px;
                    }
                    
                    .step-circle {
                        width: 36px;
                        height: 36px;
                        font-size: 0.9rem;
                    }
                    
                    .step-label {
                        font-size: 0.65rem;
                        white-space: normal;
                        line-height: 1.2;
                        max-width: 60px;
                    }
                    
                    .artisan-profile-header {
                        padding: 1.25rem;
                    }
                    
                    .artisan-profile-header .user-avatar {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }
                    
                    .profile-name {
                        font-size: 1.25rem;
                    }
                    
                    .profile-contact {
                        flex-direction: column;
                        gap: 0.5rem;
                        margin-top: 0.75rem;
                    }
                    
                    .contact-item {
                        font-size: 0.813rem;
                        padding: 0.4rem 0.75rem;
                    }
                    
                    .profile-actions {
                        margin-top: 1rem;
                        width: 100%;
                    }
                    
                    .profile-actions .d-flex {
                        flex-direction: column;
                        width: 100%;
                        gap: 0.5rem;
                    }
                    
                    .badge-verified, .badge-pending, .badge-rank {
                        font-size: 0.75rem;
                        padding: 0.4rem 0.75rem;
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }
                    
                    .stat-card {
                        padding: 1rem 0.75rem;
                    }
                    
                    .stat-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 1.25rem;
                        margin-bottom: 0.5rem;
                    }
                    
                    .stat-value {
                        font-size: 1.5rem;
                    }
                    
                    .stat-label {
                        font-size: 0.75rem;
                    }
                    
                    .pricing-grid {
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                    }
                    
                    .pricing-card {
                        padding: 1.25rem;
                    }
                    
                    .content-card {
                        padding: 1.25rem;
                        margin-bottom: 1rem;
                    }
                    
                    .section-title {
                        font-size: 1rem;
                        margin-bottom: 1rem;
                    }
                    
                    .section-icon {
                        width: 28px;
                        height: 28px;
                        font-size: 0.9rem;
                    }
                    
                    .info-row {
                        padding: 0.5rem 0;
                    }
                    
                    .info-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 1rem;
                    }
                    
                    .info-label {
                        font-size: 0.75rem;
                    }
                    
                    .info-value {
                        font-size: 0.938rem;
                    }
                    
                    .portfolio-item {
                        margin-bottom: 1rem;
                    }
                    
                    .portfolio-header {
                        padding: 1rem;
                    }
                    
                    .portfolio-title {
                        font-size: 1rem;
                    }
                    
                    .portfolio-description {
                        font-size: 0.875rem;
                    }
                    
                    .portfolio-carousel .carousel-item img {
                        height: 250px;
                    }
                    
                    .portfolio-carousel .carousel-control-prev,
                    .portfolio-carousel .carousel-control-next {
                        width: 40px;
                        height: 40px;
                    }
                    
                    .skill-badge, .cert-badge {
                        font-size: 0.813rem;
                        padding: 0.4rem 0.75rem;
                    }
                    
                    .kyc-card {
                        padding: 1.25rem;
                    }
                    
                    .kyc-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .kyc-item {
                        padding: 0.75rem;
                    }
                    
                    .kyc-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 1rem;
                    }
                    
                    .wizard-navigation {
                        margin-top: 1.5rem;
                        padding-top: 1rem;
                        flex-wrap: wrap;
                        gap: 0.75rem;
                    }
                    
                    .wizard-nav-btn {
                        padding: 0.75rem 1.5rem;
                        font-size: 0.875rem;
                        flex: 1;
                        min-width: 120px;
                    }
                    
                    .wizard-step-indicator {
                        width: 100%;
                        text-align: center;
                        order: -1;
                        margin-bottom: 0.5rem;
                        font-size: 0.813rem;
                    }
                    
                    .action-btn {
                        padding: 0.875rem 1.25rem;
                        font-size: 0.938rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .artisan-profile-wrapper {
                        padding: 0.5rem;
                    }
                    
                    .wizard-steps {
                        margin-bottom: 1rem;
                    }
                    
                    .step-circle {
                        width: 32px;
                        height: 32px;
                        font-size: 0.813rem;
                    }
                    
                    .step-label {
                        font-size: 0.6rem;
                    }
                    
                    .artisan-profile-header {
                        padding: 1rem;
                    }
                    
                    .artisan-profile-header .d-flex {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .artisan-profile-header .user-avatar {
                        width: 50px;
                        height: 50px;
                        font-size: 1.25rem;
                        margin: 0 auto 0.75rem;
                    }
                    
                    .profile-name {
                        font-size: 1.125rem;
                        text-align: center;
                    }
                    
                    .contact-item {
                        font-size: 0.75rem;
                        padding: 0.35rem 0.6rem;
                    }
                    
                    .stats-grid {
                        gap: 0.5rem;
                    }
                    
                    .stat-card {
                        padding: 0.75rem 0.5rem;
                    }
                    
                    .stat-icon {
                        width: 32px;
                        height: 32px;
                        font-size: 1rem;
                        margin-bottom: 0.4rem;
                    }
                    
                    .stat-value {
                        font-size: 1.25rem;
                    }
                    
                    .stat-label {
                        font-size: 0.688rem;
                    }
                    
                    .pricing-card {
                        padding: 1rem;
                    }
                    
                    .pricing-value {
                        font-size: 1.25rem;
                    }
                    
                    .content-card {
                        padding: 1rem;
                    }
                    
                    .section-title {
                        font-size: 0.938rem;
                    }
                    
                    .portfolio-carousel .carousel-item img {
                        height: 200px;
                    }
                    
                    .wizard-nav-btn {
                        padding: 0.65rem 1rem;
                        font-size: 0.813rem;
                        min-width: 100px;
                    }
                    
                    .wizard-nav-btn span:not(.wizard-step-indicator span) {
                        display: none;
                    }
                    
                    .wizard-nav-btn em {
                        margin: 0;
                    }
                }
            </style>
            
            <div class="artisan-profile-wrapper">
                <div class="wizard-steps">
                    <div class="wizard-step active" data-step="1">
                        <div class="step-circle"><em class="icon ni ni-user"></em></div>
                        <span class="step-label">Profile</span>
                    </div>
                    <div class="wizard-step" data-step="2">
                        <div class="step-circle"><em class="icon ni ni-edit"></em></div>
                        <span class="step-label">About & Skills</span>
                    </div>
                    <div class="wizard-step" data-step="3">
                        <div class="step-circle"><em class="icon ni ni-img"></em></div>
                        <span class="step-label">Portfolio</span>
                    </div>
                    ${(Array.isArray(certifications) && certifications.length > 0) ? `
                        <div class="wizard-step" data-step="4">
                            <div class="step-circle"><em class="icon ni ni-award"></em></div>
                            <span class="step-label">Certifications</span>
                        </div>
                        <div class="wizard-step" data-step="5">
                            <div class="step-circle"><em class="icon ni ni-shield-check"></em></div>
                            <span class="step-label">Verification</span>
                        </div>
                    ` : `
                        <div class="wizard-step" data-step="4">
                            <div class="step-circle"><em class="icon ni ni-shield-check"></em></div>
                            <span class="step-label">Verification</span>
                        </div>
                    `}
                </div>
                
                <div class="wizard-content">
                    <!-- Step 1: Profile Overview -->
                    <div class="wizard-step-content active" data-step-content="1">
                        <div class="artisan-profile-header">
                            <div class="d-flex align-items-center gap-3 profile-header-content">
                                <div class="user-avatar xl bg-primary">
                                    <span>${escapeHtml((userName || 'A').substring(0, 2).toUpperCase())}</span>
                                </div>
                                <div class="flex-grow-1">
                                    <h4 class="profile-name mb-0">${escapeHtml(userName)}</h4>
                                    <div class="profile-contact">
                                        <div class="contact-item">
                                            <em class="icon ni ni-mail"></em>
                                            <span>${escapeHtml(userEmail)}</span>
                                        </div>
                                        <div class="contact-item">
                                            <em class="icon ni ni-call"></em>
                                            <span>${escapeHtml(userPhone || 'Not provided')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="profile-actions">
                                    <div class="d-flex gap-2 align-items-center">
                                        <span class="${verified ? 'badge-verified' : 'badge-pending'}">
                                            <em class="icon ni ni-${verified ? 'check-circle' : 'alert-circle'}"></em>
                                            ${verified ? 'Verified' : 'Pending'}
                                        </span>
                                        <span class="badge-rank">${escapeHtml(rankLevel)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-star-fill"></em></div>
                                <div class="stat-value">${rating > 0 ? rating.toFixed(1) : '0.0'}</div>
                                <div class="stat-label">Rating</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-calendar"></em></div>
                                <div class="stat-value">${experience}</div>
                                <div class="stat-label">Years Exp.</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-package"></em></div>
                                <div class="stat-value">${bookingsStats.total || 0}</div>
                                <div class="stat-label">Total Jobs</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-check-circle"></em></div>
                                <div class="stat-value">${bookingsStats.completed || 0}</div>
                                <div class="stat-label">Completed</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-msg"></em></div>
                                <div class="stat-value">${responseRate}%</div>
                                <div class="stat-label">Response Rate</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-check-thick"></em></div>
                                <div class="stat-value">${completionRate}%</div>
                                <div class="stat-label">Completion Rate</div>
                            </div>
                            ${analytics.views > 0 || analytics.leads > 0 ? `
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-eye"></em></div>
                                <div class="stat-value">${analytics.views || 0}</div>
                                <div class="stat-label">Profile Views</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><em class="icon ni ni-users"></em></div>
                                <div class="stat-value">${analytics.leads || 0}</div>
                                <div class="stat-label">Leads</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        ${pricing ? `
                            <div class="pricing-grid">
                                <div class="pricing-card">
                                    <div class="pricing-icon"><em class="icon ni ni-clock"></em></div>
                                    <div class="pricing-label">Hourly Rate</div>
                                    <div class="pricing-value">₦${pricing.perHour?.toLocaleString() || 0}</div>
                                </div>
                                <div class="pricing-card">
                                    <div class="pricing-icon"><em class="icon ni ni-briefcase"></em></div>
                                    <div class="pricing-label">Per Job Rate</div>
                                    <div class="pricing-value">₦${pricing.perJob?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Step 2: About & Skills -->
                    <div class="wizard-step-content" data-step-content="2">
                        <div class="content-card">
                            <h6 class="section-title">
                                <div class="section-icon"><em class="icon ni ni-user-circle"></em></div>
                                About Artisan
                            </h6>
                            <div class="info-row">
                                <div class="info-icon"><em class="icon ni ni-edit"></em></div>
                                <div class="info-content">
                                    <div class="info-label">Biography</div>
                                    <div class="info-value">${escapeHtml(bio)}</div>
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="info-icon"><em class="icon ni ni-map-pin"></em></div>
                                <div class="info-content">
                                    <div class="info-label">Service Area</div>
                                    <div class="info-value">${escapeHtml(location)}</div>
                                </div>
                            </div>
                            ${joinedDate ? `
                            <div class="info-row">
                                <div class="info-icon"><em class="icon ni ni-calendar-check"></em></div>
                                <div class="info-content">
                                    <div class="info-label">Member Since</div>
                                    <div class="info-value">${formatDateShort(joinedDate)}</div>
                                </div>
                            </div>
                            ` : ''}
                            ${Array.isArray(availability) && availability.length > 0 ? `
                            <div class="info-row">
                                <div class="info-icon"><em class="icon ni ni-clock"></em></div>
                                <div class="info-content">
                                    <div class="info-label">Availability</div>
                                    <div class="info-value">
                                        ${availability.map(slot => {
                                            const day = slot.day || '';
                                            const start = slot.startTime || '';
                                            const end = slot.endTime || '';
                                            return `<div style="margin-bottom: 0.25rem;"><strong>${escapeHtml(day)}:</strong> ${escapeHtml(start)} - ${escapeHtml(end)}</div>`;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="content-card">
                            <h6 class="section-title">
                                <div class="section-icon"><em class="icon ni ni-setting"></em></div>
                                Trade & Skills
                            </h6>
                            <div>
                                ${Array.isArray(skills) && skills.length > 0
                ? skills.map(skill => `<span class="skill-badge">${escapeHtml(skill)}</span>`).join('')
                : '<span class="text-muted">No trade listed</span>'}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 3: Portfolio -->
                    <div class="wizard-step-content" data-step-content="3">
                        ${Array.isArray(portfolio) && portfolio.length > 0 ? `
                            <div class="content-card">
                                <h6 class="section-title">
                                    <div class="section-icon"><em class="icon ni ni-img"></em></div>
                                    Portfolio
                                </h6>
                                ${portfolio.map((item, index) => {
                    const itemCarouselId = carouselId + '-' + index;
                    return `
                                        <div class="portfolio-item">
                                            <div class="portfolio-header">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <h6 class="portfolio-title" style="margin: 0;">${escapeHtml(item.title || 'Untitled Project')}</h6>
                                                    ${item.beforeAfter ? '<span class="badge bg-info" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;"><em class="icon ni ni-swap"></em> Before/After</span>' : ''}
                                                </div>
                                                ${item.description ? `<p class="portfolio-description" style="margin-top: 0.5rem;">${escapeHtml(item.description)}</p>` : ''}
                                            </div>
                                            ${Array.isArray(item.images) && item.images.length > 0 ? `
                                                <div id="${itemCarouselId}" class="carousel slide portfolio-carousel" data-bs-ride="carousel">
                                                    ${item.images.length > 1 ? `
                                                        <div class="carousel-indicators">
                                                            ${item.images.map((_, imgIndex) => `
                                                                <button type="button" data-bs-target="#${itemCarouselId}" data-bs-slide-to="${imgIndex}" ${imgIndex === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${imgIndex + 1}"></button>
                                                            `).join('')}
                                                        </div>
                                                    ` : ''}
                                                    <div class="carousel-inner">
                                                        ${item.images.map((img, imgIndex) => `
                                                            <div class="carousel-item ${imgIndex === 0 ? 'active' : ''}">
                                                                <img src="${escapeHtml(img)}" class="d-block w-100" alt="Portfolio image ${imgIndex + 1}">
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                    ${item.images.length > 1 ? `
                                                        <button class="carousel-control-prev" type="button" data-bs-target="#${itemCarouselId}" data-bs-slide="prev">
                                                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                                            <span class="visually-hidden">Previous</span>
                                                        </button>
                                                        <button class="carousel-control-next" type="button" data-bs-target="#${itemCarouselId}" data-bs-slide="next">
                                                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                                            <span class="visually-hidden">Next</span>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                }).join('')}
                            </div>
                        ` : `
                            <div class="content-card text-center" style="padding: 3rem;">
                                <em class="icon ni ni-img" style="font-size: 4rem; color: rgba(162,0,37,0.2); margin-bottom: 1rem;"></em>
                                <h6 style="color: #64748b; font-weight: 600;">No Portfolio Items</h6>
                                <p class="text-muted mb-0">This artisan hasn't added any portfolio items yet.</p>
                            </div>
                        `}
                    </div>
                    
                    ${(Array.isArray(certifications) && certifications.length > 0) ? `
                        <!-- Step 4: Certifications -->
                        <div class="wizard-step-content" data-step-content="4">
                            <div class="content-card">
                                <h6 class="section-title">
                                    <div class="section-icon"><em class="icon ni ni-award"></em></div>
                                    Certifications
                                </h6>
                                <div>
                                    ${certifications.map(cert => `<span class="cert-badge">${escapeHtml(cert)}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 5: Verification & KYC -->
                        <div class="wizard-step-content" data-step-content="5">
                    ` : `
                        <!-- Step 4: Verification & KYC -->
                        <div class="wizard-step-content" data-step-content="4">
                    `}
                            ${kycDetails ? `
                                <div class="kyc-card">
                                    <h6 class="section-title" style="border-color: rgba(255,255,255,0.2); color: white;">
                                        <div class="section-icon"><em class="icon ni ni-shield-check"></em></div>
                                        KYC Verification Details
                                    </h6>
                                    <div class="kyc-grid">
                                        ${kycDetails.status ? `
                                            <div class="kyc-item">
                                                <div class="kyc-icon"><em class="icon ni ni-check-circle"></em></div>
                                                <div class="kyc-content">
                                                    <div class="kyc-label">KYC Status</div>
                                                    <div class="kyc-value">
                                                        <span class="badge badge-dim ${kycDetails.status === 'approved' ? 'bg-success' : kycDetails.status === 'pending' ? 'bg-warning' : 'bg-danger'}">${escapeHtml(kycDetails.status).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${kycDetails.idType ? `
                                            <div class="kyc-item">
                                                <div class="kyc-icon"><em class="icon ni ni-file-text"></em></div>
                                                <div class="kyc-content">
                                                    <div class="kyc-label">ID Type</div>
                                                    <div class="kyc-value">${escapeHtml(kycDetails.idType).replace(/_/g, ' ').toUpperCase()}</div>
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${kycDetails.verified !== undefined ? `
                                            <div class="kyc-item">
                                                <div class="kyc-icon"><em class="icon ni ni-shield-star"></em></div>
                                                <div class="kyc-content">
                                                    <div class="kyc-label">Verification Status</div>
                                                    <div class="kyc-value">
                                                        <span class="badge badge-dim ${kycDetails.verified ? 'bg-success' : 'bg-secondary'}">${kycDetails.verified ? 'VERIFIED' : 'NOT VERIFIED'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${kycDetails.submittedAt ? `
                                            <div class="kyc-item">
                                                <div class="kyc-icon"><em class="icon ni ni-calendar"></em></div>
                                                <div class="kyc-content">
                                                    <div class="kyc-label">Submitted Date</div>
                                                    <div class="kyc-value">${formatDateShort(kycDetails.submittedAt)}</div>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : `
                                <div class="content-card text-center" style="padding: 3rem;">
                                    <em class="icon ni ni-shield-check" style="font-size: 4rem; color: rgba(162,0,37,0.2); margin-bottom: 1rem;"></em>
                                    <h6 style="color: #64748b; font-weight: 600;">No KYC Details</h6>
                                    <p class="text-muted mb-0">KYC information not yet submitted.</p>
                                </div>
                            `}
                            
                            <div class="action-btn-wrapper">
                                ${verified
                ? `<button class="action-btn action-btn-unverify" onclick="unverifyArtisan('${artisanId}')">
                                        <em class="icon ni ni-cross-circle"></em>
                                        <span>Revoke Verification</span>
                                       </button>`
                : `<button class="action-btn action-btn-verify" onclick="verifyArtisan('${artisanId}')">
                                        <em class="icon ni ni-check-circle"></em>
                                        <span>Verify Artisan</span>
                                       </button>`
            }
                            </div>
                        </div>
                </div>
                
                <div class="wizard-navigation">
                    <button class="wizard-nav-btn btn-prev" disabled>
                        <em class="icon ni ni-arrow-left"></em>
                        <span>Previous</span>
                    </button>
                    <span class="wizard-step-indicator">
                        Step <span id="current-step-number">1</span> of <span id="total-steps">${totalSteps}</span>
                    </span>
                    <button class="wizard-nav-btn btn-next">
                        <span>Next</span>
                        <em class="icon ni ni-arrow-right"></em>
                    </button>
                </div>
            </div>
            

        `;

        contentEl.innerHTML = html;
        
        // Setup wizard navigation
        let currentWizardStep = 1;
        const totalWizardSteps = totalSteps;
        
        function goToStep(stepNum) {
            if (stepNum < 1 || stepNum > totalWizardSteps) return;
            currentWizardStep = stepNum;
            
            document.querySelectorAll('.wizard-step').forEach((step, index) => {
                const stepNumber = index + 1;
                step.classList.remove('active', 'completed');
                if (stepNumber === stepNum) {
                    step.classList.add('active');
                } else if (stepNumber < stepNum) {
                    step.classList.add('completed');
                }
            });
            
            document.querySelectorAll('.wizard-step-content').forEach(content => {
                content.classList.remove('active');
                if (content.getAttribute('data-step-content') == stepNum) {
                    content.classList.add('active');
                }
            });
            
            const prevBtn = document.querySelector('.wizard-nav-btn.btn-prev');
            const nextBtn = document.querySelector('.wizard-nav-btn.btn-next');
            
            if (prevBtn) {
                prevBtn.disabled = stepNum === 1;
            }
            
            if (nextBtn) {
                nextBtn.disabled = stepNum === totalWizardSteps;
                if (stepNum === totalWizardSteps) {
                    nextBtn.style.opacity = '0';
                    nextBtn.style.pointerEvents = 'none';
                } else {
                    nextBtn.style.opacity = '1';
                    nextBtn.style.pointerEvents = 'auto';
                }
            }
            
            const currentStepEl = document.getElementById('current-step-number');
            if (currentStepEl) {
                currentStepEl.textContent = stepNum;
            }
            
            const modalBody = document.getElementById('artisan-review-content');
            if (modalBody) {
                modalBody.scrollTop = 0;
            }
        }
        
        function nextStep() {
            if (currentWizardStep < totalWizardSteps) {
                goToStep(currentWizardStep + 1);
            }
        }
        
        function previousStep() {
            if (currentWizardStep > 1) {
                goToStep(currentWizardStep - 1);
            }
        }
        
        // Add click handlers to step buttons
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.addEventListener('click', function() {
                const stepNum = parseInt(this.getAttribute('data-step'));
                goToStep(stepNum);
            });
        });
        
        // Add click handlers to navigation buttons
        const prevBtn = document.querySelector('.wizard-nav-btn.btn-prev');
        const nextBtn = document.querySelector('.wizard-nav-btn.btn-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', previousStep);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextStep);
        }
        
        // Keyboard navigation
        const keydownHandler = function(e) {
            const modal = document.getElementById('artisanReviewModal');
            if (!modal || !modal.classList.contains('show')) return;
            
            if (e.key === 'ArrowRight') {
                nextStep();
            } else if (e.key === 'ArrowLeft') {
                previousStep();
            }
        };
        
        document.addEventListener('keydown', keydownHandler);
        
        // Clean up event listener when modal closes
        const modalEl = document.getElementById('artisanReviewModal');
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', function() {
                document.removeEventListener('keydown', keydownHandler);
            }, { once: true });
        }
        
        // Initialize Bootstrap carousels for portfolio images
        if (window.bootstrap && window.bootstrap.Carousel) {
            document.querySelectorAll('.portfolio-carousel').forEach(carouselEl => {
                new bootstrap.Carousel(carouselEl, {
                    interval: false, // Don't auto-slide
                    wrap: true,
                    touch: true
                });
            });
        }

        if (modalEl && window.bootstrap) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    } catch (err) {
        console.error('Failed to load artisan profile', err);
        toast.error('Failed to load artisan profile');
    }
}

// Verify artisan
window.verifyArtisan = async function (artisanId) {
    const modal = document.getElementById('verifyArtisanModal');
    const confirmBtn = document.getElementById('confirm-verify-artisan');

    if (!modal || !confirmBtn) return;

    // Close the profile modal before showing confirmation
    const profileModalEl = document.getElementById('artisanReviewModal');
    if (profileModalEl && window.bootstrap) {
        const profileModal = bootstrap.Modal.getInstance(profileModalEl);
        if (profileModal) profileModal.hide();
    }

    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        try {
            const token = getStoredToken();
            const headers = token ? { Authorization: 'Bearer ' + token } : {};

            const res = await api.patch('/artisans/' + encodeURIComponent(artisanId) + '/verify', {}, { headers });

            if (res.data?.success) {
                toast.success('Artisan verified successfully');

                // Close confirmation modal
                if (window.bootstrap) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }

                // Reload artisan list
                await loadArtisans(currentPage, PAGE_LIMIT, currentSearchQuery);

                // Wait a bit for modal to close, then fetch updated data and reopen profile modal
                setTimeout(async () => {
                    try {
                        const headers = {};
                        const token = getStoredToken();
                        if (token) headers.Authorization = 'Bearer ' + token;

                        const artisanRes = await api.get('/artisans/' + encodeURIComponent(artisanId), { headers });
                        const artisanData = artisanRes.data?.success ? artisanRes.data.data : (artisanRes.data?.data || artisanRes.data);

                        // Reopen profile modal with updated data
                        await showArtisanProfile(artisanId, artisanData);
                    } catch (err) {
                        console.error('Failed to reload artisan profile:', err);
                    }
                }, 300);
            }
        } catch (err) {
            console.error('Failed to verify artisan:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to verify artisan';
            toast.error(msg);
        }
    });

    // Show the modal
    if (window.bootstrap) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
};

// Unverify artisan
window.unverifyArtisan = async function (artisanId) {
    const modal = document.getElementById('unverifyArtisanModal');
    const confirmBtn = document.getElementById('confirm-unverify-artisan');

    if (!modal || !confirmBtn) return;

    // Close the profile modal before showing confirmation
    const profileModalEl = document.getElementById('artisanReviewModal');
    if (profileModalEl && window.bootstrap) {
        const profileModal = bootstrap.Modal.getInstance(profileModalEl);
        if (profileModal) profileModal.hide();
    }

    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        try {
            const token = getStoredToken();
            const headers = token ? { Authorization: 'Bearer ' + token } : {};

            const res = await api.patch('/artisans/' + encodeURIComponent(artisanId) + '/unverify', {}, { headers });

            if (res.data?.success) {
                toast.success('Artisan verification revoked successfully');

                // Close confirmation modal
                if (window.bootstrap) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }

                // Reload artisan list
                await loadArtisans(currentPage, PAGE_LIMIT, currentSearchQuery);

                // Wait a bit for modal to close, then fetch updated data and reopen profile modal
                setTimeout(async () => {
                    try {
                        const headers = {};
                        const token = getStoredToken();
                        if (token) headers.Authorization = 'Bearer ' + token;

                        const artisanRes = await api.get('/artisans/' + encodeURIComponent(artisanId), { headers });
                        //console.log('Fetched artisan after unverify:', artisanRes.data);
                        const artisanData = artisanRes.data?.success ? artisanRes.data.data : (artisanRes.data?.data || artisanRes.data);

                        // Reopen profile modal with updated data
                        await showArtisanProfile(artisanId, artisanData);
                    } catch (err) {
                        console.error('Failed to reload artisan profile:', err);
                    }
                }, 300);
            }
        } catch (err) {
            console.error('Failed to unverify artisan:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to unverify artisan';
            toast.error(msg);
        }
    });

    // Show the modal
    if (window.bootstrap) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
};

// Render pagination
function renderPagination(page, limit, total) {
    const paginationEl = document.getElementById('artisan-pagination');
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
            if (!disabled) loadArtisans(pageNum, limit, currentSearchQuery, currentVerificationFilter);
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
            loadArtisans(i, limit, currentSearchQuery, currentVerificationFilter);
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

        const token = getStoredToken();
        if (token) {
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }

        // Search functionality
        const searchInput = document.getElementById('artisan-search-input');
        let searchTimeout;

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                currentSearchQuery = e.target.value.trim();
                searchTimeout = setTimeout(() => {
                    loadArtisans(1, PAGE_LIMIT, currentSearchQuery, currentVerificationFilter, currentDateFrom, currentDateTo);
                }, 500); // 500ms debounce
            });
        }

        // Date filter functionality
        const dateFromInput = document.getElementById('date-from');
        const dateToInput = document.getElementById('date-to');
        const clearDateBtn = document.getElementById('clear-date-filter');

        if (dateFromInput) {
            dateFromInput.addEventListener('change', (e) => {
                currentDateFrom = e.target.value;
                currentPage = 1;
                loadArtisans(1, PAGE_LIMIT, currentSearchQuery, currentVerificationFilter, currentDateFrom, currentDateTo);
            });
        }

        if (dateToInput) {
            dateToInput.addEventListener('change', (e) => {
                currentDateTo = e.target.value;
                currentPage = 1;
                loadArtisans(1, PAGE_LIMIT, currentSearchQuery, currentVerificationFilter, currentDateFrom, currentDateTo);
            });
        }

        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', () => {
                currentDateFrom = '';
                currentDateTo = '';
                if (dateFromInput) dateFromInput.value = '';
                if (dateToInput) dateToInput.value = '';
                currentPage = 1;
                loadArtisans(1, PAGE_LIMIT, currentSearchQuery, currentVerificationFilter, '', '');
            });
        }

        // Verification filter functionality
        const verificationFilter = document.getElementById('verification-filter');
        if (verificationFilter) {
            //console.log('Verification filter element found');
            
            // Handle both native select and Select2
            verificationFilter.addEventListener('change', (e) => {
                currentVerificationFilter = e.target.value;
                //console.log('Filter changed to:', currentVerificationFilter);
                currentPage = 1;
                loadArtisans(1, PAGE_LIMIT, currentSearchQuery, currentVerificationFilter, currentDateFrom, currentDateTo);
            });
            
            // For Select2 compatibility
            if (window.jQuery && jQuery(verificationFilter).hasClass('js-select2')) {
                jQuery(verificationFilter).on('change', function() {
                    currentVerificationFilter = this.value;
                    //console.log('Filter changed (Select2) to:', currentVerificationFilter);
                    currentPage = 1;
                    loadArtisans(1, PAGE_LIMIT, currentSearchQuery, currentVerificationFilter, currentDateFrom, currentDateTo);
                });
            }
        } else {
            console.error('Verification filter element not found');
        }

        // Initial load
        await loadArtisans(1, PAGE_LIMIT, '', '', '', '');
    } catch (err) {
        console.error('Initialization failed', err);
        toast.error('Failed to initialize');
    }
})();
