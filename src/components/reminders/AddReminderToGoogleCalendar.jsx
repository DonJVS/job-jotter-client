import React, { useState } from "react";
import api from "../../services/api";

function AddReminderToGoogleCalendar({ reminder, refreshCalendar, duration = 60 }) {
  const [loading, setLoading] = useState(false);

  const validateReminder = (reminder) => {
    if (!reminder) return "Reminder is missing.";
    if (!reminder.date) return "Reminder date is required.";
    return null;
  };

  const handleAddToGoogleCalendar = async () => {
    const validationError = validateReminder(reminder);
    if (validationError) {
      alert(validationError);
      console.error(validationError, reminder);
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
        dateTime: new Date(new Date(reminder.date).getTime() + duration * 60 * 1000).toISOString(),
      },
    };

    setLoading(true);
    try {
      await api.post("/google-calendar/events", event);
      alert("Reminder successfully added to Google Calendar!");

      if (refreshCalendar) {
        refreshCalendar();
      }
    } catch (err) {
      console.error("Failed to add reminder to Google Calendar:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack,
      });
      alert("Failed to add reminder to Google Calendar. Please try again.");
    } finally {
      setLoading(false);
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


