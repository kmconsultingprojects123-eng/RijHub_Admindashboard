import { getApi, toast, getStoredToken } from './config/_helper.js';

// Frontend pagination + search + reveal display for Users Management
let api = null;
const PAGE_SIZE = 12;
let allUsers = [];
let filteredUsers = [];
let currentPage = 0; // 0-based
let loading = false;

// Truncate email for UI while preserving full value in `title` for hover
function truncateEmail(email, maxLen = 30) {
	if (!email) return { display: '', title: '' };
	const s = String(email);
	if (s.length <= maxLen) return { display: escapeHtml(s), title: '' };
	const at = s.indexOf('@');
	if (at > 0) {
		const local = s.slice(0, at);
		const domain = s.slice(at); // includes @
		// reserve 3 chars for ellipsis
		const allowedLocal = maxLen - domain.length - 3;
		if (allowedLocal <= 0) {
			// domain is long; show tail of the email
			const display = '...' + s.slice(-(maxLen - 3));
			return { display: escapeHtml(display), title: escapeHtml(s) };
		}
		const leftLocal = local.slice(0, Math.max(1, allowedLocal));
		const display = leftLocal + '...' + domain;
		return { display: escapeHtml(display), title: escapeHtml(s) };
	}
	// fallback: simple truncate with ellipsis at end
	const left = s.slice(0, Math.max(0, maxLen - 3));
	return { display: escapeHtml(left + '...'), title: escapeHtml(s) };
}

function createCard(user) {
	const col = document.createElement('div');
	col.className = 'col-sm-6 col-xl-4 user-card-col';

	const card = document.createElement('div');
	card.className = 'card card-bordered';
	card.style.opacity = '0';
	card.style.transform = 'translateY(12px)';
	card.style.transition = 'all 400ms ease-out';

	const inner = document.createElement('div');
	inner.className = 'card-inner';

	const team = document.createElement('div');
	team.className = 'team';

	const initials = (user.name || user.displayName || user.username || '').slice(0, 2).toUpperCase() || 'NN';
	const title = (user.name || user.displayName || user.username || 'Unknown');
	const email = user.email || '';

	const avatarHtml = `
		<div class="user-card user-card-s2">
			<div class="user-avatar lg bg-dark"><span>${initials}</span></div>
			<div class="user-info">
				<h6>${escapeHtml(title)}</h6>
				<!--<span class="sub-text">${escapeHtml(user.role)}</span>-->
			</div>
		</div>`;

		const list = document.createElement('ul');
		list.className = 'team-info';
		// Determine join date field (support multiple API naming conventions) and format it
		const rawJoinDate = user.joined_at || user.created_at || user.createdAt || '';
		const joinDate = formatDateHuman(rawJoinDate);
		const contactVal = user.phone || user.contact || '';

		// Base items always shown
		let listHtml = '';
		listHtml += `<li><span>Join Date</span><span>${escapeHtml(joinDate)}</span></li>`;
		listHtml += `<li><span>Contact</span><span>${escapeHtml(contactVal)}</span></li>`;

		// Truncate long emails for UI, keep full email in title for hover
		const emailTrunc = truncateEmail(email, 30);
		if (emailTrunc.title) {
			listHtml += `<li><span>Email</span><span title="${emailTrunc.title}" aria-label="Full email: ${emailTrunc.title}" style="display:inline-block;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle">${emailTrunc.display}</span></li>`;
		} else {
			listHtml += `<li><span>Email</span><span>${emailTrunc.display}</span></li>`;
		}

		// Show verification info only for agents
		const roleLower = (user.role || user.user_role || user.roleName || '').toString().toLowerCase();
        // console.log(user);
		if (roleLower === 'artisan' || roleLower === 'agent') {
			const verified = (user.isVerified == true || user.verified == true) ? 'Yes' : 'No';
			const kycVerified = (user.kycVerified === true || user.kyc_verified === true) ? 'Yes' : 'No';
			listHtml += `<li><span>Verified</span><span>${escapeHtml(verified)}</span></li>`;
			listHtml += `<li><span>KYC Verified</span><span>${escapeHtml(kycVerified)}</span></li>`;
			// intentionally DO NOT show kycLevel for agents per requirements
		}

		list.innerHTML = listHtml;

	const view = document.createElement('div');
	view.className = 'team-view';
	view.innerHTML = `<a href="/aa/userdetails/${user._id}" class="btn btn-block btn-dim btn-darkred"><span>View Profile</span></a>`;

	team.innerHTML = avatarHtml;
	team.appendChild(list);
	team.appendChild(view);

	// Apply role-based color to title and sub-text, and add a small role badge
	// Role lookup (case-insensitive)
	const role = (user.role || user.user_role || user.roleName || '').toString().toLowerCase();
	const roleColors = {
		customer: '#1ee0ac', // green-ish
		guest: '#6c757d',    // gray
		artisan: '#a20025'     // brand red
	};
	const roleColor = roleColors[role] || '#223344';

	// After innerHTML assignment, query the elements and style them
	const titleEl = team.querySelector('.user-info h6');
	const subTextEl = team.querySelector('.user-info .sub-text');

	// Role badge
	if (role) {
		const badge = document.createElement('span');
		badge.textContent = role.charAt(0).toUpperCase() + role.slice(1);
		badge.style.marginLeft = '8px';
		badge.style.fontSize = '12px';
		badge.style.padding = '3px 8px';
		badge.style.borderRadius = '12px';
		badge.style.background = roleColor + '33'; // translucent background
		badge.style.color = roleColor;
		badge.style.fontWeight = '600';
		// append badge next to title
		if (titleEl) titleEl.appendChild(badge);
	}

	inner.appendChild(team);
	card.appendChild(inner);
	col.appendChild(card);

	// reveal animation
	requestAnimationFrame(() => {
		card.style.opacity = '1';
		card.style.transform = 'translateY(0)';
	});

	return col;
}

