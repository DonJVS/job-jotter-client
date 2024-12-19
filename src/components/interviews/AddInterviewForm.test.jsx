import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddInterviewForm from "./AddInterviewForm";
import "@testing-library/jest-dom";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("AddInterviewForm Component", () => {
  const mockApplications = [
    { id: 1, jobTitle: "Software Engineer", company: "Tech Corp" },
    { id: 2, jobTitle: "Data Analyst", company: "Data Inc" },
  ];
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks(); // Clear any previous mock calls
  });

  test("renders all form fields and button", () => {
    render(<AddInterviewForm applications={mockApplications} onAdd={mockOnAdd} />);

    expect(screen.getByRole("heading", { name: "Add Interview" })).toBeInTheDocument();
    expect(screen.getByLabelText("Application")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add interview/i })).toBeInTheDocument();
  });

  test("validates required fields on submit", async () => {
    render(<AddInterviewForm applications={mockApplications} onAdd={mockOnAdd} />);

    const submitButton = screen.getByRole("button", { name: /add interview/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Application is required.")).toBeInTheDocument();
      expect(screen.getByText("Date is required.")).toBeInTheDocument();
      expect(screen.getByText("Time is required.")).toBeInTheDocument();
      expect(screen.getByText("Location is required.")).toBeInTheDocument();
    });
  });

  test("updates form state on input change", () => {
    render(<AddInterviewForm applications={mockApplications} onAdd={mockOnAdd} />);

    const locationInput = screen.getByLabelText("Location");
    fireEvent.change(locationInput, { target: { value: "123 Main St" } });
    expect(locationInput.value).toBe("123 Main St");
  });

  test("clears individual field error on change", async () => {
    render(<AddInterviewForm applications={mockApplications} onAdd={mockOnAdd} />);

    const submitButton = screen.getByRole("button", { name: /add interview/i });
    fireEvent.click(submitButton);

    const locationInput = screen.getByLabelText("Location");
    fireEvent.change(locationInput, { target: { value: "123 Main St" } });

    await waitFor(() => {
      expect(screen.queryByText("Location is required.")).not.toBeInTheDocument();
    });
  });

  test("displays global error on API failure", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("API Error"));

    render(<AddInterviewForm applications={mockApplications} onAdd={mockOnAdd} />);

    const applicationDropdown = screen.getByLabelText("Application");
    const dateInput = screen.getByLabelText("Date");
    const timeInput = screen.getByLabelText("Time");
    const locationInput = screen.getByLabelText("Location");
    const notesInput = screen.getByLabelText("Notes");

    fireEvent.change(applicationDropdown, { target: { value: mockApplications[0].id } });
    fireEvent.change(dateInput, { target: { value: "2024-12-20" } });
    fireEvent.change(timeInput, { target: { value: "10:00" } });
    fireEvent.change(locationInput, { target: { value: "Conference Room A" } });
    fireEvent.change(notesInput, { target: { value: "Be on time" } });

    const submitButton = screen.getByRole("button", { name: /add interview/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to add interview. Please try again.")).toBeInTheDocument();
    });
  });

  test("calls onAdd after successful submission", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({});

    render(<AddInterviewForm applications={mockApplications} onAdd={mockOnAdd} />);

    const applicationDropdown = screen.getByLabelText("Application");
    const dateInput = screen.getByLabelText("Date");
    const timeInput = screen.getByLabelText("Time");
    const locationInput = screen.getByLabelText("Location");
    const notesInput = screen.getByLabelText("Notes");

    fireEvent.change(applicationDropdown, { target: { value: mockApplications[0].id } });
    fireEvent.change(dateInput, { target: { value: "2024-12-20" } });
    fireEvent.change(timeInput, { target: { value: "10:00" } });
    fireEvent.change(locationInput, { target: { value: "Conference Room A" } });
    fireEvent.change(notesInput, { target: { value: "Be on time" } });

    const submitButton = screen.getByRole("button", { name: /add interview/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled();
    });
  });
});
