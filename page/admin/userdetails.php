<?php
if (!isset($pageTitle))
    $pageTitle = "User Details";
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
                                                <h3 class="nk-block-title page-title">Users / <strong
                                                        class="text-primary small">Abu Bin Ishtiyak</strong></h3>
                                                <div class="nk-block-des text-soft">
                                                    <ul class="list-inline">
                                                        <li>User ID: <span class="text-base">UD003054</span></li>
                                                        <li>Last Login: <span class="text-base">15 Feb, 2019 01:02
                                                                PM</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content"><a href="user-list-regular.html"
                                                    class="btn btn-outline-light bg-white d-none d-sm-inline-flex"><em
                                                        class="icon ni ni-arrow-left"></em><span>Back</span></a><a
                                                    href="user-list-regular.html"
                                                    class="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"><em
                                                        class="icon ni ni-arrow-left"></em></a></div>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="card card-bordered">
                                            <ul class="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                                                <li class="nav-item"><a class="nav-link active" href="#"><em
                                                            class="icon ni ni-user-circle"></em><span>Personal</span></a>
                                                </li>
                                                <li class="nav-item"><a class="nav-link" href="#"><em
                                                            class="icon ni ni-repeat"></em><span>Transactions</span></a>
                                                </li>
                                                <li class="nav-item"><a class="nav-link" href="#"><em
                                                            class="icon ni ni-file-text"></em><span>Documents</span></a>
                                                </li>
                                                <li class="nav-item"><a class="nav-link" href="#"><em
                                                            class="icon ni ni-bell"></em><span>Notifications</span></a>
                                                </li>
                                                <li class="nav-item"><a class="nav-link" href="#"><em
                                                            class="icon ni ni-activity"></em><span>Activities</span></a>
                                                </li>
                                            </ul>
                                            <div class="card-inner">
                                                <div class="nk-block">
                                                    <div class="nk-block-head">
                                                        <h5 class="title">Personal Information</h5>
                                                        <p>Basic info, like your name and address, that you use on Nio
                                                            Platform.</p>
                                                    </div>
                                                    <div class="profile-ud-list">
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Title</span><span
                                                                    class="profile-ud-value">Mr.</span></div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Full Name</span><span
                                                                    class="profile-ud-value">Abu Bin Ishtiyak</span>
                                                            </div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Date of Birth</span><span
                                                                    class="profile-ud-value">10 Aug, 1980</span></div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Surname</span><span
                                                                    class="profile-ud-value">IO</span></div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Mobile Number</span><span
                                                                    class="profile-ud-value">01713040400</span></div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Email Address</span><span
                                                                    class="profile-ud-value">info@softnio.com</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="nk-block">
                                                    <div class="nk-block-head nk-block-head-line">
                                                        <h6 class="title overline-title text-base">Additional
                                                            Information</h6>
                                                    </div>
                                                    <div class="profile-ud-list">
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Joining Date</span><span
                                                                    class="profile-ud-value">08-16-2018 09:04PM</span>
                                                            </div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Reg Method</span><span
                                                                    class="profile-ud-value">Email</span></div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Country</span><span
                                                                    class="profile-ud-value">United State</span></div>
                                                        </div>
                                                        <div class="profile-ud-item">
                                                            <div class="profile-ud wider"><span
                                                                    class="profile-ud-label">Nationality</span><span
                                                                    class="profile-ud-value">United State</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="nk-divider divider md"></div>
                                                <div class="nk-block">
                                                    <div class="nk-block-head nk-block-head-sm nk-block-between">
                                                        <h5 class="title">Admin Note</h5><a href="#"
                                                            class="link link-sm">+ Add Note</a>
                                                    </div>
                                                    <div class="bq-note">
                                                        <div class="bq-note-item">
                                                            <div class="bq-note-text">
                                                                <p>Aproin at metus et dolor tincidunt feugiat eu id
                                                                    quam. Pellentesque habitant morbi tristique senectus
                                                                    et netus et malesuada fames ac turpis egestas.
                                                                    Aenean sollicitudin non nunc vel pharetra. </p>
                                                            </div>
                                                            <div class="bq-note-meta"><span class="bq-note-added">Added
                                                                    on <span class="date">November 18, 2019</span> at
                                                                    <span class="time">5:34 PM</span></span><span
                                                                    class="bq-note-sep sep">|</span><span
                                                                    class="bq-note-by">By <span>Softnio</span></span><a
                                                                    href="#" class="link link-sm link-danger">Delete
                                                                    Note</a></div>
                                                        </div>
                                                        <div class="bq-note-item">
                                                            <div class="bq-note-text">
                                                                <p>Aproin at metus et dolor tincidunt feugiat eu id
                                                                    quam. Pellentesque habitant morbi tristique senectus
                                                                    et netus et malesuada fames ac turpis egestas.
                                                                    Aenean sollicitudin non nunc vel pharetra. </p>
                                                            </div>
                                                            <div class="bq-note-meta"><span class="bq-note-added">Added
                                                                    on <span class="date">November 18, 2019</span> at
                                                                    <span class="time">5:34 PM</span></span><span
                                                                    class="bq-note-sep sep">|</span><span
                                                                    class="bq-note-by">By <span>Softnio</span></span><a
                                                                    href="#" class="link link-sm link-danger">Delete
                                                                    Note</a></div>
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
<!-- Mirrored from dashlite.net/demo4/user-details-regular.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:07:57 GMT -->

</html>