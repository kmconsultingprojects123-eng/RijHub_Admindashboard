<?php

namespace Middleware;
require_once('./bootstrap.php');

use Database\Database;
use _Helpers\SQLDB;
use _Helpers\ToolHelper;
use _Helpers\SessionService;
use _Helpers\ServerHandler;
use _Helpers\QueryBuilder;
use _Helpers\JWT;
class Middleware
{
    protected static SQLDB $sqlDB;
    protected static ToolHelper $toolHelper;
    protected static SessionService $sessionService;
    protected static QueryBuilder $qb;
    protected static JWT $jwt;
    protected static bool $initialized = false;

    // Initialize dependencies once
    public static function init()
    {
        if (!self::$initialized) {
            global $dsn, $username, $password; // Use global variables from db_credentials.php

            $pdo = Database::getInstance()->getConnection();
            self::$sqlDB = new SQLDB($pdo);
            self::$toolHelper = new ToolHelper();
            self::$sessionService = new SessionService();
            self::$qb = new QueryBuilder($pdo);
            self::$jwt = new JWT();
            self::$initialized = true;
        }
    }
    public static function requireAdminAuth()
    {
        self::init();
        $jwt = null;
        
        // Check Authorization header
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        } else {
            $authHeader = null;
        }
        
        if ($authHeader && stripos($authHeader, 'Bearer ') === 0) {
            $jwt = trim(substr($authHeader, 7));
        } elseif (isset($_COOKIE['token'])) {
            $jwt = $_COOKIE['token'];
        } elseif (isset($_POST['token'])) {
            $jwt = $_POST['token'];
        } elseif (isset($_GET['token'])) {
            $jwt = $_GET['token'];
        }
        
        if (!$jwt) {
            // Not logged in - redirect to login page
            header('Location: /aa/login/');
            exit();
        }
        
        // Decode and verify JWT
        $payload = self::$jwt->decodeJWT($jwt);
        
        if (!$payload || !isset($payload['role']) || $payload['role'] !== 'admin') {
            // Invalid or expired token - redirect to login page
            header('Location: /aa/login/');
            exit();
        }
        
        // Valid admin token - allow access
        return $payload;
    }
    public static function restrictLoginIfAuthenticated() {
        self::init();
        $jwt = null;
    
        // Check Authorization header
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        } else {
            $authHeader = null;
        }
    
        if ($authHeader && stripos($authHeader, 'Bearer ') === 0) {
            $jwt = trim(substr($authHeader, 7));
        } elseif (isset($_COOKIE['token'])) {
            $jwt = $_COOKIE['token'];
        } elseif (isset($_POST['token'])) {
            $jwt = $_POST['token'];
        } elseif (isset($_GET['token'])) {
            $jwt = $_GET['token'];
        }
    
        // If no JWT is found, allow access to the login page
        if (!$jwt) {
            return;
        }
    
        // Validate JWT
        $payload = self::$jwt->decodeJWT($jwt);
        if ($payload && isset($payload['role']) && $payload['role'] === 'admin') {
            // User is authenticated as admin, redirect to dashboard
            header('Location: /aa/');
            exit();
        }
    
        // Invalid or expired token, or non-admin role: allow access to login page
        return;
    }
}