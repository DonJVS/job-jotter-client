import React, { useState } from "react";
import api from "../../services/api";
/**
 * AddInterviewForm Component
 * 
 * A form for adding new interview details. Allows users to:
 * - Select an application from a dropdown.
 * - Input interview date, time, location, and optional notes.
 * - Submit the form with validation.
 * 
 * Props:
 * - `applications` (Array): List of job applications to populate the dropdown.
 * - `onAdd` (Function): Callback function triggered after a successful submission.
 * 
 * State Management:
 * - `formData`: Stores form input values.
 * - `errors`: Tracks validation errors for each field.
 * - `isSubmitting`: Controls the state of the submit button.
 * - `globalError`: Displays global error messages on submission failure.
 */
function AddInterviewForm({ applications, onAdd }) {
  const [formData, setFormData] = useState({
    applicationId: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  /**
   * Updates the form field values and clears corresponding validation errors.
   * @param {Object} evt - The change event triggered by input elements.
   */
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" })); // Clear field error on change
  };

  /**
   * Validates required form fields before submission.
   * @returns {Object} - Object containing validation errors for each field.
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.applicationId) newErrors.applicationId = "Application is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.location) newErrors.location = "Location is required.";
    return newErrors;
  };

  /**
   * Handles form submission by validating fields and sending data to the backend.
   * @param {Object} evt - The submit event triggered by the form.
   */
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setGlobalError(""); // Clear global error message

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Update errors if validation fails
      return;
    }

    setIsSubmitting(true); // Disable button during submission

    try {
      // Simulated API request to add interview
      await api.post("/interviews", {
        applicationId: parseInt(formData.applicationId, 10),
        date: formData.date,
        time: formData.time,
        location: formData.location,
        notes: formData.notes,
      });

      onAdd(); // Callback to update the parent component
    } catch (err) {
      console.error("Error adding interview:", err);
      setGlobalError("Failed to add interview. Please try again."); // Set global error message
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div>
      <h3>Add Interview</h3>

      {/* Global Error Message */}
      {globalError && <div className="alert alert-danger">{globalError}</div>}

      {/* Interview Form */}
      <form onSubmit={handleSubmit}>
        {/* Application Dropdown */}
        <div className="form-group">
          <label htmlFor="application">Application</label>
          <select
            id="application"
            name="applicationId"
            value={formData.applicationId}
            onChange={handleChange}
            className={`form-control ${errors.applicationId ? "is-invalid" : ""}`}
          >
            <option value="">Select an application</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.jobTitle} at {app.company}
              </option>
            ))}
          </select>
          {errors.applicationId && <div className="invalid-feedback">{errors.applicationId}</div>}
        </div>
        {/* Date Input */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-control ${errors.date ? "is-invalid" : ""}`}
          />
          {errors.date && <div className="invalid-feedback">{errors.date}</div>}
        </div>
        {/* Time Input */}
        <div className="form-group">
          <label htmlFor="time">Time</label>
          <input
            id="time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`form-control ${errors.time ? "is-invalid" : ""}`}
          />
          {errors.time && <div className="invalid-feedback">{errors.time}</div>}
        </div>
        {/* Location Input */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`form-control ${errors.location ? "is-invalid" : ""}`}
          />
          {errors.location && <div className="invalid-feedback">{errors.location}</div>}
        </div>
        {/* Notes Input */}
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
        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Interview"}
        </button>
      </form>
    </div>
  );
}

export default AddInterviewForm;
