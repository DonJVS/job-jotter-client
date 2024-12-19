import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ApplicationSummary from "./ApplicationSummary";
import api from "../../services/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/api");

describe("ApplicationSummary", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const applicationData = {
    id: 1,
    jobTitle: "Software Engineer",
    company: "Tech Corp",
    status: "Applied",
    dateApplied: "2024-06-15",
    notes: "Follow up after 2 weeks",
  };

  const interviewsData = [
    {
      id: 1,
      date: "2024-06-20",
      time: "14:00",
      location: "Zoom",
      notes: "Technical interview",
    },
  ];

  const remindersData = [
    {
      id: 1,
      date: "2024-06-18",
      description: "Send follow-up email",
      reminder_type: "email",
    },
  ];

  test("renders loading spinner during API fetch", () => {
    api.get.mockImplementation(() =>
      new Promise(() => {
        /* Simulate pending state */
      })
    );

    render(
      <MemoryRouter initialEntries={["/applications/1"]}>
        <Routes>
          <Route path="/applications/:applicationId" element={<ApplicationSummary />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert the loading spinner is rendered
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading Application Details...")).toBeInTheDocument();
  });

  test("displays error message on API failure", async () => {
    api.get.mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter initialEntries={["/applications/1"]}>
        <Routes>
          <Route path="/applications/:applicationId" element={<ApplicationSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Application not found. Redirecting...")
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Back to Applications/i })).toBeInTheDocument();
  });


  test("shows delete confirmation modal and deletes application", async () => {
    api.get
      .mockResolvedValueOnce({ data: { application: applicationData } })
      .mockResolvedValueOnce({ data: { interviews: [] } })
      .mockResolvedValueOnce({ data: { reminders: [] } });
    api.delete.mockResolvedValueOnce({}); // Mock successful delete

    render(
      <MemoryRouter initialEntries={["/applications/1"]}>
        <Routes>
          <Route path="/applications/:applicationId" element={<ApplicationSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Software Engineer at Tech Corp")).toBeInTheDocument();
    });

    // Trigger delete modal
    fireEvent.click(screen.getByRole("button", { name: /Delete Application/i }));
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/applications/1");
      expect(mockNavigate).toHaveBeenCalledWith("/applications");
    });
  });

  test("navigates to update page", async () => {
    api.get
      .mockResolvedValueOnce({ data: { application: applicationData } })
      .mockResolvedValueOnce({ data: { interviews: [] } })
      .mockResolvedValueOnce({ data: { reminders: [] } });

    render(
      <MemoryRouter initialEntries={["/applications/1"]}>
        <Routes>
          <Route path="/applications/:applicationId" element={<ApplicationSummary />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Software Engineer at Tech Corp")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Application/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/applications/1/update");
  });
});
