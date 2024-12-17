import React, { useState } from "react";
import api from "../../services/api";

/**
 * AddReminderToGoogleCalendar Component
 * 
 * Adds a reminder as an event to Google Calendar.
 * 
 * Features:
 * - Validates the reminder input.
 * - Constructs a Google Calendar event object with a default duration.
 * - Sends the event to a backend API for Google Calendar integration.
 * - Provides loading feedback and handles errors gracefully.
 * 
 * Props:
 * - `reminder` (Object): Details of the reminder, including:
 *    - `reminderType` (String, optional): Type of the reminder.
 *    - `description` (String, optional): Reminder description.
 *    - `company` (String, optional): Company location.
 *    - `date` (String): Date and time of the reminder in ISO format.
 * - `refreshCalendar` (Function, optional): Callback function to refresh the calendar after adding the event.
 * - `duration` (Number, optional): Duration of the reminder in minutes. Defaults to 60 minutes.
 * 
 * State:
 * - `loading`: Tracks the button's loading state during API submission.
 */
function AddReminderToGoogleCalendar({ reminder, refreshCalendar, duration = 60 }) {
  const [loading, setLoading] = useState(false);

  /**
   * Validates reminder details.
   * @param {Object} reminder - The reminder object to validate.
   * @returns {String|null} - Returns an error message if invalid; otherwise, null.
   */
  const validateReminder = (reminder) => {
    if (!reminder) return "Reminder is missing.";
    if (!reminder.date) return "Reminder date is required.";
    return null;
  };

  /**
   * Handles adding the reminder to Google Calendar.
   * Constructs the event object and makes a POST request to the backend API.
   */
  const handleAddToGoogleCalendar = async () => {
    const validationError = validateReminder(reminder);
    if (validationError) {
      alert(validationError);
      console.error(validationError, reminder);
      return;
    }

    // Build the Google Calendar event object
    const event = {
      summary: `Reminder: ${reminder.reminderType || "No Type"}`,
      description: reminder.description || "No description available.",
      location: reminder.company || "No company location specified.",
      start: {
        dateTime: new Date(reminder.date).toISOString(),
      },
      end: {
        dateTime: new Date(new Date(reminder.date).getTime() + duration * 60 * 1000).toISOString(),
      },
    };

    setLoading(true); // Set button to loading state
    try {
      await api.post("/google-calendar/events", event);
      alert("Reminder successfully added to Google Calendar!");

      if (refreshCalendar) {
        refreshCalendar(); // Refresh calendar if callback is provided
      }
    } catch (err) {
      console.error("Failed to add reminder to Google Calendar:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack,
      });
      alert("Failed to add reminder to Google Calendar. Please try again.");
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <button
      className="btn btn-success mb-3"
      onClick={handleAddToGoogleCalendar}
      disabled={loading}
      aria-label="Add reminder to Google Calendar"
      title="Add this reminder to your Google Calendar"
    >
      {loading ? "Adding..." : "Add to Google Calendar"}
    </button>
  );
}

export default AddReminderToGoogleCalendar;


