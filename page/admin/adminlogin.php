<?php
if (!isset($pageTitle))
    $pageTitle = "Login | RijHub Admin Dashboard";
$pageScript = "login";//load specific page script
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
                        <div class="nk-split-content nk-block-area nk-block-area-column nk-auth-container bg-white">
                            <div class="nk-block nk-block-middle nk-auth-body">
                                <div class="brand-logo pb-5"><a href="../../index.html" class="logo-link"><img
                                            class="logo-light logo-img logo-img-lg"
                                            src="/aa/public/admin/images/applogo.jpg"
                                            srcset="/aa/public/admin/images/applogo.jpg 2x" alt="logo"><img
                                            class="logo-dark logo-img logo-img-lg"
                                            src="/aa/public/admin/images/applogo.jpg"
                                            srcset="/aa/public/admin/images/applogo.jpg 2x" alt="logo-dark"></a></div>
                                <div class="nk-block-head">
                                    <div class="nk-block-head-content">
                                        <h5 class="nk-block-title">Sign-In</h5>
                                        <div class="nk-block-des">
                                            <p>Access the <strong>RijHub</strong> panel using your email and password.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <form action="#" class="loginAdminForm">
                                    <div class="form-group">
                                        <div class="form-label-group"><label class="form-label" for="default-01">Email</label></div>
                                        <div class="form-control-wrap"><input type="text"
                                                class="form-control form-control-lg" id="email"
                                                placeholder="Enter your email address or username"></div>
                                    </div>
                                    <div class="form-group">
                                        <div class="form-label-group"><label class="form-label"
                                                for="password">Passcode</label></div>
                                        <div class="form-control-wrap"><a tabindex="-1" href="#"
                                                class="form-icon form-icon-right passcode-switch lg"
                                                data-target="password"><em
                                                    class="passcode-icon icon-show icon ni ni-eye"></em><em
                                                    class="passcode-icon icon-hide icon ni ni-eye-off"></em></a><input
                                                type="password" class="form-control form-control-lg" id="password"
                                                placeholder="Enter your passcode"></div>
                                    </div>
                                    <div class="form-group"><button class="btn btn-lg btn-darkred btn-block">Sign
                                            in</button></div>
                                </form>

                            </div>
                            <div class="nk-block nk-auth-footer">
                                <div class="mt-3 text-center">
                                    <p>&copy; 2025 <strong>RijHub</strong>. All Rights Reserved.</p>
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
    <!-- Mirrored from dashlite.net/demo4/pages/auths/auth-login-v3.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:08:15 GMT -->

    </html>