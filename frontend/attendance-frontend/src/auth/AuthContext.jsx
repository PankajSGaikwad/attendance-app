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
 * Read stored authenticated user.
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


/*
 * Normalize roles.

 * Backend may return:
 *
 * ADMIN
 * SUPERVISOR
 * EMPLOYEE
 *
 * We also handle:
 *
 * ROLE_ADMIN
 * ROLE_SUPERVISOR
 * ROLE_EMPLOYEE
 */

function normalizeRoles(
  roles
) {

  if (!Array.isArray(roles)) {

    return [];
  }

  return roles.map(
    (role) =>
      String(role)
        .replace(
          "ROLE_",
          ""
        )
        .toUpperCase()
  );
}


export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(
      getStoredUser
    );


  const [employee, setEmployee] =
    useState(
      getStoredEmployee
    );


  const [accessToken, setAccessToken] =
    useState(
      localStorage.getItem(
        "attendance.accessToken"
      )
    );


  const [loading, setLoading] =
    useState(true);


  /*
   * User roles.
   */

  const roles =
    normalizeRoles(
      user?.roles
    );


  const isAdmin =
    roles.includes(
      "ADMIN"
    );


  const isSupervisor =
    roles.includes(
      "SUPERVISOR"
    );


  const isManagementUser =
    isAdmin ||
    isSupervisor;


  /*
   * Employee status.
   */

  const employeeStatus =
    employee?.status ||
    null;


  /*
   * Save authentication.
   */

  const saveAuthentication =
    (data) => {

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

  const saveEmployee =
    (employeeData) => {

      if (!employeeData) {

        localStorage.removeItem(
          "attendance.employee"
        );

        setEmployee(
          null
        );

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

  const clearAuthentication =
    () => {

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


      setAccessToken(
        null
      );

      setUser(
        null
      );

      setEmployee(
        null
      );
    };


  /*
   * Load employee profile.
   *
   * IMPORTANT:
   *
   * Admins and supervisors
   * do not need an employee
   * profile.
   */

  const loadEmployeeProfile =
    async () => {

      if (
        isManagementUser
      ) {

        saveEmployee(
          null
        );

        return null;
      }


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

          saveEmployee(
            null
          );

          return null;
        }


        console.error(
          "Unable to load employee profile:",
          error
        );


        saveEmployee(
          null
        );


        return null;
      }
    };


  /*
   * Login.
   */

  const login =
    async (
      email,
      password
    ) => {

      const {
        data,
      } =
        await authApi.login({
          email,
          password,
        });


      saveAuthentication(
        data
      );


      /*
       * Determine role directly
       * from login response.
       */

      const loginRoles =
        normalizeRoles(
          data.response?.roles
        );


      const loginIsManagement =
        loginRoles.includes(
          "ADMIN"
        ) ||
        loginRoles.includes(
          "SUPERVISOR"
        );


      /*
       * Only employees need
       * employee profile lookup.
       */

      if (
        !loginIsManagement
      ) {

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

            saveEmployee(
              null
            );

          } else {

            console.error(
              "Unable to load employee profile:",
              error
            );

            saveEmployee(
              null
            );
          }
        }

      } else {

        saveEmployee(
          null
        );
      }


      return data;
    };


  /*
   * Refresh employee profile.
   */

  const refreshEmployeeProfile =
    async () => {

      /*
       * Management users don't
       * have employee profiles.
       */

      if (
        isManagementUser
      ) {

        return null;
      }


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

          saveEmployee(
            null
          );

          return null;
        }


        throw error;
      }
    };


  /*
   * Logout.
   */

  const logout =
    async () => {

      const refreshToken =
        localStorage.getItem(
          "attendance.refreshToken"
        );


      try {

        if (
          refreshToken
        ) {

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
   * after browser refresh.
   */

  useEffect(() => {

    const restoreSession =
      async () => {

        if (
          !accessToken
        ) {

          setLoading(
            false
          );

          return;
        }


        try {

          /*
           * Verify authentication.
           */

          const {
            data,
          } =
            await authApi.me();


          setUser(
            data
          );


          localStorage.setItem(
            "attendance.user",
            JSON.stringify(
              data
            )
          );


          /*
           * Determine roles from
           * authenticated user.
           */

          const restoredRoles =
            normalizeRoles(
              data?.roles
            );


          const restoredIsManagement =
            restoredRoles.includes(
              "ADMIN"
            ) ||
            restoredRoles.includes(
              "SUPERVISOR"
            );


          /*
           * Management users don't
           * need employee lookup.
           */

          if (
            restoredIsManagement
          ) {

            saveEmployee(
              null
            );

          } else {

            try {

              const employeeResponse =
                await getMyProfile();


              saveEmployee(
                employeeResponse.data
              );

            } catch (
              employeeError
            ) {

              if (
                employeeError
                  .response
                  ?.status ===
                404
              ) {

                saveEmployee(
                  null
                );

              } else {

                console.error(
                  "Unable to restore employee profile:",
                  employeeError
                );

                saveEmployee(
                  null
                );
              }
            }
          }

        } catch (error) {

          console.error(
            "Unable to restore user:",
            error
          );


          clearAuthentication();

        } finally {

          setLoading(
            false
          );
        }
      };


    restoreSession();

  }, [
    accessToken,
  ]);


  const value =
    useMemo(
      () => ({
        user,
        employee,
        employeeStatus,

        roles,

        isAdmin,
        isSupervisor,
        isManagementUser,

        accessToken,
        loading,

        login,
        logout,

        refreshEmployeeProfile,
        loadEmployeeProfile,
      }),

      [
        user,
        employee,
        employeeStatus,

        roles,

        isAdmin,
        isSupervisor,
        isManagementUser,

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