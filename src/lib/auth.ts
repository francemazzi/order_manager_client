import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number;
  sub: number;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const setAuthCookies = (access_token: string, user: User) => {
  console.log("Setting auth cookies...");
  try {
    const decodedToken = jwtDecode<JWTPayload>(access_token);
    const expiresIn = new Date(decodedToken.exp * 1000);

    console.log("Token expires at:", expiresIn);

    Cookies.set("token", access_token, { expires: expiresIn });
    Cookies.set("userId", String(user.id), { expires: expiresIn });
    Cookies.set("user", JSON.stringify(user), { expires: expiresIn });

    console.log("Auth cookies set successfully");
  } catch (error) {
    console.error("Error setting auth cookies:", error);
    throw error;
  }
};

export const clearAuthCookies = () => {
  console.log("Clearing auth cookies...");
  Cookies.remove("token");
  Cookies.remove("userId");
  Cookies.remove("user");
  console.log("Auth cookies cleared");
};

export const isAuthenticated = () => {
  console.log("Checking authentication...");
  const token = Cookies.get("token");
  console.log("Token found:", !!token);

  if (!token) return false;

  try {
    const decodedToken = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    const isValid = decodedToken.exp > currentTime;

    console.log("Token expiration:", new Date(decodedToken.exp * 1000));
    console.log("Current time:", new Date(currentTime * 1000));
    console.log("Token is valid:", isValid);

    return isValid;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export const getUser = (): User | null => {
  console.log("Getting user from cookies...");
  const userStr = Cookies.get("user");
  console.log("User string found:", !!userStr);

  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    console.log("User parsed successfully");
    return user;
  } catch (error) {
    console.error("Error parsing user:", error);
    return null;
  }
};
