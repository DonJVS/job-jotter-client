import React, { useEffect, useState, useContext } from "react";
import api from "../../services/api";
import ApplicationList from "../applications/ApplicationsList";
import InterviewList from "../interviews/InterviewsList";
import ReminderList from "../reminders/RemindersList";
import UserContext from "../../UserContext";

const Dashboard = () => {
  const { currentUser } = useContext(UserContext);
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const [appsRes, remindersRes, interviewsRes] = await Promise.all([
            api.get("/applications"),
            api.get("/reminders"),
            api.get("/interviews"),
          ]);
          setApplications(appsRes.data.applications);
          setReminders(remindersRes.data.reminders);
          setInterviews(interviewsRes.data.interviews);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error fetching data. Please try again later.");
        }
      }
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container text-center mt-5">
        <h2>Please login or signup to view your dashboard.</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* Applications Section */}
        <div className="col-md-12 mb-4">
          {applications.length > 0 ? (
            <ApplicationList applications={applications} />
          ) : (
            <p>No job applications found.</p>
          )}
        </div>

        {/* Reminders Section */}
        <div className="col-md-12 mb-4">
          {reminders.length > 0 ? (
            <ReminderList reminders={reminders} />
          ) : (
            <p>No reminders set.</p>
          )}
        </div>

        {/* Interviews Section */}
        <div className="col-md-12 mb-4">
          {interviews.length > 0 ? (
            <InterviewList interviews={interviews} />
          ) : (
            <p>No upcoming interviews.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
