import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const ApplicationUpdateForm = () => {
  const { id } = useParams(); // Application ID
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    status: "",
    dateApplied: "",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Formatting function for dates
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fetch application data
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
        setError("Failed to load application.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (isLoading) return <div className="container mt-4">Loading application data...</div>;

  // Handle input changes
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // Submit application updates
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      await api.patch(`/applications/${id}`, {
        jobTitle: formData.jobTitle,
        company: formData.company,
        status: formData.status,
        dateApplied: formData.dateApplied,
        notes: formData.notes,
      });

      navigate(`/applications/${id}`);
    } catch (err) {
      console.error("Error updating application:", err);
      setError("Failed to update application. Please try again.");
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Update Application</h2>
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
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Update Application
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
