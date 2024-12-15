import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddApplicationForm({ username }) {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    status: "applied",
    dateApplied: today,
    notes: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
  
    // Validation for required fields
    const { company, jobTitle, status, dateApplied } = formData;
    if (!company || !jobTitle || !status || !dateApplied) {
      setError("All fields are required.");
      return;
    }
  
    try {
      await api.post(`/applications`, formData);
      setFormData({
        company: "",
        jobTitle: "",
        status: "applied", // Reset default status
        dateApplied: today, // Reset to today's date
        notes: "",
      });
      setError(null);
      navigate("/applications"); // Navigate directly to the applications
    } catch (err) {
      setError("Failed to add application. Please try again.");
    }
  }
  
  

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
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
        <div className="form-group">
          <label>Date Applied</label>
          <input
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
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
          type="submit"
          className="btn btn-primary mt-3"
          disabled={
            !formData.company || !formData.jobTitle || !formData.status || !formData.dateApplied
          }
        >
          Add Application
        </button>
      </form>
    </div>
  );
}

export default AddApplicationForm;
