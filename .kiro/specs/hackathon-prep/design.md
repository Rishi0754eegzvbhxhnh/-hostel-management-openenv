# Hackathon Prep - Design Document

**Feature Name:** hackathon-prep  
**Date:** April 8, 2026  
**Status:** In Progress

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HACKATHON SYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │  Database    │     │
│  │   (React)    │  │  (Express)   │  │  (MongoDB)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         ├─ Parent Portal   ├─ /api/parents   ├─ Users      │
│         ├─ Student Profile ├─ /api/studypods ├─ Rooms      │
│         ├─ Admin Dashboard ├─ /api/events    ├─ Complaints │
│         └─ All Pages       ├─ /api/security  └─ Fees       │
│                            └─ /api/laundry                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Meta OpenEnv (Python)                        │  │
│  │  - 6 Tasks (room-allocation, complaint-resolution)  │  │
│  │  - FastAPI Server                                   │  │
│  │  - HuggingFace Hub Integration                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. Parent Portal (Frontend)

**File:** `src/pages/ParentPortal.jsx`

**Components:**
- `ParentAuth` - Login/Register form
- `Dashboard` - Main parent view
- `Badge` - Status badge component

**Data Flow:**
```
ParentAuth (login)
    ↓
POST /api/parents/login
    ↓
Store token in localStorage
    ↓
Dashboard (fetch child status)
    ↓
GET /api/parents/child-status
    ↓
Display: Room, Fees, Complaints, Activity
```

**Key Features:**
- Email/password authentication
- Link to child via College ID
- Real-time child status
- Complaint history
- Fee payment tracking
- Activity/points display

---

### 2. Student Profile (Frontend)

**File:** `src/pages/Profile.jsx`

**Components:**
- `ProfileHeader` - User info
- `ProfileStats` - Room, fees, points
- `ProfileEdit` - Edit form
- `ProfileHistory` - Complaints, activity

**Data Flow:**
```
Profile (load)
    ↓
GET /api/auth/me (get current user)
    ↓
GET /api/rooms/:roomId (get room info)
    ↓
GET /api/complaints/my (get complaints)
    ↓
Display all data
```

**Key Features:**
- View personal information
- Edit profile (name, phone, avatar)
- See room assignment
- See fee status
- See points/badges
- View complaint history

---

### 3. Admin Dashboard (Frontend)

**File:** `src/pages/AdminDashboard.jsx`

**Sidebar Navigation:**
```
Admin Dashboard
├─ Overview
├─ Complaints
├─ Maintenance
├─ Rooms (360)
├─ Digital Twin
├─ Students
├─ Payments
├─ IoT Control
├─ Transactions
├─ Bookings
├─ Pending Fees
├─ Forecast
├─ Finance AI
├─ Parking ← NEW
├─ Study Pods ← NEW
├─ Laundry ← NEW
└─ Security ← NEW
```

**Data Flow:**
```
Admin Dashboard (load)
    ↓
GET /api/admin/stats
GET /api/complaints
GET /api/rooms
GET /api/parking/slots
GET /api/studypods
GET /api/laundry
GET /api/security/logs
    ↓
Display all tabs
```

---

### 4. Backend Routes

**New Routes to Create:**

#### `/api/studypods`
```javascript
GET    /api/studypods           → List all study pods
GET    /api/studypods/:id       → Get pod details
POST   /api/studypods           → Create pod (admin)
PATCH  /api/studypods/:id       → Update pod (admin)
DELETE /api/studypods/:id       → Delete pod (admin)
POST   /api/studypods/:id/book  → Book pod (student)
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Pod A1",
      "capacity": 4,
      "floor": 2,
      "amenities": ["WiFi", "AC", "Whiteboard"],
      "bookings": [],
      "available": true
    }
  ]
}
```

