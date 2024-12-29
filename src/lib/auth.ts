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

export const setAuthCookies = (access_token: string) => {
  console.log("Setting auth cookie...");
  try {
    const decodedToken = jwtDecode<JWTPayload>(access_token);
    const expiresIn = new Date(decodedToken.exp * 1000);
    Cookies.set("token", access_token, { expires: expiresIn });
    console.log("Auth cookie set successfully");
  } catch (error) {
    console.error("Error setting auth cookie:", error);
  }
};

export const clearAuthCookies = () => {
  console.log("Clearing auth cookie...");
  Cookies.remove("token");
  console.log("Auth cookie cleared");
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

export const getUser = async (): Promise<User | null> => {
  console.log("Getting user from token...");
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};
