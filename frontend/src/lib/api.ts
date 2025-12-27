// Support dynamic config from config.js on server
const getAppConfig = () => {
    return (window as any).APP_CONFIG || {
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
        googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "785889991022-6jfg7dqe45cfecf1n0e3kubor89lof3p.apps.googleusercontent.com"
    };
};

const config = getAppConfig();
export const API_BASE_URL = config.apiBaseUrl;
export const GOOGLE_CLIENT_ID = config.googleClientId;

// Feature Flags
export const ENABLE_DUMMY_DATA = config.enableDummyData ?? (import.meta.env.VITE_ENABLE_DUMMY_DATA === 'true');
export const ENABLE_REGENERATE = config.enableRegenerate ?? (import.meta.env.VITE_ENABLE_REGENERATE === 'true');

interface User {
    id?: string;
    userId?: string;
    phone?: string;
    name?: string;
    email?: string;
}

export const api = {
    auth: {
        signup: async (email: string, password: string, name: string) => {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, data: { name } }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Signup failed");
            }
            return response.json();
        },
        login: async (email: string, password: string) => {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Login failed");
            }
            return response.json();
        },
        googleLogin: async (credential: string) => {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=verify_google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Google login failed");
            }
            return response.json();
        },
        googleLoginManual: async (userInfo: unknown) => {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=verify_google_manual`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userInfo),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Google login failed");
            }
            return response.json();
        }
    },
    payment: {
        createOrder: async (amount: number, user: User) => {
            // Construct return URL dynamically to match current port/host
            // Note: Cashfree Prod requires HTTPS for return_url.
            // If we are on http://localhost, we might need to "fake" the https in the string 
            // even if the local server is http (and accept the browser warning on return).
            let returnUrl = `${window.location.origin}/dashboard?order_id={order_id}`;
            if (returnUrl.startsWith("http:") && !window.location.hostname.includes("localhost")) {
                returnUrl = returnUrl.replace("http:", "https:");
            }

            const response = await fetch(`${API_BASE_URL}/payment.php?action=create_order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    customer_id: user.id || user.userId || 'GUEST',
                    customer_phone: user.phone,
                    customer_name: user.name,
                    customer_email: user.email,
                    return_url: returnUrl
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Payment initiation failed");
            }
            return response.json();
        },
        verifyOrder: async (orderId: string) => {
            const response = await fetch(`${API_BASE_URL}/payment.php?action=verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: orderId }),
            });
            return response.json();
        }
    },
    profiles: {
        create: async (profileData: unknown) => {
            const response = await fetch(`${API_BASE_URL}/profiles.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to create profile");
            }
            return response.json();
        },
        getByUserId: async (userId: string) => {
            const response = await fetch(`${API_BASE_URL}/profiles.php?user_id=${userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to fetch profile");
            }
            return response.json();
        }
    },
    subscriptions: {
        create: async (subscriptionData: unknown) => {
            const response = await fetch(`${API_BASE_URL}/subscriptions.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscriptionData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to create subscription");
            }
            return response.json();
        },
        update: async (id: string, data: unknown) => {
            const response = await fetch(`${API_BASE_URL}/subscriptions.php?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to update subscription");
            }
            return response.json();
        },
        getActiveByUserId: async (userId: string) => {
            const response = await fetch(`${API_BASE_URL}/subscriptions.php?user_id=${userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to fetch subscription");
            }
            return response.json();
        }
    },
    dietPlans: {
        createBatch: async (plans: unknown[]) => {
            const response = await fetch(`${API_BASE_URL}/daily_diet_plans.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(plans),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to create diet plans");
            }
            return response.json();
        },
        getBySubscription: async (subscriptionId: string) => {
            const response = await fetch(`${API_BASE_URL}/daily_diet_plans.php?subscription_id=${subscriptionId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to fetch diet plans");
            }
            return response.json();
        },
        unlock: async (subscriptionId: string, dayNumber: number, mealPlan: unknown) => {
            const response = await fetch(`${API_BASE_URL}/daily_diet_plans.php?subscription_id=${subscriptionId}&day_number=${dayNumber}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    is_unlocked: true,
                    unlocked_at: new Date().toISOString(),
                    meal_plan: mealPlan
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to unlock plan");
            }
            return response.json();
        },
        generate: async (userProfile: unknown, dayNumber: number, planType: string) => {
            const response = await fetch(`${API_BASE_URL}/generate_plan.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userProfile,
                    dayNumber, // Note: using dayNumber instead of day_number to match PHP
                    planType
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Failed to generate plan");
            }
            return response.json();
        },
        checkIn: async (data: { subscription_id: string, day_number: number, weight?: number, mood?: string, notes?: string }) => {
            const response = await fetch(`${API_BASE_URL}/checkin.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || "Check-in failed");
            }
            return response.json();
        }
    }
};
