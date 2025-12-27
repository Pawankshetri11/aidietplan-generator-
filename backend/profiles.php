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
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($profile) {
        $profile['dietary_restrictions'] = json_decode($profile['dietary_restrictions'], true);
        $profile['extended_data'] = json_decode($profile['extended_data'] ?? '{}', true);
        echo json_encode($profile);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Profile not found']);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Supabase .insert() might send an array of objects or a single object.
    // We'll handle single object for profiles as per the frontend code.
    
    // Check if it's an array and take the first item if so (Supabase often sends array for insert)
    /*
    if (isset($data[0]) && is_array($data[0])) {
        $data = $data[0];
    }
    */
    // If the frontend sends data directly as JSON object:
    
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $user_id = $data['user_id'] ?? null;
    $age = $data['age'] ?? 0;
    $gender = $data['gender'] ?? '';
    $height = $data['height'] ?? 0;
    $weight = $data['weight'] ?? 0;
    $goal = $data['goal'] ?? '';
    $activity_level = $data['activity_level'] ?? '';
    $dietary_restrictions = isset($data['dietary_restrictions']) ? json_encode($data['dietary_restrictions']) : '[]';
    $allergies = $data['allergies'] ?? '';
    $meal_preference = $data['meal_preference'] ?? '';
    $extended_data = isset($data['extended_data']) ? json_encode($data['extended_data']) : (isset($data['formData']) ? json_encode($data['formData']) : NULL);

    // Use ON DUPLICATE KEY UPDATE to handle re-submissions or updates
    $sql = "INSERT INTO profiles (user_id, name, email, age, gender, height, weight, goal, activity_level, dietary_restrictions, allergies, meal_preference, extended_data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             name = VALUES(name), email = VALUES(email), age = VALUES(age), gender = VALUES(gender),
             height = VALUES(height), weight = VALUES(weight), goal = VALUES(goal), activity_level = VALUES(activity_level),
             dietary_restrictions = VALUES(dietary_restrictions), allergies = VALUES(allergies), meal_preference = VALUES(meal_preference), extended_data = VALUES(extended_data)";

    // Debug: log the data
    // file_put_contents('profile_debug.log', date('Y-m-d H:i:s') . " Data: " . json_encode([$user_id, $name, $email, $age, $gender, $height, $weight, $goal, $activity_level, $dietary_restrictions, $allergies, $meal_preference, $extended_data]) . "\n", FILE_APPEND);

    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute([$user_id, $name, $email, $age, $gender, $height, $weight, $goal, $activity_level, $dietary_restrictions, $allergies, $meal_preference, $extended_data]);

        // Fetch the ID (whether inserted or updated)
        $idStmt = $pdo->prepare("SELECT id FROM profiles WHERE user_id = ?");
        $idStmt->execute([$user_id]);
        $row = $idStmt->fetch(PDO::FETCH_ASSOC);
        $id = $row['id'] ?? $pdo->lastInsertId();

        // Return the created/updated object
        echo json_encode([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'user_id' => $user_id
        ]);
    } catch (PDOException $e) {
        // file_put_contents('profile_error.log', date('Y-m-d H:i:s') . " PDO Error: " . $e->getMessage() . "\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
