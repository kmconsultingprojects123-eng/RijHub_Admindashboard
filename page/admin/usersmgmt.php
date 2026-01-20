<?php
if (!isset($pageTitle))
    $pageTitle = "Users Management";
$pageScript="usersmgmt";
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
                                                <h3 class="nk-block-title page-title"></h3>
                                                <div class="nk-block-des text-soft">
                                                    <p></p>
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
                                                            <li class="nk-block-tools-opt">
                                                                <div class="drodown"><a href="#"
                                                                        class="dropdown-toggle btn btn-icon btn-darkred"
                                                                        data-bs-toggle="dropdown"><em
                                                                            class="icon ni ni-plus"></em></a>
                                                                    <div class="dropdown-menu dropdown-menu-end">
                                                                        <ul class="link-list-opt no-bdr">
                                                                            <li><a href="#"><span>Add User</span></a>
                                                                            </li>
                                                                            <li><a href="#"><span>Add Team</span></a>
                                                                            </li>
                                                                            <li><a href="#"><span>Import User</span></a>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="nk-block nk-block-lg">
                                        <div class="nk-block-head">
                                            <div class="nk-block-head-content d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h4 class="title nk-block-title">Manage Users</h4>
                                                    <span class="sub-text">You have total 0 users.</span>
                                                </div>
                                                <div style="min-width:300px; max-width:600px;">
                                                    <div class="input-group">
                                                        <input id="user-search" type="text" class="form-control" placeholder="Search users by name, email or phone">
                                                        <button id="clear-search" class="btn btn-outline-secondary">Clear</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row g-gs" id="users-grid-wrapper">
                                            <div class="col-12">
                                                <div id="users-grid" class="row g-gs"></div>
                                                <div id="users-loader" style="text-align:center;padding:20px;display:none;">
                                                    <div class="spinner-border text-dark" role="status"><span class="visually-hidden">Loading...</span></div>
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
<!-- Mirrored from dashlite.net/demo4/user-card.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:07:57 GMT -->

</html>