<?php
if (!isset($pageTitle))
    $pageTitle = "Job Category Management";
$pageScript = "jobcategory";
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
                                                <h3 class="nk-block-title page-title">Job Category Management</h3>
                                                <div class="nk-block-des text-soft">
                                                    <p>Manage job categories and classifications</p>
                                                </div>
                                            </div>
                                            <div class="nk-block-head-content">
                                                <div class="toggle-wrap nk-block-tools-toggle"><a href="#"
                                                        class="btn btn-icon btn-trigger toggle-expand me-n1"
                                                        data-target="pageMenu"><em
                                                            class="icon ni ni-menu-alt-r"></em></a>
                                                    <div class="toggle-expand-content" data-content="pageMenu">
                                                        <ul class="nk-block-tools g-3">
                                                            <li class="nk-block-tools-opt d-none d-sm-block"><a href="#"
                                                                    class="btn btn-darkred" data-bs-toggle="modal"
                                                                    data-bs-target="#jobCategoryModal" role="button"><em
                                                                        class="icon ni ni-plus"></em><span>Create Job
                                                                        Category</span></a></li>
                                                            <li class="nk-block-tools-opt d-block d-sm-none"><a href="#"
                                                                    class="btn btn-icon btn-primary"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#jobCategoryModal" role="button"><em
                                                                        class="icon ni ni-plus"></em></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="nk-block">
                                        <div class="card card-bordered card-stretch">
                                            <div class="card-inner-group">
                                                <div class="card-inner position-relative card-tools-toggle">
                                                    <div class="card-title-group">
                                                        <div class="card-tools">
                                                            <div class="form-inline flex-nowrap gx-3">
                                                                <div class="form-wrap w-150px">
                                                                    <input type="text" class="form-control"
                                                                        id="category-search-input"
                                                                        placeholder="Search categories...">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="card-tools me-n1">
                                                            <ul class="btn-toolbar gx-1">
                                                                <li>
                                                                    <a href="#"
                                                                        class="btn btn-icon search-toggle toggle-search"
                                                                        data-target="search"><em
                                                                            class="icon ni ni-search"></em></a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div class="card-search search-wrap" data-search="search">
                                                        <div class="card-body">
                                                            <div class="search-content">
                                                                <a href="#"
                                                                    class="search-back btn btn-icon toggle-search"
                                                                    data-target="search"><em
                                                                        class="icon ni ni-arrow-left"></em></a>
                                                                <input type="text"
                                                                    class="form-control border-transparent form-focus-none"
                                                                    id="category-search-input-mobile"
                                                                    placeholder="Search categories...">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-inner p-0">
                                                    <table class="nk-tb-list nk-tb-ulist">
                                                        <thead>
                                                            <tr class="nk-tb-item nk-tb-head">
                                                                <th class="nk-tb-col"><span class="sub-text">Name</span>
                                                                </th>
                                                                <th class="nk-tb-col tb-col-xl"><span
                                                                        class="sub-text">Slug</span></th>
                                                                <th class="nk-tb-col tb-col-xl"><span
                                                                        class="sub-text">Description</span></th>
                                                                <th class="nk-tb-col tb-col-md"><span
                                                                        class="sub-text">Created At</span></th>
                                                                <th class="nk-tb-col nk-tb-col-tools text-end"><span
                                                                        class="sub-text">Actions</span></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="jobcategory-tbody">
                                                            <!-- Job categories will be populated by JavaScript -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div class="card-inner">
                                                    <div class="nk-block-between-md g-3">
                                                        <div class="g">
                                                            <ul id="jobcategory-pagination"
                                                                class="pagination justify-content-center justify-content-md-start">
                                                                <!-- pagination rendered by JS -->
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Job Category Modal (Create) -->
                                    <div class="modal fade" id="jobCategoryModal" tabindex="-1"
                                        aria-labelledby="jobCategoryModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="jobCategoryModalLabel">Create Job
                                                        Category</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                        aria-label="Close"></button>
                                                </div>
                                                <form id="jobCategoryForm" novalidate>
                                                    <div class="modal-body">
                                                        <div class="mb-3">
                                                            <label for="jc-name" class="form-label">Name</label>
                                                            <input type="text" class="form-control" id="jc-name"
                                                                name="name" required>
                                                            <div class="invalid-feedback" id="error-jc-name"></div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="jc-slug" class="form-label">Slug</label>
                                                            <input type="text" class="form-control" id="jc-slug"
                                                                name="slug" required>
                                                            <div class="invalid-feedback" id="error-jc-slug"></div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="jc-desc" class="form-label">Description</label>
                                                            <textarea class="form-control" id="jc-desc"
                                                                name="description" rows="4"></textarea>
                                                            <div class="invalid-feedback" id="error-jc-desc"></div>
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-outline-light"
                                                            data-bs-dismiss="modal">Cancel</button>
                                                        <button type="submit" class="btn btn-darkred">Create</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Job Category Modal (Edit) -->
                                    <div class="modal fade" id="jobCategoryEditModal" tabindex="-1"
                                        aria-labelledby="jobCategoryEditModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="jobCategoryEditModalLabel">Edit Job
                                                        Category</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                        aria-label="Close"></button>
                                                </div>
                                                <form id="jobCategoryEditForm" novalidate>
                                                    <input type="hidden" id="jc-edit-id" name="id" value="">
                                                    <div class="modal-body">
                                                        <div class="mb-3">
                                                            <label for="jc-edit-name" class="form-label">Name</label>
                                                            <input type="text" class="form-control" id="jc-edit-name"
                                                                name="name" required>
                                                            <div class="invalid-feedback" id="error-jc-edit-name"></div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="jc-edit-slug" class="form-label">Slug</label>
                                                            <input type="text" class="form-control" id="jc-edit-slug"
                                                                name="slug" required>
                                                            <div class="invalid-feedback" id="error-jc-edit-slug"></div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="jc-edit-desc"
                                                                class="form-label">Description</label>
                                                            <textarea class="form-control" id="jc-edit-desc"
                                                                name="description" rows="4"></textarea>
                                                            <div class="invalid-feedback" id="error-jc-edit-desc"></div>
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-outline-light"
                                                            data-bs-dismiss="modal">Cancel</button>
                                                        <button type="submit" class="btn btn-darkred">Save
                                                            Changes</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Delete Category Confirmation Modal -->
                                    <div class="modal fade" id="deleteCategoryModal" tabindex="-1"
                                        aria-labelledby="deleteCategoryModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="deleteCategoryModalLabel">Delete
                                                        Category</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                        aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <p>Are you sure you want to delete this category?</p>
                                                    <p class="text-muted"><strong id="delete-category-name"></strong>
                                                    </p>
                                                    <p class="text-danger"><small><em
                                                                class="icon ni ni-alert-circle"></em> This action cannot
                                                            be undone.</small></p>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-outline-light"
                                                        data-bs-dismiss="modal">Cancel</button>
                                                    <button type="button" class="btn btn-danger"
                                                        id="confirm-delete-category">Delete Category</button>
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
    <?php
    // Ensure this page loads its page-specific script (public/admin/api/jobcategory.js)
    // if (!isset($pageScript) || !$pageScript) $pageScript = 'jobcategory';
    include_once('includes/scripts.php'); ?>
</body>
<!-- Mirrored from dashlite.net/demo4/project-list.html by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 09 Dec 2025 13:07:57 GMT -->

</html>