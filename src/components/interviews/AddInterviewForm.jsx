import React, { useState } from "react";

function AddInterviewForm({ applications, onAdd }) {
  const [formData, setFormData] = useState({
    applicationId: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // For button state
  const [globalError, setGlobalError] = useState("");

  // Handle form changes
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" })); // Clear field error on change
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.applicationId) newErrors.applicationId = "Application is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.location) newErrors.location = "Location is required.";
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setGlobalError(""); // Clear global error message

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Set field-specific errors
      return;
    }

    setIsSubmitting(true); // Disable button during submission

    try {
      await api.post("/interviews", {
        applicationId: formData.applicationId,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        notes: formData.notes,
      });

      onAdd(); // Redirect to InterviewList page after successful addition
    } catch (err) {
      console.error("Error adding interview:", err);
      setGlobalError("Failed to add interview. Please try again."); // Global error message
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div>
      <h3>Add Interview</h3>

      {/* Global Error Message */}
      {globalError && <div className="alert alert-danger">{globalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Application</label>
          <select
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
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-control ${errors.date ? "is-invalid" : ""}`}
          />
          {errors.date && <div className="invalid-feedback">{errors.date}</div>}
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`form-control ${errors.time ? "is-invalid" : ""}`}
          />
          {errors.time && <div className="invalid-feedback">{errors.time}</div>}
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`form-control ${errors.location ? "is-invalid" : ""}`}
          />
          {errors.location && <div className="invalid-feedback">{errors.location}</div>}
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
