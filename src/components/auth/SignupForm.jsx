import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
/**
 * SignupForm Component
 * 
 * A form component for user registration. Handles input changes, form submission,
 * and displays error messages if signup fails.
 * 
 * Props:
 * - signup (function): A function passed from the parent component to handle user signup.
 */
function SignupForm({ signup }) {
  const navigate = useNavigate();
  // State to manage form input values
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  // State to manage signup errors
  const [error, setError] = useState(null);

  function getFriendlyErrorMessage(err) {
    if (!err.response || !err.response.data) {
      return "An unexpected error occurred. Please try again.";
    }

    // Handle PostgreSQL duplicate key error
    const errorDetail = err.response.data.error?.message;
  
    // PostgreSQL duplicate key error
    if (errorDetail?.includes("duplicate key value violates unique constraint")) {
    if (errorDetail.includes("users_email_key")) {
      return "The email is already in use. Please use a different email.";
    }
    if (errorDetail.includes("users_username_key")) {
      return "The username is already taken. Please choose another one.";
    }
  }

  // Handle specific duplicate username error
  if (errorDetail?.startsWith("Duplicate username:")) {
    const username = errorDetail.split(":")[1].trim(); // Extract username
    return `The username "${username}" is already taken. Please choose another one.`;
  }

  // Default fallback
  return errorDetail || "An unexpected error occurred. Please try again.";
}

  /**
   * Updates form input fields as the user types.
   * @param {Object} e - Event object from the input field.
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  }

  /**
   * Handles form submission to register a new user.
   * Calls the `signup` function passed as a prop.
   * On failure, displays an error message.
   * @param {Object} e - Event object from form submission.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signup(formData); // Call signup function with form data
      navigate("/"); // Navigate to the Homepage on successful signup
    } catch (err) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage); // Set user-friendly error message
    }
  }

  // Rendered signup form UI
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h2 className="text-center">Signup</h2>
  
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
                  onChange={handleChange}
                  required
                />
              </div>
  
              {/* First Name Input */}
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
  
              {/* Last Name Input */}
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
  
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
  
              {/* Submit Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Signup
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
