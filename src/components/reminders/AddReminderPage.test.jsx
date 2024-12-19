import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddReminderPage from "./AddReminderPage";
import api from "../../services/api";

// Mock the API service and useNavigate hook
vi.mock("../../services/api");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AddReminderPage", () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockApplications = [
    { id: 1, company: "Company A", jobTitle: "Developer" },
    { id: 2, company: "Company B", jobTitle: "Designer" },
  ];

  it("renders the loading state initially", () => {
    render(
      <MemoryRouter>
        <AddReminderPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading applications/i)).toBeInTheDocument();
  });

  it("fetches and displays applications", async () => {
    api.get.mockResolvedValueOnce({ data: { applications: mockApplications } });

    render(
      <MemoryRouter>
        <AddReminderPage />
      </MemoryRouter>
    );

    // Wait for applications to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Reminder" })).toBeInTheDocument();
      expect(screen.getByText(/company a - developer/i)).toBeInTheDocument();
      expect(screen.getByText(/company b - designer/i)).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    api.get.mockRejectedValueOnce(new Error("Failed to fetch applications"));

    render(
      <MemoryRouter>
        <AddReminderPage />
      </MemoryRouter>
    );

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to load applications/i)).toBeInTheDocument();
    });
  });

  it("navigates to the reminders list upon successful reminder creation", async () => {
    const mockResponse = { data: { reminder: { id: 1, company: "Company A", jobTitle: "Developer" } } };
    api.post.mockResolvedValueOnce(mockResponse); 
    api.get.mockResolvedValueOnce({ data: { applications: mockApplications } });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AddReminderPage />} />
          <Route path="/reminders" element={<p>Reminders List</p>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Reminder" })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/application/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/reminder type/i), { target: { value: "Follow-up" } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2024-12-20" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Test reminder description" } });

    // Simulate a successful reminder addition
    fireEvent.click(screen.getByRole("button", { name: /add reminder/i }));

    // Mock the API and simulate navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/reminders");
    });
  });

  it("navigates back to the previous page when 'Go Back' is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { applications: mockApplications } });

    render(
      <MemoryRouter>
        <AddReminderPage />
      </MemoryRouter>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Reminder" })).toBeInTheDocument();
    });

    // Simulate "Go Back" button click
    fireEvent.click(screen.getByRole("button", { name: /go back/i }));

    // Verify navigation to the previous page
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
