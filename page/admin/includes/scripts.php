<!-- <script src="/aa/public/admin/assets/js/axios.min.js"></script> -->
<script src="/aa/public/admin/assets/js/bundle9b70.js?ver=3.3.0"></script>
<script src="/aa/public/admin/assets/js/scripts9b70.js?ver=3.3.0"></script>
<script src="/aa/public/admin/assets/js/demo-settings9b70.js?ver=3.3.0"></script>
<script src="/aa/public/admin/assets/js/charts/gd-analytics9b70.js?ver=3.3.0"></script>
<script src="/aa/public/admin/assets/js/libs/jqvmap9b70.js?ver=3.3.0"></script>
<script src="/aa/public/admin/assets/js/libs/jkanban9b70.js?ver=3.3.0"></script>
<script src="/aa/public/admin/assets/js/apps/kanban9b70.js?ver=3.3.0"></script>
<!-- <script src="/aa/public/admin/assets/js/axios.min.js"></script> -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<!-- Auth Middleware - Must be loaded before page-specific scripts -->
<script type="module" src="/aa/public/admin/api/config/auth-middleware.js"></script>
<!-- Logout Handler -->
<script type="module" src="/aa/public/admin/api/logout.js"></script>
<?php
// Auto-load page-specific JS when defined
if ($pageScript) {
    echo '<script type="module" src="/aa/public/admin/api/' . $pageScript . '.js"></script>';
}
?>