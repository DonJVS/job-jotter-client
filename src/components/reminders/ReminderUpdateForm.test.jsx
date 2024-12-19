import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import ReminderUpdateForm from "./ReminderUpdateForm";
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

describe("ReminderUpdateForm", () => {
  const mockReminder = {
    id: "1",
    date: "2024-12-20T15:00:00Z",
    reminderType: "Follow-Up",
    description: "Follow-up with the recruiter",
  };
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders the loading state initially", () => {
    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading reminder details/i)).toBeInTheDocument();
  });

  it("renders an error message if the API call fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Failed to load reminder details"));

    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load reminder details/i)).toBeInTheDocument();
    });
  });

  it("renders the form with pre-filled reminder details", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });

    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-12-20")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Follow-Up")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Follow-up with the recruiter")).toBeInTheDocument();
    });
  });

  it("updates form data when inputs change", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });

    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-12-20")).toBeInTheDocument();
    });

    const typeInput = screen.getByLabelText(/type/i);
    fireEvent.change(typeInput, { target: { value: "Interview" } });

    expect(typeInput.value).toBe("Interview");
  });

  it("submits updated reminder details", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });
    api.patch.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-12-20")).toBeInTheDocument();
    });

    // Update form inputs
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: "Interview" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Prepare for the interview" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /update reminder/i });
    fireEvent.click(submitButton);

    // Assert API call and navigation
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/reminders/1", {
        date: "2024-12-20",
        reminderType: "Interview",
        description: "Prepare for the interview",
      });
    });

    // Success message
    expect(screen.getByText(/reminder updated successfully/i)).toBeInTheDocument();
  });

  it("shows an error message if the update fails", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });
    api.patch.mockRejectedValueOnce(new Error("Failed to update reminder"));

    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-12-20")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /update reminder/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/reminders/1", {
        date: "2024-12-20",
        reminderType: "Follow-Up",
        description: "Follow-up with the recruiter",
      });
      expect(screen.getByText(/failed to update reminder/i)).toBeInTheDocument();
    });
  });

  it("navigates back when 'Cancel' is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminder: mockReminder } });

    render(
      <MemoryRouter initialEntries={["/reminders/1/update"]}>
        <Routes>
          <Route path="/reminders/:reminderId/update" element={<ReminderUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("2024-12-20")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
