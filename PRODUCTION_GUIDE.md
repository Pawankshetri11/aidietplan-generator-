# Hostinger Deployment Guide for LuxeDiet

This guide is tailored for deploying the LuxeDiet application to **Hostinger** (Shared Hosting, Cloud Hosting, or VPS).

## Prerequisites
- **Local Machine**: Node.js installed to build the project.
- **Hostinger Account**: Access to **hPanel**.
- **Domain**: A domain or subdomain connected to your Hostinger account.

---

## Step 1: Prepare the Build (Local Machine)

Since Hostinger Shared Hosting doesn't easily support running `npm build`, we will build the project locally and upload the final files.

1.  **Configure Environment**:
    *   Open `frontend/.env`.
    *   Set `VITE_API_BASE_URL` to your production domain API path.
        *   *Example*: `https://your-domain.com/api` (or `https://api.your-domain.com` if using a subdomain).
    *   Set `VITE_GOOGLE_CLIENT_ID` to your production Google Client ID.
    *   Set `VITE_ENABLE_REGENERATE=false` and `VITE_ENABLE_DUMMY_DATA=false`.

2.  **Build the Project**:
    Open your terminal in the project root:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
    This creates a `dist` folder inside `frontend`.

3.  **Zip the Build**:
    *   Go to `frontend/dist`.
    *   Select all files inside it -> Right Click -> **Compress to ZIP** (e.g., `frontend_build.zip`).

4.  **Zip the Backend**:
    *   Go to the `backend` folder.
    *   Select all files -> Right Click -> **Compress to ZIP** (e.g., `backend_code.zip`).

---

## Step 2: Database Setup (Hostinger hPanel)

1.  Log in to **Hostinger hPanel**.
2.  Go to **Databases** > **Management**.
3.  **Create a New MySQL Database**:
    *   **Database Name**: e.g., `u123456789_luxediet`
    *   **Username**: e.g., `u123456789_admin`
    *   **Password**: Create a strong password. **Write these down!**
4.  Click **Create**.
5.  **Enter phpMyAdmin**:
    *   Click "Enter phpMyAdmin" next to your new database.
6.  **Import Data**:
    *   Export your local `luxediet_db` to a `.sql` file.
    *   In phpMyAdmin, click **Import** tab.
    *   Upload your `.sql` file and click **Go**.

---

## Step 3: Configure Backend Connection

1.  Unzip `backend_code.zip` locally if needed, or edit before zipping.
2.  Open `backend/db_connection.php`.
3.  Update the credentials to match your **Hostinger Database**:
    ```php
    $host = "localhost"; // Usually 'localhost' on Hostinger
    $username = "u123456789_admin"; // From Step 2
    $password = "YourStrongPassword"; // From Step 2
    $dbname = "u123456789_luxediet"; // From Step 2
    ```
4.  Save the file. (If you already zipped `backend_code.zip`, re-zip it with this change).

---

## Step 4: Upload Files (Hostinger File Manager)

1.  In hPanel, go to **Files** > **File Manager**.
2.  Navigate to `public_html`.

### Uploading Backend
1.  Create a folder named `api` inside `public_html`.
2.  Open the `api` folder.
3.  Upload `backend_code.zip`.
4.  Right-click the zip and choose **Extract**.
5.  Delete the zip file.
    *   *Result*: Your API should be accessible at `https://your-domain.com/api/test_connection.php` (if you kept a test file) or similar.

### Uploading Frontend
1.  Go back to `public_html` root.
2.  Upload `frontend_build.zip`.
3.  Right-click and **Extract**.
4.  **Move Files (If needed)**:
    *   If extracting created a subfolder (like `dist`), go inside it, select all files, move them to `public_html` directly.
    *   Ensure `index.html` is strictly inside `public_html`.
5.  Delete the zip file.

---

## Step 5: Setup URL Rewrites (Important!)

Hostinger uses Apache/LiteSpeed. You need an `.htaccess` file to make the React app work on page refresh.

1.  In File Manager (`public_html`), look for `.htaccess`.
2.  If it doesn't exist, create a **New File** named `.htaccess`.
3.  Edit it and paste this code:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```
4.  Save and Close.

## Step 6: Live Configuration (Config Room)

Once deployed, you can change critical settings without rebuilding the frontend.

1.  Locate `public_html/config.js`.
2.  Edit this file to update:
    *   **API URL**: Change `apiBaseUrl` if you move your backend.
    *   **Google ID**: Change `googleClientId` if you update your Google Cloud project.
    *   **Pricing**: Update `priceStarter`, `pricePremium`, `priceElite` and their corresponding `originalPrice` values.
    *   **Feature Flags**:
        *   `enableDummyData`: Set to `true` to enable "Fill Dummy Data" buttons (useful for testing).
        *   `enableRegenerate`: Set to `true` to enable the "Regenerate Plan" debug button on the dashboard.

---

## Step 7: Final Verification

1.  **Check PHP Version**:
    *   In hPanel, go to **Advanced** > **PHP Configuration**.
    *   Ensure **PHP 8.1** or higher is selected.
2.  **Visit your site**: `https://your-domain.com`.
3.  **Test**:
    *   Try Logging in.
    *   Try generating a plan.
    *   If API calls fail (404 or Network Error), verify your `VITE_API_BASE_URL` was correct in Step 1.

**Done! Your LuxeDiet app is live on Hostinger.**
