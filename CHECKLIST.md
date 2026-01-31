# ✅ Pre-Launch Checklist

Use this checklist to ensure everything is set up correctly before running the application.

## 📋 Installation Checklist

### Prerequisites
- [ ] Node.js installed (v14+) - Run `node --version`
- [ ] MongoDB installed and accessible - Run `mongosh`
- [ ] OpenAI API key obtained from https://platform.openai.com/api-keys
- [ ] Git installed (optional, for version control)

### Backend Setup
- [ ] Navigate to `server` directory
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Edit `.env` with your MongoDB URI
- [ ] Edit `.env` with your OpenAI API key
- [ ] Edit `.env` with a strong JWT secret
- [ ] Verify all dependencies installed successfully

### Frontend Setup
- [ ] Navigate to `client` directory
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Edit `.env` with backend API URL (default: http://localhost:5000/api)
- [ ] Verify all dependencies installed successfully

### Database Setup
- [ ] MongoDB service is running
- [ ] Can connect to MongoDB (test with `mongosh`)
- [ ] Run seed script: `cd server && npm run seed`
- [ ] Verify seed data created successfully

## 🚀 Launch Checklist

### Before Starting
- [ ] MongoDB is running
- [ ] No other services using port 5000
- [ ] No other services using port 3000
- [ ] Environment variables are set correctly

### Starting Backend
- [ ] Open terminal in `server` directory
- [ ] Run `npm run dev` or `npm start`
- [ ] Check console for "MongoDB Connected" message
- [ ] Check console for "Server running on port 5000" message
- [ ] Test health endpoint: http://localhost:5000/health

### Starting Frontend
- [ ] Open new terminal in `client` directory
- [ ] Run `npm start`
- [ ] Browser opens automatically to http://localhost:3000
- [ ] No console errors in browser DevTools
- [ ] Home page loads correctly

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Home page displays correctly
- [ ] Can navigate to Login page
- [ ] Can navigate to Register page

### Citizen Flow
- [ ] Can register new citizen account
- [ ] Redirects to dashboard after registration
- [ ] Can login with test account (citizen@test.com)
- [ ] Dashboard shows statistics
- [ ] Can click "New Complaint"
- [ ] Can submit complaint with text and location
- [ ] AI classification appears (department, priority, reason)
- [ ] Complaint appears in "My Complaints"
- [ ] Can view complaint details
- [ ] Can logout

### Official Flow
- [ ] Can login as official (official.roads@test.com)
- [ ] Dashboard shows department name
- [ ] Can see complaints for assigned department
- [ ] Can filter by priority
- [ ] Can filter by status
- [ ] Can click on a complaint
- [ ] Can update complaint status
- [ ] Can add resolution remarks
- [ ] Changes save successfully
- [ ] Can logout

### AI Classification
- [ ] Submit complaint about "broken street light"
- [ ] Verify department = "Electricity"
- [ ] Submit complaint about "pothole on road"
- [ ] Verify department = "Roads"
- [ ] Submit complaint about "garbage not collected"
- [ ] Verify department = "Sanitation"
- [ ] Submit complaint about "water logging"
- [ ] Verify department = "Drainage"

## 🔍 Troubleshooting Checklist

### If Backend Won't Start
- [ ] Check MongoDB is running
- [ ] Check port 5000 is available
- [ ] Verify .env file exists in server folder
- [ ] Check all environment variables are set
- [ ] Run `npm install` again
- [ ] Check for error messages in console

### If Frontend Won't Start
- [ ] Check port 3000 is available
- [ ] Verify .env file exists in client folder
- [ ] Check REACT_APP_API_URL is correct
- [ ] Run `npm install` again
- [ ] Clear browser cache
- [ ] Check for error messages in console

### If Login Fails
- [ ] Verify backend is running
- [ ] Check network tab in browser DevTools
- [ ] Verify credentials are correct
- [ ] Check database has users (run seed script)
- [ ] Check JWT_SECRET is set in backend .env

### If AI Classification Fails
- [ ] Verify OpenAI API key is correct
- [ ] Check OpenAI account has credits
- [ ] Check console for OpenAI error messages
- [ ] System should use fallback classification
- [ ] Complaint should still be created

### If Complaints Don't Show
- [ ] Verify user is logged in
- [ ] Check correct role (citizen sees own, official sees department)
- [ ] Check database has complaints (run seed script)
- [ ] Check network tab for API errors
- [ ] Verify token is being sent in requests

## 📊 Final Verification

### Code Quality
- [ ] No console errors in backend
- [ ] No console errors in frontend
- [ ] No linting errors
- [ ] All files saved

### Documentation
- [ ] README.md is complete
- [ ] SETUP_GUIDE.md is available
- [ ] Environment variables documented
- [ ] Demo credentials listed

### Features
- [ ] Authentication works
- [ ] Registration works
- [ ] Complaint creation works
- [ ] AI classification works
- [ ] Status updates work
- [ ] Filtering works
- [ ] Statistics display correctly

### UI/UX
- [ ] Navbar displays correctly
- [ ] Badges show proper colors
- [ ] Forms validate input
- [ ] Error messages display
- [ ] Success messages display
- [ ] Loading states work
- [ ] Responsive on mobile

## 🎉 Ready to Demo!

If all items are checked, your application is ready to demonstrate!

### Demo Script
1. Show home page and explain features
2. Register a new citizen account
3. Submit a complaint and show AI classification
4. Logout and login as official
5. Show filtered complaints
6. Update a complaint status
7. Show updated status in citizen view

### Key Points to Highlight
- ✨ AI-powered automatic classification
- 🔐 Secure role-based access
- 📊 Real-time status tracking
- 🎨 Clean, professional UI
- 🚀 Full-stack MERN implementation
- 🤖 OpenAI GPT-3.5 integration

---

**Good Luck! 🚀**

Remember: If something doesn't work, check the DEVELOPER_NOTES.md for debugging tips!
