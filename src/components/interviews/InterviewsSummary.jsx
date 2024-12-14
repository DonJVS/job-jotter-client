import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AddInterviewToGoogleCalendar from "./AddInterviewToGoogleCalendar";

function InterviewSummary() {
  const { interviewId } = useParams(); // Extract the interviewId from the URL
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interviews/${interviewId}`);
        setInterview(res.data.interview);
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Interview not found.");
        navigate("/applications"); // Redirect if interview is not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this interview?")) {
      try {
        await api.delete(`/interviews/${interviewId}`); // Delete interview via backend
        navigate("/applications"); // Navigate back to application list
      } catch (err) {
        console.error("Error deleting interview:", err);
        alert("Failed to delete interview. Please try again.");
      }
    }
  };

  if (isLoading) return <p>Loading interview details...</p>;
  if (error) return <p>{error}</p>;

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
          onClick={() => navigate(-1)}
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
        <button className="btn btn-danger mb-3 me-md-2" onClick={handleDelete}>
          Delete Interview
        </button>

        {/* Add to Google Calendar Button */}
        <AddInterviewToGoogleCalendar interview={interview} />
      </div>
    </div>
  );
}

export default InterviewSummary;
