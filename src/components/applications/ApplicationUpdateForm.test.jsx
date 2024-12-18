import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ApplicationUpdateForm from "./ApplicationUpdateForm";
import api from "../../services/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/api");

describe("ApplicationUpdateForm", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockApplication = {
    id: 1,
    jobTitle: "Software Engineer",
    company: "Tech Corp",
    status: "applied",
    dateApplied: "2024-06-01",
    notes: "Initial application submitted",
  };

  test("renders loading spinner during data fetch", () => {
    render(
      <MemoryRouter initialEntries={["/applications/1/update"]}>
        <Routes>
          <Route path="/applications/:id/update" element={<ApplicationUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading Application Details...")).toBeInTheDocument();
  });

  test("displays error message if API fetch fails", async () => {
    api.get.mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter initialEntries={["/applications/1/update"]}>
        <Routes>
          <Route path="/applications/:id/update" element={<ApplicationUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load application. Please try again later.")
      ).toBeInTheDocument();
    });
  });

  test("renders form with pre-filled data", async () => {
    const normalizeDate = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`; // YYYY-MM-DD format
    }

    // Mocked API response data
    const mockDate = "2024-06-01"; // Desired date
    normalizeDate(mockDate);

    api.get.mockResolvedValueOnce({
      data: {
        application: {
          id: 1,
          jobTitle: "Software Engineer",
          company: "Tech Corp",
          status: "applied",
          dateApplied: mockDate,
          notes: "Initial application submitted",
        },
      },
    });

    render(
      <MemoryRouter>
        <ApplicationUpdateForm />
      </MemoryRouter>
    );

    // Wait for the form to load with pre-filled data
    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("Tech Corp");
      expect(screen.getByLabelText(/Job Title/i)).toHaveValue("Software Engineer");
      expect(screen.getByLabelText(/Status/i)).toHaveValue("applied");

      // Validate the normalized date to prevent time zone issues
      expect(screen.getByLabelText(/Date Applied/i)).toHaveValue(normalizeDate(mockDate));
      
      expect(screen.getByLabelText(/Notes/i)).toHaveValue("Initial application submitted");
    });
  });

  test("updates input fields correctly", async () => {
    api.get.mockResolvedValueOnce({ data: { application: mockApplication } });

    render(
      <MemoryRouter initialEntries={["/applications/1/update"]}>
        <Routes>
          <Route path="/applications/:id/update" element={<ApplicationUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Company/i), {
        target: { value: "New Tech Corp" },
      });
      expect(screen.getByLabelText(/Company/i)).toHaveValue("New Tech Corp");
    });
  });


  test("handles API error on form submission", async () => {
    api.get.mockResolvedValueOnce({ data: { application: mockApplication } });
    api.patch.mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter initialEntries={["/applications/1/update"]}>
        <Routes>
          <Route path="/applications/:id/update" element={<ApplicationUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Update Application/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to update application. Please check your input and try again.")).toBeInTheDocument();
    });
  });

  test("navigates back when Cancel button is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { application: mockApplication } });

    render(
      <MemoryRouter initialEntries={["/applications/1/update"]}>
        <Routes>
          <Route path="/applications/:id/update" element={<ApplicationUpdateForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
