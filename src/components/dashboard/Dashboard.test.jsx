// Dashboard.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import UserContext from '../../UserContext';
import api from '../../services/api';

// Mocking child components
vi.mock('../applications/ApplicationsList', () => ({
  default: () => <div data-testid="ApplicationList">ApplicationList</div>,
}));

vi.mock('../interviews/InterviewsList', () => ({
  default: () => <div data-testid="InterviewList">InterviewList</div>,
}));

vi.mock('../reminders/RemindersList', () => ({
  default: () => <div data-testid="ReminderList">ReminderList</div>,
}));

vi.mock('../calendar/GoogleCalendarEvents', () => ({
  default: () => <div data-testid="GoogleCalendarEvents">GoogleCalendarEvents</div>,
}));

// Mocking API
vi.mock('../../services/api');

describe('Dashboard', () => {
  const mockUser = { id: 1, username: 'testuser' };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders login prompt if no user is logged in', () => {
    render(
      <UserContext.Provider value={{ currentUser: null }}>
        <Dashboard />
      </UserContext.Provider>
    );

    expect(screen.getByText(/Please login or signup to view your dashboard/i)).toBeInTheDocument();
  });

  test('shows loading spinner while fetching data', () => {
    render(
      <UserContext.Provider value={{ currentUser: mockUser }}>
        <Dashboard />
      </UserContext.Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders applications, reminders, and interviews when data is fetched successfully', async () => {
    api.get.mockResolvedValueOnce({ data: { applications: [{ id: 1, title: 'Frontend Developer' }] } });
    api.get.mockResolvedValueOnce({ data: { reminders: [{ id: 1, text: 'Follow up email' }] } });
    api.get.mockResolvedValueOnce({ data: { interviews: [{ id: 1, company: 'Tech Corp' }] } });

    render(
      <UserContext.Provider value={{ currentUser: mockUser }}>
        <Dashboard />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ApplicationList')).toBeInTheDocument();
      expect(screen.getByTestId('ReminderList')).toBeInTheDocument();
      expect(screen.getByTestId('InterviewList')).toBeInTheDocument();
    });
  });

  test('displays error message when API call fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Failed to fetch data'));

    render(
      <UserContext.Provider value={{ currentUser: mockUser }}>
        <Dashboard />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
    });
  });

  test('renders fallback messages when no data is available', async () => {
    api.get.mockResolvedValueOnce({ data: { applications: [] } });
    api.get.mockResolvedValueOnce({ data: { reminders: [] } });
    api.get.mockResolvedValueOnce({ data: { interviews: [] } });

    render(
      <UserContext.Provider value={{ currentUser: mockUser }}>
        <Dashboard />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No job applications found/i)).toBeInTheDocument();
      expect(screen.getByText(/No reminders set/i)).toBeInTheDocument();
      expect(screen.getByText(/No upcoming interviews/i)).toBeInTheDocument();
    });
  });
});
