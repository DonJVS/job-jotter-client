import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { vi } from "vitest";
import InterviewUpdateForm from "./InterviewUpdateForm";
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

describe("InterviewUpdateForm Component", () => {
  const mockNavigate = vi.fn();
  const mockParams = { interviewId: "1" };

  const mockInterview = {
    date: "2024-12-22T00:00:00",
    time: "14:00",
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
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("displays error message when interview details fail to load", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load interview details. Please try again later.")
      ).toBeInTheDocument();
    });
  });

  test("renders form pre-filled with interview details", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Date").value).toBe("2024-12-22");
      expect(screen.getByLabelText("Time").value).toBe("14:00");
      expect(screen.getByLabelText("Location").value).toBe("Remote");
      expect(screen.getByLabelText("Notes").value).toBe("Prepare project portfolio.");
    });
  });

  test("updates form state on input change", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      const locationInput = screen.getByLabelText("Location");
      fireEvent.change(locationInput, { target: { value: "Office HQ" } });
      expect(locationInput.value).toBe("Office HQ");
    });
  });

  test("displays success message after successful update", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });
    vi.mocked(api.patch).mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: "Update Interview" });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Interview updated successfully!")).toBeInTheDocument();
    });
  });

  test("displays error message on update failure", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });
    vi.mocked(api.patch).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /update interview/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to update interview. Please check your input and try again.")
      ).toBeInTheDocument();
    });
  });

  test("disables submit button during submission", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });
    vi.mocked(api.patch).mockReturnValue(new Promise(() => {})); // Mock pending promise

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /update interview/i });
      fireEvent.click(submitButton);
      expect(submitButton).toBeDisabled();
    });
  });

  test("navigates back when 'Cancel' button is clicked", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { interview: mockInterview } });

    render(
      <MemoryRouter>
        <InterviewUpdateForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
