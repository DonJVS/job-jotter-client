import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * InterviewUpdateForm Component
 * 
 * Provides a form to update an existing interview's details, including:
 * - Date
 * - Time
 * - Location
 * - Notes
 * 
 * Features:
 * - Fetches existing interview details on mount and pre-fills the form.
 * - Validates and submits updated interview data to the backend.
 * - Displays success or error messages after form submission.
 * - Prevents multiple submissions using a loading state.
 * 
 * State Management:
 * - `formData`: Stores the form fields (date, time, location, notes).
 * - `error`: Stores an error message if fetching or updating fails.
 * - `successMessage`: Displays a success notification after a successful update.
 * - `isLoading`: Controls the loading spinner while fetching data.
 * - `isSubmitting`: Tracks form submission status to disable the submit button.
 */
function InterviewUpdateForm() {
  const { interviewId } = useParams(); // Extract the interviewId from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format Date and Time for Display
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

  /**
   * Fetches existing interview details on component mount.
   */
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        // Success message and redirect
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
        setError("Failed to load interview details. Please try again later.");
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

    // Prevent multiple submissions
    if (isSubmitting) return;

    setError(null); // Reset error message
    setIsSubmitting(true); // Disable submit button

    try {
      await api.patch(`/interviews/${interviewId}`, formData);

      // Show success message
      setSuccessMessage("Interview updated successfully!");
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Error updating interview:", err);
      setError("Failed to update interview. Please check your input and try again.");
      setIsSubmitting(false); // Re-enable submit button
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

  return (
    <div className="container mt-4">
      <h2>Update Interview</h2>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success text-center">{successMessage}</div>
      )}

      {/* Error Notification */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Interview Update Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Time</label>
          <input
            id="time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-control"
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Interview"}
        </button>
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
