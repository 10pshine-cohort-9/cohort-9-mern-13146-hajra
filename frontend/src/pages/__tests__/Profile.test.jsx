import React from "react";
import { render, screen, fireEvent, waitFor ,act} from "@testing-library/react";
import Profile from "../Profile";
import { AuthContext } from "../../context/authContext";

describe("Profile Page Component", () => {
  const mockUser = {
    name: "Test User",
    email: "testuser@example.com",
  };

  const mockUpdateUserProfile = jest.fn();

  const renderComponent = (contextValue = {}) => {
    const defaultContext = {
      user: mockUser,
      updateUserProfile: mockUpdateUserProfile,
      loading: false,
      ...contextValue,
    };

    return render(
      <AuthContext.Provider value={defaultContext}>
        <Profile />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders profile details and populates form fields", () => {
    renderComponent();
    // Use regex dynamically based on mockUser.name instead of hardcoding a name
    expect(screen.getByRole("heading", { name: new RegExp(mockUser.name, "i") })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
  });

  it("handles empty user state cleanly", () => {
    renderComponent({ user: null });
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
  });

  it("shows error when submitting empty name", async () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

  it("shows error when password is less than 6 characters", async () => {
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(/new password|password/i);

    fireEvent.change(passwordInput, { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText("New password must be at least 6 characters long.")
    ).toBeInTheDocument();
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

it("submits update successfully with optional valid password", async () => {
    mockUpdateUserProfile.mockResolvedValueOnce({ success: true });
    renderComponent();

    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByPlaceholderText(/new password|password/i);
    const updatedName = `${mockUser.name} Updated`;

    fireEvent.change(nameInput, { target: { value: updatedName } });
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      const formDataArg = mockUpdateUserProfile.mock.calls[0][0];
      expect(formDataArg.get("name")).toBe(updatedName);
      expect(formDataArg.get("password")).toBe("newpassword123");

      expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
      expect(passwordInput).toHaveValue("");
    });
  });

  it("handles user object with missing name and email fields", () => {
    renderComponent({ user: {} });
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
  });

  it("handles API response failure with res.message fallback", async () => {
    mockUpdateUserProfile.mockResolvedValueOnce({
      success: false,
      message: "Update denied by server.",
    });
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Update denied by server.")).toBeInTheDocument();
    });
  });

  it("handles API response failure fallback default message", async () => {
    mockUpdateUserProfile.mockResolvedValueOnce({ success: false });
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to update profile.")).toBeInTheDocument();
    });
  });

  it("handles rejected API request with error message from server", async () => {
    mockUpdateUserProfile.mockRejectedValueOnce({
      response: { data: { message: "Server connection lost." } },
    });
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Server connection lost.")).toBeInTheDocument();
    });
  });

  it("handles rejected API request with generic catch error fallback message", async () => {
    mockUpdateUserProfile.mockRejectedValueOnce(new Error("Fatal Exception"));
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred while updating profile.")
      ).toBeInTheDocument();
    });
  });

  it("renders profile image from absolute HTTP URL correctly", () => {
    renderComponent({
      user: { ...mockUser, profile_picture: "https://example.com/avatar.jpg" },
    });
    const img = screen.getByAltText("Profile");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders profile image from local backend path correctly", () => {
    renderComponent({
      user: { ...mockUser, profile_picture: "/uploads/avatar.jpg" },
    });
    const img = screen.getByAltText("Profile");
    expect(img).toHaveAttribute("src", "http://localhost:5000/uploads/avatar.jpg");
  });

  it("updates preview URL when update response includes a new profile picture", async () => {
    mockUpdateUserProfile.mockResolvedValueOnce({
      success: true,
      data: { profile_picture: "/uploads/new-avatar.jpg" },
    });
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
    });
  });

  it("allows selecting a profile picture file and updates preview", async () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/profile picture/i);
    const file = new File(["dummy content"], "avatar.png", { type: "image/png" });

    global.URL.createObjectURL = jest.fn(() => "blob:http://localhost/mock-blob");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText("Profile");
      expect(img).toHaveAttribute("src", "blob:http://localhost/mock-blob");
    });
  });

  it("renders fallback initial letter avatar when no profile picture exists", () => {
    renderComponent({
      user: { name: "Hajra", email: "hajra@example.com", profile_picture: null },
    });

    expect(screen.getByText("H")).toBeInTheDocument();
  });
it("handles rejected API request where err.response is undefined", async () => {
    mockUpdateUserProfile.mockRejectedValueOnce(new Error("Network Error"));
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred while updating profile.")
      ).toBeInTheDocument();
    });
  });

it("clears success message on subsequent form submission", async () => {
    mockUpdateUserProfile.mockResolvedValue({ success: true });
    renderComponent();

    const nameInput = screen.getByLabelText(/full name/i);
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    const form = screen.getByTestId("profile-form");

    fireEvent.change(nameInput, { target: { value: "Test Name 1" } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
    });

    fireEvent.change(nameInput, { target: { value: "Test Name 2" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledTimes(2);
    });
  });

  

});