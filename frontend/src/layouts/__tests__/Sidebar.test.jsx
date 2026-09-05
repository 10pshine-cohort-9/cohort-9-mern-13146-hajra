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
    test('clicking each filter button calls onFilterChange and onClose', () => {
    const mockOnFilterChange = jest.fn();
    const mockOnClose = jest.fn();
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          isCollapsed={false}
          onToggleCollapse={jest.fn()}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Pinned'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('pinned');
    expect(mockOnClose).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Archived'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('archived');

    fireEvent.click(screen.getByText('All Notes'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  test('active filter gets the active styling class', () => {
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Sidebar
          isOpen={true}
          onClose={jest.fn()}
          isCollapsed={false}
          onToggleCollapse={jest.fn()}
          filter="pinned"
          onFilterChange={jest.fn()}
        />
      </BrowserRouter>
    );

    const pinnedButton = screen.getByText('Pinned').closest('button');
    expect(pinnedButton.className).toMatch(/bg-white\/25/);
  });

  test('toggles collapse and hides Menu/Filters labels when collapsed', () => {
    const mockOnToggleCollapse = jest.fn();
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    const { rerender } = render(
      <BrowserRouter>
        <Sidebar
          isOpen={true}
          onClose={jest.fn()}
          isCollapsed={false}
          onToggleCollapse={mockOnToggleCollapse}
          filter="all"
          onFilterChange={jest.fn()}
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTitle('Collapse Sidebar'));
    expect(mockOnToggleCollapse).toHaveBeenCalled();

    rerender(
      <BrowserRouter>
        <Sidebar
          isOpen={true}
          onClose={jest.fn()}
          isCollapsed={true}
          onToggleCollapse={mockOnToggleCollapse}
          filter="all"
          onFilterChange={jest.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByTitle('Expand Sidebar')).toBeInTheDocument();
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  test('clicking backdrop and close button call onClose', () => {
    const mockOnClose = jest.fn();
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    const { container } = render(
      <BrowserRouter>
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          isCollapsed={false}
          onToggleCollapse={jest.fn()}
          filter="all"
          onFilterChange={jest.fn()}
        />
      </BrowserRouter>
    );

    fireEvent.click(container.querySelector('.backdrop-blur-xs'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close sidebar'));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });


  test('activates backdrop close when clicked, since it is now a native button element', () => {
    const mockOnClose = jest.fn();
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    const { container } = render(
      <BrowserRouter>
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          isCollapsed={false}
          onToggleCollapse={jest.fn()}
          filter="all"
          onFilterChange={jest.fn()}
        />
      </BrowserRouter>
    );

    const backdrop = container.querySelector('.backdrop-blur-xs');

    expect(backdrop.tagName).toBe('BUTTON');

    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not render backdrop when sidebar is closed', () => {
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    const { container } = render(
      <BrowserRouter>
        <Sidebar
          isOpen={false}
          onClose={jest.fn()}
          isCollapsed={false}
          onToggleCollapse={jest.fn()}
          filter="all"
          onFilterChange={jest.fn()}
        />
      </BrowserRouter>
    );

    expect(container.querySelector('.backdrop-blur-xs')).not.toBeInTheDocument();
  });

  test('handles profile keydown accessibility for Enter and Space keys with and without onClose', () => {
    const mockOnClose = jest.fn();
    useAuth.mockReturnValue({
      user: { name: 'Hajra', email: 'hajra@test.com' },
      logout: mockLogout,
    });

    const { rerender } = render(
      <BrowserRouter>
        <Sidebar onClose={mockOnClose} />
      </BrowserRouter>
    );

    const profileCard = screen.getByTitle('Go to Profile');

    fireEvent.keyDown(profileCard, { key: 'Enter' });
    expect(mockedNavigate).toHaveBeenCalledWith('/profile');
    expect(mockOnClose).toHaveBeenCalled();

    mockedNavigate.mockClear();
    mockOnClose.mockClear();

    fireEvent.keyDown(profileCard, { key: ' ' });
    expect(mockedNavigate).toHaveBeenCalledWith('/profile');
    expect(mockOnClose).toHaveBeenCalled();

    mockedNavigate.mockClear();
    fireEvent.keyDown(profileCard, { key: 'Tab' });
    expect(mockedNavigate).not.toHaveBeenCalled();

    rerender(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    fireEvent.keyDown(profileCard, { key: 'Enter' });
    expect(mockedNavigate).toHaveBeenCalledWith('/profile');
  });
});