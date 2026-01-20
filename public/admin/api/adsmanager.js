import { getApi, toast, getStoredToken } from './config/_helper.js';

// Ads Manager - manage marquee, banners, carousel items, and promotional ads
let api = null;

// Cloudinary Configuration (Update these with your actual values)
const CLOUDINARY_CLOUD_NAME = 'dpjd1bxtp'; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = 'artisan_ads'; // Create unsigned upload preset in Cloudinary dashboard
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(active) {
    return active
        ? '<span class="badge badge-sm badge-dot has-bg bg-success d-inline-flex align-items-center"><span>Active</span></span>'
        : '<span class="badge badge-sm badge-dot has-bg bg-gray d-inline-flex align-items-center"><span>Inactive</span></span>';
}

function getTypeBadge(type) {
    const badges = {
        'marquee': '<span class="badge badge-sm bg-primary">Marquee</span>',
        'banner': '<span class="badge badge-sm bg-info">Banner</span>',
        'carousel': '<span class="badge badge-sm bg-warning">Carousel</span>',
        'general': '<span class="badge badge-sm bg-secondary">General</span>'
    };
    return badges[type] || `<span class="badge badge-sm bg-secondary">${escapeHtml(type)}</span>`;
}

// State variables
let currentAdId = null;
let currentDeleteAdId = null;

(async function () {
    api = await getApi();
    
    // Attach authorization token to API instance
    try {
        const token = getStoredToken();
        if (token) {
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }
    } catch (e) {
        console.warn('Failed to attach token to API', e);
    }
    
    // Load initial data
    loadMarquee();
    loadBanners();
    loadCarousel();
    loadAllAds();
    
    // Tab change handlers - reload data when switching tabs
    const tabLinks = document.querySelectorAll('a[data-bs-toggle="tab"]');
    tabLinks.forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            const target = e.target.getAttribute('href');
            if (target === '#tabMarquee') loadMarquee();
            else if (target === '#tabBanner') loadBanners();
            else if (target === '#tabCarousel') loadCarousel();
            else if (target === '#tabAllAds') loadAllAds();
        });
    });
    
    // Create Ad button
    document.getElementById('createAdBtn').addEventListener('click', () => {
        openAdModal();
    });
    
    // Save Ad button
    document.getElementById('saveAdBtn').addEventListener('click', () => {
        saveAd();
    });
    
    // Confirm Delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        confirmDelete();
    });
    
    // Ad Type change - show/hide fields
    document.getElementById('adType').addEventListener('change', (e) => {
        updateFormFields(e.target.value);
    });
    
    // Upload Image button
    document.getElementById('uploadImageBtn').addEventListener('click', () => {
        uploadImage();
    });
    
    // File input change - show preview
    document.getElementById('adImageFile').addEventListener('change', (e) => {
        previewImage(e.target.files[0]);
    });
})();

// Load Marquee
async function loadMarquee() {
    const container = document.getElementById('marquee-content');
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        const response = await api.get('/ads/marquee');
        console.log('Marquee response:', response);
        
        if (response.data) {
            const marquee = response.data;
            const hasId = marquee._id || marquee.id;
            
            container.innerHTML = `
                <div class="alert alert-${marquee.active ? 'success' : 'gray'} alert-icon">
                    <em class="icon ni ni-${marquee.active ? 'check-circle' : 'info'}"></em>
                    <strong>${escapeHtml(marquee.text || 'No marquee configured')}</strong>
                </div>
                ${hasId ? `
                <div class="mt-3">
                    <button type="button" class="btn btn-primary me-2" onclick="window.editMarquee('${marquee._id || marquee.id}')">
                        <em class="icon ni ni-edit"></em><span>Edit Marquee</span>
                    </button>
                    <button type="button" class="btn btn-danger" onclick="window.deleteAd('${marquee._id || marquee.id}', 'marquee')">
                        <em class="icon ni ni-trash"></em><span>Delete</span>
                    </button>
                </div>
                ` : `
                <div class="mt-3">
                    <button type="button" class="btn btn-primary" onclick="window.createMarquee()">
                        <em class="icon ni ni-plus"></em><span>Create Marquee</span>
                    </button>
                </div>
                `}
            `;
        }
    } catch (error) {
        console.error('Error loading marquee:', error);
        container.innerHTML = `
            <div class="alert alert-warning">
                <p>No marquee configured. Create one to display scrolling text at the top of the mobile app.</p>
                <button type="button" class="btn btn-primary btn-sm mt-2" onclick="window.createMarquee()">
                    <em class="icon ni ni-plus"></em><span>Create Marquee</span>
                </button>
            </div>
        `;
    }
}

