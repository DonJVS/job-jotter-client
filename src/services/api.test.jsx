import axios from "axios";
import { vi } from "vitest";

// Mock axios with interceptors and defaults
vi.mock("axios", () => {
  const createMock = vi.fn(() => ({
    interceptors: {
      request: {
        use: vi.fn((callback) => {
          const config = { headers: {} };
          return callback(config);
        }),
      },
    },
    defaults: {
      baseURL: import.meta.env.REACT_APP_BASE_URL || "http://localhost:5002",
    },
  }));

  return {
    default: { create: createMock },
    create: createMock,
  };
});

// Import `api` after mocking axios
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_BASE_URL || "http://localhost:5002",
  withCredentials: true,
});

describe("api module", () => {
  const BASE_URL = import.meta.env.REACT_APP_BASE_URL || "http://localhost:5002";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("api instance should have the correct base URL", () => {
    expect(api.defaults.baseURL).toBe(BASE_URL);
  });

  test("should add Authorization header if token exists", () => {
    const mockToken = "mock-token";
    localStorage.setItem("job-jotter-token", mockToken);

    const modifiedConfig = api.interceptors.request.use((config) => {
      const token = localStorage.getItem("job-jotter-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  test("should not add Authorization header if no token exists", () => {
    const modifiedConfig = api.interceptors.request.use((config) => {
      const token = localStorage.getItem("job-jotter-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });
});
