# 👨‍💻 Developer Notes & Quick Reference

## 🔧 Project Configuration

### Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-grievance
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=sk-your-openai-key
CLIENT_URL=http://localhost:3000
```

**Frontend (`client/.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/register          - Register citizen
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user
```

### Complaints
```
POST   /api/complaints             - Create complaint (Citizen)
GET    /api/complaints/my          - Get my complaints (Citizen)
GET    /api/complaints/department  - Get dept complaints (Official)
GET    /api/complaints/stats       - Get statistics
GET    /api/complaints/:id         - Get complaint by ID
PATCH  /api/complaints/:id/status  - Update status (Official)
```

## 🗄️ Database Collections

### users
- `_id`, `name`, `email`, `password`, `role`, `department`, `createdAt`

### complaints
- `_id`, `citizenId`, `complaintText`, `imageUrl`, `location`
- `department`, `priority`, `priorityReason`
- `status`, `resolutionRemarks`, `updatedBy`
- `createdAt`, `updatedAt`

## 🎨 Component Hierarchy

```
App
├── Navbar
├── Routes
    ├── Public
    │   ├── Home
    │   ├── Login
    │   └── Register
    ├── Citizen (Protected)
    │   ├── CitizenDashboard
    │   │   └── ComplaintCard (multiple)
    │   └── NewComplaint
    └── Official (Protected)
        ├── OfficialDashboard
        │   └── ComplaintCard (multiple)
        └── ComplaintDetail
```

## 🔐 Authentication Flow

```
1. User submits credentials → authController.login()
2. Verify password → user.comparePassword()
3. Generate JWT → jwt.sign()
4. Return token + user data
5. Frontend stores in localStorage
6. Axios interceptor adds token to requests
7. Backend middleware verifies token
8. Attach user to req.user
```

## 🤖 AI Classification Flow

```
1. Citizen submits complaint
2. complaintController.createComplaint()
3. Call openaiService.classifyComplaint()
4. Send prompt to OpenAI API
5. Parse JSON response
6. Validate department & priority
7. Save complaint with AI data
8. Return to frontend
```

## 🎯 Key Files to Modify

### Adding a New Department
1. `server/models/User.js` - Add to department enum
2. `server/models/Complaint.js` - Add to department enum
3. `server/services/openaiService.js` - Update prompt
4. `server/scripts/seedData.js` - Add official account

### Adding a New Status
1. `server/models/Complaint.js` - Add to status enum
2. `client/src/components/ComplaintCard.js` - Add status class
3. `client/src/styles/index.css` - Add status badge style

### Customizing AI Behavior
- Edit `server/services/openaiService.js`
- Modify the prompt in `classifyComplaint()` function
- Adjust temperature (0.0-1.0) for consistency vs creativity
- Change model (gpt-3.5-turbo, gpt-4, etc.)

## 🛠️ Useful Commands

### Backend
```bash
cd server
npm install              # Install dependencies
npm start               # Start production server
npm run dev             # Start with nodemon
npm run seed            # Seed database
node scripts/seedData.js # Alternative seed command
```

### Frontend
```bash
cd client
npm install             # Install dependencies
npm start              # Start dev server (port 3000)
npm run build          # Build for production
```

### MongoDB
```bash
mongosh                           # Open MongoDB shell
use smart-city-grievance         # Switch to database
db.users.find()                  # View all users
db.complaints.find()             # View all complaints
db.complaints.countDocuments()   # Count complaints
db.dropDatabase()                # Delete database (careful!)
```

## 🐛 Common Debugging Tips

### Backend Issues
```javascript
// Add logging in controllers
console.log('Request body:', req.body);
console.log('User:', req.user);

// Check MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// Log OpenAI responses
console.log('AI Response:', classification);
```

### Frontend Issues
```javascript
// Check auth state
console.log('User:', user);
console.log('Token:', localStorage.getItem('token'));

// Debug API calls
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

## 📦 Package Versions

### Backend
- express: ^4.18.2
- mongoose: ^8.0.3
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- openai: ^4.24.1
- cors: ^2.8.5
- dotenv: ^16.3.1
- express-validator: ^7.0.1

### Frontend
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.1
- axios: ^1.6.2

## 🎨 CSS Class Reference

### Badges
- `.priority-high` - Red badge
- `.priority-medium` - Yellow badge
- `.priority-low` - Blue badge
- `.status-pending` - Yellow badge
- `.status-in-progress` - Blue badge
- `.status-resolved` - Green badge

### Buttons
- `.btn` - Base button
- `.btn-primary` - Blue button
- `.btn-secondary` - Gray button

### Layout
- `.dashboard-container` - Main container
- `.form-container` - Form wrapper
- `.complaint-card` - Complaint card

## 🔄 State Management

### AuthContext
```javascript
const { user, loading, login, register, logout, 
        isAuthenticated, isCitizen, isOfficial } = useAuth();
```

### API Service
```javascript
import { authAPI, complaintAPI } from '../services/api';

// Usage
const response = await complaintAPI.create(data);
const complaints = await complaintAPI.getMyComplaints();
```

## 🚀 Performance Tips

1. **Backend:**
   - Add indexes to MongoDB (email, department, status)
   - Implement pagination for large datasets
   - Cache OpenAI responses for similar complaints
   - Use lean() for read-only queries

2. **Frontend:**
   - Lazy load routes with React.lazy()
   - Memoize expensive computations
   - Implement virtual scrolling for long lists
   - Optimize images

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Role-based access control
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: HTTPS in production
- ⚠️ TODO: Helmet.js for security headers

## 📝 Code Style Guide

### Backend
```javascript
// Use async/await
exports.createComplaint = async (req, res) => {
  try {
    // Logic here
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Consistent error responses
return res.status(400).json({
  success: false,
  message: 'Error message'
});
```

### Frontend
```javascript
// Use functional components with hooks
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>...</div>;
};

// Handle async operations
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.call();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 🧪 Testing Scenarios

### Test Case 1: Citizen Registration
1. Navigate to /register
2. Fill form with valid data
3. Submit
4. Verify redirect to dashboard
5. Check localStorage for token

### Test Case 2: AI Classification
1. Login as citizen
2. Submit complaint: "Power outage in my area"
3. Verify department = "Electricity"
4. Verify priority assigned
5. Check AI reasoning displayed

### Test Case 3: Status Update
1. Login as official
2. Open a pending complaint
3. Change status to "In Progress"
4. Add resolution remarks
5. Verify update reflected

## 🔗 Useful Links

- OpenAI API Docs: https://platform.openai.com/docs
- MongoDB Docs: https://docs.mongodb.com
- Express.js Guide: https://expressjs.com/en/guide
- React Docs: https://react.dev
- JWT.io: https://jwt.io

## 💡 Feature Ideas for Extension

1. Email notifications on status change
2. File upload for images (using multer)
3. Real-time updates with Socket.io
4. Admin panel for user management
5. Analytics dashboard
6. Mobile app (React Native)
7. Multi-language support
8. Complaint voting/upvoting
9. Geolocation integration
10. PDF report generation

---

**Happy Coding! 🎉**

For questions, check the main README.md or review the inline code comments.
