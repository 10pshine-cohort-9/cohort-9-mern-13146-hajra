import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '../MainLayout';
import { useAuth } from '../../context/authContext';

jest.mock('../../context/authContext');

jest.mock('../Sidebar', () => (props) => (
  <div
    data-testid="sidebar"
    data-filter={props.filter}
    data-open={String(props.isOpen)}
    data-collapsed={String(props.isCollapsed)}
  >
    <button onClick={() => props.onFilterChange('pinned')}>SidebarFilterPinned</button>
    <button onClick={props.onClose}>SidebarClose</button>
    <button onClick={props.onToggleCollapse}>SidebarToggleCollapse</button>
  </div>
));

jest.mock('../Navbar', () => (props) => (
  <div data-testid="navbar">
    <input
      data-testid="navbar-search"
      value={props.searchQuery}
      onChange={(e) => props.onSearchChange(e.target.value)}
    />
    <button onClick={props.onToggleSidebar}>NavbarToggleSidebar</button>
  </div>
));

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Sidebar and Navbar when authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="child">child content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('does not render Sidebar or Navbar when not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="child">child content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('passes searchQuery and filter props through cloneElement to element children', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="child">child content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar').getAttribute('data-filter')).toBe('all');
  });

  test('clicking a filter button in Sidebar updates shared filter state', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="child">child content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar').getAttribute('data-filter')).toBe('all');
    fireEvent.click(screen.getByText('SidebarFilterPinned'));
    expect(screen.getByTestId('sidebar').getAttribute('data-filter')).toBe('pinned');
  });

  test('typing in Navbar search updates shared searchQuery state', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="child">child content</div>
        </MainLayout>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('navbar-search'), { target: { value: 'meeting' } });
    expect(screen.getByTestId('navbar-search').value).toBe('meeting');
  });
test('clicking Sidebar toggle-collapse button flips isSidebarCollapsed', () => {
  useAuth.mockReturnValue({ isAuthenticated: true });

  render(
    <BrowserRouter>
      <MainLayout>
        <div data-testid="child">child content</div>
      </MainLayout>
    </BrowserRouter>
  );

  expect(screen.getByTestId('sidebar').getAttribute('data-collapsed')).toBe('false');
  fireEvent.click(screen.getByText('SidebarToggleCollapse'));
  expect(screen.getByTestId('sidebar').getAttribute('data-collapsed')).toBe('true');
});

test('clicking Sidebar close button sets isSidebarOpen to false', () => {
  useAuth.mockReturnValue({ isAuthenticated: true });

  render(
    <BrowserRouter>
      <MainLayout>
        <div data-testid="child">child content</div>
      </MainLayout>
    </BrowserRouter>
  );

  fireEvent.click(screen.getByText('NavbarToggleSidebar'));
  expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('true');

  fireEvent.click(screen.getByText('SidebarClose'));
  expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('false');
});

test('clicking Navbar toggle-sidebar button flips isSidebarOpen', () => {
  useAuth.mockReturnValue({ isAuthenticated: true });

  render(
    <BrowserRouter>
      <MainLayout>
        <div data-testid="child">child content</div>
      </MainLayout>
    </BrowserRouter>
  );

  expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('false');
  fireEvent.click(screen.getByText('NavbarToggleSidebar'));
  expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('true');
});

test('clones a custom component child with searchQuery, onSearchChange, filter, and onFilterChange props', () => {
  useAuth.mockReturnValue({ isAuthenticated: true });

  const ChildComponent = (props) => (
    <div
      data-testid="cloned-child"
      data-search={props.searchQuery}
      data-filter={props.filter}
    />
  );

  render(
    <BrowserRouter>
      <MainLayout>
        <ChildComponent />
      </MainLayout>
    </BrowserRouter>
  );

  const clonedChild = screen.getByTestId('cloned-child');
  expect(clonedChild.getAttribute('data-search')).toBe('');
  expect(clonedChild.getAttribute('data-filter')).toBe('all');
});
});