import React from "react";
import { useNavigate } from "react-router-dom";

function ReminderCard({ reminder, onDelete, deleteMode }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/reminders/${reminder.id}`); // Navigate to the ReminderSummary page
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigate(`/reminders/${reminder.id}/update`); // Navigate to the ReminderUpdateForm
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card navigation
    if (window.confirm(`Are you sure you want to delete this reminder?`)) {
      onDelete(reminder.id); // Call the delete handler with the reminder ID
    }
  };

  const formattedDate = reminder.date
    ? new Date(reminder.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  return (
    <div
      className="card mb-3"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="card-body">
        <h5 className="card-title">{formattedDate}</h5>
        <p className="card-text">
          <strong>Company:</strong> {reminder.company || "No company available"}<br />
          <strong>Type:</strong> {reminder.reminderType || "No type specified"}<br />
          <strong>Description:</strong> {reminder.description || "No description available"}
        </p>
        <button
          className="btn btn-primary"
          onClick={handleUpdateClick}
        >
          Update
        </button>
        {deleteMode && (
          <button className="btn btn-danger ms-2" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ReminderCard;
