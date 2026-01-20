<?php
if (!isset($pageTitle))
    $pageTitle = "Job Management";
$pageScript="jobmgmt";
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
                                                <h3 class="nk-block-title page-title">Job Management</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Manage all jobs and bookings</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Job Analytics Section -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <div class="col-xl-3 col-lg-6 col-sm-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Total Jobs</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Total number of jobs"></em>
                                                            </div>
                                                        </div>
                                                        <div class="card-amount">
                                                            <span class="amount" id="stat-total-jobs">0</span>
                                                        </div>
                                                        <div class="invest-data">
                                                            <div class="invest-data-amount g-2">
                                                                <div class="invest-data-history">
                                                                    <div class="title">All jobs in system</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xl-3 col-lg-6 col-sm-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Open Jobs</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Jobs currently accepting applications"></em>
                                                            </div>
                                                        </div>
                                                        <div class="card-amount">
                                                            <span class="amount text-success" id="stat-open-jobs">0</span>
                                                        </div>
                                                        <div class="invest-data">
                                                            <div class="invest-data-amount g-2">
                                                                <div class="invest-data-history">
                                                                    <div class="title">Active job listings</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xl-3 col-lg-6 col-sm-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Closed Jobs</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Jobs that are completed or cancelled"></em>
                                                            </div>
                                                        </div>
                                                        <div class="card-amount">
                                                            <span class="amount text-danger" id="stat-closed-jobs">0</span>
                                                        </div>
                                                        <div class="invest-data">
                                                            <div class="invest-data-amount g-2">
                                                                <div class="invest-data-history">
                                                                    <div class="title">Completed/Cancelled</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xl-3 col-lg-6 col-sm-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Total Budget</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Total budget across all jobs"></em>
                                                            </div>
                                                        </div>
                                                        <div class="card-amount">
                                                            <span class="amount text-primary" id="stat-avg-budget">₦0</span>
                                                        </div>
                                                        <div class="invest-data">
                                                            <div class="invest-data-amount g-2">
                                                                <div class="invest-data-history">
                                                                    <div class="title">Sum of all budgets</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Search and Filter Section -->
                                    <div class="nk-block-head nk-block-head-sm">
                                        <div class="nk-block-between">
                                            <div class="nk-block-head-content"></div>
                                            <div class="nk-block-head-content">
                                                <div class="toggle-wrap nk-block-tools-toggle"><a href="#"
                                                        class="btn btn-icon btn-trigger toggle-expand me-n1"
                                                        data-target="pageMenu"><em
                                                            class="icon ni ni-menu-alt-r"></em></a>
                                                    <div class="toggle-expand-content" data-content="pageMenu">
                                                        <ul class="nk-block-tools g-3">
                                                            <li>
                                                                <div class="form-control-wrap" style="min-width: 250px;">
                                                                    <div class="form-icon form-icon-left">
                                                                        <em class="icon ni ni-search"></em>
                                                                    </div>
                                                                    <input type="text" class="form-control" id="job-search-input" placeholder="Search jobs...">
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div class="drodown"><a href="#"
                                                                        class="dropdown-toggle btn btn-white btn-dim btn-outline-light"
                                                                        data-bs-toggle="dropdown"><em
                                                                            class="d-none d-sm-inline icon ni ni-filter-alt"></em><span>Filtered
                                                                            By</span><em
                                                                            class="dd-indc icon ni ni-chevron-right"></em></a>
                                                                    <div class="dropdown-menu dropdown-menu-end" style="width: 280px; max-width: 90vw; max-height: 70vh; overflow-y: auto;">
                                                                        <ul class="link-list-opt no-bdr">
                                                                            <li class="dropdown-header">Filter by Status</li>
                                                                            <li><a href="#" data-status=""><span>All Status</span></a></li>
                                                                            <li><a href="#" data-status="open"><span>Open</span></a></li>
                                                                            <li><a href="#" data-status="closed"><span>Closed</span></a></li>
                                                                            <li class="divider"></li>
                                                                            <li class="dropdown-header">Filter by Budget</li>
                                                                            <li class="px-3 py-2">
                                                                                <div class="form-group">
                                                                                    <label class="form-label" style="font-size: 11px;">Min Budget (₦)</label>
                                                                                    <input type="number" class="form-control form-control-sm" id="filter-budget-min" placeholder="0">
                                                                                </div>
                                                                                <div class="form-group mt-2">
                                                                                    <label class="form-label" style="font-size: 11px;">Max Budget (₦)</label>
                                                                                    <input type="number" class="form-control form-control-sm" id="filter-budget-max" placeholder="Any">
                                                                                </div>
                                                                                <button class="btn btn-sm btn-primary mt-2 w-100" id="apply-budget-filter">Apply Budget Filter</button>
                                                                                <button class="btn btn-sm btn-secondary mt-1 w-100" id="clear-budget-filter">Clear Budget</button>
                                                                            </li>
                                                                            <li class="divider"></li>
                                                                            <li class="dropdown-header">Filter by Date</li>
                                                                            <li class="px-3 py-2">
                                                                                <div class="form-group">
                                                                                    <label class="form-label" style="font-size: 11px;">From Date</label>
                                                                                    <input type="date" class="form-control form-control-sm" id="filter-date-from">
                                                                                </div>
                                                                                <div class="form-group mt-2">
                                                                                    <label class="form-label" style="font-size: 11px;">To Date</label>
                                                                                    <input type="date" class="form-control form-control-sm" id="filter-date-to">
                                                                                </div>
                                                                                <button class="btn btn-sm btn-primary mt-2 w-100" id="apply-date-filter">Apply Date Filter</button>
                                                                                <button class="btn btn-sm btn-secondary mt-1 w-100" id="clear-date-filter">Clear Date Filter</button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div class="form-control-wrap">
                                                                    <select class="form-select" id="job-status-filter">
                                                                        <option value="">All Status</option>
                                                                        <option value="open">Open</option>
                                                                        <option value="closed">Closed</option>
                                                                    </select>
                                                                </div>
                                                            </li>
                                                            <!-- <li class="nk-block-tools-opt d-none d-sm-block"><a href="#"
                                                                    class="btn btn-darkred" data-bs-toggle="modal" data-bs-target="#jobModal" role="button"><em
                                                                        class="icon ni ni-plus"></em><span>Create Job</span></a></li>
                                                            <li class="nk-block-tools-opt d-block d-sm-none"><a href="#"
                                                                    class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#jobModal" role="button"><em
                                                                        class="icon ni ni-plus"></em></a></li> -->
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="card card-bordered card-stretch">
                                            <div class="card-inner-group">
                                                <div class="card-inner p-0">
                                                    <table class="nk-tb-list nk-tb-ulist">
                                                        <thead>
                                                            <tr class="nk-tb-item nk-tb-head">
                                                                <th class="nk-tb-col"><span class="sub-text">Job Title</span></th>
                                                                <th class="nk-tb-col tb-col-xl"><span class="sub-text">Client</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span class="sub-text">Trade</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span class="sub-text">Status</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span class="sub-text">Budget</span></th>
                                                                <th class="nk-tb-col nk-tb-col-tools text-end"><span class="sub-text">Actions</span></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="job-tbody">
                                                            <!-- Job rows will be populated by JavaScript -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div class="card-inner">
                                                    <div class="nk-block-between-md g-3">
                                                        <div class="g">
                                                                <ul id="job-pagination" class="pagination justify-content-center justify-content-md-start">
                                                                <!-- pagination rendered by JS -->
                                                                </ul>
                                                        </div>
                                                        <div class="g">
                                                            <div
                                                                class="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                                                                <!-- <div>Page</div> -->
                                                                <!-- <div><select class="form-select js-select2"
                                                                        data-search="on" data-dropdown="xs center">
                                                                        <option value="page-1">1</option>
                                                                        <option value="page-2">2</option>
                                                                        <option value="page-4">4</option>
                                                                        <option value="page-5">5</option>
                                                                        <option value="page-6">6</option>
                                                                        <option value="page-7">7</option>
                                                                        <option value="page-8">8</option>
                                                                        <option value="page-9">9</option>
                                                                        <option value="page-10">10</option>
                                                                        <option value="page-11">11</option>
                                                                        <option value="page-12">12</option>
                                                                        <option value="page-13">13</option>
                                                                        <option value="page-14">14</option>
                                                                        <option value="page-15">15</option>
                                                                        <option value="page-16">16</option>
                                                                        <option value="page-17">17</option>
                                                                        <option value="page-18">18</option>
                                                                        <option value="page-19">19</option>
                                                                        <option value="page-20">20</option>
                                                                    </select></div>
                                                                <div>OF 102</div> -->
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Job Details Modal -->
                                    <div class="modal fade" id="jobDetailsModal" tabindex="-1" aria-labelledby="jobDetailsModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered modal-lg">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="jobDetailsModalLabel">Job Details</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body" id="job-details-content">
                                                    <!-- Populated by JS -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Job Edit Modal -->
                                    <div class="modal fade" id="jobEditModal" tabindex="-1" aria-labelledby="jobEditModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered modal-lg">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="jobEditModalLabel">Edit Job</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <form id="jobEditForm" novalidate>
                                                    <input type="hidden" id="job-edit-id" name="id" value="">
                                                    <div class="modal-body">
                                                        <div class="row g-3">
                                                            <div class="col-md-12">
                                                                <label for="job-edit-title" class="form-label">Job Title</label>
                                                                <input type="text" class="form-control" id="job-edit-title" name="title" required>
                                                                <div class="invalid-feedback" id="error-job-edit-title"></div>
                                                            </div>
                                                            <div class="col-md-12">
                                                                <label for="job-edit-description" class="form-label">Description</label>
                                                                <textarea class="form-control" id="job-edit-description" name="description" rows="4" required></textarea>
                                                                <div class="invalid-feedback" id="error-job-edit-description"></div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <label for="job-edit-trade" class="form-label">Trade</label>
                                                                <input type="text" class="form-control" id="job-edit-trade" name="trade">
                                                                <div class="invalid-feedback" id="error-job-edit-trade"></div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <label for="job-edit-status" class="form-label">Status</label>
                                                                <select class="form-select" id="job-edit-status" name="status">
                                                                    <option value="new">New</option>
                                                                    <option value="ongoing">Ongoing</option>
                                                                    <option value="completed">Completed</option>
                                                                    <option value="cancelled">Cancelled</option>
                                                                </select>
                                                                <div class="invalid-feedback" id="error-job-edit-status"></div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <label for="job-edit-budget" class="form-label">Budget</label>
                                                                <input type="number" class="form-control" id="job-edit-budget" name="budget" min="0">
                                                                <div class="invalid-feedback" id="error-job-edit-budget"></div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <label for="job-edit-experience" class="form-label">Experience Level</label>
                                                                <select class="form-select" id="job-edit-experience" name="experienceLevel">
                                                                    <option value="">Select Level</option>
                                                                    <option value="entry">Entry</option>
                                                                    <option value="intermediate">Intermediate</option>
                                                                    <option value="expert">Expert</option>
                                                                    <option value="senior">Senior</option>
                                                                </select>
                                                                <div class="invalid-feedback" id="error-job-edit-experience"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                                                        <button type="submit" class="btn btn-darkred">Save Changes</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Close Job Confirmation Modal -->
                                    <div class="modal fade" id="closeJobModal" tabindex="-1" aria-labelledby="closeJobModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="closeJobModalLabel">Close Job</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p>Are you sure you want to close this job?</p>
                                                    <p class="text-muted"><strong id="close-job-title"></strong></p>
                                                    <p class="text-danger"><small><em class="icon ni ni-alert-circle"></em> This action cannot be undone.</small></p>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                                                    <button type="button" class="btn btn-danger" id="confirm-close-job">Close Job</button>
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
    <?php
    // Ensure this page loads its page-specific script (public/admin/api/jobcategory.js)
    // if (!isset($pageScript) || !$pageScript) $pageScript = 'jobcategory';
    include_once('includes/scripts.php'); ?>
</body>
<!-- Mirrored from dashlite.net/demo4/project-list.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:07:57 GMT -->

</html>