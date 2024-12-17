import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AddInterviewForm from "./AddInterviewForm";

/**
 * AddInterviewPage Component
 * 
 * A page component that allows users to add a new interview.
 * 
 * Features:
 * - Fetches job applications to populate the dropdown in the interview form.
 * - Renders the `AddInterviewForm` component for adding interview details.
 * - Redirects to the interview list page after successful addition.
 * 
 * State Management:
 * - `applications`: Stores the list of job applications.
 * - `error`: Handles errors while fetching data.
 * 
 * Dependencies:
 * - `api`: Axios instance for API calls.
 * - `useNavigate`: React Router hook for navigation.
 */
function AddInterviewPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Fetches job applications from the backend API on component mount.
   * Populates the `applications` state or sets an error message on failure.
   */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications");
        setApplications(res.data.applications);
      } catch (err) {
        setError("Failed to load applications.");
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, []);

  /**
   * Handles successful interview addition by redirecting to the interviews list page.
   */
  const handleAddInterview = () => {
    navigate("/interviews");
  };

  // Error State: Display error message
  if (error) return <p>{error}</p>;
  // Loading State: Display loading message
  if (!applications.length) return <p>Loading applications...</p>;

  return (
    <div className="container mt-4">
      <h2>Add Interview</h2>
      {/* Render Interview Form */}
      <AddInterviewForm applications={applications} onAdd={handleAddInterview} />
      {/* Back Button */}
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

export default AddInterviewPage;
