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
    employee,
    employeeStatus,
    loading,
  } = useAuth();

  const location =
    useLocation();


  /*
   * Wait until authentication
   * and employee profile lookup
   * are completed.
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
   * No authentication.
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
   * Pages that are allowed
   * before employee profile
   * exists.
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
   *
   * Send the authenticated
   * user to profile creation.
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
   * DRAFT profile.
   *
   * User needs to complete
   * or edit their information.
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
   * PENDING profile.
   *
   * User must wait for admin
   * approval.
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
   * REJECTED profile.
   *
   * Allow the user to return
   * to the profile page and
   * make corrections.
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
   * SUSPENDED employee.
   *
   * We haven't created the
   * suspension page yet, so
   * keep them away from the
   * application for now.
   */

  if (
    employeeStatus === "SUSPENDED"
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
   * Everything is fine.
   */

  return (
    <Outlet />
  );
}