import React, { useEffect, useState, useContext } from "react";
import api from "../../services/api";
import { useLocation, Link } from "react-router-dom";
import ApplicationList from "../applications/ApplicationsList";
import InterviewList from "../interviews/InterviewsList";
import ReminderList from "../reminders/RemindersList";
import GoogleCalendarEvents from "../calendar/GoogleCalendarEvents";
import UserContext from "../../UserContext";

/**
 * Dashboard Component
 * 
 * Displays a user-specific dashboard with the following sections:
 * - Job Applications
 * - Reminders
 * - Upcoming Interviews
 * - Google Calendar Integration
 * 
 * Key Features:
 * - Fetches applications, reminders, and interviews from the backend API.
 * - Displays sections conditionally based on data availability.
 * - Integrates with the Google Calendar for event management.
 * - Uses Bootstrap for layout styling.
 */
const Dashboard = () => {
  const { currentUser } = useContext(UserContext); // Access the logged-in user context

  // State to manage data and UI behaviors
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  /**
   * Fetches all dashboard data (applications, reminders, interviews).
   * Uses `Promise.allSettled` to handle individual API failures gracefully.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Parallel API calls for better performance
          const [appsRes, remindersRes, interviewsRes] = await Promise.allSettled([
            api.get("/applications"),
            api.get("/reminders"),
            api.get("/interviews"),
          ]);
          if (appsRes.status === "fulfilled") {
            setApplications(appsRes.value.data.applications);
          } else {
            console.error("Error fetching applications:", appsRes.reason);
          }

          if (remindersRes.status === "fulfilled") {
            setReminders(remindersRes.value.data.reminders);
          } else {
            console.error("Error fetching reminders:", remindersRes.reason);
          }

          if (interviewsRes.status === "fulfilled") {
            setInterviews(interviewsRes.value.data.interviews);
          } else {
            console.error("Error fetching interviews:", interviewsRes.reason);
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error fetching data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  // Show a message if no user is logged in
  if (!currentUser) {
    return (
      <div className="container text-center mt-5">
        <h2>Please login or signup to view your dashboard.</h2>
      </div>
    );
  }

  // Show a loading spinner while fetching data
  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-primary">Dashboard</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Conditionally render the "Return to Dashboard" button */}
      {location.pathname !== "/dashboard" && (
        <Link to="/dashboard" className="btn btn-primary mb-3">
          Return to Dashboard
        </Link>
      )}

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Applications Section */}
          <div className="mb-5 p-4 bg-light rounded shadow">
            {applications.length === 0 && (
              <h3 className="text-secondary">Job Applications</h3>
            )}
            {applications.length > 0 ? (
              <ApplicationList applications={applications} />
            ) : (
              <p className="text-muted">
                No job applications found. <Link to="/applications/new" className="text-primary">Add one now!</Link>
              </p>
            )}
          </div>

          {/* Reminders Section */}
            <div className="mb-5 p-4 bg-light rounded shadow">
            {reminders.length === 0 && (
              <h3 className="text-secondary">Reminders</h3>
            )}
            {reminders.length > 0 ? (
              <ReminderList reminders={reminders} />
            ) : (
              <p className="text-muted">
                No reminders set. <Link to="/reminders/add" className="text-primary">Create one now!</Link>
              </p>
            )}
          </div>

          {/* Interviews Section */}
          <div className="mb-5 p-4 bg-light rounded shadow">
            {interviews.length === 0 && (
              <h3 className="text-secondary">Upcoming Interviews</h3>
            )}
            {interviews.length > 0 ? (
              <InterviewList interviews={interviews} />
            ) : (
              <p className="text-muted">
                No upcoming interviews. <Link to="/interviews/add" className="text-primary">Schedule one now!</Link>
              </p>
            )}
          </div>
        </div>

        {/* Google Calendar Section */}
        <div className="col-lg-4">
          <div className="sticky-side">
            <div className="p-4 bg-light rounded shadow">
              <h3 className="text-secondary">Google Calendar</h3>
              <GoogleCalendarEvents /> {/* Embed the Google Calendar component */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
