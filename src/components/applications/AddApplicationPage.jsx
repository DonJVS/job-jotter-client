import React from "react";
import { useNavigate } from "react-router-dom";
import AddApplicationForm from "./AddApplicationForm";
import { useContext } from "react";
import UserContext from "../../UserContext";

/**
 * AddApplicationPage Component
 * 
 * Provides a page for users to add a new job application.
 * 
 * Features:
 * - Integrates the `AddApplicationForm` component to handle application creation.
 * - Includes a "Go Back" button to navigate to the previous page.
 * 
 * Context:
 * - Retrieves the `currentUser` from `UserContext` to pass the username to the form.
 * 
 * Props Passed:
 * - `username`: Passes the `currentUser`'s username to the `AddApplicationForm` for associating the application.
 */
const AddApplicationPage = () => {
  const { currentUser } = useContext(UserContext); // Get the current user from context
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2>Add a New Application</h2>
      {/* Add Application Form */}
      <AddApplicationForm username={currentUser?.username} />
      {/* Go Back Button */}
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
};

export default AddApplicationPage;
