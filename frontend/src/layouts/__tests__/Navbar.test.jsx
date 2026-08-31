import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { useAuth } from '../../context/authContext';

jest.mock('../../context/authContext');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Navbar Component Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with absolute profile picture', () => {
    useAuth.mockReturnValue({
      user: { name: 'Hajra', profile_picture: 'https://example.com/avatar.jpg' },
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getAllByAltText('Profile')[0]).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(screen.getAllByText('Hajra')[0]).toBeInTheDocument();
  });

  test('handles relative picture and valid API origin', () => {
    useAuth.mockReturnValue({
      user: { name: 'Dev', profile_picture: '/images/avatar.jpg' },
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getAllByAltText('Profile')[0]).toBeInTheDocument();
  });

  test('renders default avatar and fallback username when user data is empty', () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getAllByText('U')[0]).toBeInTheDocument();
    expect(screen.getAllByText('User')[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByTitle('Go to Profile')[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/profile');
  });
  test('falls back to localhost origin when VITE_API_URL is malformed', () => {
  const original = globalThis.import.meta.env.VITE_API_URL;
  globalThis.import.meta.env.VITE_API_URL = 'not a valid url';

  useAuth.mockReturnValue({ user: { name: 'Hajra', profile_picture: '/pic.jpg' } });

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const images = screen.getAllByAltText('Profile');
  expect(images[0].getAttribute('src')).toBe('http://localhost:5000/pic.jpg');

  globalThis.import.meta.env.VITE_API_URL = original;
});

test('activates profile navigation via keyboard (Enter and Space)', () => {
  useAuth.mockReturnValue({ user: { name: 'Hajra' } });

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const profileSections = screen.getAllByTitle('Go to Profile');
  fireEvent.keyDown(profileSections[0], { key: 'Enter' });
  expect(mockedNavigate).toHaveBeenCalledWith('/profile');

  mockedNavigate.mockClear();
  fireEvent.keyDown(profileSections[0], { key: ' ' });
  expect(mockedNavigate).toHaveBeenCalledWith('/profile');

  mockedNavigate.mockClear();
  fireEvent.keyDown(profileSections[0], { key: 'Escape' });
  expect(mockedNavigate).not.toHaveBeenCalled();
});

test('clicking mobile profile section also navigates', () => {
  useAuth.mockReturnValue({ user: { name: 'Hajra' } });

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const profileSections = screen.getAllByTitle('Go to Profile');
  fireEvent.click(profileSections[1]);
  expect(mockedNavigate).toHaveBeenCalledWith('/profile');
});

test('typing in desktop and mobile search inputs calls onSearchChange', () => {
  const mockOnSearchChange = jest.fn();
  useAuth.mockReturnValue({ user: { name: 'Hajra' } });

  render(
    <BrowserRouter>
      <Navbar searchQuery="" onSearchChange={mockOnSearchChange} onToggleSidebar={jest.fn()} />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('Search notes here...'), { target: { value: 'todo' } });
  expect(mockOnSearchChange).toHaveBeenCalledWith('todo');

  fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'grocery' } });
  expect(mockOnSearchChange).toHaveBeenCalledWith('grocery');
});

test('clicking hamburger menu toggles sidebar', () => {
  const mockOnToggleSidebar = jest.fn();
  useAuth.mockReturnValue({ user: { name: 'Hajra' } });

  render(
    <BrowserRouter>
      <Navbar onToggleSidebar={mockOnToggleSidebar} searchQuery="" onSearchChange={jest.fn()} />
    </BrowserRouter>
  );

  fireEvent.click(screen.getByLabelText('Toggle Sidebar'));
  expect(mockOnToggleSidebar).toHaveBeenCalled();
});
});