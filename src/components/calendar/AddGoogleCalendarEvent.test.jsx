import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";
import AddGoogleCalendarEvent from "./AddGoogleCalendarEvent";

vi.mock("axios"); // Mock axios to intercept POST requests

describe("AddGoogleCalendarEvent Component", () => {
  const mockRefreshEvents = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders form with all input fields and submit button", () => {
    render(<AddGoogleCalendarEvent />);

    // Check for input fields
    expect(screen.getByPlaceholderText(/Summary/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Location/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Start DateTime/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/End DateTime/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole("button", { name: /Add Event/i })).toBeInTheDocument();
  });

  test("updates input fields on user typing", () => {
    render(<AddGoogleCalendarEvent />);

    // Select input fields
    const summaryInput = screen.getByPlaceholderText(/Summary/i);
    const locationInput = screen.getByPlaceholderText(/Location/i);

    // Simulate typing
    fireEvent.change(summaryInput, { target: { value: "Team Meeting" } });
    fireEvent.change(locationInput, { target: { value: "Conference Room 1" } });

    expect(summaryInput.value).toBe("Team Meeting");
    expect(locationInput.value).toBe("Conference Room 1");
  });

  test("handles successful form submission", async () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    
    axios.post.mockResolvedValueOnce({}); // Mock successful response

    render(<AddGoogleCalendarEvent refreshEvents={mockRefreshEvents} />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Summary/i), { target: { value: "Project Demo" } });
    fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: "Online" } });
    fireEvent.change(screen.getByPlaceholderText(/Start DateTime/i), {
      target: { value: "2024-06-12T10:00" },
    });
    fireEvent.change(screen.getByPlaceholderText(/End DateTime/i), {
      target: { value: "2024-06-12T11:00" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Event/i }));

    await waitFor(() => {
      // Ensure axios.post was called with correct data
      expect(axios.post).toHaveBeenCalledWith("/google-calendar/events", {
        summary: "Project Demo",
        location: "Online",
        description: "",
        start: "2024-06-12T10:00",
        end: "2024-06-12T11:00",
        timeZone: "America/New_York",
      });

      // Check if success alert is shown
      expect(window.alert).toHaveBeenCalledWith("Event added successfully!");

      // Verify that refreshEvents is called
      expect(mockRefreshEvents).toHaveBeenCalled();
    });
  });

  test("logs error to console on failed form submission", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<AddGoogleCalendarEvent refreshEvents={mockRefreshEvents} />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Summary/i), { target: { value: "Error Event" } });
    fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: "Unknown" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Event/i }));

    await waitFor(() => {
      // Ensure axios.post was called
      expect(axios.post).toHaveBeenCalled();

      // Verify error is logged
      expect(console.error).toHaveBeenCalledWith(
        "Failed to add event:",
        expect.any(Error)
      );

      // Ensure refreshEvents is not called
      expect(mockRefreshEvents).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore(); // Clean up console spy
  });
});
