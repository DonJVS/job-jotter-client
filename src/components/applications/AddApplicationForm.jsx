import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * AddApplicationForm Component
 * 
 * Provides a form for users to add a new job application.
 * 
 * Features:
 * - Allows users to enter details such as company, job title, status, application date, and notes.
 * - Validates form inputs to ensure required fields are filled.
 * - Submits data to the backend API and navigates to the applications page upon success.
 * - Displays validation errors and a generic error message for API failures.
 * 
 * State Management:
 * - `formData`: Tracks input values for the form fields.
 * - `errors`: Stores field-specific validation errors.
 * - `error`: Displays a global error message for API-related failures.
 * - `isSubmitting`: Disables the submit button during form submission to prevent duplicates.
 */
function AddApplicationForm() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    status: "applied",
    dateApplied: today,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles form input changes and updates the `formData` state.
   * Clears field-specific errors when the user starts typing.
   * @param {Object} evt - Input change event.
   */
  function handleChange(evt) {
    const { name, value } = evt.target;

    // Clear the error for the current field when user starts typing
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      return updatedErrors;
    });

    setFormData((f) => ({ ...f, [name]: value }));
  }

  /**
   * Validates the form inputs and returns any validation errors.
   * @returns {Object} - An object containing validation errors.
   */
  function validateForm() {
    const newErrors = {};
    if (!formData.company) newErrors.company = "Company name is required.";
    if (!formData.jobTitle) newErrors.jobTitle = "Job title is required.";
    if (!formData.dateApplied) newErrors.dateApplied = "Application date is required.";
    console.log("Validation Errors:", newErrors);
    return newErrors;
  }

  /**
   * Handles form submission and sends the data to the backend API.
   * Navigates to the applications page upon successful submission.
   * @param {Object} evt - Form submission event.
   */
  async function handleSubmit(evt) {
    evt.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true); // Disable button during submission
    try {
      await api.post(`/applications`, formData);
      setFormData({
        company: "",
        jobTitle: "",
        status: "applied",
        dateApplied: today,
        notes: "",
      });
      setErrors({});
      setError(null);
      navigate("/applications");
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to add application. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  }

  return (
    <div>
    {/* Global Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Add Application Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={`form-control ${errors.company ? "is-invalid" : ""}`}
            required
          />
          {errors.company && <div className="invalid-feedback">{errors.company}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="jobTitle">Job Title</label>
          <input
          id="jobTitle"
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className={`form-control ${errors.jobTitle ? "is-invalid" : ""}`}
            required
          />
          {errors.jobTitle && <div className="invalid-feedback">{errors.jobTitle}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            name="status"
            id="status"
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
        <div className="form-group">
          <label htmlFor="dateApplied">Date Applied</label>
          <input
            id="dateApplied"
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
            className={`form-control ${errors.dateApplied ? "is-invalid" : ""}`}
          />
          {errors.dateApplied && <div className="invalid-feedback">{errors.dateApplied}</div>}
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
          {isSubmitting ? "Submitting..." : "Add Application"}
        </button>
      </form>
    </div>
  );
}

export default AddApplicationForm;