// Load Banners
async function loadBanners() {
    const container = document.getElementById('banner-content');
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        const response = await api.get('/ads/banner');
        console.log('Banners response:', response);
        
        const banners = response.data || [];
        if (banners.length === 0) {
            container.innerHTML = '<div class="text-center py-4"><p class="text-muted">No banners found. Create one to get started.</p></div>';
            return;
        }
        
        let html = '<div class="row g-3">';
        banners.forEach(banner => {
            html += renderAdCard(banner, 'banner');
        });
        html += '</div>';
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading banners:', error);
        container.innerHTML = '<div class="alert alert-danger">Error loading banners. Please try again.</div>';
    }
}

// Load Carousel
async function loadCarousel() {
    const container = document.getElementById('carousel-content');
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        const response = await api.get('/ads/carousel');
        console.log('Carousel response:', response);
        
        const items = response.data || [];
        if (items.length === 0) {
            container.innerHTML = '<div class="text-center py-4"><p class="text-muted">No carousel items found. Create one to get started.</p></div>';
            return;
        }
        
        let html = '<div class="row g-3">';
        items.forEach(item => {
            html += renderAdCard(item, 'carousel');
        });
        html += '</div>';
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading carousel:', error);
        container.innerHTML = '<div class="alert alert-danger">Error loading carousel items. Please try again.</div>';
    }
}

