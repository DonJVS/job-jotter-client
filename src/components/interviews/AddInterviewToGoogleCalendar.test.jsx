import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AddInterviewToGoogleCalendar from "./AddInterviewToGoogleCalendar";
import api from "../../services/api";

vi.mock("../../services/api");

describe("AddInterviewToGoogleCalendar Component", () => {
  const mockInterview = {
    title: "Frontend Developer Interview",
    date: "2024-12-22",
    time: "14:00",
    location: "Online",
    description: "Discussing project experience and skills.",
  };

  const mockRefreshCalendar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("displays validation alert for missing date or time", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<AddInterviewToGoogleCalendar interview={{}} />);

    const button = screen.getByRole("button", { name: "Add interview to Google Calendar" });

    fireEvent.click(button);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Interview date is required.");
    });

    alertMock.mockRestore();
  });

  test("displays alert for invalid date or time", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <AddInterviewToGoogleCalendar
        interview={{ ...mockInterview, date: "invalid-date" }}
      />
    );

    const button = screen.getByRole("button", {
      name: /add interview to google calendar/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Invalid date or time for the interview. Please check the interview details."
      );
    });

    alertMock.mockRestore();
  });

  test("disables the button during API submission", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({});

    render(
      <AddInterviewToGoogleCalendar
        interview={mockInterview}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", {
      name: /add interview to google calendar/i,
    });

    fireEvent.click(button);

    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  test("sends correct event data to the API", async () => {
    const mockInterview = {
      date: "2024-12-22",
      time: "14:00", // Local time
      location: "Online",
      description: "Discussing project experience and skills.",
      title: "Frontend Developer Interview",
    };
  
    const duration = 60; // 60 minutes
    const startDateTime = new Date(`${mockInterview.date}T${mockInterview.time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
  
    vi.mocked(api.post).mockResolvedValueOnce({});
  
    render(<AddInterviewToGoogleCalendar interview={mockInterview} duration={duration} />);
  
    const button = screen.getByRole("button", { name: /add interview to google calendar/i });
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/google-calendar/events", {
        summary: "Frontend Developer Interview",
        description: "Discussing project experience and skills.",
        location: "Online",
        start: {
          dateTime: startDateTime.toISOString(), // Compare UTC time
          timeZone: "America/New_York",
        },
        end: {
          dateTime: endDateTime.toISOString(), // Compare UTC time
          timeZone: "America/New_York",
        },
      });
    });
  });

  test("calls refreshCalendar after successful API submission", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({});

    render(
      <AddInterviewToGoogleCalendar
        interview={mockInterview}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", {
      name: /add interview to google calendar/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRefreshCalendar).toHaveBeenCalled();
    });
  });

  test("displays error alert on API failure", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.mocked(api.post).mockRejectedValueOnce(new Error("API Error"));

    render(
      <AddInterviewToGoogleCalendar
        interview={mockInterview}
        refreshCalendar={mockRefreshCalendar}
      />
    );

    const button = screen.getByRole("button", {
      name: /add interview to google calendar/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Failed to add interview to Google Calendar. Please try again."
      );
    });

    alertMock.mockRestore();
  });
});
