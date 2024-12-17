import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AddInterviewForm from "./AddInterviewForm";

function AddInterviewPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleAddInterview = () => {
    navigate("/interviews"); // Redirect to the InterviewList page after adding
  };

  if (error) return <p>{error}</p>;
  if (!applications.length) return <p>Loading applications...</p>;

  return (
    <div className="container mt-4">
      <h2>Add Interview</h2>
      <AddInterviewForm applications={applications} onAdd={handleAddInterview} />
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

export default AddInterviewPage;
