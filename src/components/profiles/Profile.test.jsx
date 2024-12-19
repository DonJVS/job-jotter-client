// Profile.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Profile from "./Profile";
import UserContext from "../../UserContext";
import api from "../../services/api";

vi.mock("../../services/api");

describe("Profile", () => {
  const mockUser = {
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    email: "testuser@example.com",
  };
  const setCurrentUser = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders loading message when currentUser is not available", () => {
    render(
      <UserContext.Provider value={{ currentUser: null }}>
        <Profile />
      </UserContext.Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders profile details in view mode", () => {
    render(
      <UserContext.Provider value={{ currentUser: mockUser, setCurrentUser }}>
        <Profile />
      </UserContext.Provider>
    );

    expect(
      screen.getByText((content, element) => {
        const hasText = (node) => node.textContent === `First Name: ${mockUser.firstName}`;
        const elementHasText = hasText(element);
        const childrenDoNotHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child)
        );
        return elementHasText && childrenDoNotHaveText;
      })
    ).toBeInTheDocument();
    
    expect(
      screen.getByText((content, element) => {
        const hasText = (node) => node.textContent === `Last Name: ${mockUser.lastName}`;
        const elementHasText = hasText(element);
        const childrenDoNotHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child)
        );
        return elementHasText && childrenDoNotHaveText;
      })
    ).toBeInTheDocument();
    
    expect(
      screen.getByText((content, element) => {
        const hasText = (node) => node.textContent === `Email: ${mockUser.email}`;
        const elementHasText = hasText(element);
        const childrenDoNotHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child)
        );
        return elementHasText && childrenDoNotHaveText;
      })
    ).toBeInTheDocument();
  });

  test("toggles to edit mode when 'Edit Profile' button is clicked", () => {
    render(
      <UserContext.Provider value={{ currentUser: mockUser, setCurrentUser }}>
        <Profile />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByText("Update Profile")).toBeInTheDocument();
  });

  test("updates form values when user types into input fields", () => {
    render(
      <UserContext.Provider value={{ currentUser: mockUser, setCurrentUser }}>
        <Profile />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: "NewName" } });
    expect(firstNameInput.value).toBe("NewName");
  });

  test("submits form data and displays success message on successful update", async () => {
    api.patch.mockResolvedValueOnce({
      data: { user: { ...mockUser, firstName: "UpdatedName" } },
    });

    render(
      <UserContext.Provider value={{ currentUser: mockUser, setCurrentUser }}>
        <Profile />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: "UpdatedName" } });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/testuser", {
        firstName: "UpdatedName",
        lastName: mockUser.lastName,
        email: mockUser.email,
        password: "",
      });
      expect(setCurrentUser).toHaveBeenCalledWith({
        ...mockUser,
        firstName: "UpdatedName",
      });
      expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
    });
  });

  test("displays error message on failed update", async () => {
    api.patch.mockRejectedValueOnce(new Error("Update failed"));

    render(
      <UserContext.Provider value={{ currentUser: mockUser, setCurrentUser }}>
        <Profile />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
      expect(screen.getByText("Failed to update profile. Please try again.")).toBeInTheDocument();
    });
  });

  test("cancels editing when 'Cancel' button is clicked", () => {
    render(
      <UserContext.Provider value={{ currentUser: mockUser, setCurrentUser }}>
        <Profile />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("Profile Details")).toBeInTheDocument();
  });
});
