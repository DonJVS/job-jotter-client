import { render, screen, fireEvent, waitFor, within, cleanup } from "@testing-library/react";
import GoogleCalendarEvents from "./GoogleCalendarEvents";
import api from "../../services/api";
import { vi } from "vitest";


// Mock the API
vi.mock("../../services/api");


describe("GoogleCalendarEvents Component", () => {
  const mockEvents = [
    {
      id: "1",
      summary: "Test Event 1",
      start: { dateTime: "2024-12-18T10:00:00" },
      end: { dateTime: "2024-12-18T12:00:00" },
      description: "Description for Test Event 1",
      location: "Location 1",
    },
    {
      id: "2",
      summary: "Test Event 2",
      start: { dateTime: "2024-12-19T14:00:00" },
      end: { dateTime: "2024-12-19T15:00:00" },
      description: "Description for Test Event 2",
      location: "Location 2",
    },
  ];

  beforeEach(() => {
    api.get.mockResolvedValue({ data: mockEvents });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders loading spinner initially", () => {
    render(<GoogleCalendarEvents />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("fetches and displays events", async () => {
    render(<GoogleCalendarEvents />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringMatching(/google-calendar\/events/)
      );
    });

    expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    expect(screen.getByText("Test Event 2")).toBeInTheDocument();
  });


  it("opens a modal for editing an event", async () => {
    render(<GoogleCalendarEvents />);

    await waitFor(() => {
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    });

    const eventElement = screen.getByText("Test Event 1");
    fireEvent.click(eventElement);

    expect(screen.getByText("Edit Event")).toBeInTheDocument();
  });

  it("deletes an event", async () => {
    render(<GoogleCalendarEvents />);
  
    // Wait for the events to load
    await waitFor(() => {
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    });
  
    // Mock the API delete call
    api.delete.mockResolvedValue({});
  
    // Trigger the deletion by clicking on the event
    fireEvent.click(screen.getByText("Test Event 1"));
  
    // Simulate clicking the Delete button in the modal
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);
  
    // Simulate confirming deletion
    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);
  
    // Wait for the event to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText("Test Event 1")).not.toBeInTheDocument();
    });
  
    // Ensure the API delete call was made with the correct ID
    expect(api.delete).toHaveBeenCalledWith("/google-calendar/events/1");
  });
  
});
