import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import UserContext from "../../UserContext.js";
import ProtectedRoute from "./ProtectedRoute";

// Mock components for routes
const MockLogin = () => <div>Login Page</div>;
const MockProtectedContent = () => <div>Protected Content</div>;

describe("ProtectedRoute Component", () => {
  const renderWithContext = (currentUser) => {
    return render(
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route path="/login" element={<MockLogin />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<MockProtectedContent />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  test("redirects to /login when currentUser is not authenticated", () => {
    renderWithContext(null);

    // Check if redirected to the login page
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders child content when currentUser is authenticated", () => {
    const mockUser = { username: "testuser" };

    renderWithContext(mockUser);

    // Check if protected content is rendered
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
