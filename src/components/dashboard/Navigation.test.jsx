// Navigation.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navigation from "./Navigation";
import UserContext from "../../UserContext";

describe("Navigation", () => {
  const mockLogout = vi.fn();
  const mockUser = { id: 1, username: "testuser" };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders navigation for unauthenticated users", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: null }}>
          <Navigation logout={mockLogout} />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Check for guest links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Login")).toHaveAttribute("href", "/login");
    expect(screen.getByText("Signup")).toHaveAttribute("href", "/signup");
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  test("renders navigation for authenticated users", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: mockUser }}>
          <Navigation logout={mockLogout} />
        </UserContext.Provider>
      </MemoryRouter>
    );

    // Check for authenticated user links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Applications")).toHaveAttribute("href", "/applications");
    expect(screen.getByText("Interviews")).toHaveAttribute("href", "/interviews");
    expect(screen.getByText("Reminders")).toHaveAttribute("href", "/reminders");
    expect(screen.getByText("Profile")).toHaveAttribute("href", "/profile");
    expect(screen.getByText("Google Calendar")).toHaveAttribute("href", "/google-calendar/events");
    expect(screen.getByText(`Logout (${mockUser.username})`)).toBeInTheDocument();
  });

  test("logout button triggers logout function", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: mockUser }}>
          <Navigation logout={mockLogout} />
        </UserContext.Provider>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText(`Logout (${mockUser.username})`);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test("brand link navigates to home page", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: null }}>
          <Navigation logout={mockLogout} />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Job Jotter")).toHaveAttribute("href", "/");
  });
});
