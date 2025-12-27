# LuxeDiet Project Documentation

## Overview
LuxeDiet is a premium, AI-powered diet planning web application personalized by Dr. Kanchan Suthar. It offers users personalized meal plans based on their unique biodata (BMI, health goals, dietary preferences) using advanced AI (OpenAI/Gemini) validated by medical standards.

## Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Data Fetching**: TanStack Query
- **State Management**: React Hooks
- **Animations**: AOS (Animate On Scroll)

### Backend
- **Language**: PHP (Vanilla)
- **Database**: MySQL
- **APIs**: RESTful endpoints with JSON responses

### Integrations
- **AI**: OpenAI GPT-4 / Google Gemini (for detailed Meal Plan generation)
- **Payment**: Cashfree Payments
- **Auth**: Google OAuth & Email/Password (Custom PHP Auth)

## Key Features

1.  **Smart Onboarding**: Multi-step form to capture detailed user metrics (Age, Weight, Lifestyle, Allergies, etc.).
2.  **Dual-tier Planning**:
    *   **Standard Plan**: Basic calorie-counted meals.
    *   **Ultimate Plan**: AI-generated detailed daily timeline, protocols, grocery lists, and benefits.
3.  **User Dashboard**:
    *   Interactive daily meal view.
    *   "Daily Unlock" mechanism to encourage engagement.
    *   Progress tracking (Weight, Water intake).
    *   PDF Download of the complete plan.
4.  **Admin Features**:
    *   Plan management (Starter vs Ultimate).
    *   Pricing configuration via Environment Variables.
5.  **Secure Authentication**:
    *   JWT-based session management (or PHP Session).
    *   Google Login integration.

## Database Schema Overview
- **users**: Authentication credentials and basic info.
- **profiles**: Detailed health metrics and onboarding data.
- **subscriptions**: Plan status, payment tracking, start/end dates.
- **diet_plans**: JSON storage of the generated weekly/monthly plans.
- **daily_unlocks**: Tracking which days a user has accessed.

## Directory Structure
- `/frontend`: Frontend Application (React/Vite)
  - `/src`: Frontend Source Code
  - `/public`: Static assets
  - `.env`: Frontend Configuration
- `/backend`: PHP API Endpoints
  - `auth.php`, `subscriptions.php`, `generate_plan.php`...
  - `db_connection.php`: Database connection settings.

## Environment Variables
The application uses a `.env` file for configuration:
- `VITE_API_BASE_URL`: URL to the PHP backend.
- `VITE_GOOGLE_CLIENT_ID`: OAuth ID.
- `VITE_ENABLE_REGENERATE`: Toggle "Regenerate" button visibility.
- `VITE_ENABLE_DUMMY_DATA`: Toggle "Fill Dummy Data" buttons.
- `VITE_PRICE_STARTER`, `VITE_PRICE_PREMIUM`...: Plan pricing config. 
