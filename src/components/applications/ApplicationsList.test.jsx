import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ApplicationsList from "./ApplicationsList";
import api from "../../services/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/api");

describe("ApplicationsList", () => {
  const mockApplications = [
    { id: 1, jobTitle: "Software Engineer", company: "Tech Corp" },
    { id: 2, jobTitle: "Frontend Developer", company: "Web Inc" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading spinner during API fetch", () => {
    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("displays error message if API fails", async () => {
    api.get.mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Failed to load applications.")).toBeInTheDocument()
    );
  });

  test("renders applications after successful API fetch", async () => {
    const mockApplications = [
      { id: 1, jobTitle: "Software Engineer", company: "Tech Corp", status: "Applied", dateApplied: "2024-06-01" },
      { id: 2, jobTitle: "Frontend Developer", company: "Web Inc", status: "Interviewed", dateApplied: "2024-06-05" },
    ];

    api.get.mockResolvedValueOnce({ data: { applications: mockApplications } });

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });
  });

  test("renders empty state when no applications exist", async () => {
    api.get.mockResolvedValueOnce({ data: { applications: [] } });

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/No applications available yet./i)).toBeInTheDocument()
    );
  });

  test("navigates to Add Application form on button click", async () => {
    api.get.mockResolvedValueOnce({ data: { applications: [] } });

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /Add Application/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith("/applications/new");
  });

  test("toggles delete mode on button click", async () => {

    api.get.mockResolvedValueOnce({ data: { applications: mockApplications } });

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    // Check if "Remove Application" button is rendered
    const toggleButton = screen.getByRole("button", { name: /Remove Application/i });
    expect(toggleButton).toBeInTheDocument();

    // Click the button to toggle delete mode
    fireEvent.click(toggleButton);

    // Verify the button text changes to "Done Removing"
    expect(toggleButton).toHaveTextContent("Done Removing");

    // Click again to toggle back
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent("Remove Application");
  });

  test("deletes application and removes it from the list", async () => {

    api.get.mockResolvedValueOnce({ data: { applications: mockApplications } });
    api.delete.mockResolvedValueOnce({}); // Mock delete API response

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    // Enable delete mode
    fireEvent.click(screen.getByRole("button", { name: /Remove Application/i }));

    // Locate the card for "Software Engineer"
    const firstCard = screen.getByText("Software Engineer").closest(".card");
    const firstCardContent = within(firstCard);

    // Click the Delete button to open the confirmation modal
    fireEvent.click(firstCardContent.getByRole("button", { name: /Delete/i }));

    // Verify that the confirmation modal appears
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

    // Click the "Confirm" button
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    // Wait for the delete API call and UI update
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/applications/1");
      expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
    });

    // Verify the other application still exists
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });
});
