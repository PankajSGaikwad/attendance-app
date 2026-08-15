import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as authApi from "../api/authApi";

const AuthContext =
  createContext(null);

function getStoredUser() {
  try {

    const user =
      localStorage.getItem(
        "attendance.user"
      );

    return user
      ? JSON.parse(user)
      : null;

  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(getStoredUser);

  const [accessToken, setAccessToken] =
    useState(
      localStorage.getItem(
        "attendance.accessToken"
      )
    );

  const [loading, setLoading] =
    useState(true);

  /*
   * Save authentication
   */

  const saveAuthentication = (
    data
  ) => {

    localStorage.setItem(
      "attendance.accessToken",
      data.accessToken
    );

    localStorage.setItem(
      "attendance.refreshToken",
      data.refreshToken
    );

    localStorage.setItem(
      "attendance.user",
      JSON.stringify(
        data.response
      )
    );

    setAccessToken(
      data.accessToken
    );

    setUser(
      data.response
    );
  };

  /*
   * Login
   */

  const login = async (
    email,
    password
  ) => {

    const { data } =
      await authApi.login({
        email,
        password,
      });

    saveAuthentication(data);

    return data;
  };

  /*
   * Logout
   */

  const logout = async () => {

    const refreshToken =
      localStorage.getItem(
        "attendance.refreshToken"
      );

    try {

      if (refreshToken) {

        await authApi.logout(
          refreshToken
        );
      }

    } catch (error) {

      console.error(
        "Logout API error:",
        error
      );
    }

    localStorage.removeItem(
      "attendance.accessToken"
    );

    localStorage.removeItem(
      "attendance.refreshToken"
    );

    localStorage.removeItem(
      "attendance.user"
    );

    setAccessToken(null);
    setUser(null);
  };

  /*
   * Restore current user
   */

  useEffect(() => {

    const restoreUser =
      async () => {

        if (!accessToken) {

          setLoading(false);

          return;
        }

        try {

          const { data } =
            await authApi.me();

          setUser(data);

          localStorage.setItem(
            "attendance.user",
            JSON.stringify(data)
          );

        } catch (error) {

          console.error(
            "Unable to restore user:",
            error
          );

          localStorage.removeItem(
            "attendance.accessToken"
          );

          localStorage.removeItem(
            "attendance.refreshToken"
          );

          localStorage.removeItem(
            "attendance.user"
          );

          setAccessToken(null);
          setUser(null);

        } finally {

          setLoading(false);
        }
      };

    restoreUser();

  }, [accessToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      logout,
    }),
    [
      user,
      accessToken,
      loading,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}