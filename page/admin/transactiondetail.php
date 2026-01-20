<?php
if (!isset($pageTitle))
    $pageTitle = "Main Page";
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
                                                <h3 class="nk-block-title page-title">Invoice <strong
                                                        class="text-primary small">#746F5K2</strong></h3>
                                                <div class="nk-block-des text-soft">
                                                    <ul class="list-inline">
                                                        <li>Created At: <span class="text-base">18 Dec, 2019 01:02
                                                                PM</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content"><a href="history-invoice-list.html"
                                                    class="btn btn-outline-light bg-white d-none d-sm-inline-flex"><em
                                                        class="icon ni ni-arrow-left"></em><span>Back</span></a><a
                                                    href="history-invoice-list.html"
                                                    class="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"><em
                                                        class="icon ni ni-arrow-left"></em></a></div>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="invoice">
                                            <div class="invoice-action"><a
                                                    class="btn btn-icon btn-lg btn-white btn-dim btn-outline-primary"
                                                    href="subscription/invoice-print.html" target="_blank"><em
                                                        class="icon ni ni-printer-fill"></em></a></div>
                                            <div class="invoice-wrap">
                                                <div class="invoice-brand text-center">
                                                    <div class="logo-link"><img class="logo-light logo-img"
                                                            src="images/logo.png" srcset="/demo4/images/logo2x.png 2x"
                                                            alt=""><img class="logo-dark logo-img"
                                                            src="images/logo-dark.png"
                                                            srcset="/demo4/images/logo-dark2x.png 2x" alt=""></div>
                                                </div>
                                                <div class="invoice-head">
                                                    <div class="invoice-contact"><span class="overline-title">Invoice
                                                            To</span>
                                                        <div class="invoice-contact-info">
                                                            <h4 class="title">Gregory Anderson</h4>
                                                            <ul class="list-plain">
                                                                <li><em class="icon ni ni-map-pin-fill"></em><span>House
                                                                        #65, 4328 Marion Street<br>Newbury, VT
                                                                        05051</span></li>
                                                                <li><em class="icon ni ni-call-fill"></em><span>+012
                                                                        8764 556</span></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div class="invoice-desc">
                                                        <h3 class="title">Invoice</h3>
                                                        <ul class="list-plain">
                                                            <li class="invoice-id"><span>Invoice
                                                                    ID</span>:<span>66K5W3</span></li>
                                                            <li class="invoice-date"><span>Date</span>:<span>26 Jan,
                                                                    2020</span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div class="invoice-bills">
                                                    <div class="table-responsive">
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th class="w-150px">Item ID</th>
                                                                    <th class="w-60">Description</th>
                                                                    <th>Price</th>
                                                                    <th>Qty</th>
                                                                    <th>Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>24108054</td>
                                                                    <td>Dashlite - Conceptual App Dashboard - Regular
                                                                        License</td>
                                                                    <td>$40.00</td>
                                                                    <td>5</td>
                                                                    <td>$200.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>24108054</td>
                                                                    <td>6 months premium support</td>
                                                                    <td>$25.00</td>
                                                                    <td>1</td>
                                                                    <td>$25.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>23604094</td>
                                                                    <td>Invest Management Dashboard - Regular License
                                                                    </td>
                                                                    <td>$131.25</td>
                                                                    <td>1</td>
                                                                    <td>$131.25</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>23604094</td>
                                                                    <td>6 months premium support</td>
                                                                    <td>$78.75</td>
                                                                    <td>1</td>
                                                                    <td>$78.75</td>
                                                                </tr>
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td colspan="2"></td>
                                                                    <td colspan="2">Subtotal</td>
                                                                    <td>$435.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="2"></td>
                                                                    <td colspan="2">Processing fee</td>
                                                                    <td>$10.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="2"></td>
                                                                    <td colspan="2">TAX</td>
                                                                    <td>$43.50</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="2"></td>
                                                                    <td colspan="2">Grand Total</td>
                                                                    <td>$478.50</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                        <div class="nk-notes ff-italic fs-12px text-soft"> Invoice was
                                                            created on a computer and is valid without the signature and
                                                            seal. </div>
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
<!-- Mirrored from dashlite.net/demo4/history-invoice.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:07:59 GMT -->

</html>