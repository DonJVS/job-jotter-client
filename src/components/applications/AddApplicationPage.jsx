import React from "react";
import { useNavigate } from "react-router-dom";
import AddApplicationForm from "./AddApplicationForm";
import { useContext } from "react";
import UserContext from "../../UserContext";

const AddApplicationPage = () => {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2>Add a New Application</h2>
      <AddApplicationForm username={currentUser?.username} />
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        Back to Applications
      </button>
    </div>
  );
};

export default AddApplicationPage;
