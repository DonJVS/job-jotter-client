import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddApplicationForm from "./AddApplicationForm";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/api";

vi.mock("../../services/api"); // Mock API calls

describe("AddApplicationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all form fields", () => {
    render(<AddApplicationForm />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Applied/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Application/i })).toBeInTheDocument();
  });

  test("updates input fields on user input", () => {
    render(<AddApplicationForm />, { wrapper: MemoryRouter });

    const companyInput = screen.getByLabelText(/Company/i);
    fireEvent.change(companyInput, { target: { value: "Tech Corp" } });
    expect(companyInput.value).toBe("Tech Corp");
  });

  test("displays validation errors for empty required fields", async () => {
    render(<AddApplicationForm />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Date Applied/i), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Application/i }));

    expect(await screen.findByText(/Company name is required./i)).toBeInTheDocument();
    expect(screen.getByText(/Job title is required./i)).toBeInTheDocument();
    screen.debug();
    expect(await screen.findByText(/Application date is required./i)).toBeInTheDocument();
  });

  test("submits the form successfully", async () => {
    api.post.mockResolvedValueOnce({}); // Mock successful API response

    render(<AddApplicationForm />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: "Tech Corp" } });
    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: "Engineer" } });
    fireEvent.change(screen.getByLabelText(/Date Applied/i), { target: { value: "2024-06-15" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Application/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/applications", {
        company: "Tech Corp",
        jobTitle: "Engineer",
        status: "applied",
        dateApplied: "2024-06-15",
        notes: "",
      });
    });
  });

  test("handles API errors gracefully", async () => {
    api.post.mockRejectedValueOnce(new Error("API Error"));

    render(<AddApplicationForm />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: "Tech Corp" } });
    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: "Engineer" } });
    fireEvent.change(screen.getByLabelText(/Date Applied/i), { target: { value: "2024-06-15" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Application/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to add application. Please try again./i)).toBeInTheDocument();
    });
  });
});
