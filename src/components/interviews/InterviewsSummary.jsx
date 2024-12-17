import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AddInterviewToGoogleCalendar from "./AddInterviewToGoogleCalendar";

/**
 * InterviewSummary Component
 * 
 * Displays detailed information about a specific interview, including:
 * - Company, date, time, location, and notes.
 * - Options to update or delete the interview.
 * - Integration with Google Calendar to add the interview event.
 * 
 * Features:
 * - Fetches interview details from the backend based on the `interviewId` URL parameter.
 * - Handles deletion with a confirmation modal.
 * - Provides navigation options to return to the interview list or update the interview.
 * - Supports adding the interview to Google Calendar via the `AddInterviewToGoogleCalendar` component.
 * 
 * State Management:
 * - `interview`: Stores the fetched interview details.
 * - `error`: Tracks any errors while fetching or deleting the interview.
 * - `isLoading`: Controls the loading spinner during data fetching.
 * - `showConfirm`: Toggles the visibility of the delete confirmation modal.
 */
function InterviewSummary() {
  const { interviewId } = useParams(); // Extract the interviewId from the URL
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * Fetches the interview details from the backend using the interviewId.
   * Redirects to the interview list page if the interview is not found.
   */
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interviews/${interviewId}`);
        setInterview(res.data.interview);
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Interview not found. Redirecting...");
        setTimeout(() => navigate("/interviews"), 3000); // Redirect if interview is not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  /**
   * Deletes the interview and redirects to the interview list page.
   */
  const handleDelete = async () => {
    try {
      await api.delete(`/interviews/${interviewId}`);
      navigate("/interviews"); // Navigate back to the interview list
    } catch (err) {
      console.error("Error deleting interview:", err);
      setError("Failed to delete interview. Please try again.");
    }
  };

  // Loading State: Display spinner while fetching data
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Interview Details...</span>
        </div>
      </div>
    );
  }

  // Error State: Display error message if API fetch fails
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  // Format Date and Time for Display
  const formattedDate = interview.date
    ? new Date(interview.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No date specified";

  const formattedTime = interview.time
    ? new Date(`1970-01-01T${interview.time}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No time specified";

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Interview Details</h2>
      <div className="mb-4">
        <p>
          <strong>Company:</strong> {interview.company || "No company available"}
        </p>
        <p>
          <strong>Date:</strong> {formattedDate}
        </p>
        <p>
          <strong>Time:</strong> {formattedTime}
        </p>
        <p>
          <strong>Location:</strong> {interview.location || "Unknown location"}
        </p>
        <p>
          <strong>Notes:</strong> {interview.notes || "No notes available."}
        </p>
      </div>

      <div className="d-flex flex-column flex-md-row mt-4">
        {/* Return to Interview List Button */}
        <button
          className="btn btn-outline-dark mb-3 me-md-2"
          onClick={() => navigate("/interviews")}
        >
          ← Back to Interviews
        </button>

        {/* Update Interview Button */}
        <button
          className="btn btn-primary mb-3 me-md-2"
          onClick={() => navigate(`/interviews/${interview.id}/update`)}
        >
          Update Interview
        </button>

        {/* Delete Interview Button */}
        <button
          className="btn btn-danger mb-3 me-md-2"
          onClick={() => setShowConfirm(true)} // Show confirmation modal
        >
          Delete Interview
        </button>

        {/* Add to Google Calendar Button */}
        <AddInterviewToGoogleCalendar interview={interview} />
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
                <p>Are you sure you want to delete this interview?</p>
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

export default InterviewSummary;
