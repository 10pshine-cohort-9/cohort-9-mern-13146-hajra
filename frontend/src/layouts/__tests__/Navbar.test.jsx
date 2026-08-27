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

    expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(screen.getByText('Hajra')).toBeInTheDocument();
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

    expect(screen.getByAltText('Profile')).toBeInTheDocument();
  });

  test('renders default avatar and fallback username when user data is empty', () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Go to Profile'));
    expect(mockedNavigate).toHaveBeenCalledWith('/profile');
  });
});