<?php
if (!isset($pageTitle))
    $pageTitle = "All Quotes Overview";
    $pageScript = "quotesoverview";
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
                                                <h3 class="nk-block-title page-title">All Quotes Overview</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Complete view of all quotes (Direct Hire & Job Bids) in the system</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <div class="toggle-wrap nk-block-tools-toggle">
                                                    <a href="#" class="btn btn-icon btn-trigger toggle-expand me-n1" data-target="pageMenu"><em class="icon ni ni-more-v"></em></a>
                                                    <div class="toggle-expand-content" data-content="pageMenu">
                                                        <ul class="nk-block-tools g-3">
                                                            <li>
                                                                <div class="form-control-wrap">
                                                                    <div class="form-icon form-icon-right">
                                                                        <em class="icon ni ni-search"></em>
                                                                    </div>
                                                                    <input type="text" class="form-control" id="quote-search-input" placeholder="Search quotes...">
                                                                </div>
                                                            </li>
                                                            <li class="nk-block-tools-opt">
                                                                <div class="drodown">
                                                                    <a href="#" class="dropdown-toggle btn btn-white btn-dim btn-outline-light" data-bs-toggle="dropdown"><em class="d-none d-sm-inline icon ni ni-filter-alt"></em><span>Filtered By</span><em class="dd-indc icon ni ni-chevron-right"></em></a>
                                                                    <div class="dropdown-menu dropdown-menu-end">
                                                                        <ul class="link-list-opt no-bdr">
                                                                            <li><a href="#" data-filter="all"><span>All Quotes</span></a></li>
                                                                            <li><a href="#" data-filter="booking"><span>Direct Hire</span></a></li>
                                                                            <li><a href="#" data-filter="job"><span>Job Bids</span></a></li>
                                                                            <li class="divider"></li>
                                                                            <li><a href="#" data-filter="proposed"><span>Proposed</span></a></li>
                                                                            <li><a href="#" data-filter="accepted"><span>Accepted</span></a></li>
                                                                            <li><a href="#" data-filter="rejected"><span>Rejected</span></a></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <button class="btn btn-outline-primary" id="advancedFilterBtn">
                                                                    <em class="icon ni ni-filter"></em><span>Advanced Filter</span>
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button class="btn btn-primary" id="quoteSummaryBtn">
                                                                    <em class="icon ni ni-reports"></em><span>Quote Summary</span>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Active Job Filter Indicator -->
                                    <div id="activeJobFilter" style="display: none;" class="mb-3">
                                        <div class="alert alert-icon alert-primary alert-dismissible" role="alert" style="display: flex; align-items: center; padding: 12px 20px;">
                                            <em class="icon ni ni-filter-fill" style="font-size: 20px; margin-right: 12px;"></em>
                                            <div style="flex-grow: 1; min-width: 0;">
                                                <strong>Active Filter:</strong>
                                                <span id="activeJobFilterText" style="margin-left: 8px; display: inline-block; max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;">Filtering by job</span>
                                            </div>
                                            <button type="button" class="btn-close" id="clearJobFilter" aria-label="Clear filter" style="margin-left: 16px;"></button>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="card card-bordered card-stretch">
                                            <div class="card-inner-group">
                                                <div class="card-inner p-0">
                                                    <div class="nk-tb-list nk-tb-ulist" id="quotes-table">
                                                        <div class="nk-tb-item nk-tb-head">
                                                            <div class="nk-tb-col"><span class="sub-text">Quote ID</span></div>
                                                            <div class="nk-tb-col tb-col-mb"><span class="sub-text">Customer</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Artisan</span></div>
                                                            <div class="nk-tb-col tb-col-lg"><span class="sub-text">Type</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Total</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Status</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Created</span></div>
                                                            <div class="nk-tb-col nk-tb-col-tools text-end">
                                                                <span class="sub-text">Action</span>
                                                            </div>
                                                        </div>
                                                        <!-- Quotes will be loaded here by JS -->
                                                    </div>
                                                </div>
                                                <div class="card-inner" id="quotes-pagination">
                                                    <!-- Pagination will be loaded here -->
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

    <!-- Quote Summary Modal -->
    <div class="modal fade" id="quoteSummaryModal" tabindex="-1" aria-labelledby="quoteSummaryModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="quoteSummaryModalLabel"><em class="icon ni ni-reports me-2"></em>Quote Summary</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="quoteSummaryContent">
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3 text-muted">Loading statistics...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Jobs Filter Modal -->
    <div class="modal fade" id="jobsFilterModal" tabindex="-1" aria-labelledby="jobsFilterModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="jobsFilterModalLabel"><em class="icon ni ni-filter me-2"></em>Advanced Filters</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- Date Range Filter -->
                    <div class="card card-bordered mb-4">
                        <div class="card-body">
                            <h6 class="card-title mb-3"><em class="icon ni ni-calendar me-2"></em>Filter by Date Range</h6>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Start Date</label>
                                    <div class="form-control-wrap">
                                        <div class="form-icon form-icon-left">
                                            <em class="icon ni ni-calendar"></em>
                                        </div>
                                        <input type="date" class="form-control" id="start-date-filter" placeholder="Start Date">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">End Date</label>
                                    <div class="form-control-wrap">
                                        <div class="form-icon form-icon-left">
                                            <em class="icon ni ni-calendar"></em>
                                        </div>
                                        <input type="date" class="form-control" id="end-date-filter" placeholder="End Date">
                                    </div>
                                </div>
                                <div class="col-12">
                                    <button class="btn btn-sm btn-outline-danger" id="clearDateFilters">
                                        <em class="icon ni ni-cross"></em><span>Clear Dates</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Job Filter Section -->
                    <div class="card card-bordered">
                        <div class="card-body">
                            <h6 class="card-title mb-3"><em class="icon ni ni-briefcase me-2"></em>Filter by Job</h6>
                            <div class="mb-3">
                                <div class="form-control-wrap">
                                    <div class="form-icon form-icon-right">
                                        <em class="icon ni ni-search"></em>
                                    </div>
                                    <input type="text" class="form-control" id="job-filter-search" placeholder="Search jobs by title, location...">
                                </div>
                            </div>
                            <div id="jobsFilterContent" style="max-height: 400px; overflow-y: auto;">
                                <div class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-3 text-muted">Loading jobs...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Job Details Modal -->
    <div class="modal fade" id="jobDetailsModal" tabindex="-1" aria-labelledby="jobDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="jobDetailsModalLabel"><em class="icon ni ni-briefcase me-2"></em>Job Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="jobDetailsContent">
                    <!-- Job details will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Quote Details Modal -->
    <div class="modal fade" id="quoteDetailsModal" tabindex="-1" aria-labelledby="quoteDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="quoteDetailsModalLabel"><em class="icon ni ni-file-docs me-2"></em>Quote Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="quoteDetailsContent">
                    <!-- Quote details will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
</body>

</html>