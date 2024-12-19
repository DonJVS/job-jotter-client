import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AddReminderForm from "./AddReminderForm";
import api from "../../services/api";

// Mock the API service
vi.mock("../../services/api");

describe("AddReminderForm", () => {
  const mockApplications = [
    { id: 1, company: "Company A", jobTitle: "Developer" },
    { id: 2, company: "Company B", jobTitle: "Designer" },
  ];
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the form with the required fields", () => {
    render(<AddReminderForm applications={mockApplications} onAdd={mockOnAdd} />);

    // Check form labels and inputs
    expect(screen.getByLabelText(/application/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reminder type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add reminder/i })).toBeInTheDocument();
  });

  it("updates form state on input changes", () => {
    render(<AddReminderForm applications={mockApplications} onAdd={mockOnAdd} />);

    // Update dropdown
    fireEvent.change(screen.getByLabelText(/application/i), { target: { value: "1" } });
    expect(screen.getByLabelText(/application/i).value).toBe("1");

    // Update reminder type
    fireEvent.change(screen.getByLabelText(/reminder type/i), { target: { value: "Follow-up" } });
    expect(screen.getByLabelText(/reminder type/i).value).toBe("Follow-up");

    // Update date
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2024-12-20" } });
    expect(screen.getByLabelText(/date/i).value).toBe("2024-12-20");

    // Update description
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test description" } });
    expect(screen.getByLabelText(/description/i).value).toBe("Test description");
  });

  it("validates required fields", async () => {
    render(<AddReminderForm applications={mockApplications} onAdd={mockOnAdd} />);

    // Click submit without filling the form
    fireEvent.click(screen.getByRole("button", { name: /add reminder/i }));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/application is required/i)).toBeInTheDocument();
      expect(screen.getByText(/reminder type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    });
  });

  it("submits form data successfully", async () => {
    const mockResponse = { data: { reminder: { id: 1, ...mockApplications[0] } } };
    api.post.mockResolvedValueOnce(mockResponse);

    render(<AddReminderForm applications={mockApplications} onAdd={mockOnAdd} />);

    // Fill out form fields
    fireEvent.change(screen.getByLabelText(/application/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/reminder type/i), { target: { value: "Follow-up" } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2024-12-20" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test description" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /add reminder/i }));

    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/reminders", {
        applicationId: 1,
        reminderType: "Follow-up",
        date: "2024-12-20",
        description: "Test description",
      });
      expect(mockOnAdd).toHaveBeenCalledWith(mockResponse.data.reminder);
    });
  });

  it("handles API errors gracefully", async () => {
    api.post.mockRejectedValueOnce(new Error("Failed to add reminder"));

    render(<AddReminderForm applications={mockApplications} onAdd={mockOnAdd} />);

    // Fill out form fields
    fireEvent.change(screen.getByLabelText(/application/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/reminder type/i), { target: { value: "Follow-up" } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2024-12-20" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test description" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /add reminder/i }));

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText(/failed to add reminder/i)).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });
  });
});
