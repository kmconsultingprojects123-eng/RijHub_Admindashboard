<?php
if (!isset($pageTitle))
    $pageTitle = "Registration | RijHub Admin Dashboard";
$pageScript = "register";//load specific page script
if (!isset($pageScript))
    $pageScript = null;
?>
<?php include_once('includes/head.php'); ?>


<body class="nk-body bg-white npc-default pg-auth">
    <div class="nk-app-root">
        <div class="nk-main ">
            <div class="nk-wrap nk-wrap-nosidebar">
                <div class="nk-content ">
                    <div class="nk-split nk-split-page nk-split-md">
                        <div
                            class="nk-split-content nk-block-area nk-block-area-column nk-auth-container bg-white w-lg-45">
                            <div class="nk-block nk-block-middle nk-auth-body">
                                <div class="brand-logo pb-5"><a href="/aa/public/admin/index.html"
                                        class="logo-link"><img class="logo-light logo-img logo-img-lg"
                                            src="/aa/public/admin/images/applogo.jpg"
                                            srcset="/aa/public/admin/images/applogo.jpg 2x" alt="logo"><img
                                            class="logo-dark logo-img logo-img-lg"
                                            src="/aa/public/admin/images/applogo.jpg"
                                            srcset="/aa/public/admin/images/applogo.jpg 2x" alt="logo-dark"></a></div>
                                <div class="nk-block-head">
                                    <div class="nk-block-head-content">
                                        <h5 class="nk-block-title">Register</h5>
                                        <div class="nk-block-des">
                                            <p>Create New <strong>RijHub</strong> Admin Account</p>
                                        </div>
                                    </div>
                                </div>
                                <form id="regAdminForm" action="https://dashlite.net/aa/public/admin/pages/auths/auth-success-v3.html">
                                    <div class="form-group"><label class="form-label" for="name">Name</label>
                                        <div class="form-control-wrap"><input type="text"
                                                class="form-control form-control-lg" id="name"
                                                placeholder="Enter your name"></div>
                                    </div>
                                    <div class="form-group"><label class="form-label" for="email">Email</label>
                                        <div class="form-control-wrap"><input type="text"
                                                class="form-control form-control-lg" id="email"
                                                placeholder="Enter your email address or username"></div>
                                    </div>
                                    <div class="form-group"><label class="form-label" for="password">Passcode</label>
                                        <div class="form-control-wrap"><a tabindex="-1" href="#"
                                                class="form-icon form-icon-right passcode-switch lg"
                                                data-target="password"><em
                                                    class="passcode-icon icon-show icon ni ni-eye"></em><em
                                                    class="passcode-icon icon-hide icon ni ni-eye-off"></em></a><input
                                                type="password" class="form-control form-control-lg" id="password"
                                                placeholder="Enter your passcode"></div>
                                    </div>
                                    <!-- <div class="form-group">
                                        <div class="custom-control custom-control-xs custom-checkbox"><input
                                                type="checkbox" class="custom-control-input" id="checkbox"><label
                                                class="custom-control-label" for="checkbox">I agree to Dashlite <a
                                                    tabindex="-1" href="../terms-policy.html">Privacy Policy</a> &amp;
                                                <a tabindex="-1" href="../terms-policy.html"> Terms.</a></label></div>
                                    </div> -->
                                    <div class="form-group"><button
                                            class="btn btn-lg btn-darkred btn-block">Register</button></div>
                                </form>
                                <!-- <div class="form-note-s2 pt-4"> Already have an account ? <a
                                        href="auth-login-v3.html"><strong>Sign in instead</strong></a></div> -->
                                <!-- <div class="text-center pt-4 pb-3">
                                    <h6 class="overline-title overline-title-sap"><span>OR</span></h6>
                                </div> -->
                                <!-- <ul class="nav justify-center gx-8">
                                    <li class="nav-item"><a class="link link-primary fw-normal py-2 px-3"
                                            href="#">Facebook</a></li>
                                    <li class="nav-item"><a class="link link-primary fw-normal py-2 px-3"
                                            href="#">Google</a></li>
                                </ul> -->
                            </div>
                            <div class="nk-block nk-auth-footer">
                                <div class="mt-3">
                                    <p class="text-center">&copy; 2025 <strong>RijHub</strong>. All Rights Reserved.</p>
                                </div>
                            </div>
                        </div>
                        <div class="nk-split-content nk-split-stretch bg-abstract"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php include_once('includes/scripts.php'); ?>
    <!-- Mirrored from dashlite.net/aa/public/admin/pages/auths/auth-register-v3.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:08:15 GMT -->

    </html>