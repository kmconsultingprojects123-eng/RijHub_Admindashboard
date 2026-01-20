<style>
    .nk-aside {
        padding: 0 !important;
        margin: 0 !important;
        position: fixed !important;
        top: 80px !important;
        left: 0 !important;
        height: calc(100vh - 80px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        z-index: 900 !important;
        width: 280px !important;
    }
    /* Custom scrollbar styling */
    .nk-aside::-webkit-scrollbar {
        width: 6px;
    }
    .nk-aside::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
    }
    .nk-aside::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
    }
    .nk-aside::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
    }
    .nk-aside .nk-sidebar-menu {
        padding: 20px 0 !important;
        margin: 0 !important;
        overflow-y: visible !important;
        height: auto !important;
    }
    .nk-aside .nk-menu {
        padding: 0 !important;
        margin: 0 !important;
    }
    .nk-aside .nk-menu-item {
        margin: 0 !important;
    }
    .nk-aside .nk-menu-link {
        padding: 12px 20px !important;
    }
    .nk-aside .nk-menu-sub .nk-menu-link {
        padding: 10px 20px 10px 50px !important;
    }
    .nk-aside .nk-menu-link,
    .nk-aside .nk-menu-text,
    .nk-aside .nk-menu-icon,
    .nk-aside .nk-menu-icon em,
    .nk-aside .overline-title,
    .nk-aside .nk-menu-badge {
        color: white !important;
    }
    .nk-aside .nk-menu-link:hover,
    .nk-aside .nk-menu-link:focus {
        color: white !important;
        background-color: rgba(255, 255, 255, 0.1) !important;
    }
    .nk-aside .nk-menu-link {
        display: flex !important;
        align-items: center !important;
    }
    .nk-aside .nk-menu-heading {
        padding: 20px 20px 10px 20px !important;
        margin: 0 !important;
    }
    .nk-aside-close {
        background-color: rgb(162, 0, 37) !important;
    }
    /* Push main content to the right */
    body.has-aside .nk-content {
        margin-left: 280px !important;
        padding-left: 20px !important;
    }
    body.has-aside .nk-content-inner {
        margin-left: 0 !important;
    }
    body.has-aside .nk-content-body {
        margin-left: 0 !important;
    }
    /* Adjust container */
    body.has-aside .container,
    body.has-aside .container-fluid,
    body.has-aside .container-lg,
    body.has-aside .container-xl,
    body.has-aside .wide-xl {
        margin-left: 0 !important;
        padding-left: 20px !important;
    }
