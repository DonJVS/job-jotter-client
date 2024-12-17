import React, { useState } from "react";
import api from "../../services/api";

function AddReminderForm({ applications = [], onAdd }) {
  const [formData, setFormData] = useState({
    applicationId: "",
    reminderType: "",
    date: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button state
  const [globalError, setGlobalError] = useState(""); // For global API error messages

  // Handle form changes
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" })); // Clear specific field error on change
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.applicationId) newErrors.applicationId = "Application is required.";
    if (!formData.reminderType) newErrors.reminderType = "Reminder type is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setGlobalError(""); // Reset global error message
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Set validation errors
      return;
    }

    setIsSubmitting(true); // Disable submit button during submission

    try {
      const applicationId = parseInt(formData.applicationId, 10);
      const data = {
        ...formData,
        applicationId,
      };

      const res = await api.post("/reminders", data);

      // Call the onAdd callback to refresh the parent list
      if (onAdd) onAdd(res.data.reminder);

      // Reset form data
      setFormData({
        applicationId: "",
        reminderType: "",
        date: "",
        description: "",
      });

      setErrors({}); // Clear field-specific errors
    } catch (err) {
      console.error("Error adding reminder:", err);
      setGlobalError("Failed to add reminder. Please try again."); // Set global error message
    } finally {
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  return (
    <div>
      <h3>Add Reminder</h3>

      {/* Global Error Message */}
      {globalError && <div className="alert alert-danger">{globalError}</div>}

      <form>
        <div className="form-group">
          <label htmlFor="applicationId">Application</label>
          <select
            id="applicationId"
            name="applicationId"
            value={formData.applicationId}
            onChange={handleChange}
            className={`form-control ${errors.applicationId ? "is-invalid" : ""}`}
          >
            <option value="">Select Application</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.company} - {app.jobTitle}
              </option>
            ))}
          </select>
          {errors.applicationId && <div className="invalid-feedback">{errors.applicationId}</div>}
        </div>

        <div className="form-group">
          <label>Reminder Type</label>
          <select
            name="reminderType"
            value={formData.reminderType}
            onChange={handleChange}
            className={`form-control ${errors.reminderType ? "is-invalid" : ""}`}
          >
            <option value="">Select Type</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Interview">Interview</option>
            <option value="Deadline">Deadline</option>
            <option value="Prep">Prep</option>
          </select>
          {errors.reminderType && <div className="invalid-feedback">{errors.reminderType}</div>}
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
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
          ></textarea>
        </div>

        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Reminder"}
        </button>
      </form>
    </div>
  );
}

export default AddReminderForm;
