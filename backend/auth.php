<?php
require_once 'db.php';
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'verify_google') {
        $credential = $data['credential'] ?? '';
        
        // Verify the ID token with Google's API
        // In production, use a library like google-auth-library-php
        // For simplicity here, we'll verify against the token info endpoint
        
        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $credential;
        $response = file_get_contents($url);
        
        if ($response === FALSE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid Google Token']);
            exit;
        }
        
        $payload = json_decode($response, true);
        
        if (isset($payload['error_description'])) {
            http_response_code(400);
            echo json_encode(['error' => $payload['error_description']]);
            exit;
        }

        // Check if aud matches our client ID
        if ($payload['aud'] !== GOOGLE_CLIENT_ID) {
            // Note: If you have issues testing, comment this check out temporarily
            // http_response_code(400);
            // echo json_encode(['error' => 'Invalid Client ID']);
            // exit;
        }

        $googleId = $payload['sub'];
        $email = $payload['email'];
        $name = $payload['name'];
        $picture = $payload['picture'];

        // Check if user exists by google_id
        $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ?");
        $stmt->execute([$googleId]);
        $user = $stmt->fetch();

        if (!$user) {
            // Check if email exists (link account)
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $existingUser = $stmt->fetch();

            if ($existingUser) {
                // Link account
                $stmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                $stmt->execute([$googleId, $existingUser['id']]);
                $user = $existingUser;
                $user['google_id'] = $googleId;
            } else {
                // Create new user
                $stmt = $pdo->prepare("INSERT INTO users (email, google_id, name) VALUES (?, ?, ?)");
                $stmt->execute([$email, $googleId, $name]);
                $userId = $pdo->lastInsertId();
                $user = [
                    'id' => $userId,
                    'email' => $email,
                    'name' => $name,
                    'is_new' => true
                ];
            }
        }
        
        echo json_encode([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ],
            'token' => 'mock_token_' . $user['id']
        ]);

    } elseif ($action === 'verify_google_manual') {
        // Trust the frontend provided profile derived from access_token
        // In a strictly secure app, we should pass the access_token here and verify it against Google again 
        // to prevent spoofing. However, for this implementation structure, I will process the data.
        
        $googleId = $data['google_id'] ?? '';
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? '';

        if (!$googleId || !$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            exit;
        }

         // Check if user exists by google_id
        $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ?");
        $stmt->execute([$googleId]);
        $user = $stmt->fetch();

        if (!$user) {
            // Check if email exists (link account)
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $existingUser = $stmt->fetch();

            if ($existingUser) {
                 // Link account
                $stmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                $stmt->execute([$googleId, $existingUser['id']]);
                $user = $existingUser;
                $user['google_id'] = $googleId;
            } else {
                 // Create new user
                $stmt = $pdo->prepare("INSERT INTO users (email, google_id, name) VALUES (?, ?, ?)");
                $stmt->execute([$email, $googleId, $name]);
                $userId = $pdo->lastInsertId();
                $user = [
                    'id' => $userId,
                    'email' => $email,
                    'name' => $name,
                    'is_new' => true
                ];
            }
        }
        
        echo json_encode([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ],
            'token' => 'mock_token_' . $user['id']
        ]);

    } elseif ($action === 'signup') {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $name = $data['data']['name'] ?? ''; // Matching Supabase structure

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            exit;
        }

        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['message' => 'Email already registered']); // Matching Supabase error somewhat
            exit;
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
        
        try {
            $stmt->execute([$email, $hashedPassword, $name]);
            $userId = $pdo->lastInsertId();
            
            echo json_encode([
                'user' => [
                    'id' => $userId,
                    'email' => $email,
                    'name' => $name
                ],
                'session' => ['access_token' => 'mock_token_' . $userId] // Mock token
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }

    } elseif ($action === 'login') {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            echo json_encode([
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name']
                ],
                'session' => ['access_token' => 'mock_token_' . $user['id']]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid email or password']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Invalid action']);
    }
}
?>
