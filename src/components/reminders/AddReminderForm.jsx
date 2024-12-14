import React, { useState } from "react";
import api from "../../services/api";

function AddReminderForm({ applications = [], onAdd}) {
  const [formData, setFormData] = useState({
    applicationId: "",
    reminderType: "",
    date: "",
    description: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const applicationId = parseInt(formData.applicationId, 10);

      if (!applicationId) {
        setError("Application ID is required.");
        return;
      }

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

      setError(null);
    } catch (err) {
      console.error("Error adding reminder:", err);
      setError("Failed to add reminder. Please try again.");
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group">
          <label htmlFor="applicationId">Application</label>
          <select
            id="applicationId"
            name="applicationId"
            value={formData.applicationId}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Select Application</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.company} - {app.jobTitle}
              </option>
            ))}
          </select>
        </div>

      <div className="form-group">
        <label>Reminder Type</label>
        <select
          name="reminderType"
          value={formData.reminderType}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">Select Type</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Interview">Interview</option>
          <option value="Deadline">Deadline</option>
          <option value="Prep">Prep</option>
        </select>
      </div>

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
      >
        Add Reminder
      </button>
    </div>
  );
}

export default AddReminderForm;
