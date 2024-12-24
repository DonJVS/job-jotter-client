import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReminderCard from "./ReminderCard";
import api from "../../services/api";

/**
 * ReminderList Component
 * 
 * Displays a list of reminders with options to:
 * - Add a new reminder.
 * - Toggle delete mode for reminders.
 * - Remove reminders through the `ReminderCard` component.
 * 
 * Features:
 * - Fetches reminders from the backend on component mount.
 * - Handles loading, error states, and empty state gracefully.
 * - Allows users to add reminders or delete them using a toggleable mode.
 * 
 * State Management:
 * - `reminders`: List of reminders fetched from the backend.
 * - `deleteMode`: Controls whether delete buttons are shown on each reminder.
 * - `isLoading`: Tracks loading state while fetching reminders.
 * - `error`: Stores error messages for failed API requests.
 * 
 * Dependencies:
 * - `api`: Axios instance for making API calls.
 * - `useNavigate`: React Router hook for navigation.
 */
function ReminderList({ isDashboard = false }) {
  const [reminders, setReminders] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Fetches reminders from the backend on component mount.
   */
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await api.get("/reminders");
        setReminders(res.data.reminders || []); // Populate reminders or set to empty arra
      } catch (err) {
        console.error("Error fetching reminders:", err);
        setError("Failed to load reminders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminders();
  }, []);

  /**
   * Deletes a reminder by making a DELETE request to the backend.
   * Updates the reminders state to remove the deleted reminder.
   * @param {String} id - ID of the reminder to delete.
   */
  const handleDelete = async (id) => {
    await api.delete(`/reminders/${id}`);
    setReminders((prev) => prev.filter((i) => i.id !== id)); // Remove the reminder from state
  };

  // Loading State: Displays a spinner while fetching reminders
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Reminders...</span>
        </div>
      </div>
    );
  }
  // Error State: Displays an error message if API request fails
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Reminders</h2>

      {/* Add Reminder Button */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/reminders/add")}
      >
        Add Reminder
      </button>

      {/* Toggle Delete Mode - Show only if reminders exist */}
      {reminders.length > 0 && (
        <button
          className={`btn ${deleteMode ? "btn-danger" : "btn-primary"} mb-3 ms-2`}
          onClick={() => setDeleteMode((prev) => !prev)}
        >
          {deleteMode ? "Done Removing" : "Remove Reminder"}
        </button>
      )}

      {/* Display Reminders or Empty State */}
      {reminders.length > 0 ? (
        <div className="row">
          {reminders.map((reminder) => (
            <div className="col-md-4" key={reminder.id}>
              <ReminderCard
                reminder={reminder}
                onDelete={handleDelete}
                deleteMode={deleteMode}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No reminders available yet. Start by adding one!</p>
      )}
       {/* Conditionally render "Back to Dashboard" button */}
       {!isDashboard && (
        <div className="d-flex flex-column flex-md-row mt-4">
          <button
            className="btn btn-outline-dark mb-3 me-md-2"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}
      {/* Informational Message */}
      {reminders.length > 0 && (
        <p className="text-muted mt-4">
          Click on a Reminder card to manage adding it to your calendar!.
        </p>
      )}
    </div>
  );
}

export default ReminderList;

