import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AddReminderForm from "./AddReminderForm";

/**
 * AddReminderPage Component
 * 
 * A page component that provides functionality to add a new reminder.
 * 
 * Features:
 * - Fetches and displays a list of job applications for users to associate with a reminder.
 * - Renders the `AddReminderForm` component to handle reminder creation.
 * - Navigates the user to the reminders list page upon successful addition.
 * 
 * State Management:
 * - `applications`: List of job applications fetched from the backend.
 * - `error`: Stores an error message if the API request fails.
 * 
 * Dependencies:
 * - `api`: Axios instance for making API requests.
 * - `useNavigate`: React Router hook for programmatic navigation.
 */
function AddReminderPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Fetches job applications from the backend API on component mount.
   */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications"); // Update applications state
        setApplications(res.data.applications);
      } catch (err) {
        setError("Failed to load applications.");
        console.error("Error fetching applications:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  /**
   * Handles successful reminder creation.
   * Redirects the user to the reminders list page.
   * @param {Object} reminder - The reminder object returned after successful creation.
   */
  const handleAddReminder = () => {
    navigate("/reminders");
  };

  // Error State: Displays an error message
  if (error) return <p>{error}</p>;
  // Loading State: Displays a loading message while fetching data
  if (isLoading) return <p>Loading applications...</p>;

  if (applications.length === 0) {
    return (
      <div className="container mt-4">
        <h2>Add Reminder</h2>
        <p>
          No job applications available. 
          Please add a job application before scheduling a reminder.
        </p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/applications/new")} // Navigate to AddApplicationPage
        >
          Add Application
        </button>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }
  return (
    <div className="container mt-4">
      <h2>Add Reminder</h2>
      {/* AddReminderForm Component */}
      <AddReminderForm applications={applications} onAdd={handleAddReminder} />
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

export default AddReminderPage;
