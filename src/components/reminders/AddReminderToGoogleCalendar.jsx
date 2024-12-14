import React from "react";
import api from "../../services/api";

function AddReminderToGoogleCalendar({ reminder, refreshCalendar }) {
  const handleAddToGoogleCalendar = async () => {
    if (!reminder || !reminder.date) {
      alert("Reminder is missing required details.");
      console.error("Reminder object is invalid:", reminder);
      return;
    }

    const event = {
      summary: `Reminder: ${reminder.reminderType || "No Type"}`,
      description: reminder.description || "No description available.",
      location: reminder.company || "No company location specified.",
      start: {
        dateTime: new Date(reminder.date).toISOString(),
      },
      end: {
        dateTime: new Date(
          new Date(reminder.date).getTime() + 60 * 60 * 1000 // 1 hour duration
        ).toISOString(),
      },
    };

    try {
      const response = await api.post("/google-calendar/events", event);
      console.log("Reminder added to Google Calendar:", response.data);
      alert("Reminder successfully added to Google Calendar!");

      // Refresh the calendar if a refresh function is provided
      if (refreshCalendar) {
        refreshCalendar();
      }
    } catch (err) {
      console.error("Failed to add reminder to Google Calendar:", err);
      alert("Failed to add reminder to Google Calendar. Please try again.");
    }
  };

  return (
    <button className="btn btn-success mb-3" onClick={handleAddToGoogleCalendar}>
      Add to Google Calendar
    </button>
  );
}

export default AddReminderToGoogleCalendar;

