import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import UserContext from "../../UserContext";

function Navigation({ logout }) {
  const { currentUser } = useContext(UserContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          Job Jotter
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            {currentUser ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/applications">
                    Applications
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/interviews">
                    Interviews
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/reminders">
                    Reminders
                  </NavLink>
                </li>
                <li className="nav-item">
                  {/* Add Google Calendar Link */}
                  <NavLink className="nav-link" to="/google-calendar/events">
                    Google Calendar
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    Profile
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={logout}
                  >
                    Logout ({currentUser.username})
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/signup">
                    Signup
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;