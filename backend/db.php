<?php
// Global Production Security Settings
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Production CORS Policy
$allowed_origin = (isset($_SERVER['HTTP_ORIGIN']) && (
    $_SERVER['HTTP_ORIGIN'] === 'https://drkanchan.in' || 
    $_SERVER['HTTP_ORIGIN'] === 'http://localhost:5173' || 
    $_SERVER['HTTP_ORIGIN'] === 'http://localhost:3000'
)) ? $_SERVER['HTTP_ORIGIN'] : 'https://drkanchan.in';

header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$host = DB_HOST;
$db   = DB_NAME;
$user = DB_USER;
$pass = DB_PASS;
$charset = DB_CHARSET;

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

