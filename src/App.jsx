/**
 * Main Application Component
 * 
 * Handles routing, authentication, and user state management for the Job Jotter application.
 * 
 * Key Features:
 * - Token-based user authentication.
 * - Protected routes for authenticated users.
 * - Context provider for managing global user state.
 * - Integration with Google Calendar, applications, interviews, and reminders features.
 * - Dynamically rendered navigation and loading states.
 */

import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // JWT decoding for authentication
import api from './services/api'; // API service for backend communication
import UserContext from './UserContext'; // Context for user state
import useLocalStorage from './hooks/useLocalStorage'; // Custom hook for local storage
import ProtectedRoute from './components/auth/ProtectedRoute'; // Wrapper for protecting routes

// Components
import Homepage from './components/dashboard/Homepage';
import Dashboard from './components/dashboard/Dashboard';
import Navigation from './components/dashboard/Navigation';

// User
import Login from './components/auth/LoginForm';
import Signup from './components/auth/SignupForm';
import Profile from './components/profiles/Profile';

// Applications
import ApplicationsList from './components/applications/ApplicationsList';
import AddApplicationPage from "./components/applications/AddApplicationPage";
import ApplicationSummary from './components/applications/ApplicationSummary';
import ApplicationUpdateForm from "./components/applications/ApplicationUpdateForm";

// Interviews
import InterviewsList from './components/interviews/InterviewsList';
import InterviewSummary from './components/interviews/InterviewsSummary';
import InterviewUpdateForm from "./components/interviews/InterviewUpdateForm";
import AddInterviewPage from './components/interviews/AddInterviewPage';

// Reminders
import RemindersList from './components/reminders/RemindersList';
import ReminderSummary from './components/reminders/RemindersSummary';
import ReminderUpdateForm from './components/reminders/ReminderUpdateForm';
import AddReminderPage from './components/reminders/AddReminderPage';

// Google Calendar
import GoogleCalendarEvents from './components/calendar/GoogleCalendarEvents';
import AddGoogleCalendarEvent from './components/calendar/AddGoogleCalendarEvent';



function App() {
  const [token, setToken] = useLocalStorage("job-jotter-token", null); // JWT token storage
  const [currentUser, setCurrentUser] = useState(null); // Current authenticated user
  const [isLoading, setIsLoading] = useState(true); // Application-wide loading state

  // Feedback Messages
  const [tokenExpiryMessage, setTokenExpiryMessage] = useState(null);
  const [signupErrorMessage, setSignupErrorMessage] = useState(null);
  const [userDataErrorMessage, setUserDataErrorMessage] = useState(null);


  // Fetch user data when token changes
  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);

      try {
        if (token && token.token) {
          // Decode the token
          const decoded = jwtDecode(token.token);
          const { username, exp} = decoded;
          if (!username) throw new Error("Token missing username");

          if (exp * 1000 < Date.now()) { // Check for token expiration
            console.error("Token has expired.");
            setTokenExpiryMessage("Your session has expired. Please log in again.")
            logout();
            return;
          }
  
          // Fetch user data from API
          const res = await api.get(`/users/${username}`);
          setCurrentUser(res.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err.message);
        setUserDataErrorMessage("Failed to load user data. Please try again.");
        setCurrentUser(null);
      } finally {
        setIsLoading(false); // Ensure loading state is reset
      }
    } 
    fetchUser();
  }, [token]);
 
  /**
   * Handles user registration.
   * @param {Object} data - User registration data.
   */
  async function signup(data) {
    try {
      const res = await api.post("/auth/register", data);
      setToken({ token: res.data.token });
    } catch (err) {
      console.error("Signup failed:", err);
      setSignupErrorMessage("Signup failed. Please check your information and try again.")
      throw err;
    }
  }


  /**
   * Logs out the current user.
   */
  function logout() {
    setToken(null);
    setCurrentUser(null);
  }


  // Function to automatically dismiss messages after a timeout
  useEffect(() => {
    if (tokenExpiryMessage) {
      const timer = setTimeout(() => setTokenExpiryMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [tokenExpiryMessage]);

  useEffect(() => {
    if (signupErrorMessage) {
      const timer = setTimeout(() => setSignupErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [signupErrorMessage]);

  useEffect(() => {
    if (userDataErrorMessage) {
      const timer = setTimeout(() => setUserDataErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [userDataErrorMessage]);


  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, setToken }}>
      <Navigation logout={logout} />
      <div className="container mt-4">
        {/** Feedback Messages */}
        {tokenExpiryMessage && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {tokenExpiryMessage}
            <button type="button" className="btn-close" onClick={() => setTokenExpiryMessage(null)} aria-label="Close"></button>
          </div>
        )}
        {signupErrorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {signupErrorMessage}
            <button type="button" className="btn-close" onClick={() => setSignupErrorMessage(null)} aria-label="Close"></button>
          </div>
        )}
        {userDataErrorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {userDataErrorMessage}
            <button type="button" className="btn-close" onClick={() => setUserDataErrorMessage(null)} aria-label="Close"></button>
          </div>
        )}
      <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/signup" element={<Signup signup={signup} />} />


            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Google Calendar Routes */}
              <Route path="/google-calendar/events" element={<GoogleCalendarEvents />} />
              <Route path="/google-calendar/events/add" element={<AddGoogleCalendarEvent />} />

              {/* Applications Routes */}
              <Route path="/applications">
                <Route index element={<ApplicationsList />} />
                <Route path=":applicationId" element={<ApplicationSummary />} />
                <Route path="new" element={<AddApplicationPage />} />
                <Route path=":id/update" element={<ApplicationUpdateForm />} />
              </Route>

              {/* Interviews Routes */}
              <Route path="/interviews">
                <Route index element={<InterviewsList />} />
                <Route path=":interviewId" element={<InterviewSummary />} />
                <Route path=":interviewId/update" element={<InterviewUpdateForm />} />
                <Route path="add" element={<AddInterviewPage />} />
              </Route>

              {/* Reminders Routes */}
              <Route path="/reminders">
                <Route index element={<RemindersList />} />
                <Route path=":reminderId" element={<ReminderSummary />} />
                <Route path=":reminderId/update" element={<ReminderUpdateForm />} />
                <Route path="add" element={<AddReminderPage />} />
              </Route>

              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </UserContext.Provider>
  );
}

export default App;

