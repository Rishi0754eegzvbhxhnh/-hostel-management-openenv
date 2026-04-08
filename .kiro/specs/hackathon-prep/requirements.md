# Hackathon Prep - Requirements Document

**Feature Name:** hackathon-prep  
**Date:** April 8, 2026  
**Status:** In Progress  
**Priority:** P0 (Blocking for hackathon demo)

---

## Executive Summary

The Smart Hostel Management System is 95% complete with 18 backend routes and 37+ frontend pages. However, several critical gaps prevent a successful hackathon demo:

1. **Meta OpenEnv not submitted** to HuggingFace Hub (blocks hackathon scoring)
2. **Parent Portal** exists but needs verification and testing
3. **Backend routes** exist but some frontend pages aren't wired to them
4. **Admin Dashboard** missing navigation links to some features
5. **Data format mismatches** between frontend and backend

This spec addresses all P0 and P1 priorities to ensure a polished, working demo.

---

## Business Requirements

### BR1: Hackathon Submission Ready
**Requirement:** System must be ready for live demo to hackathon judges

**Acceptance Criteria:**
- ✅ All 6 Meta OpenEnv tasks are implemented and testable
- ✅ OpenEnv environment is pushed to HuggingFace Hub
- ✅ Parent Portal is fully functional and accessible
- ✅ Student Portal shows all key features working
- ✅ Admin Dashboard is complete with all navigation links
- ✅ No broken links or 404 errors in demo flow

**Why:** Judges will test the system live. Broken features = lost points.

---

### BR2: Parent Portal Fully Operational
**Requirement:** Parents must be able to login and view child's complete status

**Acceptance Criteria:**
- ✅ Parent can register with child's College ID
- ✅ Parent can login with email/password
- ✅ Parent sees child's room assignment
- ✅ Parent sees fee payment status
- ✅ Parent sees recent complaints
- ✅ Parent sees activity/points/badges
- ✅ Real-time data from backend (not hardcoded)
- ✅ Error handling for missing data

**Why:** Parent Portal is Task 6 in Meta OpenEnv. Must work perfectly.

---

### BR3: Student Profile Complete
**Requirement:** Students must have a dedicated profile page to view/manage their data

**Acceptance Criteria:**
- ✅ Student can view their personal information
- ✅ Student can see their room assignment
- ✅ Student can see their fee status
- ✅ Student can see their points and badges
- ✅ Student can edit their profile (name, phone, avatar)
- ✅ Student can view their complaint history
- ✅ Profile data persists to backend

**Why:** Students need a central place to manage their account.

---

### BR4: Admin Dashboard Complete
**Requirement:** Admin must have full navigation and access to all features

**Acceptance Criteria:**
- ✅ All tabs in sidebar are functional
- ✅ Parking tab is accessible from admin sidebar
- ✅ Study Pods tab is accessible from admin sidebar
- ✅ All data tabs show real data (not hardcoded)
- ✅ Admin can navigate between all features
- ✅ No broken links or missing pages

**Why:** Judges will test admin features. Navigation must be intuitive.

---

### BR5: Backend Routes Fully Wired
**Requirement:** All backend routes must be connected to frontend pages

**Acceptance Criteria:**
- ✅ `/api/studypods` route exists and works
- ✅ `/api/events` route exists and works
- ✅ `/api/security` route exists and works
- ✅ `/api/laundry` route exists and works
- ✅ All routes return proper data format
- ✅ Frontend pages consume the data correctly

**Why:** Frontend pages need real data, not hardcoded stubs.

---

### BR6: Data Format Consistency
**Requirement:** Frontend and backend must use consistent data formats

**Acceptance Criteria:**
- ✅ FoodMenu.jsx correctly reads menu data structure
- ✅ Complaint data format matches between frontend/backend
- ✅ Room data format is consistent
- ✅ User data format is consistent
- ✅ All API responses follow same structure

**Why:** Data mismatches cause runtime errors and poor UX.

---

## Functional Requirements

### FR1: Meta OpenEnv Submission
**What:** Push the hostel-openenv environment to HuggingFace Hub

**How:**
- Run `openenv push --repo-id username/hostel-openenv`
- Verify all 6 tasks are accessible
- Test with sample LLM agent
- Document submission process

**Acceptance:**
- Environment is live on HuggingFace
- Can be accessed by judges
- All 6 tasks are runnable

---

### FR2: Parent Portal Testing & Verification
**What:** Ensure Parent Portal works end-to-end

**How:**
1. Create test parent account
2. Link to existing student
3. Verify all data displays correctly
4. Test error scenarios
5. Verify real-time updates

**Acceptance:**
- Parent can login
- All child data displays
- No console errors
- Responsive on mobile

---

### FR3: Student Profile Page
**What:** Create/enhance student profile page

**How:**
1. Display personal information
2. Show room assignment
3. Show fee status
4. Show points/badges
5. Allow profile editing
6. Save changes to backend

**Acceptance:**
- Profile page loads
- All data displays
- Edit functionality works
- Changes persist

