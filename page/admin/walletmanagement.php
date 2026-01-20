<?php
if (!isset($pageTitle))
    $pageTitle = "Wallet Management";
    $pageScript = "walletmgmt";
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
                                    <div class="nk-block-head">
                                        <div class="nk-block-between g-3">
                                            <div class="nk-block-head-content">
                                                <h3 class="nk-block-title page-title">Wallet Management</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Monitor user wallets, track balances, and financial activity</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Summary Cards -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <div class="col-md-3 col-sm-6">
                                                <div class="card card-bordered" style="border-left: 4px solid #6576ff; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title text-white">Total Wallets</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-wallet" style="font-size: 2.5rem; opacity: 0.3;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount text-white" id="totalWallets" style="font-size: 2rem; font-weight: 600;">0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 col-sm-6">
                                                <div class="card card-bordered" style="border-left: 4px solid #1ee0ac; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white;">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title text-white">Total Balance</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-coins" style="font-size: 2.5rem; opacity: 0.3;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount text-white" id="totalBalance" style="font-size: 2rem; font-weight: 600;">₦0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 col-sm-6">
                                                <div class="card card-bordered" style="border-left: 4px solid #09c2de; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title text-white">Total Earned</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-trend-up" style="font-size: 2.5rem; opacity: 0.3;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount text-white" id="totalEarned" style="font-size: 2rem; font-weight: 600;">₦0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 col-sm-6">
                                                <div class="card card-bordered" style="border-left: 4px solid #f4bd0e; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title text-white">Total Spent</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-trend-down" style="font-size: 2.5rem; opacity: 0.3;"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount text-white" id="totalSpent" style="font-size: 2rem; font-weight: 600;">₦0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Filters and Table -->
                                    <div class="nk-block">
                                        <div class="card card-bordered">
                                            <div class="card-inner-group">
                                                <div class="card-inner p-3">
                                                    <div class="row g-3">
                                                        <div class="col-md-4">
                                                            <div class="form-group">
                                                                <div class="form-control-wrap">
                                                                    <div class="form-icon form-icon-left">
                                                                        <em class="icon ni ni-search"></em>
                                                                    </div>
                                                                    <input type="text" class="form-control" id="wallet-search-input" placeholder="Search by name, email...">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <div class="form-group">
                                                                <select class="form-select" id="roleFilter">
                                                                    <option value="">All Roles</option>
                                                                    <option value="artisan">Artisan</option>
                                                                    <option value="customer">Customer</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <div class="form-group">
                                                                <select class="form-select" id="sortByFilter">
                                                                    <option value="balance">Balance</option>
                                                                    <option value="totalEarned">Total Earned</option>
                                                                    <option value="totalSpent">Total Spent</option>
                                                                    <option value="totalJobs">Total Jobs</option>
                                                                    <option value="lastUpdated">Last Updated</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <div class="form-group">
                                                                <select class="form-select" id="sortOrderFilter">
                                                                    <option value="desc">Highest First</option>
                                                                    <option value="asc">Lowest First</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <button type="button" class="btn btn-primary w-100" id="refreshBtn">
                                                                <em class="icon ni ni-reload"></em><span>Refresh</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-inner p-0">
                                                    <div class="nk-tb-list is-separate mb-3" id="wallets-table">
                                                        <div class="nk-tb-item nk-tb-head">
                                                            <div class="nk-tb-col"><span>User</span></div>
                                                            <div class="nk-tb-col"><span>Role</span></div>
                                                            <div class="nk-tb-col"><span>Balance</span></div>
                                                            <div class="nk-tb-col"><span>Total Earned</span></div>
                                                            <div class="nk-tb-col"><span>Total Spent</span></div>
                                                            <div class="nk-tb-col"><span>Jobs</span></div>
                                                            <div class="nk-tb-col nk-tb-col-tools"></div>
                                                        </div>
                                                        <!-- Data rows populated by JavaScript -->
                                                    </div>
                                                </div>
                                                <div class="card-inner">
                                                    <div class="nk-block-between-md g-3">
                                                        <div class="g">
                                                            <ul class="pagination justify-content-center justify-content-md-start" id="wallets-pagination">
                                                                <!-- Populated by JavaScript -->
                                                            </ul>
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

    <!-- Wallet Details Modal -->
    <div class="modal fade" id="walletDetailsModal" tabindex="-1" aria-labelledby="walletDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="walletDetailsModalLabel">Wallet Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="walletDetailsContent">
                    <!-- Populated by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <!-- Transactions Modal -->
    <div class="modal fade" id="transactionsModal" tabindex="-1" aria-labelledby="transactionsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="transactionsModalLabel">Transaction History</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="transactionsContent">
                    <!-- Populated by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
</body>

</html>