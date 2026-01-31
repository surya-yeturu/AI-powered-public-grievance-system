# 🚀 Quick Setup Guide

This guide will help you get the Smart City Grievance Management System up and running in minutes.

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables

**Backend (.env in server folder):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-grievance
JWT_SECRET=my_super_secret_key_12345
OPENAI_API_KEY=sk-your-actual-openai-key-here
CLIENT_URL=http://localhost:3000
```

**Frontend (.env in client folder):**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Step 4: Seed Database (Optional but Recommended)

```bash
cd server
node scripts/seedData.js
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### Step 6: Access the Application

Open your browser and go to: `http://localhost:3000`

## 🔑 Test Accounts

### Citizen Account
- Email: `citizen@test.com`
- Password: `password123`

### Official Accounts
- Roads: `official.roads@test.com` / `password123`
- Electricity: `official.electricity@test.com` / `password123`
- Drainage: `official.drainage@test.com` / `password123`
- Sanitation: `official.sanitation@test.com` / `password123`

## 🧪 Testing the System

### As a Citizen:
1. Login with citizen credentials
2. Click "New Complaint"
3. Enter: "Street light broken on Main Street causing safety issues"
4. Add location: "Main Street, Sector 5"
5. Submit and watch AI classify it!

### As an Official:
1. Login with any official account
2. View complaints for your department
3. Click on a complaint
4. Update status to "In Progress"
5. Add resolution remarks

## ❗ Common Issues

### MongoDB not running?
```bash
# Check if MongoDB is running
mongosh

# If not, start it
sudo systemctl start mongod
```

### Port 5000 already in use?
Change `PORT=5001` in `server/.env`

### OpenAI API errors?
- Verify your API key is correct
- Check you have credits in your OpenAI account
- The system will use fallback classification if API fails

## 📱 Features to Test

✅ Citizen registration  
✅ Login/Logout  
✅ Submit complaint with AI classification  
✅ View complaint status  
✅ Filter complaints by status/priority  
✅ Official dashboard  
✅ Update complaint status  
✅ Add resolution remarks  

## 🎯 Next Steps

- Customize the UI colors in CSS files
- Add more departments
- Enhance AI prompts for better classification
- Add email notifications
- Deploy to production

---

Need help? Check the main README.md for detailed documentation!
