import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function ApplicationSummary() {
  const { applicationId } = useParams(); // Extract the applicationId from the URL
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch the application
        const appRes = await api.get(`/applications/${applicationId}`);
        setApplication(appRes.data.application);

        // Fetch related interviews and reminders
        const [interviewRes, reminderRes] = await Promise.all([
          api.get(`/applications/${applicationId}/interviews`),
          api.get(`/applications/${applicationId}/reminders`),
        ]);
        setInterviews(interviewRes.data.interviews);
        setReminders(reminderRes.data.reminders);
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError("Failed to load application details.");
        setError("Application not found.");
        navigate("/applications"); // Redirect if application is not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [applicationId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await api.delete(`/applications/${id}`); // Delete application via backend
        navigate("/applications"); // Navigate back to application list
      } catch (err) {
        console.error("Error deleting application:", err);
        alert("Failed to delete application. Please try again.");
      }
    }
  };

  if (isLoading) return <p>Loading application details...</p>;
  if (error) return <p>{error}</p>;


  return (
    <div className="container mt-4">
      <h2 className="mb-4">{application.job_title} at {application.company}</h2>
      
      <div className="mb-4">
        <p>
          <strong>Status:</strong> {application.status}
        </p>
        <p>
          <strong>Applied on:</strong>{" "}
          {application.dateApplied
            ? new Date(application.dateApplied).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A"}
        </p>
        <p>
          <strong>Notes:</strong> {application.notes || "No notes available."}
        </p>
      </div>
  
      <h3 className="mb-3">Interviews</h3>
      {interviews.length > 0 ? (
        <ul className="list-group mb-4">
          {interviews.map((interview) => {
            const formattedDate = interview.date
              ? new Date(interview.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Invalid Date";
  
            const formattedTime = interview.time
              ? new Date(`1970-01-01T${interview.time}`).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "Invalid Time";
  
            return (
              <li key={interview.id} className="list-group-item">
                <strong>{formattedDate} at {formattedTime}</strong>
                <br />
                {interview.location ? `Location: ${interview.location}` : "Location: Unknown"}
                <br />
                {interview.notes ? `Notes: ${interview.notes}` : "Notes: No notes available"}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">No interviews scheduled.</p>
      )}
  
      <h3 className="mb-3">Reminders</h3>
      {reminders.length > 0 ? (
        <ul className="list-group mb-4">
          {reminders.map((reminder) => {
            const formattedDate = reminder.date
              ? new Date(reminder.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Invalid Date";
  
            return (
              <li key={reminder.id} className="list-group-item">
                <strong>{formattedDate}</strong> - {reminder.description || "No description available"}{" "}
                {reminder.reminder_type ? `(${reminder.reminder_type})` : ""}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">No reminders set.</p>
      )}
  
      <div className="d-flex flex-column flex-md-row mt-4">
        {/* Return to Application List Button */}
        <button
          className="btn btn-outline-dark mb-3 me-md-2"
          onClick={() => navigate("/applications")}
        >
          ← Back to Applications
        </button>
  
        {/* Update and Delete Buttons */}
        <button
          className="btn btn-primary mb-3 me-md-2"
          onClick={() => navigate(`/applications/${applicationId}/update`)}
        >
          Update Application
        </button>
        <button
          className="btn btn-danger mb-3"
          onClick={async () => {
            if (window.confirm("Are you sure you want to delete this application?")) {
              await api.delete(`/applications/${applicationId}`);
              navigate("/applications");
            }
          }}
        >
          Delete Application
        </button>
      </div>
    </div>
  );
}

export default ApplicationSummary;
