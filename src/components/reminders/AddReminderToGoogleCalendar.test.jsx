import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AddReminderToGoogleCalendar from "./AddReminderToGoogleCalendar";
import api from "../../services/api";

// Mock the API service
vi.mock("../../services/api");

describe("AddReminderToGoogleCalendar", () => {
  const mockReminder = {
    reminderType: "Follow-up",
    description: "Follow-up with the recruiter",
    company: "Company A",
    date: "2024-12-20T15:00:00Z",
  };
  const mockRefreshCalendar = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the button correctly", () => {
    render(
      <AddReminderToGoogleCalendar
        reminder={mockReminder}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", { name: /add reminder to google calendar/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Add to Google Calendar");
    expect(button).not.toBeDisabled();
  });

  it("validates the reminder details before adding", async () => {
    const incompleteReminder = { ...mockReminder, date: "" };
    render(
      <AddReminderToGoogleCalendar
        reminder={incompleteReminder}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", { name: /add reminder to google calendar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText(/adding.../i)).not.toBeInTheDocument();
    });

    // Expect alert to be called
    // Mock alert if needed or use spy
  });

  it("sends the event to the backend API", async () => {
    api.post.mockResolvedValueOnce({});

    render(
      <AddReminderToGoogleCalendar
        reminder={mockReminder}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", { name: /add reminder to google calendar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/google-calendar/events",
        expect.objectContaining({
          summary: "Reminder: Follow-up",
          description: "Follow-up with the recruiter",
          location: "Company A",
          start: expect.objectContaining({
            dateTime: new Date("2024-12-20T15:00:00Z").toISOString(),
          }),
          end: expect.objectContaining({
            dateTime: new Date("2024-12-20T16:00:00Z").toISOString(),
          }),
        })
      );
    });
  });

  it("handles API errors gracefully", async () => {
    api.post.mockRejectedValueOnce(new Error("Failed to add to Google Calendar"));

    render(
      <AddReminderToGoogleCalendar
        reminder={mockReminder}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", { name: /add reminder to google calendar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockRefreshCalendar).not.toHaveBeenCalled();
    });
  });

  it("displays loading state during submission", async () => {
    api.post.mockResolvedValueOnce({});

    render(
      <AddReminderToGoogleCalendar
        reminder={mockReminder}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", { name: /add reminder to google calendar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent("Adding...");
      expect(button).toBeDisabled();
    });

    await waitFor(() => {
      expect(button).toHaveTextContent("Add to Google Calendar");
      expect(button).not.toBeDisabled();
    });
  });
});
