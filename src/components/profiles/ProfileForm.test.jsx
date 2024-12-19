// ProfileForm.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import ProfileForm from "./ProfileForm";

describe("ProfileForm", () => {
  test("renders the Edit Profile heading", () => {
    render(<ProfileForm />);

    expect(screen.getByRole("heading", { name: /edit profile/i })).toBeInTheDocument();
  });
});
