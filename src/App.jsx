import React, { useEffect, useState } from 'react';
import { Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from './services/api';
import UserContext from './UserContext';
import useLocalStorage from './hooks/useLocalStorage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Components
import Homepage from './components/dashboard/Homepage';
import Login from './components/auth/LoginForm';
import Signup from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import Navigation from './components/dashboard/Navigation';

import ApplicationsList from './components/applications/ApplicationsList';
import AddApplicationPage from "./components/applications/AddApplicationPage";
import ApplicationSummary from './components/applications/ApplicationSummary';
import ApplicationUpdateForm from "./components/applications/ApplicationUpdateForm";

import InterviewsList from './components/interviews/InterviewsList';
import InterviewSummary from './components/interviews/InterviewsSummary';
import InterviewUpdateForm from "./components/interviews/InterviewUpdateForm";
import AddInterviewPage from './components/interviews/AddInterviewPage';

import RemindersList from './components/reminders/RemindersList';
import ReminderSummary from './components/reminders/RemindersSummary';
import ReminderUpdateForm from './components/reminders/ReminderUpdateForm';
import AddReminderPage from './components/reminders/AddReminderPage';

import GoogleCalendarEvents from './components/calendar/GoogleCalendarEvents';
import AddGoogleCalendarEvent from './components/calendar/AddGoogleCalendarEvent';

import Profile from './components/profiles/Profile';





function App() {
  const [token, setToken] = useLocalStorage("job-jotter-token", null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("App Component: Token:", token); // Debugging

  // Load user info when token changes
  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      try {
        if (token) {
          // Decode the token
          const { username } = jwtDecode(token);
          if (!username) throw new Error("Token missing username");
  
          // Fetch user data from API
          const res = await api.get(`/users/${username}`);
          setCurrentUser(res.data.user);
          console.log("User data fetched successfully:", res.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err.response || err.message);
        setCurrentUser(null);
      } finally {
        setIsLoading(false); // Ensure loading state is reset
      }
    }
  
    fetchUser();
  }, [token]);
  

  // Login function
  async function login(data) {
    try {
      const res = await api.post("/auth/token", data);
      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token); // Assuming you use a state management hook
    } catch (err) {
      console.error("Login failed:", err);
    }
  }
  

  // Signup function
  async function signup(data) {
    try {
      const res = await api.post("/auth/register", data);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  }

  // Logout function
  function logout() {
    setToken(null);
    setCurrentUser(null);
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, setToken }}>
      <Navigation logout={logout} />
      <div className="container mt-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup signup={signup} />} />

          {/* Google Calendar Routes */}
          <Route path="/google-calendar/events" element={<GoogleCalendarEvents />} />
          <Route path="/google-calendar/events/add" element={<AddGoogleCalendarEvent />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/applications" element={<ApplicationsList />} />
            <Route path="/applications/:applicationId" element={<ApplicationSummary />} />
            <Route path="/applications/new" element={<AddApplicationPage />} />
            <Route path="/applications/:id/update" element={<ApplicationUpdateForm />} />

            <Route path="/interviews" element={<InterviewsList />} />
            <Route path="/interviews/:interviewId" element={<InterviewSummary />} />
            <Route path="/interviews/:interviewId/update" element={<InterviewUpdateForm />} />
            <Route path="/interviews/add" element={<AddInterviewPage />} />

            <Route path="/reminders" element={<RemindersList />} />
            <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
            <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
            <Route path="/reminders/add" element={<AddReminderPage />} />

            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </UserContext.Provider>
  );
}

export default App;

