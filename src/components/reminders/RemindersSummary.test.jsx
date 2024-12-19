import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import ReminderSummary from "./RemindersSummary";
import api from "../../services/api";

// Mock the API service and useNavigate hook
vi.mock("../../services/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("ReminderSummary", () => {
  const mockReminder = {
    id: "1",
    date: "2024-12-20T15:00:00Z",
    company: "Company A",
    reminderType: "Follow-up",
    description: "Follow-up with the recruiter",
  };
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders the loading state initially", () => {
    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading reminder details/i)).toBeInTheDocument();
  });

  it("renders an error message if the API call fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Reminder not found"));

    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/reminder not found\. redirecting\.\.\./i)).toBeInTheDocument();
    });
  });

  it("renders reminder details fetched from the API", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });
  
    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );
  
    // Wait for the reminder details to load
    await waitFor(() => {
      expect(screen.getByText(/reminder details/i)).toBeInTheDocument();
    });
  
    // Assert that the reminder details are displayed correctly
    const companyContainer = screen.getByText(/company:/i).closest("p");
    expect(companyContainer).toHaveTextContent("Company: Company A");
  
    const dateContainer = screen.getByText(/date:/i).closest("p");
    expect(dateContainer).toHaveTextContent("Date: December 20, 2024");
  
    const typeContainer = screen.getByText(/type:/i).closest("p");
    expect(typeContainer).toHaveTextContent("Type: Follow-up");
  
    const descriptionContainer = screen.getByText(/description:/i).closest("p");
    expect(descriptionContainer).toHaveTextContent("Description: Follow-up with the recruiter");
  });

  it("navigates back to reminders when the back button is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });

    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/← back to reminders/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/← back to reminders/i));

    expect(mockNavigate).toHaveBeenCalledWith("/reminders");
  });

  it("navigates to the update form when 'Update Reminder' is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });

    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/update reminder/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/update reminder/i));

    expect(mockNavigate).toHaveBeenCalledWith("/reminders/1/update");
  });

  it("shows the delete confirmation modal when 'Delete Reminder' is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });

    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/delete reminder/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/delete reminder/i));

    expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this reminder/i)).toBeInTheDocument();
  });

  it("deletes the reminder and navigates back to reminders on confirmation", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });
    api.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={["/reminders/1"]}>
        <Routes>
          <Route path="/reminders/:reminderId" element={<ReminderSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/delete reminder/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/delete reminder/i));

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/reminders/1");
      expect(mockNavigate).toHaveBeenCalledWith("/reminders");
    });
  });
});
