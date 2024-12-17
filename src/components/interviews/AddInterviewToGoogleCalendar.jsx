import React, { useState } from "react";
import api from "../../services/api";

/**
 * AddInterviewToGoogleCalendar Component
 * 
 * Allows users to add an interview event to their Google Calendar.
 * 
 * Features:
 * - Validates interview details (date, time).
 * - Constructs a calendar event object with a default duration (60 minutes).
 * - Sends the event data to the backend to integrate with Google Calendar.
 * - Displays a success or failure alert based on the response.
 * 
 * Props:
 * - `interview` (Object): Contains interview details including:
 *    - `title` (String, optional): Title of the interview event.
 *    - `date` (String): Date of the interview (YYYY-MM-DD).
 *    - `time` (String): Time of the interview (HH:MM, 24-hour format).
 *    - `location` (String, optional): Location of the interview.
 *    - `description` (String, optional): Description of the interview.
 * - `refreshCalendar` (Function, optional): Callback to refresh the calendar view after adding the event.
 * - `duration` (Number, optional): Duration of the interview in minutes. Defaults to 60.
 * 
 * State:
 * - `loading`: Tracks the button's loading state during API submission.
 */
function AddInterviewToGoogleCalendar({ interview, refreshCalendar, duration = 60 }) {
  const [loading, setLoading] = useState(false);

  /**
   * Validates interview details before creating the Google Calendar event.
   * @param {Object} interview - Interview object to validate.
   * @returns {String|null} - Returns an error message string if invalid; otherwise, null.
   */
  const validateInterview = (interview) => {
    if (!interview) return "Interview details are missing.";
    if (!interview.date) return "Interview date is required.";
    if (!interview.time) return "Interview time is required.";
    return null; // Valid interview
  };

  /**
   * Handles adding the interview to Google Calendar.
   * Validates input, constructs an event object, and makes a POST request to the backend API.
   */
  const handleAddToGoogleCalendar = async () => {
    const validationError = validateInterview(interview);
    if (validationError) {
      alert(validationError);
      console.error(validationError, interview);
      return;
    }

    const startDateTime = new Date(`${interview.date.split("T")[0]}T${interview.time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      alert("Invalid date or time for the interview. Please check the interview details.");
      console.error("Invalid interview date or time:", {
        rawDate: interview.date,
        rawTime: interview.time,
        startDateTime,
        endDateTime,
      });
      return;
    }

    // Event structure to send to the Google Calendar API
    const event = {
      summary: interview.title || "Interview",
      description: interview.description || "No description provided.",
      location: interview.location || "No location provided.",
      start: { 
        dateTime: startDateTime.toISOString(),
        timeZone: "America/New_York",
       },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/New_York",
      },
    };

    setLoading(true); // Disable button during API submission
    try {
      await api.post("/google-calendar/events", event);
      alert("Interview successfully added to Google Calendar!");

      if (refreshCalendar) {
        refreshCalendar(); // Refresh the calendar view if callback is provided
      }
    } catch (err) {
      console.error("Failed to add interview to Google Calendar:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack,
      });
      alert("Failed to add interview to Google Calendar. Please try again.");
    } finally {
      setLoading(false); // Re-enable the button
    }
  };

  return (
    <button
      className="btn btn-success mb-3"
      onClick={handleAddToGoogleCalendar}
      disabled={loading}
      aria-label="Add interview to Google Calendar"
      title="Add this interview to your Google Calendar"
    >
      {loading ? "Adding..." : "Add to Google Calendar"}
    </button>
  );
}

export default AddInterviewToGoogleCalendar;
