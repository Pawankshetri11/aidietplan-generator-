// LuxeDiet Production Configuration
// You can edit this file directly on the server to change settings without rebuilding the frontend.

window.APP_CONFIG = {
    // The URL of your backend API
    apiBaseUrl: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost/diet%20plan%202/backend"
        : "https://drkanchan.in/api",

    // Your production Google Client ID
    googleClientId: "785889991022-6jfg7dqe45cfecf1n0e3kubor89lof3p.apps.googleusercontent.com",

    // Pricing (You can also add these if you want to change them dynamically)
    priceStarter: 499,
    originalPriceStarter: 1499,
    pricePremium: 799,
    originalPricePremium: 1899,
    priceElite: 2499,
    originalPriceElite: 5999,

    // Development & Support Tools
    enableDummyData: true,
    enableRegenerate: false
};
