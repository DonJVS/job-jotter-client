import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SignupForm from "./SignupForm";

describe("SignupForm Component", () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the signup form with all input fields and a submit button", () => {
    render(<SignupForm signup={mockSignup} />);

    // Check for input fields
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();
  });

  test("updates input fields on user typing", () => {
    render(<SignupForm signup={mockSignup} />);

    // Select inputs
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    // Simulate typing
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "securepassword" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("securepassword");
  });

  test("calls signup function with correct form data on successful submission", async () => {
    render(<SignupForm signup={mockSignup} />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "john@example.com" } });

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
    mockSignup.mockRejectedValueOnce(new Error("Signup failed"));

    render(<SignupForm signup={mockSignup} />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: "failuser" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Signup/i }));

    await waitFor(() => {
      expect(screen.getByText(/Signup failed/i)).toBeInTheDocument();
    });
  });
});
