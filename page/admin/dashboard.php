<?php
if (!isset($pageTitle))
    $pageTitle = "Dashboard";
    $pageScript = "index";//load specific page script
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
                                                <h3 class="nk-block-title page-title">Platform Dashboard</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Welcome to your admin dashboard overview.</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <button type="button" class="btn btn-primary" id="refreshDashboard">
                                                    <em class="icon ni ni-reload"></em><span>Refresh</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Platform Snapshot Stats -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <!-- Active Artisans -->
                                            <div class="col-xxl-3 col-sm-6">
                                                <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
                                                    <div class="card-inner">
                                                        <div class="dashboard-loader" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                                            <div class="spinner-border text-white" role="status"></div>
                                                        </div>
                                                        <div class="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 class="text-white mb-1">Active Artisans</h6>
                                                                <h2 class="text-white mb-0" id="totalArtisans">0</h2>
                                                            </div>
                                                            <div class="nk-ecwg-ck" style="opacity: 0.3;">
                                                                <em class="icon ni ni-users" style="font-size: 3rem; color: white;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Total Customers -->
                                            <div class="col-xxl-3 col-sm-6">
                                                <div class="card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border: none;">
                                                    <div class="card-inner">
                                                        <div class="dashboard-loader" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                                            <div class="spinner-border text-white" role="status"></div>
                                                        </div>
                                                        <div class="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 class="text-white mb-1">Total Customers</h6>
                                                                <h2 class="text-white mb-0" id="totalCustomers">0</h2>
                                                            </div>
                                                            <div class="nk-ecwg-ck" style="opacity: 0.3;">
                                                                <em class="icon ni ni-user-list" style="font-size: 3rem; color: white;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Jobs Completed -->
                                            <div class="col-xxl-3 col-sm-6">
                                                <div class="card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border: none;">
                                                    <div class="card-inner">
                                                        <div class="dashboard-loader" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                                            <div class="spinner-border text-white" role="status"></div>
                                                        </div>
                                                        <div class="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 class="text-white mb-1">Jobs Completed</h6>
                                                                <h2 class="text-white mb-0" id="jobsCompleted">0</h2>
                                                            </div>
                                                            <div class="nk-ecwg-ck" style="opacity: 0.3;">
                                                                <em class="icon ni ni-check-circle" style="font-size: 3rem; color: white;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Total Revenue -->
                                            <div class="col-xxl-3 col-sm-6">
                                                <div class="card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border: none;">
                                                    <div class="card-inner">
                                                        <div class="dashboard-loader" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                                            <div class="spinner-border text-white" role="status"></div>
                                                        </div>
                                                        <div class="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 class="text-white mb-1">Total Revenue</h6>
                                                                <h2 class="text-white mb-0" id="totalRevenue">₦0</h2>
                                                            </div>
                                                            <div class="nk-ecwg-ck" style="opacity: 0.3;">
                                                                <em class="icon ni ni-coins" style="font-size: 3rem; color: white;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Secondary Stats -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <!-- Total Jobs -->
                                            <div class="col-xxl-4 col-md-6">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner">
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <div class="icon-circle bg-primary-dim" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                                                <em class="icon ni ni-briefcase" style="font-size: 1.5rem; color: #6576ff;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="d-flex justify-content-between align-items-end">
                                                            <div>
                                                                <h6 class="text-soft mb-1">Total Jobs</h6>
                                                                <h3 class="mb-0" id="totalJobs">0</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Pending Verifications -->
                                            <div class="col-xxl-4 col-md-6">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner">
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <div class="icon-circle bg-warning-dim" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                                                <em class="icon ni ni-clock" style="font-size: 1.5rem; color: #f4bd0e;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="d-flex justify-content-between align-items-end">
                                                            <div>
                                                                <h6 class="text-soft mb-1">Pending Verifications</h6>
                                                                <h3 class="mb-0" id="pendingVerifications">0</h3>
                                                            </div>
                                                            <a href="/artisanadmin/artisansmgmt" class="btn btn-sm btn-outline-warning">Review</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Platform Commission -->
                                            <div class="col-xxl-4 col-md-6">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner">
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <div class="icon-circle bg-success-dim" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                                                <em class="icon ni ni-growth" style="font-size: 1.5rem; color: #1ee0ac;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="d-flex justify-content-between align-items-end">
                                                            <div>
                                                                <h6 class="text-soft mb-1">Total Commission</h6>
                                                                <h3 class="mb-0" id="totalCommission">₦0</h3>
                                                            </div>
                                                            <a href="/artisanadmin/walletmanagement" class="btn btn-sm btn-outline-success">View</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Main Content Row -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <!-- Top Artisans -->
                                            <div class="col-xxl-6 col-md-12">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner border-bottom">
                                                        <div class="card-title-group">
                                                            <div class="card-title">
                                                                <h6 class="title">Top Artisans by Jobs</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <a href="/artisanadmin/artisansmgmt" class="link">View All</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card-inner p-0">
                                                        <div class="dashboard-loader" style="display: none; padding: 40px; text-align: center;">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div class="nk-tb-list is-separate" id="top-artisans-list">
                                                            <div class="nk-tb-item nk-tb-head">
                                                                <div class="nk-tb-col"><span>#</span></div>
                                                                <div class="nk-tb-col"><span>Artisan</span></div>
                                                                <div class="nk-tb-col text-end"><span>Jobs</span></div>
                                                            </div>
                                                            <!-- Populated by JavaScript -->
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Recent Bookings -->
                                            <div class="col-xxl-6 col-md-12">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner border-bottom">
                                                        <div class="card-title-group">
                                                            <div class="card-title">
                                                                <h6 class="title">Recent Bookings</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <a href="/artisanadmin/bookings-overview" class="link">View All</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card-inner p-0">
                                                        <div class="dashboard-loader" style="display: none; padding: 40px; text-align: center;">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div class="nk-tb-list is-separate" id="recent-bookings-list">
                                                            <div class="nk-tb-item nk-tb-head">
                                                                <div class="nk-tb-col"><span>Service</span></div>
                                                                <div class="nk-tb-col"><span>Artisan</span></div>
                                                                <div class="nk-tb-col"><span>Price</span></div>
                                                                <div class="nk-tb-col text-end"><span>Status</span></div>
                                                            </div>
                                                            <!-- Populated by JavaScript -->
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Pending Verifications & Recent Users -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <!-- Pending KYC Verifications -->
                                            <div class="col-xxl-6 col-md-12">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner border-bottom">
                                                        <div class="card-title-group">
                                                            <div class="card-title">
                                                                <h6 class="title">Pending KYC Verifications</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <a href="/artisanadmin/artisansmgmt" class="link">View All</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card-inner p-0">
                                                        <div class="dashboard-loader" style="display: none; padding: 40px; text-align: center;">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div class="nk-tb-list is-separate" id="pending-verifications-list">
                                                            <div class="nk-tb-item nk-tb-head">
                                                                <div class="nk-tb-col"><span>Artisan</span></div>
                                                                <div class="nk-tb-col"><span>Trade</span></div>
                                                                <div class="nk-tb-col"><span>Status</span></div>
                                                                <div class="nk-tb-col text-end"><span>Action</span></div>
                                                            </div>
                                                            <!-- Populated by JavaScript -->
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Recent Users -->
                                            <div class="col-xxl-6 col-md-12">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner border-bottom">
                                                        <div class="card-title-group">
                                                            <div class="card-title">
                                                                <h6 class="title">Recent Users</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <a href="/artisanadmin/usersmgmt" class="link">View All</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card-inner p-0">
                                                        <div class="dashboard-loader" style="display: none; padding: 40px; text-align: center;">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div class="nk-tb-list is-separate" id="recent-users-list">
                                                            <div class="nk-tb-item nk-tb-head">
                                                                <div class="nk-tb-col"><span>User</span></div>
                                                                <div class="nk-tb-col"><span>Role</span></div>
                                                                <div class="nk-tb-col text-end"><span>Joined</span></div>
                                                            </div>
                                                            <!-- Populated by JavaScript -->
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Recent Jobs & Quotes -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <!-- Recent Jobs -->
                                            <div class="col-xxl-6 col-md-12">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner border-bottom">
                                                        <div class="card-title-group">
                                                            <div class="card-title">
                                                                <h6 class="title">Recent Jobs Posted</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <a href="/artisanadmin/jobmgmt" class="link">View All</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card-inner p-0">
                                                        <div class="dashboard-loader" style="display: none; padding: 40px; text-align: center;">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div class="nk-tb-list is-separate" id="recent-jobs-list">
                                                            <div class="nk-tb-item nk-tb-head">
                                                                <div class="nk-tb-col"><span>Job</span></div>
                                                                <div class="nk-tb-col"><span>Category</span></div>
                                                                <div class="nk-tb-col"><span>Status</span></div>
                                                                <div class="nk-tb-col text-end"><span>Posted</span></div>
                                                            </div>
                                                            <!-- Populated by JavaScript -->
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Recent Quotes -->
                                            <div class="col-xxl-6 col-md-12">
                                                <div class="card card-bordered h-100">
                                                    <div class="card-inner border-bottom">
                                                        <div class="card-title-group">
                                                            <div class="card-title">
                                                                <h6 class="title">Recent Quotes</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <a href="/artisanadmin/quotes-overview" class="link">View All</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="card-inner p-0">
                                                        <div class="dashboard-loader" style="display: none; padding: 40px; text-align: center;">
                                                            <div class="spinner-border text-primary" role="status"></div>
                                                        </div>
                                                        <div class="nk-tb-list is-separate" id="recent-quotes-list">
                                                            <div class="nk-tb-item nk-tb-head">
                                                                <div class="nk-tb-col"><span>From</span></div>
                                                                <div class="nk-tb-col"><span>Amount</span></div>
                                                                <div class="nk-tb-col"><span>Status</span></div>
                                                                <div class="nk-tb-col text-end"><span>Date</span></div>
                                                            </div>
                                                            <!-- Populated by JavaScript -->
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

    <?php include_once('includes/scripts.php'); ?>
</body>

</html>
