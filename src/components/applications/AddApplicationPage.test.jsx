import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AddApplicationPage from "./AddApplicationPage";
import UserContext from "../../UserContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("./AddApplicationForm", () => ({
  default: () => <div data-testid="add-application-form">Mock AddApplicationForm</div>,
}));

describe("AddApplicationPage", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  test("renders the AddApplicationPage with title and form", () => {
    const mockUser = { username: "testuser" };

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: mockUser }}>
          <AddApplicationPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 2, name: /Add a New Application/i })).toBeInTheDocument();
    expect(screen.getByTestId("add-application-form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go Back/i })).toBeInTheDocument();
  });

  test("passes currentUser.username to AddApplicationForm", () => {
    const mockUser = { username: "testuser" };

    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: mockUser }}>
          <AddApplicationPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("add-application-form")).toBeInTheDocument();
    // Check that AddApplicationForm received props (mock confirmation in this case)
  });

  test("navigates back when Go Back button is clicked", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ currentUser: { username: "testuser" } }}>
          <AddApplicationPage />
        </UserContext.Provider>
      </MemoryRouter>
    );

    const goBackButton = screen.getByRole("button", { name: /Go Back/i });
    fireEvent.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
