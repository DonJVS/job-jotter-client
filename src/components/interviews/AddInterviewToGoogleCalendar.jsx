import React from "react";
import api from "../../services/api";

function AddInterviewToGoogleCalendar({ interview, refreshCalendar }) {
  const handleAddToGoogleCalendar = async () => {
    if (!interview || !interview.date || !interview.time) {
      alert("Interview is missing required details.");
      console.error("Interview object is invalid:", interview);
      return;
    }

    // Combine date and time to create startDateTime
    const startDateTime = new Date(`${interview.date.split("T")[0]}T${interview.time}`);

    // Set default endDateTime to 1 hour after startDateTime
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // Debug logs
    console.log("Interview object:", interview);
    console.log("Resolved startDateTime:", startDateTime);
    console.log("Resolved endDateTime:", endDateTime);

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      alert("Invalid date or time for the interview. Please check the interview details.");
      console.error("Invalid startDateTime or endDateTime:", {
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
      },
      end: {
        dateTime: endDateTime.toISOString(),
      },
    };

    try {
      console.log("Sending event to Google Calendar:", event); // Debug log
      const response = await api.post("/google-calendar/events", event);
      console.log("Interview added to Google Calendar:", response.data);
      alert("Interview successfully added to Google Calendar!");

      // Refresh the calendar if a refresh function is provided
      if (refreshCalendar) {
        refreshCalendar();
      }
    } catch (err) {
      console.error("Failed to add interview to Google Calendar:", err);
      alert("Failed to add interview to Google Calendar. Please try again.");
    }
  };

  return (
    <button className="btn btn-success mb-3" onClick={handleAddToGoogleCalendar}>
      Add to Google Calendar
    </button>
  );
}

export default AddInterviewToGoogleCalendar;

