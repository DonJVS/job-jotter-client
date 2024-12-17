import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * InterviewCard Component
 * 
 * Displays a single interview card with details, and provides options to:
 * - Navigate to the interview summary page on card click.
 * - Update the interview via a button.
 * - Delete the interview with a confirmation modal (if `deleteMode` is enabled).
 * 
 * Props:
 * - `interview` (Object): Details of the interview.
 *    - `id` (String): Interview ID.
 *    - `date` (String): Interview date in ISO format (YYYY-MM-DD).
 *    - `time` (String): Interview time in 24-hour format (HH:MM).
 *    - `company` (String, optional): Company name.
 *    - `location` (String, optional): Location of the interview.
 *    - `notes` (String, optional): Additional notes.
 * - `onDelete` (Function): Callback to handle interview deletion.
 * - `deleteMode` (Boolean): Enables or disables the delete button.
 * 
 * State:
 * - `showConfirm`: Controls the visibility of the delete confirmation modal.
 */
function InterviewCard({ interview, onDelete, deleteMode }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false); // Controls the confirmation modal

  /**
   * Navigates to the Interview Summary page.
   */
  const handleCardClick = () => {
    navigate(`/interviews/${interview.id}`);
  };

  /**
   * Navigates to the Interview Update form.
   * Stops propagation to prevent triggering the card click.
   * @param {Object} e - Event object
   */
  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick
    navigate(`/interviews/${interview.id}/update`);
  };

  /**
   * Shows the delete confirmation modal.
   */
  const confirmDelete = () => {
    setShowConfirm(true); // Show the confirmation modal
  };

  /**
   * Confirms and triggers the delete callback.
   */
  const handleConfirmDelete = () => {
    setShowConfirm(false); // Close the modal
    onDelete(interview.id); // Call the delete handler with the interview ID
  };

  /**
   * Formats the interview date into a user-friendly string.
   */
  const formattedDate = interview.date
    ? new Date(interview.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  /**
   * Formats the interview time into a user-friendly string.
   */
  const formattedTime = interview.time
    ? new Date(`1970-01-01T${interview.time}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Invalid Time";

  return (
    <>
      {/* Interview Card */}
      <div className="card mb-3" onClick={handleCardClick} style={{ cursor: "pointer" }}>
        <div className="card-body">
          <h5 className="card-title">{formattedDate}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{formattedTime}</h6>
          <p className="card-text">
            <strong>Company:</strong> {interview.company || "No company available"}<br />
            <strong>Location:</strong> {interview.location || "Unknown location"}<br />
            <strong>Notes:</strong> {interview.notes || "No notes available."}
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

      {/* Delete Confirmation Modal */}
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
                  Are you sure you want to delete this interview on{" "}
                  <strong>{formattedDate}</strong> at <strong>{formattedTime}</strong>?
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

export default InterviewCard;
