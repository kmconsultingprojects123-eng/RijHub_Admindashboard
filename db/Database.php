<?php

namespace Database;

class Database {
    private static ?Database $instance = null;
    private \PDO $connection;

    private function __construct($dsn, $username, $password) {
        try {
            $this->connection = new \PDO($dsn, $username, $password);
            $this->connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            die("Error connecting to the database: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            $credentials = require(__DIR__ . "/db_credentials.php");
            self::$instance = new self($credentials['dsn'], $credentials['username'], $credentials['password']);
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}
