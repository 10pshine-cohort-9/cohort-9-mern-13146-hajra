import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import * as AuthContextModule from "../../context/authContext";
import { ProtectedRoute, PublicRoute } from "../../components/ProtectedRoute";

describe("ProtectedRoute and PublicRoute", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("ProtectedRoute", () => {
    it("redirects unauthenticated user to login screen", () => {
      jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
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

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    });

    it("renders loader when authentication state is loading", () => {
      jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
        isAuthenticated: false,
        loading: true,
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
            <Route path="/login" element={<div>Login Page</div>} />
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

  describe("PublicRoute", () => {
    it("renders loader when authentication state is loading", () => {
      jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
        isAuthenticated: false,
        loading: true,
      });

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div>Login Content</div>
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText("Login Content")).not.toBeInTheDocument();
    });

    it("redirects authenticated user away from public route to dashboard", () => {
      jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div>Login Content</div>
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
      expect(screen.queryByText("Login Content")).not.toBeInTheDocument();
    });

    it("renders public component for unauthenticated users", () => {
      jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div>Login Content</div>
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Login Content")).toBeInTheDocument();
    });
  });
});