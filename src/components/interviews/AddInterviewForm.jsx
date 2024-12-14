import React, { useState } from "react";
import api from "../../services/api";

function AddInterviewForm({ applications = [], onAdd}) {
  const [formData, setFormData] = useState({
    applicationId: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Determine the application ID to send
      const applicationId = parseInt(formData.applicationId, 10);

      if (!applicationId) {
        setError("Application ID is required.");
        return;
      }

      // Prepare the data to send
      const data = {
        ...formData,
        applicationId,
      };

      // Make the API request
      const res = await api.post("/interviews", data);

      // Handle success
      if (onAdd) onAdd(res.data.interview); // Callback to refresh the parent list

      // Reset form
      setFormData({
        applicationId: "",
        date: "",
        time: "",
        location: "",
        notes: "",
      });
      setError(null);
    } catch (err) {
      console.error("Error adding interview:", err);
      setError("Failed to add interview. Please try again.");
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

      <button
        type="button"
        className="btn btn-primary mt-3"
        onClick={handleSubmit}
      >
        Add Interview
      </button>
    </div>
  );
}

export default AddInterviewForm;

