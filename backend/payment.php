<?php
// Prevent PHP warnings/errors from messing up JSON response
error_reporting(0);
ini_set('display_errors', 0);

require_once 'db.php';
require_once 'config.php';

// header("Access-Control-Allow-Origin: *"); // Handled in db.php
header("Content-Type: application/json");

// Log for debugging
// Log for debugging
// file_put_contents('payment_debug.log', date('Y-m-d H:i:s') . " Action: " . ($_GET['action'] ?? '') . ", Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create_order') {
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            exit;
        }
        $amount = $data['amount'] ?? 0;
        $customerId = $data['customer_id'] ?? '';
        // Sanitize phone - keep only digits
        $customerPhone = $data['customer_phone'];
        $customerPhone = preg_replace('/[^0-9]/', '', $customerPhone);
        if (strlen($customerPhone) > 10) {
            // Take last 10 digits if longer (e.g. includes country code)
            $customerPhone = substr($customerPhone, -10);
        }
        
        $customerName = $data['customer_name'];
        $customerEmail = $data['customer_email'];
        
        // Ensure valid customer ID
        if (empty($customerId) || $customerId === 'GUEST') {
             $customerId = 'GUEST_' . uniqid();
        }
        // Remove unsafe chars from ID
        $customerId = preg_replace('/[^a-zA-Z0-9_]/', '', $customerId);
        
        $orderId = 'ORDER_' . uniqid() . '_' . time();
        
        // --- Single Active Plan Enforcement ---
        // Only check if we have a valid numeric User ID (authenticated user)
        // If it starts with 'GUEST', skip check.
        $isGuest = strpos($customerId, 'GUEST') !== false;

        if (!$isGuest) {
            // First, sanitize the ID just to be sure it's numeric for the DB query
            if (is_numeric($customerId)) {
                $checkStmt = $pdo->prepare("SELECT id, plan_type, end_date FROM subscriptions WHERE user_id = ? AND payment_status = 'completed' AND end_date >= CURDATE() LIMIT 1");
                $checkStmt->execute([$customerId]);
                $activePlan = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($activePlan) {
                    // Logic for Upgrade/Downgrade could go here later.
                    // For now, strictly block multiple active plans as per Phase 1 Requirement.
                    http_response_code(409); // Conflict
                    echo json_encode([
                        'error' => 'You already have an active subscription.',
                        'active_plan' => $activePlan,
                        'message' => 'Please wait for your current plan to expire or contact support to upgrade.'
                    ]);
                    exit;
                }
            }
        }
        // --------------------------------------

        $returnUrl = $data['return_url'] ?? 'http://localhost:8081/dashboard?order_id={order_id}';
        
        $payload = [
            'order_id' => $orderId,
            'order_amount' => $amount,
            'order_currency' => 'INR',
            'customer_details' => [
                'customer_id' => "CUST_" . $customerId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_phone' => $customerPhone
            ],
            'order_meta' => [
                'return_url' => $returnUrl
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, CASHFREE_BASE_URL . '/orders');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'x-client-id: ' . CASHFREE_APP_ID,
            'x-client-secret: ' . CASHFREE_SECRET_KEY,
            'x-api-version: ' . CASHFREE_API_VERSION,
            'Content-Type: application/json'
        ]);

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, CASHFREE_ENV === 'PROD' ? 1 : 0); 
        
        // Log payload for debugging
        file_put_contents('cashfree_debug.log', date('Y-m-d H:i:s') . " Payload: " . json_encode($payload) . "\n", FILE_APPEND);
        
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $curlError = curl_error($ch);
            file_put_contents('cashfree_debug.log', date('Y-m-d H:i:s') . " Curl Error: " . $curlError . "\n", FILE_APPEND);
            echo json_encode(['error' => 'Curl error: ' . $curlError]);
            exit;
        }
        curl_close($ch);
        
        $response = json_decode($result, true);
        
        // Log response for debugging
        file_put_contents('cashfree_debug.log', date('Y-m-d H:i:s') . " Response: " . $result . "\n", FILE_APPEND);

        if (isset($response['message']) && !isset($response['payment_session_id'])) {
             // Cashfree returned an API error
             http_response_code(400); // Bad Request
             echo json_encode(['error' => $response['message'], 'details' => $response]);
             exit;
        }
        
        // Return payment_session_id to frontend
        echo json_encode($response);
        
    } elseif ($action === 'verify') {
        $orderId = $data['order_id'];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, CASHFREE_BASE_URL . '/orders/' . $orderId);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'x-client-id: ' . CASHFREE_APP_ID,
            'x-client-secret: ' . CASHFREE_SECRET_KEY,
            'x-api-version: ' . CASHFREE_API_VERSION,
            'Content-Type: application/json'
        ]);
        
        $result = curl_exec($ch);
        curl_close($ch);
        
        // Log for debugging
        file_put_contents('payment_verify_debug.log', date('Y-m-d H:i:s') . " Order: $orderId, Result: $result\n", FILE_APPEND);
        
        echo $result;
    }
}
?>
