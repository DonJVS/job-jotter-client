import { render, screen, within, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import ReminderCard from "./ReminderCard";

// Mock the useNavigate hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("ReminderCard", () => {
  const mockReminder = {
    id: "1",
    date: "2024-12-20T15:00:00Z",
    company: "Company A",
    reminderType: "Follow-up",
    description: "Follow-up with the recruiter",
  };
  const mockOnDelete = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders the reminder details correctly", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={true} />
      </MemoryRouter>
    );
  
    // Assert the date
    expect(screen.getByText("December 20, 2024")).toBeInTheDocument();
  
    // Get the <p> element containing all the details
    const detailsContainer = screen.getByText("Company:", { exact: false }).closest("p");
  
    // Assert the text content within the <p> element
    expect(detailsContainer).toHaveTextContent("Company: Company A");
    expect(detailsContainer).toHaveTextContent("Type: Follow-up");
    expect(detailsContainer).toHaveTextContent("Description: Follow-up with the recruiter");
  });

  it("navigates to the reminder summary page on card click", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={true} />
      </MemoryRouter>
    );

    const card = screen.getByText("December 20, 2024").closest(".card");
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/reminders/1");
  });

  it("navigates to the update form on update button click", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={true} />
      </MemoryRouter>
    );

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    expect(mockNavigate).toHaveBeenCalledWith("/reminders/1/update");
  });

  it("shows the confirmation modal on delete button click", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={true} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  it("calls onDelete with the reminder ID on confirm delete", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={true} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("closes the confirmation modal on cancel delete", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={true} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/confirm deletion/i)).not.toBeInTheDocument();
  });

  it("does not render the delete button if deleteMode is false", () => {
    render(
      <MemoryRouter>
        <ReminderCard reminder={mockReminder} onDelete={mockOnDelete} deleteMode={false} />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