function escapeHtml(str) {
	if (!str) return '';
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDateHuman(dateInput) {
	if (!dateInput) return '';
	const d = new Date(dateInput);
	if (isNaN(d.getTime())) return '';
	// e.g. Nov 10, 2025 — change locale if needed
	try {
		return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
	} catch (e) {
		return d.toLocaleDateString();
	}
}

function normalizeUsersResponse(res) {
	if (!res) return [];
	if (Array.isArray(res.data)) return res.data;
	if (res.data && Array.isArray(res.data.message)) return res.data.message;
	if (res.data && Array.isArray(res.data.users)) return res.data.users;
	if (res.data && Array.isArray(res.data.data)) return res.data.data;
	for (const v of Object.values(res.data || {})) if (Array.isArray(v)) return v;
	return [];
}

async function loadAllUsers() {
	if (!api) throw new Error('API not initialized');
	loading = true;
	document.getElementById('users-loader').style.display = 'block';
	try {
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		};
		const token = getStoredToken();
		if (token) headers.Authorization = 'Bearer ' + token;
        // console.log(token);
		const res = await api.get('/users', { headers });
		// Defensive check: if server returned HTML (ngrok interstitial or error page), abort and surface diagnostics
		const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';
		const ct = String(contentType).toLowerCase();
		if (ct.includes('text/html') || (typeof res.data === 'string' && res.data.trim().startsWith('<'))) {
			console.error('Expected JSON but received HTML/other:', { status: res.status, headers: res.headers, dataSnippet: String(res.data).slice(0,200) });
			toast.error('Server returned HTML instead of JSON. Check backend/ngrok and CORS. See console for details.');
			return [];
		}

		const users = normalizeUsersResponse(res) || [];
		// Precompute a lowercase search key for fast client-side search
		users.forEach(u => {
			const pieces = [];
			if (u.name) pieces.push(u.name);
			if (u.displayName) pieces.push(u.displayName);
			if (u.username) pieces.push(u.username);
			if (u.email) pieces.push(u.email);
			if (u.phone) pieces.push(u.phone);
			if (u.contact) pieces.push(u.contact);
			// include role
			if (u.role) pieces.push(u.role);
			u._searchKey = pieces.join(' ').toLowerCase();
		});
		return users;
	} catch (err) {
		console.error('Failed to fetch users', err);
		toast.error('Failed to load users');
		return [];
	} finally {
		loading = false;
		const loader = document.getElementById('users-loader'); if (loader) loader.style.display = 'none';
	}
}

function applyFilter(q) {
	if (!q) {
		filteredUsers = allUsers.slice();
		return;
	}
	const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (terms.length === 0) { filteredUsers = allUsers.slice(); return; }
	// fast tokenized search using precomputed _searchKey
	filteredUsers = allUsers.filter(u => {
		const key = u._searchKey || '';
		// every search term must be present
		for (let i = 0; i < terms.length; i++) {
			if (!key.includes(terms[i])) return false;
		}
		return true;
	});
}

function renderInitialPage() {
	currentPage = 0;
	const grid = document.getElementById('users-grid'); if (!grid) return;
	grid.innerHTML = '';
	renderPage(0);
}

function renderPage(pageIndex) {
	const grid = document.getElementById('users-grid'); if (!grid) return;
	const start = pageIndex * PAGE_SIZE;
	const slice = filteredUsers.slice(start, start + PAGE_SIZE);
	slice.forEach(u => grid.appendChild(createCard(u)));
}

function loadMoreOnScroll() {
	const reached = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 600);
	if (!reached) return;
	const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
	if (currentPage + 1 >= totalPages) return; // no more pages
	currentPage += 1;
	renderPage(currentPage);
}

function debounce(fn, wait = 250) {
	let t;
	return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// Initialize UI and load data
(async function init() {
	try {
		api = await getApi();
	} catch (err) {
		console.error('Failed to init API', err);
		toast.error('Cannot reach API configuration');
		return;
	}

	// wire search
    let query = '';
	const input = document.getElementById('user-search');
	const clearBtn = document.getElementById('clear-search');
	input && input.addEventListener('input', debounce((e) => {
		query = e.target.value.trim();
		applyFilter(query);
		renderInitialPage();
	}, 300));
	clearBtn && clearBtn.addEventListener('click', () => { if (input) input.value = ''; query = ''; applyFilter(''); renderInitialPage(); });

	window.addEventListener('scroll', debounce(loadMoreOnScroll, 150));

	// fetch users and render first page
	const users = await loadAllUsers();
	allUsers = users || [];
	applyFilter('');
	renderInitialPage();
})();
