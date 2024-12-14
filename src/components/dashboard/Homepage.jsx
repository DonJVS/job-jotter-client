import React, { useContext } from "react";
import UserContext from "../../UserContext";

function Homepage() {
  const { currentUser } = useContext(UserContext);

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">Welcome to Job Jotter</h1>
      <p className="lead">
        Your ultimate tool for organizing job applications, tracking interviews, and setting reminders.
      </p>
      {currentUser ? (
        <div>
          <p className="fs-5">Welcome back, <strong>{currentUser.username}</strong>!</p>
          <p className="fs-6">Ready to continue your job search journey?</p>
          <a href="/dashboard" className="btn btn-primary btn-lg mt-3">
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div>
          <p className="fs-5">Login or Signup to start managing your job applications!</p>
          <div className="mt-3">
            <a href="/login" className="btn btn-primary me-2">
              Login
            </a>
            <a href="/signup" className="btn btn-secondary">
              Signup
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
