import { render, screen, within, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ApplicationCard from "./ApplicationCard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ApplicationCard", () => {
  const mockOnDelete = vi.fn();

  const application = {
    id: 1,
    jobTitle: "Software Engineer",
    company: "Tech Corp",
    status: "Applied",
    dateApplied: "2024-06-15",
    notes: "Follow up after 2 weeks.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders application details", () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={application} deleteMode={false} onDelete={() =>{}} />
      </MemoryRouter>
    );

    const card = screen.getByRole("heading", { name: application.jobTitle }).closest(".card");

    expect(card).toBeInTheDocument();

    const cardContent = within(card);
    
    const statusElement = card.querySelector("p.card-text");
    expect(statusElement.textContent).toContain("Status: Applied");
    expect(cardContent.getByText(application.company)).toBeInTheDocument();
    expect(cardContent.getByText(/Status:/i)).toBeInTheDocument();
    // expect(cardContent.getByText("Applied")).toBeInTheDocument();
    expect(cardContent.getByText(/Follow up after 2 weeks\./i)).toBeInTheDocument();
  });

  test("renders 'No application data' when no application is passed", () => {
    render(<ApplicationCard />);

    expect(screen.getByText("No application data.")).toBeInTheDocument();
  });

  test("navigates to detail page on card click", () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={application} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(application.jobTitle));
    expect(mockNavigate).toHaveBeenCalledWith(`/applications/${application.id}`);
  });

  test("navigates to update page on Update button click", () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={application} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));
    expect(mockNavigate).toHaveBeenCalledWith(`/applications/${application.id}/update`);
  });

  test("shows delete button in deleteMode", () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={application} deleteMode={true} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  test("opens and closes delete confirmation modal", () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={application} deleteMode={true} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(screen.queryByText(/Confirm Deletion/i)).not.toBeInTheDocument();
  });

  test("triggers onDelete when Confirm is clicked", () => {
    render(
      <MemoryRouter>
        <ApplicationCard application={application} deleteMode={true} onDelete={mockOnDelete} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    expect(mockOnDelete).toHaveBeenCalledWith(application.id);
  });
});
