<?php
if (!isset($pageTitle))
    $pageTitle = "Ads Manager";
    $pageScript = "adsmanager";
if (!isset($pageScript))
    $pageScript = null;
?>
<?php include_once('includes/head.php'); ?>

<style>
    /* Mobile Warning Message */
    .mobile-warning {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
        justify-content: center;
        align-items: center;
        padding: 2rem;
    }
    
    .mobile-warning-content {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    
    .mobile-warning-icon {
        font-size: 4rem;
        color: #667eea;
        margin-bottom: 1rem;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .mobile-warning h3 {
        color: #1e293b;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }
    
    .mobile-warning p {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 0;
    }
    
    @media (max-width: 991px) {
        .mobile-warning {
            display: flex !important;
        }
        
        .nk-content-body {
            display: none !important;
        }
    }
</style>

<body class="nk-body bg-white npc-default has-aside ">
    <!-- Mobile Warning -->
    <div class="mobile-warning">
        <div class="mobile-warning-content">
            <div class="mobile-warning-icon">
                <em class="icon ni ni-monitor"></em>
            </div>
            <h3>Desktop Only</h3>
            <p>This page is optimized for desktop viewing. Please use a desktop or laptop computer to access the Ads Manager.</p>
            <p class="mt-3"><small class="text-muted">Minimum screen width: 992px</small></p>
        </div>
    </div>
    
    <div class="nk-app-root">
        <div class="nk-main ">
            <div class="nk-wrap ">
                <?php include_once('includes/header.php'); ?>
                <div class="nk-content ">
                    <div class="container wide-xl">
                        <div class="nk-content-inner">
                            <?php include_once('includes/sidebar.php'); ?>
                            <div class="nk-content-body">
                                <div class="nk-content-wrap">
                                    <div class="nk-block-head">
                                        <div class="nk-block-between g-3 flex-column flex-sm-row">
                                            <div class="nk-block-head-content">
                                                <h3 class="nk-block-title page-title">Ads Manager</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Manage marquee text, banners, carousel items, and promotional ads</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <button type="button" class="btn btn-primary" id="createAdBtn">
                                                    <em class="icon ni ni-plus"></em><span class="d-none d-sm-inline">Create Ad</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Ad Type Tabs -->
                                    <div class="nk-block">
                                        <ul class="nav nav-tabs nav-tabs-s2" role="tablist" style="flex-wrap: wrap;">
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link active" data-bs-toggle="tab" href="#tabMarquee" role="tab" aria-selected="true">
                                                    <em class="icon ni ni-text"></em><span class="d-none d-sm-inline">Marquee</span>
                                                </a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" data-bs-toggle="tab" href="#tabBanner" role="tab" aria-selected="false">
                                                    <em class="icon ni ni-img"></em><span class="d-none d-sm-inline">Banners</span>
                                                </a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" data-bs-toggle="tab" href="#tabCarousel" role="tab" aria-selected="false">
                                                    <em class="icon ni ni-view-grid-sq"></em><span class="d-none d-sm-inline">Carousel</span>
                                                </a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" data-bs-toggle="tab" href="#tabAllAds" role="tab" aria-selected="false">
                                                    <em class="icon ni ni-list"></em><span class="d-none d-sm-inline">All Ads</span>
                                                </a>
                                            </li>
                                        </ul>

                                        <div class="tab-content">
                                            <!-- Marquee Tab -->
                                            <div class="tab-pane active" id="tabMarquee" role="tabpanel">
                                                <div class="card card-bordered mt-3">
                                                    <div class="card-inner">
                                                        <div class="nk-block-head-content mb-3">
                                                            <h5 class="title">Marquee Text Banner</h5>
                                                            <p class="text-soft">Only one marquee can be active at a time. This scrolls at the top of the mobile app.</p>
                                                        </div>
                                                        <div id="marquee-content">
                                                            <div class="text-center py-4">
                                                                <div class="spinner-border text-primary" role="status">
                                                                    <span class="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Banner Tab -->
                                            <div class="tab-pane" id="tabBanner" role="tabpanel">
                                                <div class="card card-bordered mt-3">
                                                    <div class="card-inner">
                                                        <div id="banner-content">
                                                            <div class="text-center py-4">
                                                                <div class="spinner-border text-primary" role="status">
                                                                    <span class="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Carousel Tab -->
                                            <div class="tab-pane" id="tabCarousel" role="tabpanel">
                                                <div class="card card-bordered mt-3">
                                                    <div class="card-inner">
                                                        <div id="carousel-content">
                                                            <div class="text-center py-4">
                                                                <div class="spinner-border text-primary" role="status">
                                                                    <span class="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- All Ads Tab -->
                                            <div class="tab-pane" id="tabAllAds" role="tabpanel">
                                                <div class="card card-bordered mt-3">
                                                    <div class="card-inner">
                                                        <div class="nk-tb-list is-separate mb-3">
                                                            <div class="nk-tb-item nk-tb-head d-none d-md-flex">
                                                                <div class="nk-tb-col"><span>Type</span></div>
                                                                <div class="nk-tb-col"><span>Title</span></div>
                                                                <div class="nk-tb-col"><span>Status</span></div>
                                                                <div class="nk-tb-col"><span>Order</span></div>
                                                                <div class="nk-tb-col"><span>Created</span></div>
                                                                <div class="nk-tb-col nk-tb-col-tools"></div>
                                                            </div>
                                                            <div id="all-ads-table"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                               <?php include_once('includes/footer.php'); ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create/Edit Ad Modal -->
    <div class="modal fade" id="adModal" tabindex="-1" aria-labelledby="adModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="adModalLabel">Create Ad</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="adForm">
                        <input type="hidden" id="adId" name="adId">
                        
                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label class="form-label" for="adType">Ad Type</label>
                                    <select class="form-select" id="adType" name="type" required>
                                        <option value="marquee">Marquee</option>
                                        <option value="banner">Banner</option>
                                        <option value="carousel">Carousel</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label class="form-label" for="adOrder">Display Order</label>
                                    <input type="number" class="form-control" id="adOrder" name="order" min="0" value="0">
                                    <div class="form-note">Lower numbers display first</div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label class="form-label" for="adTitle">Title</label>
                                    <input type="text" class="form-control" id="adTitle" name="title" required>
                                </div>
                            </div>
                            <div class="col-12" id="textFieldContainer">
                                <div class="form-group">
                                    <label class="form-label" for="adText">Text Content</label>
                                    <textarea class="form-control" id="adText" name="text" rows="3"></textarea>
                                    <div class="form-note">For marquee scrolling text</div>
                                </div>
                            </div>
                            <div class="col-12" id="imageFieldContainer">
                                <div class="form-group">
                                    <label class="form-label" for="adImage">Image URL</label>
                                    <input type="url" class="form-control" id="adImage" name="image" placeholder="https://cloudinary.com/...">
                                    <div class="form-note">Upload to Cloudinary or provide direct URL</div>
                                </div>
                                <div class="form-group mt-2">
                                    <label class="form-label">Or Upload Image</label>
                                    <div class="input-group">
                                        <input type="file" class="form-control" id="adImageFile" accept="image/*">
                                        <button type="button" class="btn btn-primary" id="uploadImageBtn">
                                            <em class="icon ni ni-upload"></em><span>Upload</span>
                                        </button>
                                    </div>
                                    <div class="progress mt-2 d-none" id="uploadProgress">
                                        <div class="progress-bar" role="progressbar" style="width: 0%" id="uploadProgressBar">0%</div>
                                    </div>
                                    <div id="uploadStatus" class="form-note mt-1"></div>
                                </div>
                                <div id="imagePreview" class="mt-2 d-none">
                                    <img id="previewImg" src="" alt="Preview" class="img-thumbnail" style="max-height: 200px;">
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label class="form-label" for="adLink">Link URL</label>
                                    <input type="url" class="form-control" id="adLink" name="link" placeholder="https://example.com or /page">
                                    <div class="form-note">Where users go when clicking the ad</div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <div class="custom-control custom-switch">
                                        <input type="checkbox" class="custom-control-input" id="adActive" name="active" checked>
                                        <label class="custom-control-label" for="adActive">Active (visible to users)</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer flex-column flex-sm-row">
                    <button type="button" class="btn btn-secondary w-100 w-sm-auto mb-2 mb-sm-0" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary w-100 w-sm-auto" id="saveAdBtn">Save Ad</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteAdModal" tabindex="-1" aria-labelledby="deleteAdModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteAdModalLabel">Delete Ad</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this ad? This action cannot be undone.</p>
                    <p class="text-muted" id="deleteAdInfo"></p>
                </div>
                <div class="modal-footer flex-column flex-sm-row">
                    <button type="button" class="btn btn-secondary w-100 w-sm-auto mb-2 mb-sm-0" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger w-100 w-sm-auto" id="confirmDeleteBtn">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Ad Details Modal -->
    <div class="modal fade" id="adDetailsModal" tabindex="-1" aria-labelledby="adDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="adDetailsModalLabel">Ad Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="adDetailsContent">
                    <!-- Content populated by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
</body>

</html>