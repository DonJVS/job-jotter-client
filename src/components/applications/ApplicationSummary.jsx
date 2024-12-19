import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * ApplicationSummary Component
 * 
 * Displays the details of a specific job application along with:
 * - Associated interviews.
 * - Associated reminders.
 * - Actions to update or delete the application.
 * 
 * Features:
 * - Fetches application details, related interviews, and reminders from the backend.
 * - Allows deletion of the application with a confirmation dialog.
 * - Provides navigation to the update page or back to the applications list.
 * 
 * State Management:
 * - `application`: Stores the details of the application.
 * - `interviews`: Stores the list of associated interviews.
 * - `reminders`: Stores the list of associated reminders.
 * - `error`: Holds error messages in case of API failures.
 * - `isLoading`: Indicates if the data is being loaded.
 * - `showConfirm`: Controls the visibility of the confirmation modal.
 */
function ApplicationSummary() {
  const { applicationId } = useParams(); // Extract application ID from URL
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false); // Confirmation dialog visibility

  /**
   * Fetches application details, interviews, and reminders.
   */
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch the application details
        const appRes = await api.get(`/applications/${applicationId}`);
        setApplication(appRes.data.application);

        // Fetch related interviews and reminders in parallel
        const [interviewRes, reminderRes] = await Promise.all([
          api.get(`/applications/${applicationId}/interviews`),
          api.get(`/applications/${applicationId}/reminders`),
        ]);
        setInterviews(interviewRes.data.interviews);
        setReminders(reminderRes.data.reminders);
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError("Application not found. Redirecting...");
        setTimeout(() => navigate("/applications"), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [applicationId]);

  /**
   * Deletes the application and navigates back to the applications list.
   */
  const handleDelete = async () => {
    try {
      await api.delete(`/applications/${applicationId}`);
      navigate("/applications");
    } catch (err) {
      console.error("Error deleting application:", err);
      setError("Failed to delete application. Please try again.");
    }
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Application Details...</span>
        </div>
      </div>
    );
  }

  // Show error message if data fetching fails
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-outline-dark"
          onClick={() => navigate("/applications")}
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{application?.jobTitle || "Job Title"} at {application?.company || "Company"}</h2>

      {/* Application Details */}
      <div className="mb-4">
        <p><strong>Status:</strong> {application?.status || "Unknown"}</p>
        <p>
          <strong>Applied on:</strong>{" "}
          {application?.dateApplied
            ? new Date(application.dateApplied).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A"}
        </p>
        <p><strong>Notes:</strong> {application?.notes || "No notes available."}</p>
      </div>

      {/* Interviews */}
      <h3 className="mb-3">Interviews</h3>
      {interviews.length > 0 ? (
        <ul className="list-group mb-4">
          {interviews.map((interview) => (
            <li key={interview.id} className="list-group-item">
              <strong>
                {new Date(interview.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>{" "}
              at{" "}
              <strong>
                {new Date(`1970-01-01T${interview.time}`).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              <br />
              {interview.location ? `Location: ${interview.location}` : "Location: Unknown"}
              <br />
              {interview.notes ? `Notes: ${interview.notes}` : "Notes: No notes available"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No interviews scheduled.</p>
      )}

      {/* Reminders */}
      <h3 className="mb-3">Reminders</h3>
      {reminders.length > 0 ? (
        <ul className="list-group mb-4">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="list-group-item">
              <strong>
                {new Date(reminder.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>{" "}
              - {reminder.description || "No description available"}{" "}
              {reminder.reminder_type ? `(${reminder.reminder_type})` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No reminders set.</p>
      )}

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-md-row mt-4">
        <button
          className="btn btn-outline-dark mb-3 me-md-2"
          onClick={() => navigate("/applications")}
        >
          ← Back to Applications
        </button>
        <button
          className="btn btn-primary mb-3 me-md-2"
          onClick={() => navigate(`/applications/${applicationId}/update`)}
        >
          Update Application
        </button>
        <button
          className="btn btn-danger mb-3"
          onClick={() => setShowConfirm(true)} // Show confirmation dialog
        >
          Delete Application
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this application?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    setShowConfirm(false);
                    await handleDelete();
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationSummary;
