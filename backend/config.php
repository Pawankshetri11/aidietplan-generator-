<?php
// config.php - Configuration settings

// Client Side Keys (Public)
// Ideally these are injected into the Frontend build, but we keep them here for reference or if we serve config to frontend
// REACT_APP_GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"

// Server Side Keys (Private)
define('GOOGLE_CLIENT_ID', '');

// Cashfree Keys (LIVE PRODUCTION)
define('CASHFREE_APP_ID', ''); 
define('CASHFREE_SECRET_KEY', '');
define('CASHFREE_API_VERSION', '2022-09-01');
define('CASHFREE_ENV', 'PROD'); // Set to PROD for live payments
define('CASHFREE_BASE_URL', (CASHFREE_ENV === 'PROD') 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg');


