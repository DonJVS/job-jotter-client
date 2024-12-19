import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { vi } from "vitest";
import InterviewCard from "./InterviewCard";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("InterviewCard Component", () => {
  const mockNavigate = vi.fn();
  const mockOnDelete = vi.fn();

  const mockInterview = {
    id: "1",
    date: "2024-12-22T00:00:00",
    time: "14:00",
    company: "Tech Corp",
    location: "Remote",
    notes: "Prepare project portfolio.",
  };

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  test("renders interview details correctly", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={true} />
      </MemoryRouter>
    );

    expect(screen.getByText("December 22, 2024")).toBeInTheDocument();
    expect(screen.getByText("02:00 PM")).toBeInTheDocument();

    expect(screen.getByText((content) => content.includes("Tech Corp"))
    ).toBeInTheDocument();

    expect(screen.getByText((content) => content.includes("Remote"))
    ).toBeInTheDocument();

    expect(screen.getByText((content) => content.includes("Prepare project portfolio."))
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  test("navigates to interview summary page on card click", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={true} />
      </MemoryRouter>
    );

    const card = screen.getByText("December 22, 2024").closest(".card");
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/interviews/1");
  });

  test("navigates to update form when 'Update' button is clicked", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={true} />
      </MemoryRouter>
    );

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    expect(mockNavigate).toHaveBeenCalledWith("/interviews/1/update");
  });

  test("shows delete confirmation modal when 'Delete' button is clicked", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={true} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(
    screen.getByText((content) =>
      content.includes("Are you sure you want to delete this interview on")
    )
    ).toBeInTheDocument();
    const modalDate = screen.getAllByText("December 22, 2024").find(
      (el) => el.closest(".modal") // Ensure it's inside the modal
    );
    expect(modalDate).toBeInTheDocument();
  
    // Assert the modal's time
    const modalTime = screen.getAllByText("02:00 PM").find(
      (el) => el.closest(".modal") // Ensure it's inside the modal
    );
    expect(modalTime).toBeInTheDocument();
  });

  test("calls onDelete when deletion is confirmed", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={true} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  test("closes the delete confirmation modal when 'Cancel' is clicked", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={true} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
  });

  test("does not show 'Delete' button when deleteMode is false", () => {
    render(
      <MemoryRouter>
        <InterviewCard interview={mockInterview} deleteMode={false} />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
