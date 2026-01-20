<?php
if (!isset($pageTitle))
    $pageTitle = "Admin Management";
    $pageScript = "adminmgmt";
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
                    <div class="container-fluid">
                        <div class="nk-content-inner">
                            <?php include_once('includes/sidebar.php'); ?>
                            <div class="nk-content-body">
                                <div class="nk-content-wrap">
                                    <!-- Page Header -->
                                    <div class="nk-block-head nk-block-head-sm">
                                        <div class="nk-block-between">
                                            <div class="nk-block-head-content">
                                                <h3 class="nk-block-title page-title">Admin Management</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Manage admin accounts and permissions</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAdminModal">
                                                    <em class="icon ni ni-plus"></em><span>Add Admin</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Admin Stats Cards -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <div class="col-md-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="subtitle">Total Admins</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Total admin accounts"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="total-admins">0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="subtitle">Recently Added</h6>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="recent-admins">0</span>
                                                                <span class="sub-title"><span class="change down text-muted"><em class="icon ni ni-calendar"></em>Last 7 days</span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Admins List -->
                                    <div class="nk-block">
                                        <div class="card card-bordered card-stretch">
                                            <div class="card-inner-group">
                                                <div class="card-inner position-relative card-tools-toggle">
                                                    <div class="card-title-group">
                                                        <div class="card-tools">
                                                            <div class="form-inline flex-nowrap gx-3">
                                                                <div class="form-wrap w-150px">
                                                                    <select class="form-select js-select2" id="role-filter" data-search="off" data-placeholder="All Roles">
                                                                        <option value="">All Roles</option>
                                                                        <option value="admin">Admin</option>
                                                                        <option value="super-admin">Super Admin</option>
                                                                    </select>
                                                                </div>
                                                                <div class="btn-wrap">
                                                                    <span class="d-none d-md-block">
                                                                        <button class="btn btn-dim btn-outline-light" id="refreshBtn">
                                                                            <em class="icon ni ni-reload"></em><span>Refresh</span>
                                                                        </button>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="card-search search-wrap" data-search="search">
                                                            <div class="card-body">
                                                                <div class="search-content">
                                                                    <button class="search-back btn btn-icon toggle-search" data-target="search"><em class="icon ni ni-arrow-left"></em></button>
                                                                    <input type="text" class="form-control border-transparent form-focus-none" id="searchInput" placeholder="Search by name or email">
                                                                    <button class="search-submit btn btn-icon"><em class="icon ni ni-search"></em></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-inner p-0">
                                                    <div class="nk-tb-list nk-tb-ulist" id="admin-table">
                                                        <div class="nk-tb-item nk-tb-head">
                                                            <div class="nk-tb-col"><span class="sub-text">Admin</span></div>
                                                            <div class="nk-tb-col tb-col-mb"><span class="sub-text">Email</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Role</span></div>
                                                            <div class="nk-tb-col nk-tb-col-tools text-end">
                                                                <span class="sub-text">Action</span>
                                                            </div>
                                                        </div>
                                                        <!-- Admin rows will be inserted here -->
                                                    </div>
                                                </div>
                                                <div class="card-inner">
                                                    <div class="nk-block-between-md g-3">
                                                        <div class="g">
                                                            <div id="admin-pagination"></div>
                                                        </div>
                                                        <div class="g">
                                                            <div class="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                                                                <div>Page</div>
                                                                <div>
                                                                    <select class="form-select form-select-sm js-select2" id="page-select" data-search="on" data-dropdown="xs center">
                                                                        <option value="1">1</option>
                                                                    </select>
                                                                </div>
                                                                <div>OF <span id="total-pages">1</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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

    <!-- Add Admin Modal -->
    <div class="modal fade" id="addAdminModal" tabindex="-1" aria-labelledby="addAdminModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addAdminModalLabel">Add New Admin</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="addAdminForm">
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label class="form-label" for="admin-name">Full Name</label>
                            <input type="text" class="form-control" id="admin-name" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label" for="admin-email">Email</label>
                            <input type="email" class="form-control" id="admin-email" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label" for="admin-password">Password</label>
                            <input type="password" class="form-control" id="admin-password" required minlength="6">
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label" for="admin-role">Role</label>
                            <select class="form-select" id="admin-role">
                                <option value="admin">Admin</option>
                                <option value="super-admin">Super Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Permissions</label>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="perm-users" value="manageUsers" checked>
                                <label class="custom-control-label" for="perm-users">Manage Users</label>
                            </div>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="perm-artisans" value="verifyArtisans" checked>
                                <label class="custom-control-label" for="perm-artisans">Verify Artisans</label>
                            </div>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="perm-jobs" value="manageJobs" checked>
                                <label class="custom-control-label" for="perm-jobs">Manage Jobs</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Admin</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Edit Admin Modal -->
    <div class="modal fade" id="editAdminModal" tabindex="-1" aria-labelledby="editAdminModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editAdminModalLabel">Edit Admin</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="editAdminForm">
                    <input type="hidden" id="edit-admin-id">
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label class="form-label" for="edit-admin-name">Full Name</label>
                            <input type="text" class="form-control" id="edit-admin-name" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label" for="edit-admin-email">Email</label>
                            <input type="email" class="form-control" id="edit-admin-email" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label" for="edit-admin-role">Role</label>
                            <select class="form-select" id="edit-admin-role">
                                <option value="admin">Admin</option>
                                <option value="super-admin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Admin</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- View Admin Details Modal -->
    <div class="modal fade" id="viewAdminModal" tabindex="-1" aria-labelledby="viewAdminModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewAdminModalLabel">Admin Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="viewAdminContent">
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteAdminModal" tabindex="-1" aria-labelledby="deleteAdminModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteAdminModalLabel">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <em class="icon ni ni-cross-circle-fill text-danger" style="font-size: 3rem;"></em>
                        <h5 class="mt-3">Are you sure?</h5>
                        <p class="text-muted">Do you really want to delete this admin account? This action cannot be undone.</p>
                        <div class="alert alert-warning mt-3" id="deleteAdminInfo">
                            <!-- Admin info will be displayed here -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete Admin</button>
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
</body>

</html>