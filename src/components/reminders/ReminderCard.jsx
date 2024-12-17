import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ReminderCard({ reminder, onDelete, deleteMode }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false); // Controls the confirmation modal

  const handleCardClick = () => {
    navigate(`/reminders/${reminder.id}`); // Navigate to the ReminderSummary page
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigate(`/reminders/${reminder.id}/update`); // Navigate to the ReminderUpdateForm
  };

  const confirmDelete = () => {
    setShowConfirm(true); // Show the confirmation modal
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false); // Close the modal
    onDelete(reminder.id); // Call the delete handler with the reminder ID
  };

  const formattedDate = reminder.date
    ? new Date(reminder.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  return (
    <>
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
          <button className="btn btn-primary" onClick={handleUpdateClick}>
            Update
          </button>
          {deleteMode && (
            <button
              className="btn btn-danger ms-2"
              onClick={(e) => e.stopPropagation() || confirmDelete()}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this reminder for{" "}
                  <strong>{formattedDate}</strong>?
                </p>
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
                  onClick={handleConfirmDelete}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReminderCard;
