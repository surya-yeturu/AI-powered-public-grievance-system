# 🏙️ Smart City Civic Grievance Management System

An AI-powered civic grievance prioritization platform built with the MERN stack and OpenAI API. This system enables citizens to report civic complaints and government officials to manage and resolve them efficiently with AI-assisted classification.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Demo Credentials](#demo-credentials)
- [Screenshots](#screenshots)
- [License](#license)

## ✨ Features

### For Citizens
- ✅ Register and login securely
- ✅ Submit civic complaints with text, location, and images
- ✅ AI automatically classifies complaints by department and priority
- ✅ Track complaint status in real-time (Pending / In Progress / Resolved)
- ✅ View complaint history and resolution remarks

### For Government Officials
- ✅ Login with department-specific accounts
- ✅ View complaints filtered by department and priority
- ✅ Update complaint status and add resolution remarks
- ✅ Dashboard with statistics and priority management

### AI-Powered Features
- 🤖 Automatic department assignment (Roads, Electricity, Drainage, Sanitation)
- 🤖 Intelligent priority classification (High, Medium, Low)
- 🤖 AI-generated reasoning for priority decisions
- 🤖 Powered by OpenAI GPT-3.5 Turbo

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library with modern hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Custom styling (no external UI libraries)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### AI & Authentication
- **OpenAI API** - GPT-3.5 for NLP classification
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
F-4/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ComplaintCard.js
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/        # React context
│   │   │   └── AuthContext.js
│   │   ├── pages/          # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── CitizenDashboard.js
│   │   │   ├── NewComplaint.js
│   │   │   ├── OfficialDashboard.js
│   │   │   └── ComplaintDetail.js
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   └── complaintController.js
│   ├── middlewares/        # Custom middleware
│   │   ├── auth.js
│   │   └── validator.js
│   ├── models/             # Mongoose models
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   ├── services/           # Business logic
│   │   └── openaiService.js
│   ├── scripts/            # Utility scripts
│   │   └── seedData.js
│   ├── server.js           # Entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **OpenAI API Key** - [Get API Key](https://platform.openai.com/api-keys)
- **npm** or **yarn** package manager

## 🚀 Installation

### 1. Clone the Repository

```bash
cd F-4
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Edit `.env` and add your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/smart-city-grievance

# JWT Secret (Use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Frontend Configuration

1. Navigate to the `client` directory
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### Seed Database (Optional)

Populate the database with sample data:

```bash
cd server
node scripts/seedData.js
```

This creates:
- 2 citizen accounts
- 4 government official accounts (one per department)
- 5 sample complaints

### Start Backend Server

```bash
cd server
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

### Start Frontend

Open a new terminal:

```bash
cd client
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Demo Credentials

After seeding the database, you can use these credentials:

### Citizens
- **Email:** citizen@test.com  
  **Password:** password123

- **Email:** citizen2@test.com  
  **Password:** password123

### Government Officials

- **Roads Department**  
  **Email:** official.roads@test.com  
  **Password:** password123

- **Electricity Department**  
  **Email:** official.electricity@test.com  
  **Password:** password123

- **Drainage Department**  
  **Email:** official.drainage@test.com  
  **Password:** password123

- **Sanitation Department**  
  **Email:** official.sanitation@test.com  
  **Password:** password123

## 📡 API Documentation

### Authentication Endpoints

#### Register (Citizen Only)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Complaint Endpoints

#### Create Complaint (Citizen)
```http
POST /api/complaints
Authorization: Bearer <token>
Content-Type: application/json

{
  "complaintText": "Description of the issue",
  "location": "Location details",
  "imageUrl": "https://example.com/image.jpg" (optional)
}
```

#### Get My Complaints (Citizen)
```http
GET /api/complaints/my
Authorization: Bearer <token>
```

#### Get Department Complaints (Official)
```http
GET /api/complaints/department?priority=High&status=Pending
Authorization: Bearer <token>
```

#### Get Complaint by ID
```http
GET /api/complaints/:id
Authorization: Bearer <token>
```

#### Update Complaint Status (Official)
```http
PATCH /api/complaints/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress",
  "resolutionRemarks": "Working on it"
}
```

#### Get Statistics
```http
GET /api/complaints/stats
Authorization: Bearer <token>
```

## 👥 User Roles

### Citizen
- Can register publicly
- Submit complaints
- View own complaints
- Track complaint status
- Cannot update complaint status

### Government Official
- Cannot register publicly (admin-created)
- Assigned to specific department
- View department-specific complaints
- Update complaint status
- Add resolution remarks
- Cannot create complaints

## 🔄 Application Flow

1. **Citizen submits complaint** → Enters text, location, optional image
2. **Backend receives complaint** → Sends text to OpenAI API
3. **OpenAI analyzes** → Returns department, priority, and reasoning
4. **Complaint saved** → Stored in MongoDB with AI classification
5. **Official reviews** → Sees complaint in department dashboard
6. **Status updated** → Official changes status and adds remarks
7. **Citizen notified** → Status reflects in citizen dashboard

## 🤖 AI Classification Logic

The OpenAI service uses GPT-3.5 Turbo with the following prompt:

```
You are an AI assistant for a smart city grievance system.
Given a citizen complaint, identify:
1. Relevant department (Roads, Electricity, Drainage, Sanitation)
2. Priority level (High, Medium, Low)
3. Short reason for the priority

Return ONLY valid JSON in this format:
{
  "department": "",
  "priority": "",
  "reason": ""
}
```

### Fallback Mechanism
If OpenAI API fails, the system automatically assigns:
- **Department:** Roads (default)
- **Priority:** Medium (default)
- **Reason:** "Auto-classified due to AI service error. Please review manually."

## 🎨 UI Features

- Clean, professional design
- Responsive layout (mobile-friendly)
- Color-coded priority badges
- Status indicators
- Real-time updates
- Loading states
- Error handling

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected API routes
- Input validation
- CORS configuration
- Environment variable protection

## 🧪 Testing the Application

### Test Citizen Flow
1. Register a new citizen account
2. Login and navigate to dashboard
3. Click "New Complaint"
4. Submit a complaint (e.g., "Broken street light on Park Avenue")
5. Observe AI classification results
6. View complaint in dashboard

### Test Official Flow
1. Login as an official (use demo credentials)
2. View department-specific complaints
3. Filter by priority/status
4. Click on a complaint
5. Update status and add remarks
6. Verify changes reflect in citizen dashboard

## 📝 Notes

- This is a **demonstration system** and does not integrate with actual government systems
- OpenAI API calls are rate-limited based on your API plan
- Images are stored as URLs (not uploaded to server)
- All data is stored in MongoDB

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running

### OpenAI API Error
```
Error: Invalid API key
```
**Solution:** Check your `.env` file has correct `OPENAI_API_KEY`

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Change `PORT` in server `.env` or kill the process using that port

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure `CLIENT_URL` in server `.env` matches your frontend URL

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Ensure MongoDB connection string is set
3. Deploy using Git

### Frontend Deployment (Vercel/Netlify)
1. Build the production bundle: `npm run build`
2. Set `REACT_APP_API_URL` to production backend URL
3. Deploy the `build` folder

## 📄 License

This project is created for educational and demonstration purposes.

## 👨‍💻 Author

Built as a hackathon-ready MERN stack application with AI integration.

---

**Happy Coding! 🎉**

For issues or questions, please check the troubleshooting section or review the code comments.
#   A I - p o w e r e d - p u b l i c - g r i e v a n c e - s y s t e m  
 