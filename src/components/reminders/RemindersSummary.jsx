import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AddReminderToGoogleCalendar from "./AddReminderToGoogleCalendar";

function ReminderSummary() {
  const { reminderId } = useParams(); // Extract the reminderId from the URL
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const res = await api.get(`/reminders/${reminderId}`);
        setReminder(res.data.reminder);
      } catch (err) {
        console.error("Error fetching reminder details:", err);
        setError("Reminder not found.");
        navigate("/applications"); // Redirect if reminder is not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminder();
  }, [reminderId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      try {
        await api.delete(`/reminders/${reminderId}`); // Delete reminder via backend
        navigate("/applications"); // Navigate back to application list
      } catch (err) {
        console.error("Error deleting reminder:", err);
        alert("Failed to delete reminder. Please try again.");
      }
    }
  };

  if (isLoading) return <p>Loading reminder details...</p>;
  if (error) return <p>{error}</p>;

  const formattedDate = reminder.date
    ? new Date(reminder.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Reminder Details</h2>
      <div className="mb-4">
        <p>
          <strong>Company:</strong> {reminder.company || "No company available"}
        </p>
        <p>
          <strong>Date:</strong> {formattedDate}
        </p>
        <p>
          <strong>Type:</strong> {reminder.reminderType || "No type specified"}
        </p>
        <p>
          <strong>Description:</strong> {reminder.description || "No description available"}
        </p>
      </div>

      <div className="d-flex flex-column flex-md-row mt-4">
        <button
          className="btn btn-outline-dark mb-3 me-md-2"
          onClick={() => navigate(-1)}
        >
          ← Back to Applications
        </button>

        <button
          className="btn btn-primary mb-3 me-md-2"
          onClick={() => navigate(`/reminders/${reminder.id}/update`)}
        >
          Update Reminder
        </button>

        <button className="btn btn-danger mb-3" onClick={handleDelete}>
          Delete Reminder
        </button>

        {/* Integrate AddReminderToGoogleCalendar Component */}
        <AddReminderToGoogleCalendar reminder={reminder} />
      </div>
    </div>
  );
}

export default ReminderSummary;
