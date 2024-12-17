import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserContext from "../../UserContext.js";

/**
 * ProtectedRoute Component
 * 
 * This component restricts access to routes that require user authentication.
 * It checks if a `currentUser` exists in the UserContext.
 * 
 * Behavior:
 * - If a user is not logged in (`currentUser` is null/undefined), redirects to the login page.
 * - If a user is logged in, renders the nested routes via `Outlet`.
 */
function ProtectedRoute() {
  const { currentUser } = useContext(UserContext); // Access current user data from context

  // Redirect to login page if the user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render nested child routes
  return <Outlet />;
}

export default ProtectedRoute;
