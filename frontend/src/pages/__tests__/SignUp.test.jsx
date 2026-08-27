import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../Signup";
import * as AuthContextModule from "../../context/authContext";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Signup Page Component", () => {
  const mockSignup = jest.fn();
  const testUser = {
    name: "New User",
    email: "newuser@example.com",
    password: "password123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      signup: mockSignup,
    });
  });

  it("renders all form elements", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    // Fixed heading matcher to match "Create an Account"
    expect(screen.getByRole("heading", { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows error when submitting empty fields", async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("All fields are required.")).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

it("shows error when password is less than 6 characters", async () => {
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: testUser.name } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
  
  // Use getByPlaceholderText here instead of getByLabelText:
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "123" } });

  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  expect(await screen.findByText("Password must be at least 6 characters long.")).toBeInTheDocument();
  expect(mockSignup).not.toHaveBeenCalled();
});

  it("navigates to dashboard on successful signup", async () => {
    mockSignup.mockResolvedValueOnce({ success: true });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: testUser.name } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: testUser.password } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(testUser.name, testUser.email, testUser.password);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on signup failure response", async () => {
    mockSignup.mockResolvedValueOnce({ success: false, message: "Email already taken" });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: testUser.name } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: testUser.password } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Email already taken")).toBeInTheDocument();
  });

  it("displays fallback error message on rejected request", async () => {
    mockSignup.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: testUser.name } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: testUser.password } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Registration failed. Please try again.")).toBeInTheDocument();
  });

  it("displays default 'Registration failed.' error message when res.message is undefined", async () => {
    const customMockSignup = jest.fn().mockResolvedValueOnce({ success: false });
    
    jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      signup: customMockSignup,
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: testUser.name } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: testUser.password } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Registration failed.")).toBeInTheDocument();
  });

  
});