# Agro Billing System

A comprehensive billing and inventory management system designed for agricultural businesses (Purchase from Company, Sales to Farmers). Built with the MERN stack (MySQL, Express, React, Node.js).

## 🚀 Features

- **Dashboard**: Real-time overview of sales, stock, and recent activities.
- **Masters**: Manage Items (Products) and Parties (Farmers/Suppliers).
- **Purchase Management**: 
  - Record purchases from companies.
  - Automatic stock updates.
- **Sales Management**: 
  - Billing for farmers.
  - Print professional invoices (A4 format).
- **Reports**: Stock Reports, Purchase History, Payment Reports.
- **User Management**: Secure login and authentication.

## 🛠 Tech Stack

- **Frontend**: React.js (Vite), PrimeReact (UI Components), Tailwind CSS (Utilities).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Tooling**: Concurrently (to run both servers).

## 📦 Installation & Setup

1. **Clone the repository** (if not already done).

2. **Install Dependencies**:
   Run the following command from the root directory to install dependencies for root, client, and server:
   ```bash
   npm run install-all
   ```

3. **Database Configuration**:
   - Create a MySQL database named `agro_billing`.
   - Update the database credentials in `server/.env`:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=agro_billing
     JWT_SECRET=your_jwt_secret
     ```
   - **Import Schema**: Run the SQL script located at `server/database/full_schema.sql` in your MySQL Workbench or CLI to create the tables.
   - **Note**: The user table is named `app_users` to avoid conflicts.

4. **Default Admin Credentials**:
   - **Username**: `admin`
   - **Password**: `admin123`

## 🏃‍♂️ Running the Application

To run both the **Client** (Frontend) and **Server** (Backend) simultaneously:

```bash
npm run dev
```

- Client runs on: `http://localhost:5173`
- Server runs on: `http://localhost:5000`

## 📂 Project Structure

- **/client**: React frontend code.
- **/server**: Node/Express backend code.
  - `/config`: Database connection.
  - `/controllers`: Logic for API endpoints.
  - `/database`: SQL Schema files.
  - `/routes`: API Routes.