</style>
<div class="nk-aside" data-content="sideNav" data-toggle-overlay="true" data-toggle-screen="lg" data-toggle-body="true" style="background-color: rgb(162, 0, 37);">
    <div class="nk-sidebar-menu" data-simplebar>
        <ul class="nk-menu">
            <!-- <li class="nk-menu-heading">
                <h6 class="overline-title text-primary-alt">Use-Case Concept</h6>
            </li> -->
            <!-- <li class="nk-menu-item"><a href="subscription/index.html" class="nk-menu-link" target="_blank"><span
                        class="nk-menu-icon"><em class="icon ni ni-calendar-booking"></em></span><span
                        class="nk-menu-text">Subscription - SaaS</span></a>
            </li> -->
            <li class="nk-menu-heading">
                <h6 class="overline-title text-primary-alt">Dashboards</h6>
            </li>
            <!-- <li class="nk-menu-item"><a href="index.html" class="nk-menu-link"><span class="nk-menu-icon"><em
                            class="icon ni ni-dashlite"></em></span><span class="nk-menu-text">SaaS Dashboard</span></a>
            </li> -->
            <li class="nk-menu-item"><a href="index-analytics.html" class="nk-menu-link"><span class="nk-menu-icon"><em
                            class="icon ni ni-growth"></em></span><span class="nk-menu-text">Dashboard</span></a>
            </li>
            <li class="nk-menu-heading">
                <h6 class="overline-title text-primary-alt">Pre-Built Pages</h6>
            </li>
            <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-users"></em></span><span
                        class="nk-menu-text">User Management</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="/aa/usersmgmt/" class="nk-menu-link"><span
                                class="nk-menu-text">Users</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/artisansmgmt/" class="nk-menu-link"><span
                                class="nk-menu-text">Artisans</span></a></li>
                </ul>
            </li>
            <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-card-view"></em></span><span class="nk-menu-text">Services</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="user-list-regular.html" class="nk-menu-link"><span
                                class="nk-menu-text">service management</span></a></li>
                    <li class="nk-menu-item"><a href="user-list-compact.html" class="nk-menu-link"><span
                                class="nk-menu-text">service lists</span></a></li>
                    <!-- <li class="nk-menu-item"><a href="user-details-regular.html" class="nk-menu-link"><span
                                class="nk-menu-text">User Details -
                                Regular</span></a></li>
                    <li class="nk-menu-item"><a href="user-profile-regular.html" class="nk-menu-link"><span
                                class="nk-menu-text">User Profile -
                                Regular</span></a></li>
                    <li class="nk-menu-item"><a href="user-card.html" class="nk-menu-link"><span
                                class="nk-menu-text">User Contact -
                                Card</span></a></li> -->
                </ul>
            </li>
            <li class="nk-menu-item has-sub"><a href="" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-tranx"></em></span><span 
                        class="nk-menu-text">Transactions</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="/aa/transactionmgmt/" class="nk-menu-link"><span
                                class="nk-menu-text">Transaction Mgt.</span></a></li>
                    <!-- <li class="nk-menu-item"><a href="customer-details.html" class="nk-menu-link"><span
                                class="nk-menu-text"></span></a></li> -->
                </ul>
            </li>
            <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-briefcase"></em></span><span class="nk-menu-text">Jobs</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="/aa/jobcategorymgmt/" class="nk-menu-link"><span
                                class="nk-menu-text">Job Categories</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/jobmgmt/" class="nk-menu-link"><span
                                class="nk-menu-text">Jobs</span></a></li>
                </ul>
            </li>
            <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-calendar-booking"></em></span><span class="nk-menu-text">Bookings Management</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="/aa/bookings-overview/" class="nk-menu-link"><span
                                class="nk-menu-text">All Bookings Overview</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/quotes-overview/" class="nk-menu-link"><span
                                class="nk-menu-text">All Quotes Overview</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/direct-hire-monitoring/" class="nk-menu-link"><span
                                class="nk-menu-text">Direct Hire Monitoring</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/job-marketplace-activity/" class="nk-menu-link"><span
                                class="nk-menu-text">Job Marketplace Activity</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/active-job-bids/" class="nk-menu-link"><span
                                class="nk-menu-text">Active Job Bids</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/accepted-deals/" class="nk-menu-link"><span
                                class="nk-menu-text">Accepted Deals</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/artisan-performance/" class="nk-menu-link"><span
                                class="nk-menu-text">Artisan Performance</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/customer-activity/" class="nk-menu-link"><span
                                class="nk-menu-text">Customer Activity</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/booking-investigation/" class="nk-menu-link"><span
                                class="nk-menu-text">Booking Investigation</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/job-bid-analysis/" class="nk-menu-link"><span
                                class="nk-menu-text">Job Bid Analysis</span></a></li>
                    <li class="nk-menu-item"><a href="/aa/all-jobs-overview/" class="nk-menu-link"><span
                                class="nk-menu-text">All Jobs Overview</span></a></li>
                </ul>
            </li>
            <!-- <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-card-view"></em></span><span
                        class="nk-menu-text">Products</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="product-list.html" class="nk-menu-link"><span
                                class="nk-menu-text">Product
                                List</span></a></li>
                    <li class="nk-menu-item"><a href="product-card.html" class="nk-menu-link"><span
                                class="nk-menu-text">Product
                                Card</span></a></li>
                    <li class="nk-menu-item"><a href="product-details.html" class="nk-menu-link"><span
                                class="nk-menu-text">Product
                                Details</span></a></li>
                </ul>
            </li> -->
            <!-- <li class="nk-menu-item"><a href="pricing-table.html" class="nk-menu-link"><span class="nk-menu-icon"><em
                            class="icon ni ni-view-col"></em></span><span class="nk-menu-text">Pricing Table</span></a>
            </li> -->
            <!-- <li class="nk-menu-item"><a href="gallery.html" class="nk-menu-link"><span class="nk-menu-icon"><em
                            class="icon ni ni-img"></em></span><span class="nk-menu-text">Image Gallery</span></a></li> -->
            <!-- <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-help-alt"></em></span><span
                        class="nk-menu-text">Support & Ticket</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="support-kb.html" class="nk-menu-link"><span
                                class="nk-menu-text">Support -
                                KB</span></a></li>
                    <li class="nk-menu-item"><a href="support-kb-topics.html" class="nk-menu-link"><span
                                class="nk-menu-text">Support - KB
                                Topic</span></a></li>
                    <li class="nk-menu-item"><a href="support-kb-details.html" class="nk-menu-link"><span
                                class="nk-menu-text">Support - KB
                                Details</span></a></li>
                    <li class="nk-menu-item"><a href="ticket-list.html" class="nk-menu-link"><span
                                class="nk-menu-text">Ticket
                                List</span></a></li>
                    <li class="nk-menu-item"><a href="ticket-details.html" class="nk-menu-link"><span
                                class="nk-menu-text">Ticket
                                Details</span></a></li>
                    <li class="nk-menu-item"><a href="history-invoice.html" class="nk-menu-link"><span
                                class="nk-menu-text">Invoice
                                Detail</span></a></li>
                </ul>
            </li> -->
            <!-- <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-signin"></em></span><span class="nk-menu-text">Auth
                        Pages</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="pages/auths/auth-login.html" class="nk-menu-link"
                            target="_blank"><span class="nk-menu-text">Login / Signin</span></a></li>
                    <li class="nk-menu-item"><a href="pages/auths/auth-register.html" class="nk-menu-link"
                            target="_blank"><span class="nk-menu-text">Register / Signup</span></a></li>
                    <li class="nk-menu-item"><a href="pages/auths/auth-reset.html" class="nk-menu-link"
                            target="_blank"><span class="nk-menu-text">Forgot Password</span></a></li>
                    <li class="nk-menu-item"><a href="pages/auths/auth-success.html" class="nk-menu-link"
                            target="_blank"><span class="nk-menu-text">Success / Confirm</span></a></li>
                    <li class="nk-menu-item"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                                class="nk-menu-text">Classic Version - v2</span></a>
                        <ul class="nk-menu-sub">
                            <li class="nk-menu-item"><a href="pages/auths/auth-login-v2.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Login / Signin</span></a></li>
                            <li class="nk-menu-item"><a href="pages/auths/auth-register-v2.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Register / Signup</span></a>
                            </li>
                            <li class="nk-menu-item"><a href="pages/auths/auth-reset-v2.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Forgot Password</span></a></li>
                            <li class="nk-menu-item"><a href="pages/auths/auth-success-v2.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Success / Confirm</span></a>
                            </li>
                        </ul>
                    </li>
                    <li class="nk-menu-item"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                                class="nk-menu-text">No Slider Version - v3</span></a>
                        <ul class="nk-menu-sub">
                            <li class="nk-menu-item"><a href="pages/auths/auth-login-v3.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Login / Signin</span></a></li>
                            <li class="nk-menu-item"><a href="pages/auths/auth-register-v3.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Register / Signup</span></a>
                            </li>
                            <li class="nk-menu-item"><a href="pages/auths/auth-reset-v3.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Forgot Password</span></a></li>
                            <li class="nk-menu-item"><a href="pages/auths/auth-success-v3.html" class="nk-menu-link"
                                    target="_blank"><span class="nk-menu-text">Success / Confirm</span></a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-files"></em></span><span class="nk-menu-text">Error
                        Pages</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="pages/errors/404-classic.html" target="_blank"
                            class="nk-menu-link"><span class="nk-menu-text">404 Classic</span></a></li>
                    <li class="nk-menu-item"><a href="pages/errors/504-classic.html" target="_blank"
                            class="nk-menu-link"><span class="nk-menu-text">504 Classic</span></a></li>
                    <li class="nk-menu-item"><a href="pages/errors/404-s1.html" target="_blank"
                            class="nk-menu-link"><span class="nk-menu-text">404 Modern</span></a></li>
                    <li class="nk-menu-item"><a href="pages/errors/504-s1.html" target="_blank"
                            class="nk-menu-link"><span class="nk-menu-text">504 Modern</span></a></li>
                </ul>
            </li> -->
            <!-- <li class="nk-menu-item has-sub"><a href="#" class="nk-menu-link nk-menu-toggle"><span
                        class="nk-menu-icon"><em class="icon ni ni-files"></em></span><span class="nk-menu-text">Other
                        Pages</span></a>
                <ul class="nk-menu-sub">
                    <li class="nk-menu-item"><a href="_blank.html" class="nk-menu-link"><span class="nk-menu-text">Blank
                                /
                                Startup</span></a></li>
                    <li class="nk-menu-item"><a href="pages/pricing.html" class="nk-menu-link"><span
                                class="nk-menu-text">Pricing
                                Plan</span></a></li>
                    <li class="nk-menu-item"><a href="pages/faqs.html" class="nk-menu-link"><span
                                class="nk-menu-text">Faqs /
                                Help</span></a></li>
                    <li class="nk-menu-item"><a href="pages/contact.html" class="nk-menu-link"><span
                                class="nk-menu-text">Contact</span></a></li>
                    <li class="nk-menu-item"><a href="pages/terms-policy.html" class="nk-menu-link"><span
                                class="nk-menu-text">Terms /
                                Policy</span></a></li>
                    <li class="nk-menu-item"><a href="pages/regular-v1.html" class="nk-menu-link"><span
                                class="nk-menu-text">Regular Page -
                                v1</span></a></li>
                    <li class="nk-menu-item"><a href="pages/regular-v2.html" class="nk-menu-link"><span
                                class="nk-menu-text">Regular Page -
                                v2</span></a></li>
                </ul>
            </li> -->
            <li class="nk-menu-heading">
                <h6 class="overline-title text-primary-alt">Auth</h6>
            </li>
            <li class="nk-menu-item"><a href="email-templates.html" class="nk-menu-link"><span class="nk-menu-icon"><em
                            class="icon ni ni-text-rich"></em></span><span class="nk-menu-text">Admin Management</span></a></li>
            <li class="nk-menu-item"><a href="components.html" class="nk-menu-link"><span class="nk-menu-icon"><em
                            class="icon ni ni-layers"></em></span><span class="nk-menu-text">Log Out</span></a>
            </li>
        </ul>
    </div>
    <div class="nk-aside-close"><a href="#" class="toggle" data-target="sideNav"><em class="icon ni ni-cross"></em></a>
    </div>
</div>