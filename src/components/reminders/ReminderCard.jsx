import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ReminderCard Component
 * 
 * Displays a single reminder card with details and provides options to:
 * - View reminder details by navigating to the ReminderSummary page.
 * - Update the reminder via a button.
 * - Delete the reminder with a confirmation modal (if `deleteMode` is enabled).
 * 
 * Props:
 * - `reminder` (Object): Contains reminder details.
 *    - `id` (String): Reminder ID.
 *    - `date` (String): Reminder date in ISO format.
 *    - `company` (String, optional): Company associated with the reminder.
 *    - `reminderType` (String, optional): Type of the reminder (e.g., Follow-up).
 *    - `description` (String, optional): Additional details about the reminder.
 * - `onDelete` (Function): Callback to handle the deletion of the reminder.
 * - `deleteMode` (Boolean): Toggles the display of the delete button.
 * 
 * State Management:
 * - `showConfirm`: Tracks the visibility of the delete confirmation modal.
 */
function ReminderCard({ reminder, onDelete, deleteMode }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * Handles card click to navigate to the ReminderSummary page.
   */
  const handleCardClick = () => {
    navigate(`/reminders/${reminder.id}`); // Navigate to the ReminderSummary page
  };

  /**
   * Handles click on the update button, navigating to the ReminderUpdateForm.
   * Stops propagation to prevent triggering the card click.
   * @param {Object} e - Click event.
   */
  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigate(`/reminders/${reminder.id}/update`); // Navigate to the ReminderUpdateForm
  };

  /**
   * Opens the confirmation modal for deletion.
   */
  const confirmDelete = () => {
    setShowConfirm(true); // Show the confirmation modal
  };

  /**
   * Confirms and triggers the delete callback with the reminder ID.
   */
  const handleConfirmDelete = () => {
    setShowConfirm(false); // Close the modal
    onDelete(reminder.id); // Call the delete handler with the reminder ID
  };

  /**
   * Formats the reminder date into a user-friendly string.
   * @returns {String} - Formatted date string or "Invalid Date".
   */
  const formattedDate = reminder.date
    ? new Date(reminder.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  return (
    <>
    {/* Reminder Card */}
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
          {/* Update Button */}
          <button className="btn btn-primary" onClick={handleUpdateClick}>
            Update
          </button>
          {/* Delete Button */}
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
