<?php
if (!isset($pageTitle))
    $pageTitle = "All Bookings Overview";
$pageScript = "bookingsoverview";
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
                                                <h3 class="nk-block-title page-title">All Bookings Overview</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Complete booking history with customer, artisan, quotes, and jobs</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <div class="toggle-wrap nk-block-tools-toggle">
                                                    <a href="#" class="btn btn-icon btn-trigger toggle-expand me-n1" data-target="pageMenu"><em class="icon ni ni-menu-alt-r"></em></a>
                                                    <div class="toggle-expand-content" data-content="pageMenu">
                                                        <ul class="nk-block-tools g-3">
                                                            <li>
                                                                <div class="form-control-wrap">
                                                                    <div class="form-icon form-icon-right">
                                                                        <em class="icon ni ni-search"></em>
                                                                    </div>
                                                                    <input type="text" class="form-control" id="booking-search-input" placeholder="Search bookings...">
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div class="drodown">
                                                                    <a href="#" class="dropdown-toggle btn btn-white btn-dim btn-outline-light" data-bs-toggle="dropdown">
                                                                        <em class="icon ni ni-filter-alt"></em><span>Filter</span>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-menu-end">
                                                                        <ul class="link-list-opt no-bdr">
                                                                            <li><a href="#" data-filter="all"><span>All Bookings</span></a></li>
                                                                            <li><a href="#" data-filter="pending"><span>Pending</span></a></li>
                                                                            <li><a href="#" data-filter="accepted"><span>Accepted</span></a></li>
                                                                            <li><a href="#" data-filter="in-progress"><span>In Progress</span></a></li>
                                                                            <li><a href="#" data-filter="completed"><span>Completed</span></a></li>
                                                                            <li><a href="#" data-filter="cancelled"><span>Cancelled</span></a></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <button class="btn btn-primary" id="bookingSummaryBtn">
                                                                    <em class="icon ni ni-pie"></em><span>Booking Summary</span>
                                                                </button>
                                                            </li>
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
                                                    <div class="nk-tb-list nk-tb-ulist" id="bookings-table">
                                                        <div class="nk-tb-item nk-tb-head">
                                                            <div class="nk-tb-col"><span class="sub-text">Booking ID</span></div>
                                                            <div class="nk-tb-col tb-col-mb"><span class="sub-text">Customer</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Artisan</span></div>
                                                            <div class="nk-tb-col tb-col-lg"><span class="sub-text">Service</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Price</span></div>
                                                            <div class="nk-tb-col tb-col-md"><span class="sub-text">Status</span></div>
                                                            <div class="nk-tb-col nk-tb-col-tools text-end">
                                                                <span class="sub-text">Action</span>
                                                            </div>
                                                        </div>
                                                        <!-- Bookings will be loaded here by JS -->
                                                    </div>
                                                </div>
                                                <div class="card-inner">
                                                    <ul class="pagination justify-content-center justify-content-md-start" id="bookings-pagination">
                                                        <!-- Pagination will be loaded here -->
                                                    </ul>
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

    <!-- Booking Summary Modal -->
    <div class="modal fade" id="bookingSummaryModal" tabindex="-1" aria-labelledby="bookingSummaryModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="bookingSummaryModalLabel"><em class="icon ni ni-pie me-2"></em>Booking Summary</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="bookingSummaryContent">
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

    <!-- Quotes Modal -->
    <div class="modal fade" id="quotesModal" tabindex="-1" aria-labelledby="quotesModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="quotesModalLabel"><em class="icon ni ni-file-text me-2"></em>Booking Quotes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="quotesModalContent">
                    <!-- Quotes will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Booking Details Modal -->
    <div class="modal fade" id="bookingDetailsModal" tabindex="-1" aria-labelledby="bookingDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0">
                    <h5 class="modal-title" id="bookingDetailsModalLabel">Booking Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="bookingDetailsContent">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
</body>
<!-- Mirrored from dashlite.net/demo4/history-invoice.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:07:59 GMT -->

</html>