// Load All Ads
async function loadAllAds() {
    const container = document.getElementById('all-ads-table');
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        const response = await api.get('/ads');
        console.log('All ads response:', response);
        
        const ads = response.data || [];
        if (ads.length === 0) {
            container.innerHTML = '<div class="nk-tb-item"><div class="nk-tb-col" colspan="6"><div class="text-center py-4"><p class="text-muted">No ads found.</p></div></div></div>';
            return;
        }
        
        let html = '';
        ads.forEach(ad => {
            html += `
                <div class="nk-tb-item">
                    <div class="nk-tb-col" data-label="Type: ">
                        ${getTypeBadge(ad.type)}
                    </div>
                    <div class="nk-tb-col" data-label="Title: ">
                        <span class="tb-lead">${escapeHtml(ad.title || ad.text || 'Untitled')}</span>
                    </div>
                    <div class="nk-tb-col" data-label="Status: ">
                        ${getStatusBadge(ad.active)}
                    </div>
                    <div class="nk-tb-col" data-label="Order: ">
                        <span class="badge badge-sm badge-dim bg-outline-secondary">${ad.order || 0}</span>
                    </div>
                    <div class="nk-tb-col" data-label="Created: ">
                        <span class="text-soft">${formatDate(ad.createdAt)}</span>
                    </div>
                    <div class="nk-tb-col nk-tb-col-tools" data-label="">
                        <ul class="nk-tb-actions gx-1">
                            <li>
                                <div class="drodown">
                                    <a href="#" class="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown"><em class="icon ni ni-more-h"></em></a>
                                    <div class="dropdown-menu dropdown-menu-end">
                                        <ul class="link-list-opt no-bdr">
                                            <li><a href="#" onclick="window.viewAdDetails('${ad._id}'); return false;"><em class="icon ni ni-eye"></em><span>View Details</span></a></li>
                                            <li><a href="#" onclick="window.editAd('${ad._id}'); return false;"><em class="icon ni ni-edit"></em><span>Edit</span></a></li>
                                            <li class="divider"></li>
                                            <li><a href="#" class="text-danger" onclick="window.deleteAd('${ad._id}', '${ad.type}'); return false;"><em class="icon ni ni-trash"></em><span>Delete</span></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading all ads:', error);
        container.innerHTML = '<div class="nk-tb-item"><div class="nk-tb-col" colspan="6"><div class="alert alert-danger">Error loading ads. Please try again.</div></div></div>';
    }
}

// Render Ad Card (for banners/carousel)
function renderAdCard(ad, type) {
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card card-bordered h-100">
                ${ad.image ? `<img src="${escapeHtml(ad.image)}" class="card-img-top" alt="${escapeHtml(ad.title)}" style="height: 200px; object-fit: cover;">` : ''}
                <div class="card-inner">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title">${escapeHtml(ad.title)}</h6>
                        ${getStatusBadge(ad.active)}
                    </div>
                    ${ad.text ? `<p class="card-text text-soft small">${escapeHtml(ad.text)}</p>` : ''}
                    ${ad.link ? `<p class="card-text small"><strong>Link:</strong> <a href="${escapeHtml(ad.link)}" target="_blank" class="text-primary">${escapeHtml(ad.link)}</a></p>` : ''}
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="badge badge-sm badge-dim bg-outline-secondary">Order: ${ad.order || 0}</span>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-dim btn-outline-primary" onclick="window.editAd('${ad._id}')">
                                <em class="icon ni ni-edit"></em>
                            </button>
                            <button type="button" class="btn btn-dim btn-outline-danger" onclick="window.deleteAd('${ad._id}', '${type}')">
                                <em class="icon ni ni-trash"></em>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Open Ad Modal
function openAdModal(adData = null) {
    currentAdId = adData ? (adData._id || adData.id) : null;
    const modal = new bootstrap.Modal(document.getElementById('adModal'));
    const form = document.getElementById('adForm');
    const modalLabel = document.getElementById('adModalLabel');
    
    // Reset form
    form.reset();
    
    if (adData) {
        // Edit mode
        modalLabel.textContent = 'Edit Ad';
        document.getElementById('adId').value = adData._id || adData.id || '';
        document.getElementById('adType').value = adData.type || 'marquee';
        document.getElementById('adTitle').value = adData.title || '';
        document.getElementById('adText').value = adData.text || '';
        document.getElementById('adImage').value = adData.image || '';
        document.getElementById('adLink').value = adData.link || '';
        document.getElementById('adOrder').value = adData.order || 0;
        document.getElementById('adActive').checked = adData.active !== false;
        
        updateFormFields(adData.type || 'marquee');
    } else {
        // Create mode
        modalLabel.textContent = 'Create Ad';
        document.getElementById('adActive').checked = true;
        updateFormFields('marquee');
    }
    
    modal.show();
}

// Update form fields based on ad type
function updateFormFields(type) {
    const textContainer = document.getElementById('textFieldContainer');
    const imageContainer = document.getElementById('imageFieldContainer');
    const textField = document.getElementById('adText');
    const imageField = document.getElementById('adImage');
    
    if (type === 'marquee') {
        textContainer.style.display = 'block';
        imageContainer.style.display = 'none';
        textField.required = true;
        imageField.required = false;
    } else {
        textContainer.style.display = 'none';
        imageContainer.style.display = 'block';
        textField.required = false;
        imageField.required = true;
    }
}

// Save Ad
async function saveAd() {
    const form = document.getElementById('adForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const adId = document.getElementById('adId').value;
    const type = document.getElementById('adType').value;
    const title = document.getElementById('adTitle').value;
    const text = document.getElementById('adText').value;
    const image = document.getElementById('adImage').value;
    const link = document.getElementById('adLink').value;
    const order = parseInt(document.getElementById('adOrder').value) || 0;
    const active = document.getElementById('adActive').checked;
    
    const payload = { type, title, text, image, link, order, active };
    
    try {
        const saveBtn = document.getElementById('saveAdBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        
        let response;
        if (adId) {
            // Update existing ad
            response = await api.put(`/ads/${adId}`, payload);
            toast.success('Ad updated successfully');
        } else {
            // Create new ad - use specific endpoint for marquee/banner/carousel
            if (type === 'marquee') {
                response = await api.post('/ads/marquee', payload);
            } else if (type === 'banner') {
                response = await api.post('/ads/banner', payload);
            } else if (type === 'carousel') {
                response = await api.post('/ads/carousel', payload);
            } else {
                response = await api.post('/ads', payload);
            }
            toast.success('Ad created successfully');
        }
        
        console.log('Save ad response:', response);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('adModal'));
        modal.hide();
        
        // Reload appropriate section
        if (type === 'marquee') loadMarquee();
        else if (type === 'banner') loadBanners();
        else if (type === 'carousel') loadCarousel();
        loadAllAds();
        
    } catch (error) {
        console.error('Error saving ad:', error);
        toast.error(error.response?.data?.message || 'Error saving ad');
    } finally {
        const saveBtn = document.getElementById('saveAdBtn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Ad';
    }
}

// Delete Ad
async function deleteAd(adId, type) {
    currentDeleteAdId = adId;
    const modal = new bootstrap.Modal(document.getElementById('deleteAdModal'));
    document.getElementById('deleteAdInfo').textContent = `Type: ${type}`;
    modal.show();
}

async function confirmDelete() {
    if (!currentDeleteAdId) return;
    
    try {
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
        
        await api.delete(`/ads/${currentDeleteAdId}`);
        toast.success('Ad deleted successfully');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAdModal'));
        modal.hide();
        
        // Reload all sections
        loadMarquee();
        loadBanners();
        loadCarousel();
        loadAllAds();
        
    } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error(error.response?.data?.message || 'Error deleting ad');
    } finally {
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Delete';
        currentDeleteAdId = null;
    }
}

// Edit Ad
async function editAd(adId) {
    try {
        const response = await api.get(`/ads/${adId}`);
        console.log('Edit ad response:', response);
        openAdModal(response.data);
    } catch (error) {
        console.error('Error fetching ad:', error);
        toast.error('Error loading ad details');
    }
}

// View Ad Details
async function viewAdDetails(adId) {
    try {
        const response = await api.get(`/ads/${adId}`);
        const ad = response.data;
        
        const content = `
            <div class="row g-3">
                <div class="col-md-6">
                    <p><strong>Type:</strong> ${getTypeBadge(ad.type)}</p>
                    <p><strong>Title:</strong> ${escapeHtml(ad.title || 'N/A')}</p>
                    <p><strong>Status:</strong> ${getStatusBadge(ad.active)}</p>
                    <p><strong>Order:</strong> ${ad.order || 0}</p>
                    <p><strong>Created:</strong> ${formatDate(ad.createdAt)}</p>
                </div>
                <div class="col-md-6">
                    ${ad.image ? `<img src="${escapeHtml(ad.image)}" class="img-fluid rounded mb-2" alt="Ad image">` : ''}
                    ${ad.text ? `<p><strong>Text:</strong> ${escapeHtml(ad.text)}</p>` : ''}
                    ${ad.link ? `<p><strong>Link:</strong> <a href="${escapeHtml(ad.link)}" target="_blank">${escapeHtml(ad.link)}</a></p>` : ''}
                </div>
                ${ad.meta && Object.keys(ad.meta).length > 0 ? `
                <div class="col-12">
                    <p><strong>Metadata:</strong></p>
                    <pre class="bg-light p-2 rounded">${JSON.stringify(ad.meta, null, 2)}</pre>
                </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('adDetailsContent').innerHTML = content;
        const modal = new bootstrap.Modal(document.getElementById('adDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading ad details:', error);
        toast.error('Error loading ad details');
    }
}

// Create Marquee (convenience function)
function createMarquee() {
    openAdModal({ type: 'marquee', active: true });
}

// Edit Marquee (convenience function)
async function editMarquee(marqueeId) {
    try {
        const response = await api.get(`/ads/${marqueeId}`);
        openAdModal(response.data);
    } catch (error) {
        console.error('Error fetching marquee:', error);
        // If marquee doesn't have an ID, just open create modal
        openAdModal({ type: 'marquee', active: true });
    }
}

// Preview selected image
function previewImage(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = e.target.result;
        preview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
}

// Upload image to Cloudinary
async function uploadImage() {
    const fileInput = document.getElementById('adImageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        toast.error('Please select an image file');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        toast.error('Image size must be less than 10MB');
        return;
    }
    
    const uploadBtn = document.getElementById('uploadImageBtn');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressContainer = document.getElementById('uploadProgress');
    const statusEl = document.getElementById('uploadStatus');
    
    try {
        // Disable upload button
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
        
        // Show progress bar
        progressContainer.classList.remove('d-none');
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        statusEl.textContent = 'Uploading to Cloudinary...';
        statusEl.className = 'form-note mt-1 text-info';
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
        
        // Upload to Cloudinary with progress tracking
        const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progressBar.style.width = percentCompleted + '%';
                progressBar.textContent = percentCompleted + '%';
            }
        });
        
        console.log('Cloudinary upload response:', response.data);
        
        // Get the secure URL
        const imageUrl = response.data.secure_url;
        
        // Update the image URL field
        document.getElementById('adImage').value = imageUrl;
        
        // Show success message
        statusEl.textContent = '✓ Image uploaded successfully!';
        statusEl.className = 'form-note mt-1 text-success';
        toast.success('Image uploaded successfully');
        
        // Hide progress bar after 2 seconds
        setTimeout(() => {
            progressContainer.classList.add('d-none');
        }, 2000);
        
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        
        let errorMessage = 'Failed to upload image';
        if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Check if it's a configuration error
        if (errorMessage.includes('Invalid cloud_name') || errorMessage.includes('upload_preset')) {
            errorMessage = 'Cloudinary not configured. Please update CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in adsmanager.js';
        }
        
        statusEl.textContent = '✗ ' + errorMessage;
        statusEl.className = 'form-note mt-1 text-danger';
        toast.error(errorMessage);
        
        // Hide progress bar
        progressContainer.classList.add('d-none');
        
    } finally {
        // Re-enable upload button
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<em class="icon ni ni-upload"></em><span>Upload</span>';
    }
}

// Make functions globally available
window.editAd = editAd;
window.deleteAd = deleteAd;
window.viewAdDetails = viewAdDetails;
window.createMarquee = createMarquee;
window.editMarquee = editMarquee;
