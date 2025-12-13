"use client";

// Auth constants - exported để AuthContext có thể dùng
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const TOKEN_KEY = "jwt_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user_data";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// Custom fetch wrapper with automatic token refresh
export async function authFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;

  // Get token from localStorage
  let token = localStorage.getItem(TOKEN_KEY);

  if (!skipAuth && token && isTokenExpired(token)) {
    const success = await refreshAccessToken();
    if (!success) {
      localStorage.removeItem(TOKEN_KEY);
      // localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/home/login";
      }
    }
    token = localStorage.getItem(TOKEN_KEY);
  }

  // Add authorization header if not skipping auth
  if (!skipAuth && token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  } else if (!skipAuth) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  // Make the request
  let response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  // If unauthorized (401), try to refresh token
  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the request with new token
      token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        };
        response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
      }
    } else {
      // Refresh failed, redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem("user_data");
        window.location.href = "/home/login";
      }
    }
  }

  return response;
}

// Refresh access token - exported để AuthContext có thể dùng
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_URL}/api/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    // Save new tokens
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }

    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

// Decode JWT token
export function decodeToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Get refresh token from localStorage
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

// Get user role from token
export function getUserRole(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload?.role || null;
}

// Check if user has specific role
export function hasRole(roles: string | string[]): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(userRole);
}

// Save token to localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Save refresh token to localStorage
export function setRefreshToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

// Save user data to localStorage
export function setUserData(user: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

// Get user data from localStorage
export function getUserData(): any {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Clear all auth data from localStorage
export function clearAuthData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// Check if token will expire soon (within minutes)
export function willTokenExpireSoon(
  token: string,
  minutesThreshold: number = 5
): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    const expirationTime = payload.exp * 1000;
    const timeUntilExpiration = expirationTime - Date.now();
    const thresholdMs = minutesThreshold * 60 * 1000;
    return timeUntilExpiration <= thresholdMs;
  } catch (error) {
    return true;
  }
}
