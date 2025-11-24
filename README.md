# Admin Panel - Registration Management System

A secure, full-stack admin panel for managing registration form submissions with JWT authentication, advanced search/filter capabilities, print functionality, and Excel/CSV export.

## 🚀 Features

- ✅ **Secure Authentication**: JWT-based admin login with protected routes
- ✅ **Dashboard**: View all registration submissions in a clean, responsive table
- ✅ **Advanced Search & Filter**:
  - Search by name or phone number
  - Filter by circle
  - Date range filtering
  - Real-time filtering
- ✅ **Print Functionality**: Print individual entries or all filtered results
- ✅ **Export**: Export data to Excel (.xlsx) or CSV format
- ✅ **Modern UI**: Responsive design with smooth animations
- ✅ **Statistics**: View total registrations, today's count, and filtered results

## 📁 Project Structure

```
jamal ustha/
├── backend/
│   ├── models/
│   │   ├── Admin.js              # Admin user schema
│   │   └── Registration.js       # Registration form schema
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── routes/
│   │   └── adminRoutes.js        # Admin API routes
│   ├── .env                      # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Express server
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminLogin.jsx    # Login page
    │   │   ├── AdminDashboard.jsx # Dashboard with all features
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── App.jsx               # Main app component
    │   ├── App.css               # Styles
    │   └── main.jsx              # Entry point
    ├── .gitignore
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   The `.env` file is already created with default values. Update if needed:
   
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/registration_db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
   JWT_EXPIRE=7d
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**:
   
   If using local MongoDB:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
   
   Or use MongoDB Atlas and update the `MONGODB_URI` in `.env`

5. **Start the backend server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

4. **Access the application**:
   
   Open your browser and go to `http://localhost:5173`

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials in production!

## 📊 API Endpoints

### Authentication

- **POST** `/api/admin/login`
  - Body: `{ username, password }`
  - Returns: `{ success, token, admin }`

### Admin Routes (Protected)

All routes require `Authorization: Bearer <token>` header

- **GET** `/api/admin/forms`
  - Query params: `search`, `searchBy`, `circle`, `dateFrom`, `dateTo`, `page`, `limit`
  - Returns: List of registration entries

- **GET** `/api/admin/stats`
  - Returns: Dashboard statistics

### Health Check

- **GET** `/api/health`
  - Returns: Server status

## 💾 Database Schema

### Registration Collection

```javascript
{
  name: String,           // പേര്
  phone: String,          // ഫോൺ നമ്പർ
  job: String,            // ജോലി
  jobLocation: String,    // ജോലി സ്ഥലം
  address: String,        // വാസ സ്ഥലം
  circle: String,         // സർക്കിൾ
  paymentId: String,      // Razorpay Payment ID
  submittedAt: Date,      // Submission timestamp
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Collection

```javascript
{
  username: String,
  password: String (hashed with bcrypt),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Features Guide

### Search & Filter

1. **Search by Name**: Select "Name" from dropdown and enter search term
2. **Search by Phone**: Select "Phone Number" and enter digits
3. **Filter by Circle**: Enter circle name in the circle filter
4. **Date Range**: Select start and end dates to filter submissions
5. **Clear Filters**: Click "Clear Filters" to reset all filters

### Print Functionality

- **Print Single Entry**: Click the 🖨️ button next to any entry
- **Print All**: Click "Print All" button to print all filtered results
- Print view opens in a new window with clean formatting

### Export Data

- **Excel Export**: Click "Export to Excel" for .xlsx file
- **CSV Export**: Click "Export to CSV" for .csv file
- Exported files include all filtered data with timestamp in filename

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation
- ✅ Token expiration (7 days default)

## 🚀 Production Deployment

For detailed, step-by-step instructions on how to deploy this application to **Render** (Backend) and **Vercel** (Frontend), please refer to the [Deployment Guide](./DEPLOYMENT_GUIDE.md).

### Quick Overview

1.  **Backend**: Deployed on Render.
    -   Connects to PostgreSQL database.
    -   Requires environment variables (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`).
2.  **Frontend**: Deployed on Vercel.
    -   Connects to the Render backend via `VITE_API_URL`.

## 🧪 Testing the Application

### 1. Test Backend

```bash
# Check server health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Add Sample Data

You can add sample registration data directly to MongoDB:

```javascript
// Using MongoDB Compass or mongosh
use registration_db

db.registrations.insertOne({
  name: "Test User",
  phone: "1234567890",
  job: "Engineer",
  jobLocation: "Kochi",
  address: "Test Address, Kerala",
  circle: "Circle A",
  paymentId: "pay_test123456",
  submittedAt: new Date()
})
```

### 3. Test Frontend

1. Open `http://localhost:5173`
2. Login with admin credentials
3. Verify dashboard loads
4. Test search and filter features
5. Test print functionality
6. Test export to Excel/CSV

## 📝 Adding More Admins

To add additional admin users to the database:

```javascript
// Using mongosh or a script
use registration_db

db.admins.insertOne({
  username: "newadmin",
  password: "$2a$10$..." // Use bcrypt to hash the password
})
```

Or create a registration endpoint in the backend (not included for security).

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity for Atlas

### CORS Error

- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `server.js`

### Token Invalid Error

- Token may have expired (default 7 days)
- Clear localStorage and login again
- Check JWT_SECRET is consistent

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

## 📞 Support

For issues or questions, please check:
- MongoDB connection status
- Node.js and npm versions
- Console errors in browser DevTools
- Backend server logs

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
