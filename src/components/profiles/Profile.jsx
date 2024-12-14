import React, { useState, useContext } from "react";
import UserContext from "../../UserContext";
import api from "../../services/api";

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

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await api.patch(`/users/${currentUser.username}`, {
        ...formData,
      });
      setCurrentUser(updatedUser.data.user);
      setSuccess(true);
      setError(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
      setSuccess(false);
    }
  };

  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <h1 className="text-center">Profile</h1>
      {success && <div className="alert alert-success">Profile updated successfully!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

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
