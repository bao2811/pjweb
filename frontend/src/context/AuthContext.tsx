"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  API_URL,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  isTokenExpired,
  refreshAccessToken,
  setToken as saveToken,
  setRefreshToken as saveRefreshToken,
  setUserData,
  getUserData,
  clearAuthData,
  getToken,
  willTokenExpireSoon,
  hasRole as checkRole,
} from "@/utils/auth";

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "manager" | "user";
  image?: string;
  phone?: string;
  address?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  hasRole: (roles: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRouter();
  // Ref to dedupe profile fetches for the same token
  const lastFetchedTokenRef = useRef<string | null>(null);
  const fetchingProfileRef = useRef<boolean>(false);
  // Refresh token wrapper - sử dụng function từ auth.ts
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        const newToken = getToken();
        setToken(newToken);
        return true;
      }

      // Refresh failed - clear state
      clearAuthData();
      setToken(null);
      setUser(null);
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearAuthData();
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (authToken: string) => {
    if (!authToken) return;
    // Deduplicate: if we've already fetched for this token, skip
    if (lastFetchedTokenRef.current === authToken) {
      // If a fetch is already in progress, wait for it to finish
      if (fetchingProfileRef.current) {
        // another call is in-flight; skip starting a duplicate
        console.log(
          "fetchUserProfile: fetch already in progress for this token, skipping duplicate"
        );
        return;
      }
      // already fetched for this token previously
      console.log(
        "fetchUserProfile: profile already fetched for this token, skipping"
      );
      return;
    }
    // mark which token we're fetching for
    lastFetchedTokenRef.current = authToken;
    fetchingProfileRef.current = true;
    // Debug: log the token being used to fetch profile (masked)
    try {
      const masked = authToken
        ? `${authToken.slice(0, 8)}...${authToken.slice(-8)}`
        : "no-token";
      console.log("fetchUserProfile: using token", masked);
    } catch (e) {
      console.log("fetchUserProfile: token present");
    }
    try {
      const response = await fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user profile");

      const userData = await response.json();
      const userObj = userData.user || userData;
      setUser(userObj);
      setUserData(userObj);

      console.log("Fetched user profile:", userObj);
      fetchingProfileRef.current = false;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      fetchingProfileRef.current = false;
    }
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      try {
        const response = await fetch(`${API_URL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            rememberme: rememberMe,
          }),
        });

        const data = await response.json(); // <- chỉ đọc 1 lần

        console.log("Login response payload:", data);

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Save tokens - be defensive about field names
        const access =
          data.access_token || data.token || data.auth_token || null;
        const refresh = data.refresh_token || data.refreshToken || null;

        if (!access) {
          console.error("Login did not return an access token", data);
          throw new Error("Login failed: no access token returned");
        }

        try {
          // Save tokens using utils (keeps keys consistent)
          if (access) {
            saveToken(access);
            setToken(access); // update React state so isAuthenticated becomes true
          }
          if (refresh) {
            saveRefreshToken(refresh);
          }
        } catch (err) {
          console.error("Error saving tokens to localStorage:", err);
        }

        console.log("Saved access token:", access);

        const role = data.user?.role || "user";
        console.log("Login successful, user role:", role);

        // Fetch user profile (use the resolved access variable)
        await fetchUserProfile(access as string);

        // Redirect
        route.push(`/${role}/dashboard`);
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [fetchUserProfile]
  );

  // Logout function
  const logout = useCallback(() => {
    // Call logout API (optional - if backend tracks sessions)
    if (token) {
      fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((error) => console.error("Logout API error:", error));
    }

    // Clear all auth data using auth.ts function
    clearAuthData();
    setToken(null);
    setUser(null);
  }, [token]);

  // Check if user has specific role(s) - sử dụng user state thay vì token
  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getToken(); // Sử dụng function từ auth.ts
        const storedUser = getUserData(); // Sử dụng function từ auth.ts

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired using auth.ts function
        if (isTokenExpired(storedToken)) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          if (!refreshed) {
            setIsLoading(false);
            return;
          }

          // Get new token after refresh
          const newToken = getToken();
          if (newToken) {
            setToken(newToken);
            await fetchUserProfile(newToken);
          }
        } else {
          // Token is still valid
          setToken(storedToken);

          // Load user from localStorage first (avoid an extra network call if we already have user data)
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Only fetch profile if we don't have a cached user
            try {
              await fetchUserProfile(storedToken);
            } catch (error) {
              console.error("Error fetching user profile on init:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshToken, fetchUserProfile, logout]);

  // Auto refresh token before it expires
  useEffect(() => {
    if (!token) return;

    const checkAndRefreshToken = async () => {
      try {
        // Sử dụng willTokenExpireSoon từ auth.ts (5 phút threshold)
        if (willTokenExpireSoon(token, 5)) {
          await refreshToken();
        }
      } catch (error) {
        console.error("Error in auto token refresh:", error);
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRefreshToken, 60 * 1000);

    return () => clearInterval(interval);
  }, [token, refreshToken]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
