import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import Complaints from './pages/Complaints';
import AdminDashboard from './pages/AdminDashboard';
import AdminSignup from './pages/AdminSignup';
import AriaAssistant from './components/AriaAssistant';
import ARTour from './pages/ARTour';
import DigitalTwin from './pages/DigitalTwin';
import RoommateMatcher from './pages/RoommateMatcher';
import StudyPods from './pages/StudyPods';
import SmartLiving from './pages/SmartLiving';
import Gamification from './pages/Gamification';
import CommunityHub from './pages/CommunityHub';
import PredictiveDashboard from './pages/PredictiveDashboard';
import FeedbackHub from './pages/Feedback';
import EventCalendar from './pages/EventCalendar';
import DigitalSecurity from './pages/DigitalSecurity';
import FoodMenu from './pages/FoodMenu';
import RoomBooking from './pages/RoomBooking';
import HostelDiscovery from './pages/HostelDiscovery';
import RoomGallery from './pages/RoomGallery';
import SmartParking from './pages/SmartParking';
import HolidayPlanner from './pages/HolidayPlanner';
import ParentPortal from './pages/ParentPortal';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AriaAssistant />
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/room-gallery" element={<RoomGallery />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/food-menu" element={<FoodMenu />} />
        <Route path="/room-booking" element={<RoomBooking />} />
        <Route path="/security" element={<DigitalSecurity />} />
        <Route path="/study-pods" element={<StudyPods />} />
        <Route path="/gamification" element={<Gamification />} />
        <Route path="/events" element={<EventCalendar />} />
        <Route path="/feedback" element={<FeedbackHub />} />
        <Route path="/community" element={<CommunityHub />} />
        <Route path="/smart-living" element={<SmartLiving />} />
        <Route path="/ar-tour" element={<ARTour />} />
        <Route path="/roommate-match" element={<RoommateMatcher />} />
        <Route path="/parking" element={<SmartParking />} />
        <Route path="/holiday-planner" element={<HolidayPlanner />} />

        {/* Parent Portal */}
        <Route path="/parent" element={<ParentPortal />} />
        <Route path="/parent-portal" element={<ParentPortal />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/digital-twin" element={<DigitalTwin />} />
        <Route path="/admin/predictive" element={<PredictiveDashboard />} />

        {/* Discovery & Info */}
        <Route path="/discovery" element={<HostelDiscovery />} />

        {/* 404 Catch-All — must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