#### `/api/events`
```javascript
GET    /api/events              → List all events
GET    /api/events/:id          → Get event details
POST   /api/events              → Create event (admin)
PATCH  /api/events/:id          → Update event (admin)
DELETE /api/events/:id          → Delete event (admin)
POST   /api/events/:id/register → Register for event (student)
```

#### `/api/security`
```javascript
GET    /api/security/logs       → Get security logs
POST   /api/security/checkin    → Check in student
POST   /api/security/checkout   → Check out student
GET    /api/security/qr/:id     → Generate QR code
```

#### `/api/laundry`
```javascript
GET    /api/laundry/status      → Get laundry status
POST   /api/laundry/request     → Request laundry
GET    /api/laundry/my-requests → Get student's requests
```

---

### 5. Data Models

**StudyPod Model:**
```javascript
{
  name: String,
  capacity: Number,
  floor: Number,
  amenities: [String],
  bookings: [{
    student: ObjectId,
    startTime: Date,
    endTime: Date,
    status: String
  }],
  available: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Event Model:**
```javascript
{
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  capacity: Number,
  registrations: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**SecurityLog Model:**
```javascript
{
  student: ObjectId,
  action: String, // 'checkin' | 'checkout'
  timestamp: Date,
  location: String,
  qrCode: String,
  createdAt: Date
}
```

**LaundryRequest Model:**
```javascript
{
  student: ObjectId,
  requestDate: Date,
  deliveryDate: Date,
  items: Number,
  status: String, // 'pending' | 'processing' | 'ready' | 'delivered'
  cost: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Data Format Specifications

### FoodMenu Format
**Current (Correct):**
```json
{
  "Monday": {
    "breakfast": { "items": ["Idli", "Sambar"], "time": "7:00-9:00" },
    "lunch": { "items": ["Rice", "Dal"], "time": "12:00-2:00" },
    "dinner": { "items": ["Roti", "Curry"], "time": "7:00-9:00" }
  }
}
```

**Frontend Usage:**
```javascript
menuData[day].breakfast.items.map(item => <div>{item}</div>)
```

---

### Complaint Format
**Backend Response:**
```json
{
  "_id": "...",
  "student": "...",
  "studentName": "Rishi",
  "title": "Broken AC",
  "description": "...",
  "category": "maintenance",
  "priority": "high",
  "status": "pending",
  "images": ["base64..."],
  "aiStatus": "authentic",
  "adminResponse": "",
  "createdAt": "2026-04-08T10:00:00Z",
  "updatedAt": "2026-04-08T10:00:00Z"
}
```

---

### Room Format
**Backend Response:**
```json
{
  "_id": "...",
  "roomNumber": "302",
  "block": "A",
  "floor": 3,
  "type": "single",
  "capacity": 1,
  "price": 5500,
  "amenities": ["AC", "WiFi", "Balcony"],
  "isAvailable": true,
  "occupant": "...",
  "createdAt": "2026-04-08T10:00:00Z"
}
```

---

### User Format
**Backend Response:**
```json
{
  "_id": "...",
  "fullName": "Rishi Kumar",
  "email": "rishi@edu.in",
  "phone": "9848022338",
  "collegeId": "CS2101",
  "role": "student",
  "room": "...",
  "points": 150,
  "badges": [],
  "avatar": "...",
  "createdAt": "2026-04-08T10:00:00Z"
}
```

---

## API Response Format

**Standard Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

---

## Frontend-Backend Integration

### Parent Portal Integration
```
Frontend: ParentPortal.jsx
    ↓
POST /api/parents/login
    ↓
Backend: routes/parents.js
    ↓
Database: User (role: 'parent')
    ↓
Response: { token, parent, child }
    ↓
Frontend: Store token, fetch child-status
    ↓
GET /api/parents/child-status
    ↓
Backend: Fetch child data from multiple collections
    ↓
Response: { child, room, feeStatus, complaints, activity }
    ↓
Frontend: Display dashboard
```

### Student Profile Integration
```
Frontend: Profile.jsx
    ↓
GET /api/auth/me
    ↓
Backend: routes/auth.js
    ↓
Database: User (current user)
    ↓
Response: { user data }
    ↓
Frontend: Display profile
    ↓
PATCH /api/auth/me (on edit)
    ↓
Backend: Update user
    ↓
Database: Save changes
    ↓
Response: { updated user }
    ↓
Frontend: Show success message
```

---

## Admin Dashboard Navigation

**Sidebar Structure:**
```javascript
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'complaints', label: 'Complaints', icon: 'report' },
  { id: 'maintenance', label: 'Maintenance', icon: 'build' },
  { id: 'rooms', label: 'Inventory (360)', icon: 'bed' },
  { id: 'digital-twin', label: 'Digital Twin', icon: 'view_in_ar' },
  { id: 'students', label: 'Students', icon: 'groups' },
  { id: 'payments', label: 'Payments', icon: 'payments' },
  { id: 'iot', label: '💡 IoT Control', icon: 'lightbulb' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
  { id: 'bookings', label: 'Bookings', icon: 'event_available' },
  { id: 'pending-fees', label: 'Pending Fees', icon: 'pending_actions' },
  { id: 'forecast', label: '📈 Forecast', icon: 'trending_up' },
  { id: 'finance-ai', label: '🤖 Finance AI', icon: 'smart_toy' },
  { id: 'parking', label: '🅿️ Parking', icon: 'local_parking' },
  { id: 'study-pods', label: '📚 Study Pods', icon: 'school' },
  { id: 'laundry', label: '👕 Laundry', icon: 'local_laundry_service' },
  { id: 'security', label: '🔐 Security', icon: 'security' },
];
```

---

## Meta OpenEnv Integration

**Submission Process:**
```
1. Verify all 6 tasks work locally
2. Run: openenv push --repo-id username/hostel-openenv
3. Verify on HuggingFace Hub
4. Test with sample agent
5. Document for judges
```

**Tasks:**
1. ✅ room-allocation
2. ✅ complaint-resolution
3. ✅ fee-meal-scheduling
4. ✅ parking-guidance
5. ✅ iot-maintenance
6. ✅ parent-query

---

## Error Handling

### Frontend Error Handling
```javascript
try {
  const response = await axios.get(endpoint, { headers });
  if (response.data.success) {
    // Handle success
  } else {
    setError(response.data.error);
  }
} catch (error) {
  setError(error.response?.data?.error || 'Network error');
}
```

### Backend Error Handling
```javascript
try {
  // Do something
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message 
  });
}
```

---

## Performance Considerations

### Frontend Optimization
- Lazy load pages
- Cache API responses
- Minimize re-renders
- Optimize images

### Backend Optimization
- Index database queries
- Use pagination for large datasets
- Cache frequently accessed data
- Optimize API response size

---

## Security Considerations

### Authentication
- JWT tokens with expiration
- Secure password hashing
- Role-based access control
- CORS properly configured

### Data Protection
- No sensitive data in console
- Validate all inputs
- Sanitize outputs
- Use HTTPS in production

---

## Testing Strategy

### Unit Tests
- Test individual components
- Test API endpoints
- Test data models

### Integration Tests
- Test frontend-backend integration
- Test data flows
- Test error scenarios

### E2E Tests
- Test complete user flows
- Test all features
- Test on multiple devices

---

## Deployment Checklist

- [ ] All routes implemented
- [ ] All pages wired to backend
- [ ] Data formats consistent
- [ ] Error handling complete
- [ ] Navigation working
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Performance optimized
- [ ] Security verified
- [ ] OpenEnv pushed to HuggingFace
- [ ] Demo script prepared
- [ ] Judges can access system

---

## Sign-Off

**Designed by:** Rishi (Project Lead)  
**Date:** April 8, 2026  
**Status:** Ready for Implementation

---

**Next Step:** Create implementation tasks based on this design.
