import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ApplicationCard({ application, onDelete, deleteMode }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false); // Controls the confirmation modal

  if (!application) return <p>No application data.</p>;

  // Handle navigation to the detailed application page
  const handleCardClick = () => {
    navigate(`/applications/${application.id}`); // Use application.id to navigate
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigate(`/applications/${application.id}/update`); // Navigate to the ApplicationUpdateForm
  };

  const confirmDelete = () => {
    setShowConfirm(true); // Show confirmation modal
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false); // Close the confirmation modal
    onDelete(application.id); // Call the delete handler with the application ID
  };

  return (
    <>
      <div
        className="card mb-3"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }} // Indicate that the card is clickable
      >
        <div className="card-body">
          <h5 className="card-title">{application.jobTitle}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{application.company}</h6>
          <p className="card-text">
            <strong>Status:</strong> {application.status}
            <br />
            <strong>Date Applied:</strong>{" "}
            {new Date(application.dateApplied).toLocaleDateString()}
            <br />
            {application.notes && (
              <span>
                <strong>Notes:</strong> {application.notes}
              </span>
            )}
          </p>
          <button className="btn btn-primary" onClick={handleUpdateClick}>
            Update
          </button>
          {/* Conditionally show delete button */}
          {deleteMode && (
            <button className="btn btn-danger" onClick={(e) => e.stopPropagation() || confirmDelete()}>
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
                <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <strong>{application.jobTitle}</strong>?
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

export default ApplicationCard;
