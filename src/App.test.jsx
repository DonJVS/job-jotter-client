import React from 'react';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest'; // Import Vitest mocking utilities
import App from './App';
import api from './services/api';
import jwtDecode from 'jwt-decode';
import useLocalStorage from './hooks/useLocalStorage';

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
  
    // Mock jwtDecode to return a decoded token with exp
    jwtDecode.mockReturnValue({ 
      username: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1-hour expiration
    });
  
    // Mock api.get to return user data
    api.get.mockResolvedValueOnce({ data: { user: mockUser } });
  
    // Mock useLocalStorage to return a valid token
    const mockToken = `${btoa('header')}.${btoa(
      JSON.stringify({ username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 })
    )}.signature`;
    useLocalStorage.mockReturnValue([ { token: mockToken }, vi.fn() ]);
  
    // Render the App
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
    const mockUser = { username: 'testuser', email: 'testuser@example.com' };
    
    // Mock jwtDecode to simulate decoding a valid JWT
    const mockToken = `${btoa('header')}.${btoa(
      JSON.stringify({ username: 'testuser', exp: Math.floor(Date.now() / 1000) + 3600 })
    )}.signature`;
    useLocalStorage.mockReturnValue([ { token: mockToken }, vi.fn() ]);
  
    // Mock API response for fetching user data
    api.get.mockResolvedValueOnce({
      data: { user: mockUser },
    });
  
    // Render the App
    await act(async () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });
    
    const nav = screen.getByRole('navigation');

    // Verify that the Logout button appears
    const logoutButton = await screen.findByRole('button', { name: /Logout/i });
    expect(logoutButton).toBeInTheDocument();
  
    // Simulate a click on the Logout button
    fireEvent.click(logoutButton);
  
    // Verify that the user is logged out by checking for the Login button
    const mainLoginButton = within(nav).getByRole('link', { name: /Login/i });
    expect(mainLoginButton).toBeInTheDocument();
    expect(mainLoginButton).toHaveClass('nav-link');
  
    // Optionally, verify that the Logout button is no longer present
    expect(screen.queryByRole('button', { name: /Logout/i })).not.toBeInTheDocument();
  });
  
});
