import authService from "../authService";
import api from "../api";

jest.mock("../api");

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls api.post on login", async () => {
    const mockData = { success: true, data: { token: "123" } };
    api.post.mockResolvedValueOnce({ data: mockData });

    const result = await authService.login("test@example.com", "password");
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@example.com",
      password: "password",
    });
    expect(result).toEqual(mockData);
  });

  it("calls api.post on register", async () => {
    const mockData = { success: true };
    api.post.mockResolvedValueOnce({ data: mockData });

    const result = await authService.register("Hajra", "test@example.com", "password");
    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      name: "Hajra",
      email: "test@example.com",
      password: "password",
    });
    expect(result).toEqual(mockData);
  });

  it("calls api.get on getProfile", async () => {
    const mockData = { success: true, data: { name: "Hajra" } };
    api.get.mockResolvedValueOnce({ data: mockData });

    const result = await authService.getProfile();
    expect(api.get).toHaveBeenCalledWith("/auth/profile");
    expect(result).toEqual(mockData);
  });

  it("calls api.put on updateProfile", async () => {
    const mockData = { success: true, data: { name: "Hajra Updated" } };
    api.put.mockResolvedValueOnce({ data: mockData });

    const result = await authService.updateProfile({ name: "Hajra Updated" });
    expect(api.put).toHaveBeenCalledWith("/auth/profile", { name: "Hajra Updated" });
    expect(result).toEqual(mockData);
  });
});