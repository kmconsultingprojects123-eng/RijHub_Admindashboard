<?php
if (!isset($pageTitle))
    $pageTitle = "Main Page";
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
                                <div class="brand-logo pb-5"><a href="../../index.html" class="logo-link"><img
                                            class="logo-light logo-img logo-img-lg" src="../../images/logo.png"
                                            srcset="/demo4/images/logo2x.png 2x" alt="logo"><img
                                            class="logo-dark logo-img logo-img-lg" src="../../images/logo-dark.png"
                                            srcset="/demo4/images/logo-dark2x.png 2x" alt="logo-dark"></a></div>
                                <div class="nk-block-head">
                                    <div class="nk-block-head-content">
                                        <h5 class="nk-block-title">Reset password</h5>
                                        <div class="nk-block-des">
                                            <p>If you forgot your password, well, then we’ll email you instructions to
                                                reset your password.</p>
                                        </div>
                                    </div>
                                </div>
                                <form action="https://dashlite.net/demo4/pages/auths/auth-success-v3.html">
                                    <div class="form-group">
                                        <div class="form-label-group"><label class="form-label"
                                                for="default-01">Email</label><a class="link link-primary link-sm"
                                                href="#">Need Help?</a></div>
                                        <div class="form-control-wrap"><input type="text"
                                                class="form-control form-control-lg" id="default-01"
                                                placeholder="Enter your email address"></div>
                                    </div>
                                    <div class="form-group"><button class="btn btn-lg btn-primary btn-block">Send Reset
                                            Link</button></div>
                                </form>
                                <div class="form-note-s2 pt-5"><a href="auth-login-v3.html"><strong>Return to
                                            login</strong></a></div>
                            </div>
                            <div class="nk-block nk-auth-footer">
                                <div class="nk-block-between">
                                    <ul class="nav nav-sm">
                                        <li class="nav-item"><a class="link link-primary fw-normal py-2 px-3"
                                                href="#">Terms & Condition</a></li>
                                        <li class="nav-item"><a class="link link-primary fw-normal py-2 px-3"
                                                href="#">Privacy Policy</a></li>
                                        <li class="nav-item"><a class="link link-primary fw-normal py-2 px-3"
                                                href="#">Help</a></li>
                                        <li class="nav-item dropup"><a
                                                class="dropdown-toggle dropdown-indicator has-indicator link link-primary fw-normal py-2 px-3"
                                                data-bs-toggle="dropdown" data-offset="0,10"><small>English</small></a>
                                            <div class="dropdown-menu dropdown-menu-sm dropdown-menu-end">
                                                <ul class="language-list">
                                                    <li><a href="#" class="language-item"><img
                                                                src="../../images/flags/english.png" alt=""
                                                                class="language-flag"><span
                                                                class="language-name">English</span></a></li>
                                                    <li><a href="#" class="language-item"><img
                                                                src="../../images/flags/spanish.png" alt=""
                                                                class="language-flag"><span
                                                                class="language-name">Español</span></a></li>
                                                    <li><a href="#" class="language-item"><img
                                                                src="../../images/flags/french.png" alt=""
                                                                class="language-flag"><span
                                                                class="language-name">Français</span></a></li>
                                                    <li><a href="#" class="language-item"><img
                                                                src="../../images/flags/turkey.png" alt=""
                                                                class="language-flag"><span
                                                                class="language-name">Türkçe</span></a></li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div class="mt-3">
                                    <p>&copy; 2024 DashLite. All Rights Reserved.</p>
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
    
    <!-- Mirrored from dashlite.net/demo4/pages/auths/auth-reset-v3.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:08:15 GMT -->

</html>