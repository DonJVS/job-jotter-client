import React from "react";
import { useNavigate } from "react-router-dom";

function ApplicationCard({ application, onDelete, deleteMode }) {
  const navigate = useNavigate();

  if (!application) return <p>No application data.</p>;

  // Handle navigation to the detailed application page
  const handleCardClick = () => {
    navigate(`/applications/${application.id}`); // Use application.id to navigate
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigate(`/applications/${application.id}/update`); // Navigate to the ReminderUpdateForm
  };

  //Handle deleting a selected application
  const handleDelete = (evt) => {
    evt.stopPropagation(); // Prevent navigation when clicking "Delete"
    if (window.confirm(`Are you sure you want to delete ${application.jobTitle}?`)) {
      onDelete(application.id); // Call the delete handler with the application ID
    }
  };

  return (
    <div
      className="card mb-3"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }} // Indicate that the card is clickable
    >
      <div className="card-body">
        <h5 className="card-title">{application.jobTitle}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{application.company}</h6>
        <p className="card-text">
          <strong>Status:</strong> {application.status}<br />
          <strong>Date Applied:</strong>{" "}
          {new Date(application.dateApplied).toLocaleDateString()}<br />
          {application.notes && (
            <span>
              <strong>Notes:</strong> {application.notes}
            </span>
          )}
        </p>
        <button
          className="btn btn-primary"
          onClick={handleUpdateClick}
        >
          Update
        </button>
        {/* Conditionally show delete button */}

        {deleteMode && (
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ApplicationCard;

