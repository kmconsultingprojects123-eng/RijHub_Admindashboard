<?php
// router.php

if (php_sapi_name() == 'cli-server') {
    $url  = parse_url($_SERVER['REQUEST_URI']);
    $path = $url['path'];
    $ext  = pathinfo($path, PATHINFO_EXTENSION);

    // Serve static files directly
    if (is_file(__DIR__ . $path)) {
        return false;
    }

    // Don't rewrite requests for static assets
    $staticExts = ['css','js','png','jpg','jpeg','gif','ico','woff','woff2','ttf','svg'];
    if (in_array(strtolower($ext), $staticExts)) {
        return false;
    }

    // Route all other requests to index.php with ?route=...
    $_GET['route'] = ltrim($path, '/');
    require __DIR__ . '/index.php';
    exit;
}
require __DIR__ . '/index.php';