import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InterviewCard from "./InterviewCard";
import api from "../../services/api";

function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get("/interviews"); 
        setInterviews(res.data.interviews || []); 
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load interviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/interviews/${id}`);
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  if (isLoading) return <p>Loading interviews...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Interviews</h2>
  
      {/* Add Interview Button */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/interviews/add")}
      >
        Add Interview
      </button>
  
      {/* Toggle Delete Mode - Show only if interviews exist */}
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
    </div>
  );
}

export default InterviewList;

