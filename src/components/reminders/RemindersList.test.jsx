import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import ReminderList from "./RemindersList";
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

describe("ReminderList", () => {
  const mockReminders = [
    {
      id: "1",
      date: "2024-12-20T15:00:00Z",
      company: "Company A",
      reminderType: "Follow-up",
      description: "Follow-up with the recruiter",
    },
    {
      id: "2",
      date: "2024-12-21T15:00:00Z",
      company: "Company B",
      reminderType: "Interview",
      description: "Prepare for the interview",
    },
  ];
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders the loading state initially", () => {
    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading reminders/i)).toBeInTheDocument();
  });

  it("renders an error message if the API call fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Failed to load reminders"));

    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load reminders/i)).toBeInTheDocument();
    });
  });

  it("renders reminders fetched from the API", async () => {
    api.get.mockResolvedValueOnce({ data: { reminders: mockReminders } });
  
    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );
  
    // Wait for reminders to load
    await waitFor(() => {
      expect(screen.getByText("Reminders")).toBeInTheDocument();
    });
  
    // Check that each reminder card is rendered
    const reminderCards = screen.getAllByRole("heading", { level: 5 });
    expect(reminderCards).toHaveLength(mockReminders.length);
  
    // Assert details within the first reminder card
    const firstCard = reminderCards[0].closest(".card");
    const detailsContainer = within(firstCard).getByText("Company:", { exact: false }).closest("p");
  
    expect(detailsContainer).toHaveTextContent("Company: Company A");
    expect(detailsContainer).toHaveTextContent("Type: Follow-up");
    expect(detailsContainer).toHaveTextContent("Description: Follow-up with the recruiter");
  });

  it("navigates to the add reminder page when 'Add Reminder' is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminders: mockReminders } });

    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add reminder/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /add reminder/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/reminders/add");
  });

  it("toggles delete mode when the remove reminder button is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminders: mockReminders } });

    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /remove reminder/i })).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole("button", { name: /remove reminder/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole("button", { name: /done removing/i })).toBeInTheDocument();
  });

  it("removes a reminder when the delete button is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { reminders: mockReminders } });
    api.delete.mockResolvedValueOnce({});
  
    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );
  
    // Wait for reminders to load
    await waitFor(() => {
      expect(screen.getByText("Reminders")).toBeInTheDocument();
    });

    const toggleDeleteButton = screen.getByRole("button", { name: /remove reminder/i });
    fireEvent.click(toggleDeleteButton);
  
    // Locate the first reminder card
    const firstCard = screen.getByText("December 20, 2024").closest(".card");
    const deleteButton = within(firstCard).getByRole("button", { name: /delete/i });
  
    // Click the delete button
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);
  
    // Assert that the reminder is removed
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith("/reminders/1");
      
    });
    expect(screen.queryByText("Company: Company A")).not.toBeInTheDocument();
  });

  it("renders a message when no reminders are available", async () => {
    api.get.mockResolvedValueOnce({ data: { reminders: [] } });

    render(
      <MemoryRouter>
        <ReminderList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no reminders available yet/i)).toBeInTheDocument();
    });
  });
});
