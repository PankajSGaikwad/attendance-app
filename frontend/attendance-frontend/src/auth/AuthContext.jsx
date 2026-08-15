import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as authApi from "../api/authApi";
import {
  getMyProfile,
} from "../api/employeeApi";


const AuthContext =
  createContext(null);


/*
 * Read stored employee profile.
 */

function getStoredEmployee() {
  try {

    const employee =
      localStorage.getItem(
        "attendance.employee"
      );

    return employee
      ? JSON.parse(employee)
      : null;

  } catch {
    return null;
  }
}


/*
 * Read stored auth user.
 */

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

  const [employee, setEmployee] =
    useState(getStoredEmployee);

  const [accessToken, setAccessToken] =
    useState(
      localStorage.getItem(
        "attendance.accessToken"
      )
    );

  const [loading, setLoading] =
    useState(true);


  /*
   * Employee status is kept
   * separately from auth status.
   *
   * Possible values:
   *
   * null
   * DRAFT
   * PENDING
   * APPROVED
   * REJECTED
   * SUSPENDED
   */

  const employeeStatus =
    employee?.status || null;


  /*
   * Save authentication.
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
   * Save employee profile.
   */

  const saveEmployee = (
    employeeData
  ) => {

    if (!employeeData) {

      localStorage.removeItem(
        "attendance.employee"
      );

      setEmployee(null);

      return;
    }

    localStorage.setItem(
      "attendance.employee",
      JSON.stringify(
        employeeData
      )
    );

    setEmployee(
      employeeData
    );
  };


  /*
   * Clear authentication.
   */

  const clearAuthentication = () => {

    localStorage.removeItem(
      "attendance.accessToken"
    );

    localStorage.removeItem(
      "attendance.refreshToken"
    );

    localStorage.removeItem(
      "attendance.user"
    );

    localStorage.removeItem(
      "attendance.employee"
    );

    setAccessToken(null);

    setUser(null);

    setEmployee(null);
  };


  /*
   * Login.
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

    /*
     * Try to load the employee
     * profile immediately after
     * authentication.
     *
     * A 404 is expected for a new
     * auth-only account.
     */

    try {

      const employeeResponse =
        await getMyProfile();

      saveEmployee(
        employeeResponse.data
      );

    } catch (error) {

      if (
        error.response?.status ===
        404
      ) {

        saveEmployee(null);

      } else {

        console.error(
          "Unable to load employee profile:",
          error
        );

        /*
         * Don't fail login just
         * because employee profile
         * lookup failed.
         *
         * ProtectedRoute will handle
         * the authenticated state.
         */

        saveEmployee(null);
      }
    }

    return data;
  };


  /*
   * Refresh employee profile.
   */

  const refreshEmployeeProfile =
    async () => {

      try {

        const response =
          await getMyProfile();

        saveEmployee(
          response.data
        );

        return response.data;

      } catch (error) {

        if (
          error.response?.status ===
          404
        ) {

          saveEmployee(null);

          return null;
        }

        throw error;
      }
    };


  /*
   * Logout.
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

    } finally {

      clearAuthentication();
    }
  };


  /*
   * Restore authentication
   * when the browser refreshes.
   */

  useEffect(() => {

    const restoreSession =
      async () => {

        if (!accessToken) {

          setLoading(false);

          return;
        }


        try {

          /*
           * Verify the auth token.
           */

          const {
            data,
          } = await authApi.me();

          setUser(data);

          localStorage.setItem(
            "attendance.user",
            JSON.stringify(data)
          );


          /*
           * Then check employee
           * profile.
           */

          try {

            const employeeResponse =
              await getMyProfile();

            saveEmployee(
              employeeResponse.data
            );

          } catch (employeeError) {

            if (
              employeeError.response
                ?.status === 404
            ) {

              saveEmployee(null);

            } else {

              console.error(
                "Unable to restore employee profile:",
                employeeError
              );

              saveEmployee(null);
            }
          }

        } catch (error) {

          console.error(
            "Unable to restore user:",
            error
          );

          clearAuthentication();

        } finally {

          setLoading(false);
        }
      };


    restoreSession();

  }, [accessToken]);


  const value =
    useMemo(
      () => ({
        user,
        employee,
        employeeStatus,
        accessToken,
        loading,
        login,
        logout,
        refreshEmployeeProfile,
      }),
      [
        user,
        employee,
        employeeStatus,
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