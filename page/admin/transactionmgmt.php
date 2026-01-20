<?php
if (!isset($pageTitle))
    $pageTitle = "Transaction Management";
$pageScript = "transactionmgmt";
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
                                                <h3 class="nk-block-title page-title">Transaction Management</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>View and manage all platform transactions</p>
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
                                    <!-- Stats Cards -->
                                    <div class="nk-block">
                                        <div class="row g-gs">
                                            <div class="col-xxl-3 col-md-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Total Transactions</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Total number of transactions"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="total-transactions">0</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-tranx" style="font-size: 2.5rem; color: #526484; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xxl-3 col-md-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Total Amount</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Total transaction amount"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="total-amount">₦0.00</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-coins" style="font-size: 2.5rem; color: #816bff; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xxl-3 col-md-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Holding (Escrow)</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Amount in escrow"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="holding-amount">₦0.00</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-wallet-alt" style="font-size: 2.5rem; color: #f4bd0e; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-xxl-3 col-md-6">
                                                <div class="card card-bordered">
                                                    <div class="card-inner">
                                                        <div class="card-title-group align-start mb-2">
                                                            <div class="card-title">
                                                                <h6 class="title">Paid Out</h6>
                                                            </div>
                                                            <div class="card-tools">
                                                                <em class="card-hint icon ni ni-help-fill" data-bs-toggle="tooltip" data-bs-placement="left" title="Amount paid to artisans"></em>
                                                            </div>
                                                        </div>
                                                        <div class="align-end flex-sm-wrap g-4 flex-md-nowrap">
                                                            <div class="nk-sale-data">
                                                                <span class="amount" id="paid-amount">₦0.00</span>
                                                            </div>
                                                            <div class="nk-sales-ck ms-auto">
                                                                <em class="icon ni ni-check-circle" style="font-size: 2.5rem; color: #1ee0ac; opacity: 0.5;"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Transactions Table -->
                                    <div class="nk-block">
                                        <div class="card card-bordered card-stretch">
                                            <div class="card-inner-group">
                                                <div class="card-inner position-relative card-tools-toggle">
                                                    <div class="card-title-group">
                                                        <div class="card-tools">
                                                            <div class="form-inline flex-nowrap gx-3">
                                                                <div class="form-wrap w-150px">
                                                                    <select class="form-select js-select2" data-search="on"
                                                                        data-placeholder="Filter Status" id="status-filter">
                                                                        <option value="">All Status</option>
                                                                        <option value="pending">Pending</option>
                                                                        <option value="holding">Holding</option>
                                                                        <option value="released">Released</option>
                                                                        <option value="paid">Paid</option>
                                                                        <option value="refunded">Refunded</option>
                                                                    </select>
                                                                </div>
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
                                                    </div>
                                                </div>
                                                <div class="card-inner p-0">
                                                    <table class="table table-orders">
                                                        <thead class="tb-odr-head">
                                                            <tr class="tb-odr-item">
                                                                <th class="tb-odr-info">
                                                                    <span class="tb-odr-id">Transaction ID</span>
                                                                    <span class="tb-odr-date d-none d-md-inline-block">Date</span>
                                                                </th>
                                                                <th class="tb-odr-amount">
                                                                    <span class="tb-odr-total">Amount</span>
                                                                    <span class="tb-odr-status d-none d-md-inline-block">Status</span>
                                                                </th>
                                                                <th class="tb-odr-action">&nbsp;</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody class="tb-odr-body" id="transaction-tbody">
                                                            <!-- Transactions will be loaded here dynamically -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div class="card-inner">
                                                    <div id="transaction-pagination">
                                                        <!-- Pagination will be rendered here -->
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

    <!-- Transaction Detail Modal -->
    <div class="modal fade" id="transactionDetailModal" tabindex="-1" aria-labelledby="transactionDetailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="transactionDetailModalLabel">Transaction Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="transaction-detail-content">
                        <!-- Transaction details will be loaded here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
</body>

</html>
