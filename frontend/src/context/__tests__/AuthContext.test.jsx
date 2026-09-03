import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../authContext";
import authService from "../../services/authService";

jest.mock("../../services/authService");

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("initializes state from localStorage on mount", async () => {
    const mockUser = { id: "1", name: "Hajra", email: "hajra@example.com" };
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    let result;

    await act(async () => {
      const hook = renderHook(() => useAuth(), { wrapper });
      result = hook.result;
    });

    expect(result.current.token).toBe("stored-token");
    expect(result.current.user).toEqual(mockUser);
  });

  it("clears storage when stored user JSON fails to parse during initialization", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("user", "{invalid-json-string");

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    let result;

    await act(async () => {
      const hook = renderHook(() => useAuth(), { wrapper });
      result = hook.result;
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("logs in successfully with nested user data object", async () => {
    const mockUser = { id: "123", name: "Hajra", email: "hajra@example.com" };
    const mockResponse = {
      success: true,
      data: {
        token: "fake-jwt-token",
        user: mockUser,
      },
    };
    authService.login.mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("hajra@example.com", "password123");
    });

    expect(result.current.token).toBe("fake-jwt-token");
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem("token")).toBe("fake-jwt-token");
  });

it("handles login response without explicit user object", async () => {
    const mockResponse = {
      success: true,
      data: {
        token: "fake-jwt-token",
        id: "123",
        name: "Hajra",
        email: "hajra@example.com",
      },
    };
    authService.login.mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("hajra@example.com", "password123");
    });

    expect(result.current.user).toEqual({
      id: "123",
      name: "Hajra",
      email: "hajra@example.com",
      profile_picture: null,
    });
  });

  it("signs up successfully with nested user data object", async () => {
    const mockUser = { id: "124", name: "Hajra", email: "hajra@example.com" };
    const mockResponse = {
      success: true,
      data: {
        token: "fake-jwt-token",
        user: mockUser,
      },
    };
    authService.register.mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup("Hajra", "hajra@example.com", "password123");
    });

    expect(result.current.token).toBe("fake-jwt-token");
    expect(result.current.user).toEqual(mockUser);
  });

  it("handles signup response without explicit user object", async () => {
    const mockResponse = {
      success: true,
      data: {
        token: "fake-jwt-token",
        id: "124",
        name: "Hajra",
        email: "hajra@example.com",
      },
    };
    authService.register.mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup("Hajra", "hajra@example.com", "password123");
    });

    expect(result.current.user).toEqual({
      id: "124",
      name: "Hajra",
      email: "hajra@example.com",
    });
  });

  it("handles login failure by rethrowing error and preserving unauthenticated state", async () => {
    const errorMessage = "Invalid credentials";
    authService.login.mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let caughtError;
    await act(async () => {
      try {
        await result.current.login("hajra@example.com", "wrongpass");
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe(errorMessage);
    expect(result.current.user).toBeNull();
  });

  it("handles signup failure by rethrowing error and preserving unauthenticated state", async () => {
    const errorMessage = "User already exists";
    authService.register.mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let caughtError;
    await act(async () => {
      try {
        await result.current.signup("Hajra", "hajra@example.com", "password123");
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe(errorMessage);
    expect(result.current.user).toBeNull();
  });

  it("updates user profile successfully", async () => {
    const updatedUser = { id: "1", name: "Hajra Updated", email: "hajra@example.com" };
    authService.updateProfile.mockResolvedValueOnce({
      success: true,
      data: updatedUser,
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.updateUserProfile({ name: "Hajra Updated" });
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(localStorage.getItem("user")).toBe(JSON.stringify(updatedUser));
  });

  it("clears user and token on logout", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("user", JSON.stringify({ id: "1", name: "Hajra" }));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    let result;

    await act(async () => {
      const hook = renderHook(() => useAuth(), { wrapper });
      result = hook.result;
    });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("fetches user profile successfully on mount when token exists", async () => {
    const mockProfile = { id: "1", name: "Hajra", email: "hajra@example.com" };
    localStorage.setItem("token", "existing-token");
    authService.getProfile.mockResolvedValueOnce({
      success: true,
      data: mockProfile,
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockProfile);
    });
    expect(localStorage.getItem("user")).toBe(JSON.stringify(mockProfile));
  });

 it("logs out automatically when profile fetch fails on mount", async () => {
    localStorage.setItem("token", "invalid-token");
    localStorage.setItem("user", JSON.stringify({ id: "1", name: "Hajra" }));
    authService.getProfile.mockRejectedValueOnce(new Error("Unauthorized"));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).toBeNull();
    });
    expect(result.current.user).toBeNull();
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    consoleError.mockRestore();
  });

  it("handles login response with false success status without setting token", async () => {
  authService.login.mockResolvedValueOnce({ success: false });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
    await result.current.login("hajra@example.com", "password123");
  });

  expect(result.current.token).toBeNull();
  expect(result.current.user).toBeNull();
});

it("handles signup response with false success status without setting token", async () => {
  authService.register.mockResolvedValueOnce({ success: false });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
    await result.current.signup("Hajra", "hajra@example.com", "password123");
  });

  expect(result.current.token).toBeNull();
  expect(result.current.user).toBeNull();
});

it("handles updateUserProfile response with false success status without modifying user state", async () => {
  authService.updateProfile.mockResolvedValueOnce({ success: false });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
    await result.current.updateUserProfile({ name: "Hajra Updated" });
  });

  expect(result.current.user).toBeNull();
});

it("handles errors gracefully during token/profile initialization in useEffect", async () => {
    localStorage.setItem("token", "faulty-token");
    authService.getProfile.mockRejectedValueOnce(new Error("Token validation failed"));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).toBeNull();
    });

    expect(result.current.user).toBeNull();
  });

  it("handles update profile failure by throwing error", async () => {
    authService.updateProfile.mockRejectedValueOnce(new Error("Update failed"));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let caughtError;
    await act(async () => {
      try {
        await result.current.updateUserProfile({ name: "Fail" });
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe("Update failed");
  });

 it("skips profile fetching and sets loading to false when no token exists on mount", async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authService.getProfile).not.toHaveBeenCalled();
    expect(result.current.token).toBeNull();
  });

  it("updates profile_picture when the response explicitly includes it", async () => {
  authService.updateProfile.mockResolvedValueOnce({
    success: true,
    data: { id: "1", name: "Hajra", email: "hajra@example.com", profile_picture: "/uploads/new-avatar.jpg" },
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
    await result.current.updateUserProfile({ name: "Hajra" });
  });

  expect(result.current.user.profile_picture).toBe("/uploads/new-avatar.jpg");
});
});