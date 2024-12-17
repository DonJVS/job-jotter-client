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
  const [showConfirm, setShowConfirm] = useState(false); // Controls the confirmation dialog

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const res = await api.get(`/reminders/${reminderId}`);
        setReminder(res.data.reminder);
      } catch (err) {
        console.error("Error fetching reminder details:", err);
        setError("Reminder not found. Redirecting...");
        setTimeout(() => navigate("/reminders"), 3000); // Redirect if reminder is not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminder();
  }, [reminderId, navigate]);

  const handleDelete = async () => {
    try {
      await api.delete(`/reminders/${reminderId}`);
      navigate("/reminders"); // Navigate back to the reminders list
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError("Failed to delete reminder. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Reminder Details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  const formattedDate = reminder.date
    ? new Date(reminder.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No date specified";

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
          onClick={() => navigate("/reminders")}
        >
          ← Back to Reminders
        </button>

        <button
          className="btn btn-primary mb-3 me-md-2"
          onClick={() => navigate(`/reminders/${reminder.id}/update`)}
        >
          Update Reminder
        </button>

        <button
          className="btn btn-danger mb-3"
          onClick={() => setShowConfirm(true)} // Show confirmation modal
        >
          Delete Reminder
        </button>

        {/* Integrate AddReminderToGoogleCalendar Component */}
        <AddReminderToGoogleCalendar reminder={reminder} />
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this reminder?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    setShowConfirm(false);
                    await handleDelete();
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReminderSummary;
