import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "./AuthContext";


export default function ProtectedRoute() {

  const {
    accessToken,
    user,
    employee,
    employeeStatus,
    isManagementUser,
    loading,
  } = useAuth();


  const location =
    useLocation();


  /*
   * Wait for authentication
   * restoration.
   */

  if (loading) {

    return (
      <div className="route-loading">

        <div className="loading-spinner" />

        <p>
          Loading your workspace...
        </p>

      </div>
    );
  }


  /*
   * Not authenticated.
   */

  if (!accessToken) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }


  const currentPath =
    location.pathname;


  /*
   * =========================================
   * ADMIN / SUPERVISOR
   * =========================================
   */

  if (
    isManagementUser
  ) {

    /*
     * Management users should
     * never enter employee
     * onboarding.
     */

    const employeeOnlyPaths = [
      "/complete-profile",
      "/profile-pending",
    ];


    if (
      employeeOnlyPaths.includes(
        currentPath
      )
    ) {

      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }


    /*
     * If an admin lands on the
     * employee dashboard, send
     * them to management.
     */

    if (
      currentPath ===
      "/dashboard"
    ) {

      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }


    return (
      <Outlet />
    );
  }


  /*
   * =========================================
   * NORMAL EMPLOYEE
   * =========================================
   */


  const profileSetupPaths = [
    "/complete-profile",
    "/profile-pending",
  ];


  const isProfileSetupPage =
    profileSetupPaths.includes(
      currentPath
    );


  /*
   * No employee profile.
   */

  if (
    !employee &&
    !isProfileSetupPage
  ) {

    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }


  /*
   * DRAFT.
   */

  if (
    employeeStatus === "DRAFT" &&
    currentPath !==
      "/complete-profile"
  ) {

    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }


  /*
   * PENDING.
   */

  if (
    employeeStatus === "PENDING" &&
    currentPath !==
      "/profile-pending"
  ) {

    return (
      <Navigate
        to="/profile-pending"
        replace
      />
    );
  }


  /*
   * REJECTED.
   */

  if (
    employeeStatus === "REJECTED" &&
    currentPath !==
      "/complete-profile"
  ) {

    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }


  /*
   * SUSPENDED.
   */

  if (
    employeeStatus ===
    "SUSPENDED"
  ) {

    return (
      <div className="account-restricted">

        <div className="restricted-card">

          <div className="eyebrow">
            ACCOUNT RESTRICTED
          </div>

          <h1>
            Your employee account
            is suspended
          </h1>

          <p>
            Please contact your
            administrator for more
            information.
          </p>

        </div>

      </div>
    );
  }


  /*
   * Employee is allowed.
   */

  return (
    <Outlet />
  );
}