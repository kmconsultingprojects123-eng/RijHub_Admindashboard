<?php
// Detect the environment
$env = ($_SERVER['HTTP_HOST'] === 'localhost') ? 'development' : 'production';

// Set base URLs for development and production
$base_url = ($env === 'development') ? 'http://localhost/mzd' : 'https://themindsurgeon.net';
?>
