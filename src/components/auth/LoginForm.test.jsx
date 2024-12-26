import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
import api from "../../services/api";

// Mock navigate and api.post
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom"); // Import actual module
  return {
    ...actual,
    useNavigate: vi.fn(), // Mock useNavigate
  };
});

vi.mock("../../services/api", () => ({
  default: {
    post: vi.fn(), // Mock the `post` method
  },
}));


describe("LoginForm Component", () => {
  const mockSetToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders login form with username and password inputs", () => {
    render(
      <MemoryRouter>
        <LoginForm setToken={mockSetToken} />
      </MemoryRouter>
    );
  
    // Check for the heading
    expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();
  
    // Check for the button
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  
    // Check for input fields
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test("updates input fields on user typing", () => {
    render(
      <MemoryRouter>
        <LoginForm setToken={mockSetToken} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpassword" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("testpassword");
  });

  test("handles successful form submission", async () => {
    // Mock API response
    api.post.mockResolvedValueOnce({ data: { token: "mockToken123" } });

    render(
      <MemoryRouter>
        <LoginForm setToken={mockSetToken} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/token", {
        username: "testuser",
        password: "testpassword",
      });
      expect(mockSetToken).toHaveBeenCalledWith({ token: "mockToken123" });
    });
  });

  test("displays error message on failed login", async () => {
    // Mock API error response
    api.post.mockRejectedValueOnce(new Error("Invalid login credentials"));

    render(
      <MemoryRouter>
        <LoginForm setToken={mockSetToken} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/token", {
        username: "wronguser",
        password: "wrongpassword",
      });
      expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
    });
  });
});
