import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

/**
 * LoginForm Component
 * 
 * A form component for user login. Handles input changes, form submission,
 * and manages authentication tokens for accessing protected routes.
 * 
 * Props:
 * - setToken (function): Function to update the token state in the parent component.
 */
const LoginForm = ({ setToken }) => {
  const navigate = useNavigate(); // Hook to programmatically navigate between routes.

  // State to manage form input values
  const [formData, setFormData] = useState({ username: "", password: "" });
  // State to manage error messages
  const [error, setError] = useState(null);

  /**
   * Updates form input fields as the user types.
   * @param {Object} e - Event object from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  /**
   * Handles form submission to authenticate the user.
   * Sends a POST request to the server with login credentials.
   * On success, sets the authentication token and redirects to the dashboard.
   * On failure, displays an error message.
   * @param {Object} e - Event object from form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior.

    try {
      // Send login credentials to the backend API
      const res = await api.post("/auth/token", formData);
      const tokenObj = { token: res.data.token };
      setToken(tokenObj); // Update token state
      localStorage.setItem("job-jotter-token", JSON.stringify(tokenObj)); // Save token in local storage

      // Redirect the user to the dashboard
      navigate("/dashboard");
    } catch (err) {
      // Display error message on invalid login
      setError("Invalid login credentials.");
    }
  };

  // Rendered login form UI
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h2 className="text-center">Login</h2>

            {/* Error Message Display */}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Username Input */}
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
