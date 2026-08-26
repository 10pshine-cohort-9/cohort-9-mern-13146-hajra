import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import * as AuthContextModule from "../../context/authContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = AuthContextModule.useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Redirected to Login</div>;
  return children;
};

describe("ProtectedRoute", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("redirects unauthenticated user to login screen", () => {
    jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Redirected to Login")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
  });

  it("renders protected component for authenticated users", () => {
    jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });
});