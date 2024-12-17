import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddApplicationForm from "./AddApplicationForm";
import api from "../../services/api";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest"; //

vi.mock("../../services/api", () => {
  return {
    default: {
      post: vi.fn(), // Mock the post method
    },
  };
}); // Mock the API module

// Helper to render the component with routing context
function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("AddApplicationForm", () => {
  const today = new Date().toISOString().split("T")[0];

  beforeEach(() => {
    vi.clearAllMocks(); 
    api.post.mockResolvedValueOnce({ data: { success: true } });// Reset mocks before each test
  });

  test("renders form fields correctly", () => {
    renderWithRouter(<AddApplicationForm />);

    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Applied/i)).toHaveValue(today);
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Application/i })).toBeInTheDocument();
  });

  test("shows validation errors for required fields", async () => {
    renderWithRouter(<AddApplicationForm />);

    // Submit form without filling in required fields
    fireEvent.click(screen.getByRole("button", { name: /Add Application/i }));

    expect(await screen.findByText(/Company name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Job title is required/i)).toBeInTheDocument();
  });

  test("submits form successfully and resets fields", async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<AddApplicationForm />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Company/i), "Google");
    await userEvent.type(screen.getByLabelText(/Job Title/i), "Software Engineer");
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "offered" } });
    fireEvent.change(screen.getByLabelText(/Date Applied/i), { target: { value: today } });
    await userEvent.type(screen.getByLabelText(/Notes/i), "Excited for this role!");

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Application/i }));

    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/applications", {
        company: "Google",
        jobTitle: "Software Engineer",
        status: "offered",
        dateApplied: today,
        notes: "Excited for this role!",
      });
    });

    // Confirm fields are reset
    expect(screen.getByLabelText(/Company/i)).toHaveValue("");
    expect(screen.getByLabelText(/Job Title/i)).toHaveValue("");
    expect(screen.getByLabelText(/Status/i)).toHaveValue("applied");
    expect(screen.getByLabelText(/Date Applied/i)).toHaveValue(today);
    expect(screen.getByLabelText(/Notes/i)).toHaveValue("");
  });

  test("displays a generic error when API submission fails", async () => {
    api.post.mockRejectedValueOnce(new Error("Failed to add application"));
  
    renderWithRouter(<AddApplicationForm />);
  
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Company/i), "Amazon");
    await userEvent.type(screen.getByLabelText(/Job Title/i), "Backend Engineer");
  
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Application/i }));
  
    // Ensure API call happens
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  
    // Wait for the error message
    await waitFor(() => {
      expect(screen.queryByText(/Failed to add application/i)).toBeTruthy();
    });
  });
  
  

  test("disables the submit button during form submission", async () => {
    api.post.mockResolvedValue({});

    renderWithRouter(<AddApplicationForm />);

    // Fill in the form
    userEvent.type(screen.getByLabelText(/Company/i), "Microsoft");
    userEvent.type(screen.getByLabelText(/Job Title/i), "DevOps Engineer");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Add Application/i });
    fireEvent.click(submitButton);

    // Button should be disabled
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Button should be re-enabled after submission
    expect(submitButton).not.toBeDisabled();
  });
});
