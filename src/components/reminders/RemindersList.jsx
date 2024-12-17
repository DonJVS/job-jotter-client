import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReminderCard from "./ReminderCard";
import api from "../../services/api";

function ReminderList() {
  const [reminders, setReminders] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await api.get("/reminders");
        setReminders(res.data.reminders || []);
      } catch (err) {
        console.error("Error fetching reminders:", err);
        setError("Failed to load reminders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/reminders/${id}`);
    setReminders((prev) => prev.filter((i) => i.id !== id));
  };

  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Reminders...</span>
        </div>
      </div>
    );
  }
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Reminders</h2>

      {/* Add Reminder Button */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate("/reminders/add")}
      >
        Add Reminder
      </button>

      {/* Toggle Delete Mode - Show only if reminders exist */}
      {reminders.length > 0 && (
        <button
          className={`btn ${deleteMode ? "btn-danger" : "btn-primary"} mb-3 ms-2`}
          onClick={() => setDeleteMode((prev) => !prev)}
        >
          {deleteMode ? "Done Removing" : "Remove Reminder"}
        </button>
      )}

      {/* Display Reminders or Empty State */}
      {reminders.length > 0 ? (
        <div className="row">
          {reminders.map((reminder) => (
            <div className="col-md-4" key={reminder.id}>
              <ReminderCard
                reminder={reminder}
                onDelete={handleDelete}
                deleteMode={deleteMode}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No reminders available yet. Start by adding one!</p>
      )}
    </div>
  );
}

export default ReminderList;

