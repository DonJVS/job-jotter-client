import React, { useState } from "react";

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
    } catch (err) {
      setError("Signup failed"); // Set error message on failure
    }
  }

  // Rendered signup form UI
  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
        />
        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <button type="submit">Signup</button>
      </form>

      {/* Display error message if signup fails */}
      {error && <p>{error}</p>}
    </div>
  );
}

export default SignupForm;
