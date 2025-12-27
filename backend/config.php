<?php
// config.php - Single Source of Truth for all Secrets and Configuration

// 1. Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'dietplan');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// 2. OpenAI Configuration
// Only put your key here. Do not update openai_service.php directly.
define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: 'YOUR_OPENAI_KEY_HERE');

// 3. Google Auth Configuration
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: 'YOUR_GOOGLE_CLIENT_ID_HERE');

// 4. Cashfree Payment Configuration
define('CASHFREE_APP_ID', getenv('CASHFREE_APP_ID') ?: 'YOUR_CASHFREE_APP_ID');
define('CASHFREE_SECRET_KEY', getenv('CASHFREE_SECRET_KEY') ?: 'YOUR_CASHFREE_SECRET_KEY');
define('CASHFREE_API_VERSION', '2022-09-01');
define('CASHFREE_ENV', getenv('CASHFREE_ENV') ?: 'PROD'); // 'TEST' or 'PROD'

// Derived Configurations
define('CASHFREE_BASE_URL', (CASHFREE_ENV === 'PROD') 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg');

?>
