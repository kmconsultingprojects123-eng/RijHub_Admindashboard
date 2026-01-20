<?php

// Add global CORS headers so API requests (including preflight) allow required headers
// and methods. This ensures clients can send the custom `timeout` header without
// CORS preflight rejection.
// Note: allow origin is echoed back if provided, otherwise allow all origins.
if (!defined('PHPUNIT_RUNNING')) {
	if (!empty($_SERVER['HTTP_ORIGIN'])) {
		header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
	} else {
		header('Access-Control-Allow-Origin: *');
	}
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-XSRF-TOKEN, timeout');

	// Handle OPTIONS preflight quickly and exit
	if (isset($_SERVER['REQUEST_METHOD']) && strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
		http_response_code(200);
		exit();
	}
}

require_once('./_Helpers.php');
require_once('./db/db_credentials.php');
require_once('./db/Database.php');
// require_once('./src/paystack/src/autoload.php');

// use PDOException;
