<?php
// Allow manual override via environment variable
$env = getenv('APP_ENV');
if (!$env) {
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '');
    $localHosts = ['localhost', '127.0.0.1', '::1'];
    $env = in_array($host, $localHosts) ? 'development' : 'production';
}

$config = [
    'development' => [
        'servername' => '',
        'hostname' => 'localhost',
        'password' => '',
        'user' => 'root',
        'dbname' => '',
        'serverpathname' => '/aa/'
    ],
    'production' => [
        'servername' => '',
        'hostname' => 'localhost',
        'password' => '',
        'user' => 'root',
        'dbname' => '',
        'serverpathname' => '/aa/'
    ]
];

return $config[$env];