---

### FR4: Admin Navigation
**What:** Add missing navigation links to admin sidebar

**How:**
1. Add Parking link to sidebar
2. Add Study Pods link to sidebar
3. Add Laundry link to sidebar
4. Add Security link to sidebar
5. Verify all links work

**Acceptance:**
- All links appear in sidebar
- All links navigate correctly
- No broken pages

---

### FR5: Backend Route Wiring
**What:** Create missing backend routes

**How:**
1. Create `/api/studypods` route
2. Create `/api/events` route
3. Create `/api/security` route
4. Create `/api/laundry` route
5. Wire frontend pages to routes

**Acceptance:**
- Routes exist and respond
- Frontend pages consume data
- No 404 errors

---

### FR6: Data Format Fixes
**What:** Fix data format mismatches

**How:**
1. Fix FoodMenu.jsx to read menu items array
2. Verify complaint data format
3. Verify room data format
4. Verify user data format
5. Test all data flows

**Acceptance:**
- No data format errors
- All pages display data correctly
- No console errors

---

## Non-Functional Requirements

### NFR1: Performance
- Page load time < 2 seconds
- API response time < 500ms
- No memory leaks
- Smooth animations

### NFR2: Reliability
- No broken links
- No 404 errors in demo flow
- Error handling for all API calls
- Graceful degradation

### NFR3: Usability
- Intuitive navigation
- Clear error messages
- Responsive design
- Accessible UI

### NFR4: Security
- JWT authentication working
- Parent/Student/Admin roles enforced
- No sensitive data in console
- CORS properly configured

---

## User Stories

### US1: Parent Views Child Status
**As a** parent  
**I want to** login and see my child's hostel status  
**So that** I can monitor their wellbeing and finances

**Acceptance Criteria:**
- Parent can register with child's College ID
- Parent can login with email/password
- Parent sees room, fees, complaints, activity
- Data updates in real-time

---

### US2: Student Manages Profile
**As a** student  
**I want to** view and edit my profile  
**So that** I can keep my information up-to-date

**Acceptance Criteria:**
- Student can view their profile
- Student can edit name, phone, avatar
- Changes are saved to backend
- Profile displays updated info

---

### US3: Admin Manages All Features
**As an** admin  
**I want to** access all features from the dashboard  
**So that** I can manage the hostel efficiently

**Acceptance Criteria:**
- All features are accessible from sidebar
- Navigation is intuitive
- All pages load correctly
- No broken links

---

### US4: Judge Tests System
**As a** hackathon judge  
**I want to** test all features of the system  
**So that** I can evaluate the project fairly

**Acceptance Criteria:**
- All features work without errors
- Demo flow is smooth
- No console errors
- Responsive on all devices

---

## Constraints & Assumptions

### Constraints
- Must use existing MERN stack (no new frameworks)
- Must not break existing functionality
- Must complete within 1 day
- Must be testable by judges

### Assumptions
- MongoDB is running and connected
- Backend is running on port 5000
- Frontend is running on port 5175
- All environment variables are set
- Test data is available

---

## Success Criteria

### Must Have (P0)
- ✅ Meta OpenEnv pushed to HuggingFace
- ✅ Parent Portal fully functional
- ✅ Admin Dashboard complete
- ✅ No broken links in demo flow
- ✅ All 6 OpenEnv tasks testable

### Should Have (P1)
- ✅ Student Profile page enhanced
- ✅ Backend routes wired
- ✅ Data format fixes
- ✅ Admin navigation complete

### Nice to Have (P2)
- ✅ PWA manifest
- ✅ Offline support
- ✅ Advanced analytics
- ✅ Performance optimizations

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| OpenEnv push fails | Can't submit to hackathon | Test locally first, have backup plan |
| Parent Portal has bugs | Judges see broken feature | Thorough testing before demo |
| Data format mismatch | Pages show errors | Verify all API responses |
| Navigation broken | Demo flow interrupted | Test all links before demo |
| Performance issues | Slow demo | Optimize queries and rendering |

---

## Timeline

- **Phase 1 (2 hours):** OpenEnv submission + Parent Portal testing
- **Phase 2 (2 hours):** Admin Dashboard completion + Navigation fixes
- **Phase 3 (2 hours):** Backend route wiring + Data format fixes
- **Phase 4 (1 hour):** Final testing + Demo preparation

**Total:** ~7 hours

---

## Deliverables

1. ✅ Updated requirements.md (this document)
2. ✅ Design document (design.md)
3. ✅ Implementation tasks (tasks.md)
4. ✅ Working Parent Portal
5. ✅ Complete Admin Dashboard
6. ✅ Enhanced Student Profile
7. ✅ OpenEnv pushed to HuggingFace
8. ✅ Demo-ready system

---

## Sign-Off

**Prepared by:** Rishi (Project Lead)  
**Date:** April 8, 2026  
**Status:** Ready for Design Phase

---

**Next Step:** Review and approve requirements, then proceed to Design Phase.
