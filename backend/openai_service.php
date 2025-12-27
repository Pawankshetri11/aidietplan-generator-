<?php
// openai_service.php - Service to interact with OpenAI API

require_once 'config.php';

// Ensure key is loaded
if (!defined('OPENAI_API_KEY')) {
    // Fallback or Error
    error_log("OPENAI_API_KEY not defined in config");
    return ['error' => 'Server Configuration Error'];
}

function generateMealPlanAI($userProfile, $dayNumber, $pastMeals = [], $planType = 'starter') {
    
    $url = 'https://api.openai.com/v1/chat/completions';
    $isUltimate = in_array($planType, ['premium', 'elite', 'ultimate', 'custom']); 
    $language = $userProfile['language'] ?? 'English';

    if ($isUltimate) {
        // --- ULTIMATE PLAN PROMPT ---
        $prompt = "You are an elite-level Indian Nutritionist. You provide scientific, results-driven nutrition plans.\n";
        $prompt .= "STRICT LANGUAGE RULE: You must respond in " . strtoupper($language) . " for all conversational text, titles, preparation steps, and benefits.\n";
        if ($language === 'Hinglish') {
            $prompt .= "- Hinglish Definition: Use a mix of Hindi and English. (e.g., 'Warm water piyo digestion ke liye').\n";
        }
        $prompt .= "Your task is to generate a results-oriented DAILY DIET PLAN for Day $dayNumber.\n\n";

        $prompt .= "CLIENT PROFILE:\n";
        $prompt .= json_encode($userProfile) . "\n";
        if (isset($userProfile['extended_data'])) {
            $prompt .= "Deep Health Data: " . json_encode($userProfile['extended_data']) . "\n";
        }

        $prompt .= "\nUSER GOAL: " . ($userProfile['goal'] ?? 'General Fitness') . "\n";
        $prompt .= "TARGET CALORIES: " . ($userProfile['target_calories'] ?? 2000) . " kcal (+/- 50 kcal).\n\n";

        $prompt .= "STRICT GUIDELINES (FAILURE IS NOT AN OPTION):\n";
        $prompt .= "1. DAILY CHECK-IN NOTES: If the user provides notes (e.g., 'Headache', 'Craving sweets', 'Feeling bloated'), you MUST adjust today's plan to address these specific issues. Explain how you've addressed them in the 'day_summary'.\n";
        $prompt .= "2. LANGUAGE: Use professional, encouraging " . $language . " for all descriptions, benefits, and instructions.\n";
        $prompt .= "3. DISH NAMES: Regardless of language selection, use COMMON INDIAN NAMES (e.g., 'Paneer Bhurji', 'Dal Tadka', 'Jeera Pani').\n";
        $prompt .= "4. INGREDIENTS: Use food available in the local Indian market (sabzi mandi). STRICTLY NO QUINOA, NO SALMON, NO AVOCADO. Each main meal MUST have at least 4-5 items. EVERY item MUST have a specific quantity (e.g., '150g Paneer', '2 Chapati', '10g Ghee'). NEVER list an item alone.\n";
        $prompt .= "5. MACROS: ALL numeric fields (calories, protein, carbs, fat) MUST be RAW NUMBERS (integers). DO NOT use strings like '28g'. DO NOT leave fields empty or just 'g'. If you don't have a value, calculate/estimate it precisely. NO NULLS.\n";
        $prompt .= "6. DETAIL: Provide at least 3-5 detailed preparation steps for every main meal. Summaries must be insightful and at least 4 sentences long.\n";
        $prompt .= "7. DUAL OPTIONS: Provide Option 1 and Option 2 for Breakfast, Lunch, and Dinner.\n";
        $prompt .= "8. STRUCTURE: Follow a 6-meal timeline: Wake-up Protocol, Breakfast, Mid-Morning, Lunch, Evening Snack, and Dinner.\n\n";

        $prompt .= "REQUIRED JSON STRUCTURE (STRICT):\n";
        $prompt .= "{\n";
        $prompt .= "  \"day_title\": \"(Professional Catchy Title in $language)\",\n";
        $prompt .= "  \"daily_objectives\": [\"Objective 1\", \"Objective 2\", \"Objective 3\"],\n";
        $prompt .= "  \"day_summary\": \"Explain how today's plan helps the user's health/goal (e.g., improve energy, recover, metabolic focus) in $language. Focus ONLY on the health results and what this diet will DO for the body.\",\n";
        $prompt .= "  \"target_stats\": { \"calories\": \"2000\", \"protein\": \"120\", \"carbs\": \"200\", \"fat\": \"60\" },\n";
        $prompt .= "  \"timeline\": [\n";
        $prompt .= "    { \n";
        $prompt .= "      \"time\": \"7:00 AM\", \"title\": \"Wake-Up Protocol\", \"type\": \"ritual\",\n";
        $prompt .= "      \"items\": [{ \"name\": \"Indian Dish Name\", \"quantity\": \"200ml\", \"instruction\": \"Preparation in $language\", \"benefit\": \"1. ... 2. ... 3. ... (in $language)\" }]\n";
        $prompt .= "    },\n";
        $prompt .= "    { \n";
        $prompt .= "      \"time\": \"8:00 AM\", \"title\": \"Breakfast\", \"type\": \"meal\", \"name\": \"Main Dish Title (Indian Name)\",\n";
        $prompt .= "      \"option_1\": { \"name\": \"Indian Name\", \"calories\": 450, \"protein\": 25, \"carbs\": 50, \"fat\": 15, \"ingredients\": [\"200g Paneer\", \"2 Whole Wheat Roti\"], \"preparation_steps\": [\"Step 1\", \"Step 2\"], \"benefits\": \"1. ... 2. ... 3. ...\" },\n";
        $prompt .= "      \"option_2\": { \"name\": \"Indian Name\", \"calories\": 420, \"protein\": 20, \"carbs\": 45, \"fat\": 12, \"ingredients\": [\"100g Oats\", \"250ml Milk\"], \"preparation_steps\": [\"Step 1\"], \"benefits\": \"1. ...\" },\n";
        $prompt .= "      \"suggestions\": \"Expert Tip in $language\"\n";
        $prompt .= "    },\n";
        $prompt .= "    { \"time\": \"11:00 AM\", \"title\": \"Mid-Morning\", \"type\": \"meal\", \"name\": \"Indian Dish Name\", \"calories\": 150, \"ingredients\": [\"1 Medium Apple\"], \"benefits\": \"Benefits in $language\" },\n";
        $prompt .= "    { \"time\": \"2:00 PM\", \"title\": \"Lunch\", \"type\": \"meal\", \"name\": \"Main Dish Title\", \"option_1\": { \"name\": \"Indian Name\", \"calories\": 600, \"protein\": 30, \"ingredients\": [\"150g Chicken/Paneer\", \"2 Roti\", \"1 cup Dal\"], \"preparation_steps\": [], \"benefits\": \"\" }, \"option_2\": { \"name\": \"Indian Name\", \"calories\": 580, \"protein\": 28, \"ingredients\": [\"1 cup Rice\", \"1 cup Rajma\"], \"preparation_steps\": [], \"benefits\": \"\" } },\n";
        $prompt .= "    { \"time\": \"6:00 PM\", \"title\": \"Evening Snack\", \"type\": \"meal\", \"name\": \"Indian Dish Name\", \"calories\": 100, \"ingredients\": [\"1 cup Green Tea\", \"5 Almonds\"], \"benefits\": \"\" },\n";
        $prompt .= "    { \"time\": \"10:00 PM\", \"title\": \"Dinner\", \"type\": \"meal\", \"name\": \"Main Dish Title\", \"option_1\": { \"name\": \"Indian Name\", \"calories\": 400, \"protein\": 20, \"ingredients\": [\"1 cup Mixed Sabzi\", \"1 Roti\"], \"preparation_steps\": [], \"benefits\": \"\" }, \"option_2\": { \"name\": \"Indian Name\", \"calories\": 380, \"protein\": 18, \"ingredients\": [\"1 cup Moong Dal Khichdi\", \"1 cup Curd\"], \"preparation_steps\": [], \"benefits\": \"\" } }\n";
        $prompt .= "  ],\n";
        $prompt .= "  \"daily_dos\": [\"Point 1 in $language\", \"Point 2\"],\n";
        $prompt .= "  \"daily_donts\": [\"Point 1 in $language\", \"Point 2\"],\n";
        $prompt .= "  \"summary_table\": { \"total_calories\": \"2000\", \"focus\": \"Clean Bulking\", \"Expected_Result\": \"Better recovery and energy\" }\n";
        $prompt .= "}\n";
        $prompt .= "\nIMPORTANT: Deliver scientific, high-quality content in " . $language . ". Use common Indian food names. No imported superfoods.\n";

    } else {
        // --- STANDARD PLAN PROMPT ---
        $prompt = "You are a professional nutritionist. Create a Daily Diet Plan (Day $dayNumber) for:\n";
        $prompt .= "Language: " . $language . " (Strictly use this for all text).\n";
        $prompt .= "Profile: " . json_encode($userProfile) . "\n";
        $prompt .= "Plan Type: STANDARD.\n";
        $prompt .= "GOAL: Balanced plan with macros.\n";
        $prompt .= "   - CALORIES: " . ($userProfile['target_calories'] ?? '2000') . " kcal (+/- 50).\n";
        $prompt .= "STRICT RULES: \n";
        $prompt .= "1. USER NOTES: If notes are provided (e.g. feeling tired), adjust meals accordingly.\n";
        $prompt .= "2. EVERY ingredient MUST have a quantity (e.g. 100g, 2 pieces). \n";
        $prompt .= "3. All macros (protein, carbs etc) MUST be numbers only.\n";
        $prompt .= "4. LOCAL INGREDIENTS ONLY: Use food available in the local Indian market (sabzi mandi). STRICTLY NO QUINOA, NO SALMON, NO AVOCADO, NO KALE. Use Dal, Paneer, Poha, Roti, Rice, Dalia, Besan etc.\n";
        $prompt .= "INGREDIENTS: Use local Indian food and names. No fancy items.\n";
        $prompt .= "MEAL COUNT: 4 to 5.\n\n";

        $prompt .= "REQUIRED JSON STRUCTURE (Strictly follow this):\n";
        $prompt .= "{\n";
        $prompt .= "  \"day_title\": \"Day $dayNumber Nutrition\",\n";
        $prompt .= "  \"day_summary\": \"Explain how today's plan helps the user's health/goal (e.g., improve energy, muscle recovery, digestion) in $language. Do not talk about ingredient availability, focus ONLY on what this diet will DO for the body.\",\n";
        $prompt .= "  \"daily_objectives\": [\"Objective 1\", \"Objective 2\"],\n";
        $prompt .= "  \"meals\": [\n";
        $prompt .= "    { \n";
        $prompt .= "      \"time\": \"8:30 AM\", \"title\": \"Breakfast\", \"type\": \"meal\", \"name\": \"Indian Dish Name\", \n";
        $prompt .= "      \"calories\": 380, \"protein\": 20, \"carbs\": 35, \"fat\": 18, \n";
        $prompt .= "      \"ingredients\": [\"string list\"], \n";
        $prompt .= "      \"tips\": \"Expert tip\"\n";
        $prompt .= "    }\n";
        $prompt .= "  ],\n";
        $prompt .= "  \"daily_dos\": [],\n";
        $prompt .= "  \"daily_donts\": [],\n";
        $prompt .= "  \"summary_table\": { \"total_calories\": \"2000\", \"protein\": \"100\" }\n";
        $prompt .= "}\n";
    }

    $data = [
        'model' => 'gpt-4o',
        'messages' => [
            ['role' => 'system', 'content' => "You are an ultra-precise Nutrition JSON API. 
RULES:
1. RAW NUMBERS ONLY for macros (no 'g', no strings).
2. NO EMOJIS.
3. HIGH DETAIL for ingredients (must include weights/quantities).
4. STRICT JSON FORMAT.
If you violate these, the integration will fail."],
            ['role' => 'user', 'content' => $prompt]
        ],
        'temperature' => 0.4
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENAI_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); 
    curl_setopt($ch, CURLOPT_TIMEOUT, 90);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

    $result = curl_exec($ch);
    
    if (curl_errno($ch)) {
        error_log('OpenAI Request Failed: ' . curl_error($ch));
        return ['error' => 'Connection failed. Please check your internet or try again later.'];
    }
    
    curl_close($ch);
    $response = json_decode($result, true);
    $content = $response['choices'][0]['message']['content'] ?? null;

    if ($content) {
        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');
        if ($jsonStart !== false && $jsonEnd !== false) {
            $jsonStr = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
            return json_decode($jsonStr, true);
        }
    }
    
    return ['error' => 'Failed to parse AI response'];
}
?>
