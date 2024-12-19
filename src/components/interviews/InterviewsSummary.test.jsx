import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { vi } from "vitest";
import InterviewSummary from "./InterviewsSummary";
import api from "../../services/api";

vi.mock("../../services/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

describe("InterviewSummary Component", () => {
  const mockNavigate = vi.fn();
  const mockParams = { interviewId: "1" };

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
    vi.mocked(useParams).mockReturnValue(mockParams);
    vi.clearAllMocks();
  });


  test("shows loading spinner initially", () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // Mock a pending promise

    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("displays error message when interview is not found", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("Interview not found"));
    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Interview not found. Redirecting...")).toBeInTheDocument();
    });
  });

  test("renders interview details when data is successfully loaded", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      expect(screen.getByText("December 22, 2024")).toBeInTheDocument();
      expect(screen.getByText("02:00 PM")).toBeInTheDocument();
      expect(screen.getByText("Prepare project portfolio.")).toBeInTheDocument();
    });
  });

  test("navigates back to interview list when 'Back to Interviews' button is clicked", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByText("← Back to Interviews");
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith("/interviews");
    });
  });

  test("navigates to update form when 'Update Interview' button is clicked", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      const updateButton = screen.getByText("Update Interview");
      fireEvent.click(updateButton);
      expect(mockNavigate).toHaveBeenCalledWith("/interviews/1/update");
    });
  });

  test("displays confirmation modal and deletes interview", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });
    vi.mocked(api.delete).mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      const deleteButton = screen.getByText("Delete Interview");
      fireEvent.click(deleteButton);
      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    });

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/interviews/1");
      expect(mockNavigate).toHaveBeenCalledWith("/interviews");
    });
  });

  test("renders AddInterviewToGoogleCalendar with correct props", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewSummary />
      </MemoryRouter>
    );

    await waitFor(() => {
      const calendarButton = screen.getByRole("button", {
        name: "Add interview to Google Calendar",
      });
      expect(calendarButton).toBeInTheDocument();
    });
  });
});
