import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { useAuth } from '../../context/authContext';

jest.mock('../../context/authContext');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Sidebar Component Branch Coverage', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with absolute profile picture URL and name/email', () => {
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com', profile_picture: 'https://example.com/pic.jpg' },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const img = screen.getByAltText('Profile');
    expect(img).toHaveAttribute('src', 'https://example.com/pic.jpg');
    expect(screen.getByText('Hajra')).toBeInTheDocument();
    expect(screen.getByText('hajra@test.com')).toBeInTheDocument();
  });

  test('renders sidebar with relative profile picture URL and fallback user data', () => {
    useAuth.mockReturnValue({
      user: { profile_picture: '/uploads/pic.jpg' },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const img = screen.getByAltText('Profile');
    expect(img).toHaveAttribute('src', 'http://localhost:5000/uploads/pic.jpg');
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  test('renders fallback initial avatar when profile picture is missing', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  test('handles profile click and logout actions', () => {
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTitle('Go to Profile'));
    expect(mockedNavigate).toHaveBeenCalledWith('/profile');

    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});