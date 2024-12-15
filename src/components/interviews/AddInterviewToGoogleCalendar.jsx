import React, { useState } from "react";
import api from "../../services/api";

function AddInterviewToGoogleCalendar({ interview, refreshCalendar, duration = 60 }) {
  const [loading, setLoading] = useState(false);

  const validateInterview = (interview) => {
    if (!interview) return "Interview details are missing.";
    if (!interview.date) return "Interview date is required.";
    if (!interview.time) return "Interview time is required.";
    return null; // Valid interview
  };

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

    setLoading(true);
    try {
      const response = await api.post("/google-calendar/events", event);
      alert("Interview successfully added to Google Calendar!");

      if (refreshCalendar) {
        refreshCalendar();
      }
    } catch (err) {
      console.error("Failed to add interview to Google Calendar:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack,
      });
      alert("Failed to add interview to Google Calendar. Please try again.");
    } finally {
      setLoading(false);
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
