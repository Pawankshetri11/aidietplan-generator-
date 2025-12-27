<?php
require_once 'db.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id required']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT s.*, p.name as profile_name, u.name as user_name FROM subscriptions s JOIN profiles p ON s.profile_id = p.id JOIN users u ON s.user_id = u.id WHERE s.user_id = ? AND s.payment_status = 'completed' ORDER BY s.start_date DESC LIMIT 1");
    $stmt->execute([$user_id]);
    $subscription = $stmt->fetch(PDO::FETCH_ASSOC);
    // file_put_contents('debug.log', "User $user_id, subscription: " . json_encode($subscription) . "\n", FILE_APPEND);
    if ($subscription) {
        echo json_encode($subscription);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No active subscription found']);
    }
} elseif ($method === 'POST' || $method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        $profile_id = $data['profile_id'] ?? null;
        $user_id = $data['user_id'] ?? null; // Expect user_id from frontend
        
        // Fallback: If no user_id, fetch from profile
        if (!$user_id && $profile_id) {
            $uStmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
            $uStmt->execute([$profile_id]);
            $uRow = $uStmt->fetch(PDO::FETCH_ASSOC);
            if ($uRow) {
                $user_id = $uRow['user_id'];
            }
        }

        $plan_type = $data['plan_type'] ?? '';
        $plan_days = $data['plan_days'] ?? 0;
        $end_date = $data['end_date'] ?? '';
        $amount = $data['amount'] ?? 0.0;
        $payment_method = $data['payment_method'] ?? '';
        $payment_status = $data['payment_status'] ?? 'pending';

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing user_id for subscription']);
            exit;
        }

        // Get user name
        $userStmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $userRow = $userStmt->fetch(PDO::FETCH_ASSOC);
        $user_name = $userRow['name'] ?? 'Unknown';

        $stmt = $pdo->prepare("INSERT INTO subscriptions (user_id, profile_id, plan_type, plan_days, end_date, amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        try {
            $stmt->execute([$user_id, $profile_id, $plan_type, $plan_days, $end_date, $amount, $payment_method, $payment_status]);
            $id = $pdo->lastInsertId();

            echo json_encode(['id' => $id, 'user_id' => $user_id, 'profile_id' => $profile_id]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else { // PATCH
        $id = $_GET['id'] ?? null;
        $payment_status = $data['payment_status'] ?? null;

        if (!$id || !$payment_status) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id or payment_status', 'received' => $data]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE subscriptions SET payment_status = ? WHERE id = ?");
        try {
            $stmt->execute([$payment_status, $id]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>
