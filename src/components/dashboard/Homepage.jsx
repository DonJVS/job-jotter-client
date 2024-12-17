import React, { useContext } from "react";
import UserContext from "../../UserContext";

function Homepage() {
  const { currentUser } = useContext(UserContext);

  return (
    <div className="container text-center mt-5">
      <div className="p-5 bg-light rounded-3 shadow">
        <h1 className="display-4 fw-bold text-primary">Welcome to Job Jotter</h1>
        <p className="lead text-secondary">
          Your ultimate tool for organizing job applications, tracking interviews, and setting reminders.
        </p>
        {currentUser ? (
          <div>
            <p className="fs-5 text-dark">
              Welcome back, <strong>{currentUser.username}</strong>!
            </p>
            <p className="fs-6 text-muted">Ready to continue your job search journey?</p>
            <a href="/dashboard" className="btn btn-primary btn-lg mt-3 shadow">
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div>
            <p className="fs-5 text-dark">
              Login or Signup to start managing your job applications!
            </p>
            <div className="mt-3">
              <a href="/login" className="btn btn-primary btn-lg me-2 shadow">
                Login
              </a>
              <a href="/signup" className="btn btn-secondary btn-lg shadow">
                Signup
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;
