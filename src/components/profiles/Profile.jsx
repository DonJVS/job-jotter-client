import React, { useState, useContext } from "react";
import UserContext from "../../UserContext";
import api from "../../services/api";

/**
 * Profile Component
 * 
 * Provides functionality for users to view and update their profile details.
 * 
 * Features:
 * - Displays the current user's profile information.
 * - Allows the user to toggle between viewing and editing modes.
 * - Handles profile updates via a PATCH request to the backend.
 * - Displays success and error messages based on the operation's outcome.
 * 
 * State Management:
 * - `formData`: Tracks input values for profile fields (first name, last name, email, password).
 * - `isEditing`: Toggles between view and edit modes.
 * - `success`: Indicates if the profile update was successful.
 * - `error`: Stores error messages for failed profile updates.
 * 
 * Context:
 * - `currentUser`: Retrieved from `UserContext`, represents the logged-in user.
 * - `setCurrentUser`: Updates the current user's data after a successful profile update.
 */
const Profile = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    password: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Toggles between viewing and editing modes.
   */
  const toggleEdit = () => setIsEditing(!isEditing);

  /**
   * Handles input field changes and updates the `formData` state.
   * @param {Object} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  /**
   * Submits the updated profile details to the backend.
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the password field is empty
    if (!formData.password) {
      setError("Password is required to update your profile.");
      setSuccess(false);
      return;
    }
    try {
      const updatedUser = await api.patch(`/users/${currentUser.username}`, {
        ...formData,
      });
      // Update current user data in context
      setCurrentUser(updatedUser.data.user);
      setSuccess(true);
      setError(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Incorrect password. Please provide the correct current password to update your profile.");
        } else {
          setError(err.response.data.message || "Failed to update profile. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setSuccess(false);
    }
  };

  // Display a loading message if `currentUser` is not yet available
  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <h1 className="text-center">Profile</h1>
      {/* Success Notification */}
      {success && <div className="alert alert-success">Profile updated successfully!</div>}
      {/* Error Notification */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Profile Edit Mode */}
      {isEditing ? (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Update Profile</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter current password to update"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary ms-2" onClick={toggleEdit}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Profile View Mode */
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Profile Details</h5>
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>First Name:</strong> {currentUser.firstName}</p>
            <p><strong>Last Name:</strong> {currentUser.lastName}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <button className="btn btn-primary" onClick={toggleEdit}>
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
