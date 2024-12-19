import React, { useState } from "react";
import api from "../../services/api";

/**
 * AddReminderForm Component
 * 
 * Provides a form to add reminders for specific job applications.
 * 
 * Features:
 * - Allows users to select an application, set a reminder type, date, and description.
 * - Validates input fields and provides user feedback on submission errors.
 * - Submits reminder details to the backend and refreshes the parent list upon success.
 * 
 * Props:
 * - `applications` (Array): List of job applications to populate the dropdown.
 *    - Each application includes `id`, `company`, and `jobTitle`.
 * - `onAdd` (Function): Callback function triggered after successfully adding a reminder.
 * 
 * State Management:
 * - `formData`: Tracks input values for the form fields.
 * - `errors`: Stores validation errors for each input field.
 * - `globalError`: Manages global error messages for API submission failures.
 * - `isSubmitting`: Prevents duplicate submissions by disabling the submit button.
 */
function AddReminderForm({ applications = [], onAdd }) {
  const [formData, setFormData] = useState({
    applicationId: "",
    reminderType: "",
    date: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  /**
   * Handles changes to input fields and clears corresponding field errors.
   * @param {Object} evt - The change event triggered by the form input.
   */
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" })); // Clear specific field error on change
  };

  /**
   * Validates required fields in the form.
   * @returns {Object} - An object containing validation errors.
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.applicationId) newErrors.applicationId = "Application is required.";
    if (!formData.reminderType) newErrors.reminderType = "Reminder type is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    return newErrors;
  };

  /**
   * Handles form submission by validating fields and sending data to the backend API.
   */
  const handleSubmit = async () => {
    setGlobalError(""); // Reset global error message
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      // Trigger parent callback and reset form
      if (onAdd) onAdd(res.data.reminder);

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

      {/* Reminder Form */}
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
        
        {/* Reminder Type Dropdown */}
        <div className="form-group">
          <label htmlFor="reminderType">Reminder Type</label>
          <select
            id="reminderType"
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

        {/* Description Textarea */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
          ></textarea>
        </div>
          
        {/* Submit Button */}
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
