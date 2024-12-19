import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { vi } from "vitest";
import InterviewList from "./InterviewsList";
import api from "../../services/api";

vi.mock("../../services/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("InterviewList Component", () => {
  const mockNavigate = vi.fn();

  const mockInterviews = [
    {
      id: "1",
      date: "2024-12-22",
      time: "14:00",
      company: "Tech Corp",
      location: "Remote",
      notes: "Prepare project portfolio.",
    },
    {
      id: "2",
      date: "2024-12-23",
      time: "10:00",
      company: "Data Inc",
      location: "Headquarters",
      notes: "Bring updated resume.",
    },
  ];

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  test("shows loading spinner initially", () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // Mock a pending promise

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("displays error message when API call fails", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load interviews. Please try again later.")
      ).toBeInTheDocument();
    });
  });

  test("renders interviews list when API call succeeds", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { interviews: mockInterviews },
    });

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Tech Corp"))
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes("Data Inc"))
      ).toBeInTheDocument();
    });
  });

  test("renders empty state when no interviews are available", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interviews: [] } });

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("No interviews scheduled yet. Start by adding one!")
      ).toBeInTheDocument();
    });
  });

  test("navigates to add interview page when 'Add Interview' button is clicked", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interviews: [] } });

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    await waitFor(() => {
      const addButton = screen.getByText("Add Interview");
      fireEvent.click(addButton);
      expect(mockNavigate).toHaveBeenCalledWith("/interviews/add");
    });
  });

  test("toggles delete mode and updates button text", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { interviews: mockInterviews },
    });

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    await waitFor(() => {
      const toggleButton = screen.getByText("Remove Interview");
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent("Done Removing");

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent("Remove Interview");
    });
  });

  test("calls API and removes interview on delete", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { interviews: mockInterviews },
    });
    vi.mocked(api.delete).mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <InterviewList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Upcoming Interviews")).toBeInTheDocument();
    });
  
    // Enable delete mode
    const deleteModeButton = screen.getByRole("button", { name: /remove interview/i });
    fireEvent.click(deleteModeButton);
  
    // Find and click the "Delete" button for the first interview
    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    fireEvent.click(deleteButton);
  
    // Confirm the deletion
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);
  
    // Verify the API call and DOM update
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(`/interviews/1`);
      expect(screen.queryByText("Tech Corp")).not.toBeInTheDocument();
    });
  });
});
