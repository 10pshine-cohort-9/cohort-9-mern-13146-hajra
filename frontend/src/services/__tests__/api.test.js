import axios from "axios";
import api from "../api";

describe("api service & interceptors", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    delete window.location;
    window.location = {
      pathname: "/dashboard",
      href: "http://localhost/dashboard",
      assign: jest.fn(),
      replace: jest.fn(),
    };
  });

  afterEach(() => {
    window.location = originalLocation;
  });


describe("Base Configuration", () => {
    it("falls back to default baseURL when VITE_API_URL is undefined", () => {
      jest.resetModules();

      const originalEnv = import.meta.env.VITE_API_URL;
      
      delete import.meta.env.VITE_API_URL;

      const freshApi = require("../api").default;
      expect(freshApi.defaults.baseURL).toBe("http://localhost:5000/api");

      // Restore original env value
      import.meta.env.VITE_API_URL = originalEnv;
    });
  });

  describe("Request Interceptor", () => {
    it("attaches Authorization header when token exists in localStorage", async () => {
      localStorage.setItem("token", "test-bearer-token");

      const config = { headers: {} };
      const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;

      const updatedConfig = await requestInterceptor(config);

      expect(updatedConfig.headers.Authorization).toBe("Bearer test-bearer-token");
    });

    it("does not attach Authorization header when token is missing", async () => {
      const config = { headers: {} };
      const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;

      const updatedConfig = await requestInterceptor(config);

      expect(updatedConfig.headers.Authorization).toBeUndefined();
    });

    it("handles request error in interceptor", async () => {
      const requestErrorInterceptor = api.interceptors.request.handlers[0].rejected;
      const mockError = new Error("Request configuration failed");

      await expect(requestErrorInterceptor(mockError)).rejects.toThrow(
        "Request configuration failed"
      );
    });
  });

  describe("Response Interceptor", () => {
    it("returns response data directly on success", async () => {
      const mockResponse = { data: { success: true }, status: 200 };
      const responseInterceptor = api.interceptors.response.handlers[0].fulfilled;

      const result = await responseInterceptor(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it("clears localStorage token and user on 401 response error and redirects to login", async () => {
      localStorage.setItem("token", "expired-token");
      localStorage.setItem("user", JSON.stringify({ name: "User" }));

      const mockError = {
        response: { status: 401 },
      };

      const responseErrorInterceptor = api.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(window.location.href).toBe("/login");
    });

    it("does not redirect to /login if already on /login page during 401 error", async () => {
      window.location.pathname = "/login";
      window.location.href = "http://localhost/login";

      localStorage.setItem("token", "expired-token");

      const mockError = {
        response: { status: 401 },
      };

      const responseErrorInterceptor = api.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(window.location.href).toBe("http://localhost/login");
    });

    it("passes through error without clearing localStorage on non-401 response error", async () => {
      localStorage.setItem("token", "valid-token");
      const mockError = {
        response: { status: 500, data: { message: "Server Error" } },
      };

      const responseErrorInterceptor = api.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(localStorage.getItem("token")).toBe("valid-token");
    });
  });
});