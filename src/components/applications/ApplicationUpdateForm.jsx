import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * ApplicationUpdateForm Component
 * 
 * Allows users to update the details of a specific job application, including:
 * - Job title, company, application status, date applied, and notes.
 * 
 * Features:
 * - Fetches the application data based on the application ID.
 * - Allows users to update application details through a form.
 * - Provides success and error messages.
 * - Handles form validation and submission.
 * 
 * State Management:
 * - `formData`: Stores the input values for the application.
 * - `error`: Tracks errors during data fetching or submission.
 * - `successMessage`: Displays a success notification after updating.
 * - `isLoading`: Indicates whether the application data is loading.
 * - `isSubmitting`: Indicates whether the form is being submitted.
 */
const ApplicationUpdateForm = () => {
  const { id } = useParams(); // Extract application ID from the URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    status: "",
    dateApplied: "",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // For success notifications
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Formats a date string for an input field in "YYYY-MM-DD" format.
   * @param {string} dateString - The date string to format.
   * @returns {string} Formatted date string.
   */
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Fetches the details of the application and populates the form fields.
   */
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        const { application } = res.data;

        setFormData({
          jobTitle: application.jobTitle,
          company: application.company,
          status: application.status,
          dateApplied: application.dateApplied
            ? formatDateForInput(application.dateApplied)
            : "",
          notes: application.notes,
        });
      } catch (err) {
        console.error("Error fetching application:", err);
        setError("Failed to load application. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  /**
   * Handles input changes in the form fields.
   * @param {Object} evt - Event object from the input field.
   */
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  /**
   * Submits the updated application data to the backend.
   * @param {Object} evt - Event object from the form submission.
   */
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (isSubmitting) return; // Prevent duplicate submissions

    setError(null); // Reset error messages
    setIsSubmitting(true); // Show spinner on button

    try {
      await api.patch(`/applications/${id}`, {
        jobTitle: formData.jobTitle,
        company: formData.company,
        status: formData.status,
        dateApplied: formData.dateApplied,
        notes: formData.notes,
      });

      // Show success message and auto-hide it after 3 seconds
      setSuccessMessage("Application updated successfully!");
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Error updating application:", err);
      setError("Failed to update application. Please check your input and try again.");
      setIsSubmitting(false);// Re-enable submit button
    } 
  };

  // Loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Application Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Update Application</h2>

      {/* Global Success Message */}
      {successMessage && (
        <div className="alert alert-success text-center">{successMessage}</div>
      )}

      {/* Global Error Message */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
          id="company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        {/* Job Title Field */}
        <div className="form-group">
          <label htmlFor="jobTitle">Job Title</label>
          <input
          id="jobTitle"
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        {/* Status Field */}
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="applied">Applied</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {/* Date Applied Field */}
        <div className="form-group">
          <label htmlFor="dateApplied">Date Applied</label>
          <input
            id="dateApplied"
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        {/* Notes Field */}
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        {/* Submit and Cancel Buttons */}
        <button  
          type="submit" 
          className="btn btn-primary mt-3" 
          disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Application"}
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
};

export default ApplicationUpdateForm;
