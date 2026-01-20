<?php
if (!isset($pageTitle))
    $pageTitle = "Artisan Management";
$pageScript = "artisanmgmt";
if (!isset($pageScript))
    $pageScript = null;
?>
<?php include_once('includes/head.php'); ?>

<body class="nk-body bg-white npc-default has-aside ">
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
                                    <div class="nk-block-head nk-block-head-sm">
                                        <div class="nk-block-between">
                                            <div class="nk-block-head-content">
                                                <h3 class="nk-block-title page-title">Artisan Management</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Manage and review artisan profiles</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <div class="toggle-wrap nk-block-tools-toggle"><a href="#"
                                                        class="btn btn-icon btn-trigger toggle-expand me-n1"
                                                        data-target="pageMenu"><em
                                                            class="icon ni ni-menu-alt-r"></em></a>
                                                    <div class="toggle-expand-content" data-content="pageMenu">
                                                        <ul class="nk-block-tools g-3">
                                                            <li><a href="#" class="btn btn-white btn-outline-light"><em
                                                                        class="icon ni ni-download-cloud"></em><span>Export</span></a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <div class="col-xxl-4 col-md-4">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Total Artisans</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Total number of artisans"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="total-artisans">0</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-users" style="font-size: 2.5rem; color: #526484; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xxl-4 col-md-4">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Verified Artisans</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Number of verified artisans"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="verified-artisans">0</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-check-circle" style="font-size: 2.5rem; color: #1ee0ac; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xxl-4 col-md-4">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Unverified Artisans</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Number of unverified artisans"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="unverified-artisans">0</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-alert-circle" style="font-size: 2.5rem; color: #e85347; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="card card-bordered card-stretch">
                                            <div class="card-inner-group">
                                                <div class="card-inner position-relative card-tools-toggle">
                                                    <div class="card-title-group">
                                                        <div class="card-tools">
                                                            <div class="form-inline flex-nowrap gx-3">
                                                                <div class="form-wrap w-150px"><select
                                                                        class="form-select js-select2" data-search="on"
                                                                        data-placeholder="Filter Status" id="verification-filter">
                                                                        <option value="">All Artisans</option>
                                                                        <option value="verified">Verified</option>
                                                                        <option value="unverified">Unverified</option>
                                                                    </select></div>
                                                                <div class="form-wrap">
                                                                    <input type="date" class="form-control" id="date-from" placeholder="From Date">
                                                                </div>
                                                                <div class="form-wrap">
                                                                    <input type="date" class="form-control" id="date-to" placeholder="To Date">
                                                                </div>
                                                                <div class="form-wrap">
                                                                    <button class="btn btn-secondary" id="clear-date-filter" title="Clear date filter">
                                                                        <em class="icon ni ni-cross"></em>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="card-tools me-n1">
                                                            <ul class="btn-toolbar gx-1">
                                                                <li><a href="#"
                                                                        class="btn btn-icon search-toggle toggle-search"
                                                                        data-target="search"><em
                                                                            class="icon ni ni-search"></em></a></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div class="card-search search-wrap" data-search="search">
                                                        <div class="card-body">
                                                            <div class="search-content"><a href="#"
                                                                    class="search-back btn btn-icon toggle-search"
                                                                    data-target="search"><em
                                                                        class="icon ni ni-arrow-left"></em></a><input
                                                                    type="text" id="artisan-search-input"
                                                                    class="form-control border-transparent form-focus-none"
                                                                    placeholder="Search by name or skills..."><button
                                                                    class="search-submit btn btn-icon"><em
                                                                        class="icon ni ni-search"></em></button></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-inner p-0">
                                                    <table class="nk-tb-list nk-tb-ulist is-compact">
                                                        <thead>
                                                            <tr class="nk-tb-item nk-tb-head">
                                                                <th class="nk-tb-col"><span class="sub-text">Artisan</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span class="sub-text">Skills</span></th>
                                                                <th class="nk-tb-col tb-col-lg"><span class="sub-text">Location</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span class="sub-text">Rating</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span class="sub-text">Verification</span></th>
                                                                <th class="nk-tb-col nk-tb-col-tools text-end"><span class="sub-text">Actions</span></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="artisan-tbody">
                                                            <!-- Artisan rows will be populated by JavaScript -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div class="card-inner">
                                                    <div class="nk-block-between-md g-3">
                                                        <div class="g">
                                                            <ul id="artisan-pagination" class="pagination justify-content-center justify-content-md-start">
                                                                <!-- pagination rendered by JS -->
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Artisan Profile Review Modal -->
                                    <div class="modal fade" id="artisanReviewModal" tabindex="-1" aria-labelledby="artisanReviewModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered modal-lg">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="artisanReviewModalLabel">Artisan Profile Review</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body" id="artisan-review-content">
                                                    <!-- Populated by JS -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Verify Artisan Confirmation Modal -->
                                    <div class="modal fade" id="verifyArtisanModal" tabindex="-1" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header text-white" style="background: linear-gradient(135deg, #d65c74 0%, #a20025 100%);">
                                                    <h5 class="modal-title"><em class="icon ni ni-check-circle me-2"></em>Verify Artisan</h5>
                                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p class="text-center mb-3">
                                                        <em class="icon ni ni-check-circle" style="font-size: 3rem; color: #d65c74;"></em>
                                                    </p>
                                                    <p class="text-center">Are you sure you want to verify this artisan?</p>
                                                    <p class="text-muted small text-center">This will set the artisan as verified and enable them to appear in public searches.</p>
                                                </div>
                                                <div class="modal-footer justify-content-center">
                                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                                    <button type="button" id="confirm-verify-artisan" class="btn text-white" style="background: linear-gradient(135deg, #d65c74 0%, #a20025 100%);">
                                                        <em class="icon ni ni-check-circle"></em> Verify Artisan
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Unverify Artisan Confirmation Modal -->
                                    <div class="modal fade" id="unverifyArtisanModal" tabindex="-1" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header text-white" style="background: linear-gradient(135deg, #a20025 0%, #000000 100%);">
                                                    <h5 class="modal-title"><em class="icon ni ni-cross-circle me-2"></em>Revoke Verification</h5>
                                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p class="text-center mb-3">
                                                        <em class="icon ni ni-alert-circle" style="font-size: 3rem; color: #a20025;"></em>
                                                    </p>
                                                    <p class="text-center">Are you sure you want to revoke verification for this artisan?</p>
                                                    <p class="text-muted small text-center">This will remove their verified status and hide them from public searches.</p>
                                                </div>
                                                <div class="modal-footer justify-content-center">
                                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                                    <button type="button" id="confirm-unverify-artisan" class="btn text-white" style="background: linear-gradient(135deg, #a20025 0%, #000000 100%);">
                                                        <em class="icon ni ni-cross-circle"></em> Revoke Verification
                                                    </button>
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
    <?php include_once('includes/scripts.php'); ?>
</body>

</html>
                                                              