import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";
import { AuthContext } from "../../context/authContext";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login Page Component", () => {
  const mockLogin = jest.fn();

  const renderComponent = (contextValue = {}) => {
    const defaultContext = {
      login: mockLogin,
      user: null,
      loading: false,
      ...contextValue,
    };

    return render(
      <MemoryRouter>
        <AuthContext.Provider value={defaultContext}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error validation when trying to submit empty fields", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Please fill in all fields.")).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("navigates to /dashboard on successful login", async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles unsuccessful login response message", async () => {
    mockLogin.mockResolvedValueOnce({ success: false, message: "Invalid credentials." });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials.")).toBeInTheDocument();
    });
  });

  it("handles unsuccessful login with fallback message (covers line 31)", async () => {
    mockLogin.mockResolvedValueOnce({ success: false });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to sign in.")).toBeInTheDocument();
    });
  });

  it("handles rejected login request with catch error handler", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: "Server down, try again later" } },
    });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    // ✅ Use an exact anchor /^password$/i or query the container by input type/id
fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Server down, try again later")).toBeInTheDocument();
    });
  });

it("handles generic login rejection fallback message", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network Error"));
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error|failed to sign in|an error occurred during sign in/i)).toBeInTheDocument();
    });
  });
});