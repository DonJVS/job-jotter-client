import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ApplicationCard from "./ApplicationCard";
import api from "../../services/api";


const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const navigate = useNavigate();

  // Fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications");
        console.log("Fetched applications:", res.data); // Debugging
        setApplications(res.data.applications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/applications/${id}`); // Call backend to delete application
      setApplications((prev) => prev.filter((app) => app.id !== id)); // Update state
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Failed to delete application. Please try again.");
    }
  };

  if (isLoading) return <p>Loading applications...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Applications</h2>
  
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
    </div>
  );
};

export default ApplicationList;



