import React from "react";
import { useNavigate } from "react-router-dom";

function InterviewCard({ interview, onDelete, deleteMode }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/interviews/${interview.id}`); // Navigate to the InterviewSummary page
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigate(`/interviews/${interview.id}/update`); // Navigate to the InterviewUpdateForm
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card navigation
    if (window.confirm(`Are you sure you want to delete this interview?`)) {
      onDelete(interview.id); // Call the delete handler with the interview ID
    }
  };

  const formattedDate = interview.date
    ? new Date(interview.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Invalid Date";

  const formattedTime = interview.time
    ? new Date(`1970-01-01T${interview.time}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Invalid Time";

  return (
    <div className="card mb-3" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className="card-body">
        <h5 className="card-title">{formattedDate}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{formattedTime}</h6>
        <p className="card-text">
          <strong>Company:</strong> {interview.company || "No company available"}<br />
          <strong>Location:</strong> {interview.location || "Unknown location"}<br />
          <strong>Notes:</strong> {interview.notes || "No notes available."}
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

export default InterviewCard;
