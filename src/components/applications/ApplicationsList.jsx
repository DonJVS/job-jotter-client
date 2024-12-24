import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ApplicationCard from "./ApplicationCard";
import api from "../../services/api";

/**
 * ApplicationList Component
 * 
 * Displays a list of job applications and provides functionality to:
 * - Add a new application.
 * - Toggle delete mode for applications.
 * - Delete an application with confirmation.
 * 
 * Features:
 * - Fetches and displays applications from the backend.
 * - Allows users to navigate to the application creation page.
 * - Supports a delete mode for removing applications with a button toggle.
 * 
 * State Management:
 * - `applications`: Stores the list of applications.
 * - `error`: Tracks any errors during data fetching or deletion.
 * - `isLoading`: Indicates if the data is being loaded.
 * - `deleteMode`: Toggles the visibility of delete buttons for applications.
 */
const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetches applications from the backend on component mount.
   */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications");
        setApplications(res.data.applications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications.");
      } finally {
        setIsLoading(false); // Stop loading indicator
      }
    };

    fetchApplications();
  }, []);

  /**
   * Deletes an application and updates the state.
   * @param {number} id - The ID of the application to delete.
   */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/applications/${id}`); // Call backend to delete application
      setApplications((prev) => prev.filter((app) => app.id !== id)); // Update state
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Failed to delete application. Please try again.");
    }
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  // Show error message if there's a failure during fetching
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Job Applications</h2>
  
      {/* Add Application Button */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/applications/new")}
      >
        Add Application
      </button>
  
      {/* Toggle Delete Mode - Show only if applications exist */}
      {applications.length > 0 && (
        <button
          className={`btn ${deleteMode ? "btn-danger" : "btn-primary"} mb-3 ms-2`}
          onClick={() => setDeleteMode((prev) => !prev)}
        >
          {deleteMode ? "Done Removing" : "Remove Application"}
        </button>
      )}
  
      {/* Display Applications or Empty State */}
      {applications.length > 0 ? (
        <div className="row mt-4">
          {applications.map((application) => (
            <div className="col-md-4" key={application.id}>
              <ApplicationCard
                application={application}
                onDelete={handleDelete}
                deleteMode={deleteMode} // Pass delete mode to ApplicationCard
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No applications available yet. Start by creating one!</p>
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
    </div>
  );
};

export default ApplicationList;



