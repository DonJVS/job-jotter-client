import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import SignupForm from "./SignupForm";

describe("SignupForm Component", () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the signup form with all input fields and a submit button", () => {
    render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );

    // Check for input fields
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();
  });

  test("updates input fields on user typing", () => {
    render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );

    // Select inputs
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    // Simulate typing
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "securepassword" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("securepassword");
  });

  test("calls signup function with correct form data on successful submission", async () => {
    render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Signup/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
    });
  });

  test("displays an error message when signup fails", async () => {
    const mockSignup = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: { message: "Duplicate username: testuser4" },
        },
      },
    });
  
    render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );
  
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser4" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "testuser4@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "User" },
    });
  
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /signup/i }));
  
    // Check for the error message
    const errorMessage = await screen.findByText(
      /The username "testuser4" is already taken. Please choose another one./i
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
