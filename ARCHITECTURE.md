# 🏗️ System Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Home    │  │  Login   │  │ Register │  │ Citizen  │       │
│  │  Page    │  │  Page    │  │  Page    │  │Dashboard │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │   New    │  │ Official │  │Complaint │                     │
│  │Complaint │  │Dashboard │  │  Detail  │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │         AuthContext (Global State)             │            │
│  │  - user, login, logout, isAuthenticated        │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │         API Service (Axios)                    │            │
│  │  - authAPI, complaintAPI                       │            │
│  │  - Token injection, Error handling             │            │
│  └────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│                     http://localhost:5000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │              Routes Layer                      │            │
│  │  /api/auth/*        /api/complaints/*          │            │
│  └────────────────────────────────────────────────┘            │
│                              │                                   │
│  ┌────────────────────────────────────────────────┐            │
│  │           Middleware Layer                     │            │
│  │  - authenticate (JWT verification)             │            │
│  │  - authorize (Role-based access)               │            │
│  │  - validate (Input validation)                 │            │
│  └────────────────────────────────────────────────┘            │
│                              │                                   │
│  ┌────────────────────────────────────────────────┐            │
│  │           Controllers Layer                    │            │
│  │  - authController                              │            │
│  │  - complaintController                         │            │
│  └────────────────────────────────────────────────┘            │
│                              │                                   │
│  ┌────────────────────────────────────────────────┐            │
│  │           Services Layer                       │            │
│  │  - openaiService (AI Classification)           │            │
│  └────────────────────────────────────────────────┘            │
│                              │                                   │
│  ┌────────────────────────────────────────────────┐            │
│  │           Models Layer (Mongoose)              │            │
│  │  - User Model                                  │            │
│  │  - Complaint Model                             │            │
│  └────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
│                  mongodb://localhost:27017                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐      ┌────────────────────┐            │
│  │   users collection │      │complaints collection│           │
│  │                    │      │                     │           │
│  │  - _id             │      │  - _id              │           │
│  │  - name            │      │  - citizenId (ref)  │           │
│  │  - email           │      │  - complaintText    │           │
│  │  - password        │      │  - location         │           │
│  │  - role            │      │  - imageUrl         │           │
│  │  - department      │      │  - department       │           │
│  │  - createdAt       │      │  - priority         │           │
│  │                    │      │  - priorityReason   │           │
│  │                    │      │  - status           │           │
│  │                    │      │  - resolutionRemarks│           │
│  │                    │      │  - updatedBy (ref)  │           │
│  │                    │      │  - createdAt        │           │
│  │                    │      │  - updatedAt        │           │
│  └────────────────────┘      └────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │   EXTERNAL API      │
                              │   OpenAI GPT-3.5    │
                              │                     │
                              │  - Classify dept    │
                              │  - Assign priority  │
                              │  - Generate reason  │
                              └─────────────────────┘
                                        ▲
                                        │
                                        │ HTTPS/REST
                                        │
                              ┌─────────┴─────────┐
                              │  openaiService    │
                              └───────────────────┘
```

## 🔄 Request Flow Diagrams

### 1. Citizen Registration Flow

```
User (Browser)
    │
    │ 1. Fill registration form
    │    (name, email, password)
    ▼
React Component (Register.js)
    │
    │ 2. Form validation
    │ 3. Call authAPI.register()
    ▼
API Service (api.js)
    │
    │ 4. POST /api/auth/register
    │    with JSON body
    ▼
Express Route (authRoutes.js)
    │
    │ 5. Validation middleware
    ▼
Auth Controller (authController.js)
    │
    │ 6. Check if user exists
    │ 7. Create new User
    ▼
User Model (User.js)
    │
    │ 8. Hash password (bcrypt)
    │ 9. Save to MongoDB
    ▼
MongoDB (users collection)
    │
    │ 10. Return saved user
    ▼
Auth Controller
    │
    │ 11. Generate JWT token
    │ 12. Return token + user data
    ▼
React Component
    │
    │ 13. Store token in localStorage
    │ 14. Update AuthContext
    │ 15. Redirect to dashboard
    ▼
User sees Dashboard
```

### 2. Complaint Submission with AI Classification Flow

```
Citizen (Browser)
    │
    │ 1. Fill complaint form
    │    (text, location, image URL)
    ▼
React Component (NewComplaint.js)
    │
    │ 2. Form validation
    │ 3. Call complaintAPI.create()
    ▼
API Service (api.js)
    │
    │ 4. POST /api/complaints
    │    Authorization: Bearer <token>
    ▼
Express Route (complaintRoutes.js)
    │
    │ 5. authenticate middleware
    │ 6. authorize('citizen')
    │ 7. validate input
    ▼
Complaint Controller (complaintController.js)
    │
    │ 8. Extract complaint text
    │ 9. Call openaiService.classifyComplaint()
    ▼
OpenAI Service (openaiService.js)
    │
    │ 10. Build prompt
    │ 11. Call OpenAI API
    ▼
OpenAI GPT-3.5 Turbo
    │
    │ 12. Analyze complaint text
    │ 13. Return JSON:
    │     {
    │       department: "Roads",
    │       priority: "High",
    │       reason: "Safety hazard..."
    │     }
    ▼
OpenAI Service
    │
    │ 14. Parse & validate JSON
    │ 15. Return classification
    ▼
Complaint Controller
    │
    │ 16. Create Complaint with AI data
    ▼
Complaint Model (Complaint.js)
    │
    │ 17. Validate schema
    │ 18. Save to MongoDB
    ▼
MongoDB (complaints collection)
    │
    │ 19. Return saved complaint
    ▼
Complaint Controller
    │
    │ 20. Populate citizen details
    │ 21. Return complaint + AI info
    ▼
React Component
    │
    │ 22. Show success message
    │ 23. Display AI classification
    │ 24. Redirect to dashboard
    ▼
Citizen sees complaint in dashboard
```

### 3. Official Status Update Flow

```
Official (Browser)
    │
    │ 1. View complaint detail
    │ 2. Update status form
    │    (status, remarks)
    ▼
React Component (ComplaintDetail.js)
    │
    │ 3. Call complaintAPI.updateStatus()
    ▼
API Service (api.js)
    │
    │ 4. PATCH /api/complaints/:id/status
    │    Authorization: Bearer <token>
    ▼
Express Route (complaintRoutes.js)
    │
    │ 5. authenticate middleware
    │ 6. authorize('official')
    │ 7. validate input
    ▼
Complaint Controller (complaintController.js)
    │
    │ 8. Find complaint by ID
    │ 9. Check department match
    │ 10. Update status & remarks
    │ 11. Set updatedBy = official ID
    ▼
Complaint Model (Complaint.js)
    │
    │ 12. Update updatedAt timestamp
    │ 13. Save to MongoDB
    ▼
MongoDB (complaints collection)
    │
    │ 14. Return updated complaint
    ▼
Complaint Controller
    │
    │ 15. Populate references
    │ 16. Return updated complaint
    ▼
React Component
    │
    │ 17. Show success message
    │ 18. Refresh complaint data
    ▼
Official sees updated status
    │
    │ (Citizen can now see
    │  updated status when
    │  they check their dashboard)
```

## 🔐 Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Authentication                         │
└──────────────────────────────────────────────────────────┘

Login Request
    │
    ▼
Verify Credentials (email + password)
    │
    ├─ User not found ──────────► 401 Unauthorized
    │
    ├─ Password incorrect ──────► 401 Unauthorized
    │
    └─ Valid credentials
           │
           ▼
    Generate JWT Token
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
           │
           ▼
    Return Token + User Data
           │
           ▼
    Frontend stores in localStorage
           │
           ▼
    All subsequent requests include:
    Authorization: Bearer <token>

┌──────────────────────────────────────────────────────────┐
│                    Authorization                          │
└──────────────────────────────────────────────────────────┘

Protected Request
    │
    ▼
authenticate middleware
    │
    ├─ No token ────────────────► 401 Unauthorized
    │
    ├─ Invalid token ───────────► 401 Unauthorized
    │
    ├─ Expired token ───────────► 401 Unauthorized
    │
    └─ Valid token
           │
           ▼
    Decode token → Get userId
           │
           ▼
    Find user in database
           │
           ├─ User not found ──► 401 Unauthorized
           │
           └─ User found
                  │
                  ▼
           Attach user to req.user
                  │
                  ▼
           authorize middleware (if needed)
                  │
                  ├─ Role not allowed ──► 403 Forbidden
                  │
                  └─ Role allowed
                         │
                         ▼
                  Process request
```

## 📦 Data Models Relationships

```
┌─────────────────────┐
│       User          │
│  (users collection) │
├─────────────────────┤
│ _id: ObjectId       │◄─────┐
│ name: String        │      │
│ email: String       │      │
│ password: String    │      │
│ role: String        │      │
│ department: String  │      │
│ createdAt: Date     │      │
└─────────────────────┘      │
                              │
                              │ References
                              │
┌─────────────────────────────┼────────────┐
│         Complaint           │            │
│  (complaints collection)    │            │
├─────────────────────────────┼────────────┤
│ _id: ObjectId               │            │
│ citizenId: ObjectId ────────┘ (ref: User)│
│ complaintText: String                    │
│ imageUrl: String                         │
│ location: String                         │
│ department: String                       │
│ priority: String                         │
│ priorityReason: String                   │
│ status: String                           │
│ resolutionRemarks: String                │
│ updatedBy: ObjectId ──────────┐ (ref: User)
│ createdAt: Date               │
│ updatedAt: Date               │
└───────────────────────────────┘

Relationships:
- One User (citizen) can have Many Complaints (1:N)
- One User (official) can update Many Complaints (1:N)
- One Complaint belongs to One Citizen (N:1)
- One Complaint can be updated by One Official (N:1)
```

## 🎯 Component Architecture (Frontend)

```
App.js
│
├── AuthProvider (Context)
│   └── Wraps entire app
│
├── Router
│   │
│   ├── Navbar (Always visible)
│   │   ├── Logo
│   │   ├── Navigation Links (role-based)
│   │   └── User Info / Logout
│   │
│   └── Routes
│       │
│       ├── Public Routes
│       │   ├── Home
│       │   ├── Login
│       │   └── Register
│       │
│       ├── Citizen Routes (ProtectedRoute)
│       │   ├── CitizenDashboard
│       │   │   ├── Stats Cards
│       │   │   ├── Filter Bar
│       │   │   └── ComplaintCard[] (list)
│       │   │
│       │   └── NewComplaint
│       │       └── Form
│       │
│       ├── Official Routes (ProtectedRoute)
│       │   ├── OfficialDashboard
│       │   │   ├── Stats Cards
│       │   │   ├── Priority Stats
│       │   │   ├── Filter Section
│       │   │   └── ComplaintCard[] (list)
│       │   │
│       │   └── ComplaintDetail
│       │       ├── Complaint Info
│       │       ├── AI Reasoning
│       │       └── Update Form (officials only)
│       │
│       └── Shared Routes (ProtectedRoute)
│           └── ComplaintDetail
│               └── Read-only view (citizens)
```

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────┐
│                   AuthContext                            │
├─────────────────────────────────────────────────────────┤
│  State:                                                  │
│    - user: Object | null                                │
│    - loading: boolean                                   │
│                                                          │
│  Methods:                                               │
│    - login(email, password)                             │
│    - register(name, email, password)                    │
│    - logout()                                           │
│                                                          │
│  Computed:                                              │
│    - isAuthenticated: boolean                           │
│    - isCitizen: boolean                                 │
│    - isOfficial: boolean                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Provides to all components
                          ▼
              ┌─────────────────────┐
              │   useAuth() hook    │
              └─────────────────────┘
```

## 🛡️ Security Layers

```
Layer 1: Frontend
    - Protected Routes (ProtectedRoute component)
    - Role-based rendering
    - Token storage in localStorage
    - Automatic token injection

Layer 2: Network
    - CORS configuration
    - HTTPS (production)
    - Authorization header

Layer 3: Backend Middleware
    - authenticate (JWT verification)
    - authorize (Role checking)
    - Input validation

Layer 4: Controller Logic
    - Business rule enforcement
    - Department matching (officials)
    - Ownership verification (citizens)

Layer 5: Database
    - Schema validation
    - Unique constraints
    - Reference integrity
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Testability
