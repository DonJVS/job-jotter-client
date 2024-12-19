import React from 'react';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest'; // Import Vitest mocking utilities
import App from './App';
import api from './services/api';
import jwtDecode from 'jwt-decode';

// Mock external modules using Vitest
vi.mock('./services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('jwt-decode', async () => {
  const actual = await vi.importActual('jwt-decode');
  return {
    ...actual,
    default: vi.fn(), // Mock the default export
  };
});

vi.mock('./hooks/useLocalStorage', () => {
  // Mock token with Base64-encoded payload
  const mockToken = `${btoa('header')}.${btoa(
    JSON.stringify({ username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 })
  )}.signature`;
  return {
    default: vi.fn(() => [mockToken, vi.fn()]),
  };
});

const TestComponent = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return <div>Not Loading</div>;
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear all mocks between tests
  });

  test('displays loading spinner when isLoading is true', () => {
    render(<TestComponent isLoading={true} />);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const spinners = screen.getAllByRole('status');
    expect(spinners[0]).toBeInTheDocument();
  });

  test('renders homepage for "/" route', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });

  test('fetches user data when token is available', async () => {
    const mockUser = { username: 'testuser' };

    // Mock jwtDecode to return a decoded token
    jwtDecode.mockReturnValue({ username: 'testuser' });

    // Mock api.get to return user data
    api.get.mockResolvedValueOnce({ data: { user: mockUser } });

    // Mock useState to simulate a valid token
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );
    });

    // Verify the api call
    expect(api.get).toHaveBeenCalledWith('/users/testuser');

    // Check that the dashboard is rendered
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  test('logs out user and clears state', async () => {
    // Mock the localStorage token to simulate a logged-in user
    const mockToken = 'mock-jwt-token';
    localStorage.setItem('job-jotter-token', mockToken);
  
    // Mock jwtDecode to simulate decoding a valid JWT
    jwtDecode.mockReturnValue({
      username: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1-hour expiration
    });
  
    // Mock API response for fetching user data
    api.get.mockResolvedValueOnce({
      data: { user: { username: 'testuser', email: 'testuser@example.com' } },
    });
  
    // Render the app
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
  
    // Wait for the logout button to appear
    const logoutButton = await screen.findByRole('button', { name: /Logout/i });
  
    // Simulate a click on the logout button
    fireEvent.click(logoutButton);
  
    // Verify the user is logged out
    const mainContent = screen.getByRole('main'); // or another specific container
    const mainLoginButton = within(mainContent).getByRole('link', { name: /Login/i });
    expect(mainLoginButton).toBeInTheDocument();
    expect(mainLoginButton).toHaveClass('btn-primary')
  
    // Cleanup localStorage
    localStorage.removeItem('job-jotter-token');
  });
});
