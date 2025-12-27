# Backend Setup

1. **Database Setup**:
   - Open PHPMyAdmin.
   - Create a database named `dietplan`.
   - Import the `database.sql` file found in this directory.

2. **Configuration**:
   - Open `db.php` and verify the `$user` and `$pass` match your MySQL credentials (default XAMPP is root/empty).

3. **Running**:
   - You can host this folder on your local server (e.g., XAMPP/WAMP `htdocs`).
   - If using XAMPP, place the `backend` folder in `C:\xampp\htdocs\dietplan_backend`.
   - Your API endpoints will be accessible at `http://localhost/dietplan_backend/api.php` (etc).

4. **Frontend Integration**:
   - You will need to update your Frontend code to fetch from these PHP endpoints instead of Supabase.
