<?php
$config = require(__DIR__ . '/../config.php');

return [
    'dsn' => "mysql:host=" . $config['hostname'] . ";dbname=" . $config['dbname'],
    'username' => $config['user'],
    'password' => $config['password']
];
