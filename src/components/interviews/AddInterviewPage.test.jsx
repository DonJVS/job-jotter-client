import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { vi } from "vitest";
import AddInterviewPage from "./AddInterviewPage";
import api from "../../services/api";

vi.mock("../../services/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("AddInterviewPage Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  test("renders loading message initially", () => {
    render(
      <MemoryRouter>
        <AddInterviewPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading applications...")).toBeInTheDocument();
  });

  test("renders error message when API call fails", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <AddInterviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load applications.")).toBeInTheDocument();
    });
  });

  test("renders AddInterviewForm when applications load successfully", async () => {
    const mockApplications = [
      { id: 1, jobTitle: "Software Engineer", company: "Tech Corp" },
      { id: 2, jobTitle: "Data Analyst", company: "Data Inc" },
    ];

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { applications: mockApplications },
    });

    render(
      <MemoryRouter>
        <AddInterviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Add Interview", level: 2 })).toBeInTheDocument();
      expect(screen.getByLabelText("Application")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add Interview" })).toBeInTheDocument();
    });
  });

  test("navigates to interviews list on successful addition", async () => {
    const mockApplications = [
      { id: 1, jobTitle: "Software Engineer", company: "Tech Corp" },
      { id: 2, jobTitle: "Data Analyst", company: "Data Inc" },
    ];

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { applications: mockApplications },
    });

    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <AddInterviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Add Interview", level: 2 })).toBeInTheDocument();
    });

    // Simulate successful form submission
    fireEvent.change(screen.getByLabelText("Application"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2024-12-20" } });
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "Conference Room A" } });
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Be on time" } });

    // Simulate form submission
    fireEvent.click(screen.getByRole("button", { name: /add interview/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/interviews");
    });
  });

  test("navigates back on clicking 'Go Back' button", async () => {
    const mockApplications = [
      { id: 1, jobTitle: "Software Engineer", company: "Tech Corp" },
      { id: 2, jobTitle: "Data Analyst", company: "Data Inc" },
    ];

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { applications: mockApplications },
    });

    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <AddInterviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Add Interview", level: 2 })).toBeInTheDocument();
    });

    // Simulate "Go Back" button click
    const backButton = screen.getByRole("button", { name: /go back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
