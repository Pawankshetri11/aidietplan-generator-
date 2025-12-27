<?php

set_time_limit(120);
error_reporting(0); // Disable all error reporting for production
ini_set('display_errors', 0);

// Debug logging function (Disabled for production to save space)
function logDebug($msg) {
    // error_log(date('[Y-m-d H:i:s] ') . $msg . "\n"); 
}


logDebug("Script started. Method: " . $_SERVER['REQUEST_METHOD']);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

logDebug("Loading dependencies...");
try {
    require_once 'db.php';
    require_once 'openai_service.php';
    logDebug("Dependencies loaded successfully");
} catch (Throwable $e) {
    logDebug("FATAL ERROR during dependency load: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Backend Dependency Error: ' . $e->getMessage()]);
    exit;
}

$rawInput = file_get_contents('php://input');
logDebug("Raw input length: " . strlen($rawInput));

$input = json_decode($rawInput, true);
if ($input === null) {
    logDebug("JSON decode error: " . json_last_error_msg());
}
logDebug("Input received: " . json_encode($input));

$body = $input['body'] ?? $input;
$userProfile = $body['userProfile'] ?? [];
$dayNumber = $body['dayNumber'] ?? 1;

logDebug("Processing profile for day $dayNumber");

// 1. Calculate Target Calories locally as a baseline/fallback
$weight = $userProfile['weight'] ?? 70;
$height = $userProfile['height'] ?? 170;
$age = $userProfile['age'] ?? 30;
$gender = strtolower($userProfile['gender'] ?? 'male');
$activity = $userProfile['activity_level'] ?? 'moderate';
$goal = $userProfile['goal'] ?? 'weight-loss';

$bmr = ($gender === 'female') 
    ? (10 * $weight) + (6.25 * $height) - (5 * $age) - 161
    : (10 * $weight) + (6.25 * $height) - (5 * $age) + 5;

$multipliers = ['sedentary' => 1.2, 'light' => 1.375, 'moderate' => 1.55, 'active' => 1.725];
$tdee = $bmr * ($multipliers[$activity] ?? 1.55);

if ($goal === 'weight-loss') $targetCalories = $tdee - 500;
elseif ($goal === 'muscle-gain') $targetCalories = $tdee + 300;
else $targetCalories = $tdee;
$targetCalories = round($targetCalories);

// Add calculated target to profile for AI
$userProfile['target_calories'] = $targetCalories;

// ---------------------------------------------------------
// AI GENERATION ATTEMPT
// ---------------------------------------------------------
$mealPlan = null;

$isKeyDefined = defined('OPENAI_API_KEY');
$keyValue = $isKeyDefined ? substr(OPENAI_API_KEY, 0, 7) . '...' : 'undefined';
logDebug("OpenAI Key Status: Defined=$isKeyDefined, ValueStart=$keyValue");

// Only try AI if Key is set and not placeholder
if ($isKeyDefined && OPENAI_API_KEY !== 'YOUR_OPENAI_KEY_HERE') {
    logDebug("AI attempt for day $dayNumber");
    // TODO: Fetch real past meals from DB if needed
    $pastMeals = [];
    
    $planType = $body['planType'] ?? 'starter';
    $aiResponse = generateMealPlanAI($userProfile, $dayNumber, $pastMeals, $planType);
    // Don't log full AI response if it's huge, but do log error or success
    if (isset($aiResponse['error'])) {
         logDebug("AI Response Error: " . json_encode($aiResponse));
    } else {
         logDebug("AI Response Success (truncated log)");
    }

    if ($aiResponse && !isset($aiResponse['error'])) {
        logDebug("AI success");
        $mealPlan = $aiResponse;
    } else {
        logDebug("AI failed: " . ($aiResponse['error'] ?? 'Unknown error'));
        // Return the specific error to the frontend for debugging
        http_response_code(500);
        echo json_encode(['error' => 'AI Generation Failed: ' . ($aiResponse['error'] ?? 'Unknown')]);
        exit;
    }
} else {
    logDebug("Skipping AI: Key missing or placeholder");
}

// ---------------------------------------------------------
// NO FALLBACK: Only AI plans
// ---------------------------------------------------------
if (!$mealPlan) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to generate AI meal plan (Key missing or AI error)']);
    exit;
}

echo json_encode(['mealPlan' => $mealPlan]);
?>
