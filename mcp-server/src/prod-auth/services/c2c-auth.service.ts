/**
 * C2C Backend Authentication Service
 * 
 * This service integrates with the existing C2C backend authentication system.
 * It uses the C2C backend API to authenticate users and retrieve user information.
 */

const C2C_BACKEND_URL = process.env.C2C_BACKEND_URL || "http://localhost:5000";

export interface C2CUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "buyer" | "vendor";
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface C2CLoginResponse {
  user: C2CUser;
  accessToken: string;
  refreshToken: string;
}

export interface C2CLoginRequest {
  email: string;
  password: string;
}

/**
 * Authenticate user with C2C backend
 * Calls the existing C2C backend login endpoint
 */
export async function authenticateC2CUser(
  credentials: C2CLoginRequest
): Promise<C2CLoginResponse> {
  const response = await fetch(`${C2C_BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "C2C authentication failed");
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Verify C2C access token and get user info
 * This can be used to validate tokens passed from the C2C frontend
 */
export async function verifyC2CToken(token: string): Promise<C2CUser> {
  const response = await fetch(`${C2C_BACKEND_URL}/api/v1/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Invalid C2C token");
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Get user information from C2C backend by user ID
 */
export async function getC2CUser(userId: string): Promise<C2CUser> {
  const response = await fetch(`${C2C_BACKEND_URL}/api/v1/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user from C2C backend");
  }

  const data = await response.json();
  return data.data || data;
}
