// Homepage.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Homepage from "./Homepage";
import UserContext from "../../UserContext";

describe("Homepage", () => {
  const mockUser = { id: 1, username: "testuser" };

  test("renders welcome message for unauthenticated users", () => {
    render(
      <UserContext.Provider value={{ currentUser: null }}>
        <Homepage />
      </UserContext.Provider>
    );

    expect(
      screen.getByText(/Your ultimate tool for organizing job applications/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Login or Signup to start managing your job applications!/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: /signup/i })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  test("renders personalized welcome message for authenticated users", () => {
    render(
      <UserContext.Provider value={{ currentUser: mockUser }}>
        <Homepage />
      </UserContext.Provider>
    );

    expect(
      screen.getByText(/Your ultimate tool for organizing job applications/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        const hasText = (node) => node.textContent === "Welcome back, testuser!";
        const elementHasText = hasText(element);
        const childrenDoNotHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child)
        );
        return elementHasText && childrenDoNotHaveText;
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ready to continue your job search journey?/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});
