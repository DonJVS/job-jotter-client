import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function InterviewUpdateForm() {
  const { interviewId } = useParams(); // Get the interview ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Formatting functions
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatTimeForInput(timeString) {
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interviews/${interviewId}`);
        const interview = res.data.interview;
        setFormData({
          date: interview.date ? formatDateForInput(interview.date) : "",
          time: interview.time ? formatTimeForInput(interview.time) : "",
          location: interview.location || "",
          notes: interview.notes || "",
        });
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Failed to load interview details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    console.log("Submitting formData:", formData); // Debugging
    try {
      await api.patch(`/interviews/${interviewId}`, formData); // Update interview via backend
      navigate(`/interviews/${interviewId}`, { replace: true }); // Navigate back to interview summary
      
    } catch (err) {
      console.error("Error updating interview:", err);
      setError("Failed to update interview. Please try again.");
    }
  };

  if (isLoading) return <p>Loading interview details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Update Interview</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-control"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Update Interview</button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default InterviewUpdateForm;
