import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InterviewCard from "./InterviewCard";
import api from "../../services/api";

/**
 * InterviewList Component
 * 
 * Displays a list of interviews with options to:
 * - Add a new interview.
 * - Toggle delete mode for interview removal.
 * - Remove interviews through a confirmation process.
 * 
 * Features:
 * - Fetches interviews from the backend on component mount.
 * - Supports delete functionality and UI state toggling for delete mode.
 * - Displays a spinner while data is loading and handles errors gracefully.
 * 
 * State Management:
 * - `interviews`: Array of interview objects fetched from the backend.
 * - `deleteMode`: Toggles delete mode to allow interview removal.
 * - `isLoading`: Tracks loading state during API fetch.
 * - `error`: Stores error messages on API failure.
 */
function InterviewList(isDashboard) {
  const [interviews, setInterviews] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  InterviewList.defaultProps = {
    isDashboard: false,
  };

  /**
   * Fetches interviews from the backend API.
   * Updates `interviews` state with the fetched data.
   * Handles errors and updates loading state.
   */
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get("/interviews"); 
        setInterviews(res.data.interviews || []); // Update interviews or set to empty array
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load interviews. Please try again later.");
      } finally {
        setIsLoading(false); // Stop the loading spinner
      }
    };

    fetchInterviews();
  }, []);

  /**
   * Handles interview deletion by making an API call.
   * Updates the state to remove the deleted interview.
   * @param {String} id - ID of the interview to delete.
   */
  const handleDelete = async (id) => {
    await api.delete(`/interviews/${id}`);
    setInterviews((prev) => prev.filter((i) => i.id !== id)); // Remove deleted interview from state
  };

  // Loading State: Display spinner while fetching data
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Interviews...</span>
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

  return (
    <div className="container mt-4">
      <h2>Upcoming Interviews</h2>
  
      {/* Add Interview Button */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/interviews/add")}
      >
        Add Interview
      </button>
  
      {/* Toggle Delete Mode Button */}
      {interviews.length > 0 && (
        <button
          className={`btn ${deleteMode ? "btn-danger" : "btn-primary"} mb-3 ms-2`}
          onClick={() => setDeleteMode((prev) => !prev)}
        >
          {deleteMode ? "Done Removing" : "Remove Interview"}
        </button>
      )}
  
      {/* Display Interviews or Empty State */}
      {interviews.length > 0 ? (
        <div className="row">
          {interviews.map((interview) => (
            <div className="col-md-4" key={interview.id}>
              <InterviewCard 
                interview={interview}
                onDelete={handleDelete}
                deleteMode={deleteMode}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No interviews scheduled yet. Start by adding one!</p>
      )}
       {/* Conditionally render "Back to Dashboard" button */}
       {!isDashboard && (
        <div className="d-flex flex-column flex-md-row mt-4">
          <button
            className="btn btn-outline-dark mb-3 me-md-2"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}
      {/* Informational Message */}
      {interviews.length > 0 && (
        <p className="text-muted mt-4">
          Click on an Interview card to manage adding it to your calendar!.
        </p>
      )}
    </div>
  );
}

export default InterviewList;

