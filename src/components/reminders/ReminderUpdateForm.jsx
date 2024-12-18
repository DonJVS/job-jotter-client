import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * ReminderUpdateForm Component
 * 
 * Allows users to update an existing reminder's details, including:
 * - Date
 * - Type
 * - Description
 * 
 * Features:
 * - Fetches and pre-fills the form with the current reminder data.
 * - Submits updated reminder details to the backend via PATCH request.
 * - Displays success or error messages based on the operation's result.
 * 
 * State Management:
 * - `formData`: Tracks the input values for the reminder fields.
 * - `error`: Holds error messages for failed fetch or update operations.
 * - `successMessage`: Displays a notification after successful updates.
 * - `isLoading`: Controls the loading spinner while fetching data.
 * - `isSubmitting`: Prevents multiple form submissions.
 */
function ReminderUpdateForm() {
  const { reminderId } = useParams(); // Get the reminder ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    reminderType: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // For success notifications
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button state

  /**
   * Formats a date string into the `YYYY-MM-DD` format for input fields.
   * @param {String} dateString - Raw date string.
   * @returns {String} - Formatted date string.
   */
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Fetches the existing reminder details from the backend.
   */
  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const res = await api.get(`/reminders/${reminderId}`);
        const reminder = res.data.reminder;
        // Populate form fields with fetched data
        setFormData({
          date: reminder.date ? formatDateForInput(reminder.date) : "",
          reminderType: reminder.reminderType || "",
          description: reminder.description || "",
        });
      } catch (err) {
        console.error("Error fetching reminder details:", err);
        setError("Failed to load reminder details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminder();
  }, [reminderId]);

  /**
   * Handles form input changes and updates the `formData` state.
   * @param {Object} evt - The input change event.
   */
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  /**
   * Submits updated reminder details to the backend.
   * @param {Object} evt - The form submission event.
   */
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    setError(null); // Reset error message
    setIsSubmitting(true); // Disable submit button

    try {
      await api.patch(`/reminders/${reminderId}`, formData); // Use PATCH to update reminder

      // Show success message
      setSuccessMessage("Reminder updated successfully!");
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message
        navigate(-1); // Navigate to the previous page
      }, 2000);
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError("Failed to update reminder. Please check your input and try again.");
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  // Display loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Reminder Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Update Reminder</h2>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success text-center">{successMessage}</div>
      )}

      {/* Error Notification */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            name="reminderType"
            value={formData.reminderType}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Reminder"}
        </button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default ReminderUpdateForm;
