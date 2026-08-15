import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/AuthContext";

import api from "../../api/client";


export default function ProfilePending() {

  const navigate =
    useNavigate();

  const {
    user,
    employee,
    refreshEmployeeProfile,
  } = useAuth();


  const [status, setStatus] =
    useState(
      employee?.status ||
      employee?.approvalStatus ||
      "PENDING"
    );


  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * Normalize backend status.
   */

  const normalizeStatus =
    (employeeData) => {

      const value =
        employeeData?.status ||
        employeeData?.approvalStatus ||
        employeeData?.employeeStatus ||
        "PENDING";

      return String(value)
        .trim()
        .toUpperCase();
    };


  /*
   * Get current employee profile.
   */

  const checkEmployeeStatus =
    useCallback(
      async (
        showLoading = true
      ) => {

        if (showLoading) {
          setLoading(true);
        }

        setError("");


        try {

          const response =
            await api.get(
              "/api/employees/me"
            );


          const employeeData =
            response.data;


          const currentStatus =
            normalizeStatus(
              employeeData
            );


          setStatus(
            currentStatus
          );


          /*
           * Update AuthContext.
           */

          try {

            await refreshEmployeeProfile();

          } catch (refreshError) {

            console.warn(
              "Unable to refresh employee context:",
              refreshError
            );
          }


          /*
           * Employee approved.
           */

          if (
            currentStatus ===
            "APPROVED"
          ) {

            navigate(
              "/dashboard",
              {
                replace: true,
              }
            );

            return;
          }


          /*
           * Profile rejected.
           */

          if (
            currentStatus ===
            "REJECTED"
          ) {

            return;
          }

        } catch (statusError) {

          console.error(
            "Unable to check employee status:",
            statusError
          );


          /*
           * Don't show an error on
           * the first render if the
           * employee object already
           * tells us the status.
           */

          if (
            !employee?.status &&
            !employee?.approvalStatus
          ) {

            setError(
              getErrorMessage(
                statusError,
                "Unable to check your profile status."
              )
            );
          }

        } finally {

          if (showLoading) {
            setLoading(false);
          }

          setInitialLoading(false);
        }

      },
      [
        employee,
        navigate,
        refreshEmployeeProfile,
      ]
    );


  /*
   * Check status when page opens.
   */

  useEffect(() => {

    checkEmployeeStatus(
      false
    );

  }, [
    checkEmployeeStatus,
  ]);


  /*
   * Status label.
   */

  const getStatusLabel =
    () => {

      if (
        status ===
        "APPROVED"
      ) {

        return "Approved";
      }


      if (
        status ===
        "REJECTED"
      ) {

        return "Rejected";
      }


      return "Pending";
    };


  /*
   * Status description.
   */

  const getStatusDescription =
    () => {

      if (
        status ===
        "APPROVED"
      ) {

        return (
          "Your employee profile has been approved. Attendance features are now available."
        );
      }


      if (
        status ===
        "REJECTED"
      ) {

        return (
          "Your profile was not approved. Please contact your administrator for further information."
        );
      }


      return (
        "An administrator needs to review and approve your information before you can use attendance features."
      );
    };


  /*
   * Current status class.
   */

  const getStatusClass =
    () => {

      if (
        status ===
        "APPROVED"
      ) {

        return "profile-status-approved";
      }


      if (
        status ===
        "REJECTED"
      ) {

        return "profile-status-rejected";
      }


      return "profile-status-pending";
    };


  /*
   * Loading screen.
   */

  if (
    initialLoading
  ) {

    return (
      <div className="pending-page">

        <div className="pending-loading">

          <div className="pending-spinner" />

          <p>
            Checking your profile status...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="pending-page">

      <div className="pending-container">

        {/* Header */}

        <div className="pending-header">

          <div>

            <div className="pending-eyebrow">
              EMPLOYEE ONBOARDING
            </div>

            <h1>
              Profile submitted
            </h1>

            <p>
              Your employee information has been
              submitted successfully.
            </p>

          </div>


          <div
            className={
              `pending-status-badge ${getStatusClass()}`
            }
          >

            <span className="pending-status-dot" />

            {getStatusLabel()}

          </div>

        </div>


        {/* Error */}

        {error && (

          <div className="pending-alert">

            <div className="pending-alert-icon">
              !
            </div>

            <div>

              {error}

            </div>

          </div>

        )}


        {/* Main status card */}

        <section className="pending-main-card">

          <div
            className={
              `pending-main-icon ${getStatusClass()}`
            }
          >

            {status === "APPROVED" && "✓"}

            {status === "REJECTED" && "!"}

            {status === "PENDING" && "◷"}

          </div>


          <div className="pending-main-content">

            <div className="pending-card-eyebrow">
              PROFILE STATUS
            </div>

            <h2>
              {status === "APPROVED"
                ? "Your profile has been approved"
                : status === "REJECTED"
                  ? "Your profile needs attention"
                  : "Your profile is under review"
              }
            </h2>

            <p>
              {getStatusDescription()}
            </p>

          </div>

        </section>


        {/* Progress */}

        <section className="pending-progress-card">

          <div className="pending-progress-header">

            <div>

              <div className="pending-card-eyebrow">
                ONBOARDING PROGRESS
              </div>

              <h2>
                Employee access
              </h2>

            </div>

            <span className="pending-progress-count">
              {status === "APPROVED"
                ? "3 / 3"
                : "2 / 3"
              }
            </span>

          </div>


          <div className="pending-progress-line">

            <div
              className={
                `pending-progress-fill ${
                  status === "APPROVED"
                    ? "pending-progress-complete"
                    : ""
                }`
              }
            />

          </div>


          <div className="pending-steps">

            {/* Step 1 */}

            <div className="pending-step pending-step-complete">

              <div className="pending-step-marker">
                ✓
              </div>

              <div>

                <strong>
                  Profile completed
                </strong>

                <span>
                  Your employee information has been submitted.
                </span>

              </div>

            </div>


            {/* Step 2 */}

            <div
              className={
                `pending-step ${
                  status === "PENDING"
                    ? "pending-step-active"
                    : status === "APPROVED"
                      ? "pending-step-complete"
                      : ""
                }`
              }
            >

              <div className="pending-step-marker">

                {status === "APPROVED"
                  ? "✓"
                  : status === "PENDING"
                    ? "◷"
                    : "2"
                }

              </div>

              <div>

                <strong>
                  Administrator review
                </strong>

                <span>

                  {status === "APPROVED"
                    ? "Your profile has been approved."
                    : status === "REJECTED"
                      ? "Your profile was not approved."
                      : "An administrator will review your profile."
                  }

                </span>

              </div>

            </div>


            {/* Step 3 */}

            <div
              className={
                `pending-step ${
                  status === "APPROVED"
                    ? "pending-step-complete"
                    : ""
                }`
              }
            >

              <div className="pending-step-marker">

                {status === "APPROVED"
                  ? "✓"
                  : "3"
                }

              </div>

              <div>

                <strong>
                  Employee access
                </strong>

                <span>
                  {status === "APPROVED"
                    ? "Attendance features are now available."
                    : "Attendance will become available after approval."
                  }
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* Current status */}

        <section className="pending-status-card">

          <div className="pending-status-card-left">

            <div className="pending-status-card-icon">
              ◷
            </div>

            <div>

              <div className="pending-card-eyebrow">
                CURRENT STATUS
              </div>

              <h2>
                {getStatusLabel()}
              </h2>

            </div>

          </div>


          <div className="pending-status-card-right">

            {status === "APPROVED" ? (

              <button
                type="button"
                className="pending-primary-button"
                onClick={() =>
                  navigate(
                    "/dashboard",
                    {
                      replace: true,
                    }
                  )
                }
              >

                Go to dashboard

                <span>
                  →
                </span>

              </button>

            ) : status === "REJECTED" ? (

              <button
                type="button"
                className="pending-secondary-button"
                onClick={() =>
                  navigate(
                    "/complete-profile"
                  )
                }
              >

                Update profile

                <span>
                  →
                </span>

              </button>

            ) : (

              <button
                type="button"
                className="pending-secondary-button"
                onClick={() =>
                  checkEmployeeStatus(
                    true
                  )
                }
                disabled={loading}
              >

                <span
                  className={
                    loading
                      ? "pending-button-spinner"
                      : ""
                  }
                >
                  {loading
                    ? "◌"
                    : "↻"
                  }
                </span>

                {loading
                  ? "Checking..."
                  : "Check status"
                }

              </button>

            )}

          </div>

        </section>


        {/* Information */}

        <div className="pending-information">

          <div className="pending-information-icon">
            i
          </div>

          <div>

            <strong>
              What happens next?
            </strong>

            <p>

              {status === "APPROVED"
                ? "Your account is ready. You can now mark attendance and access your employee workspace."
                : status === "REJECTED"
                  ? "Please update your employee information and contact your administrator if you need assistance."
                  : "You can safely leave this page. Once an administrator approves your profile, check your status again to access the employee workspace."
              }

            </p>

          </div>

        </div>


        {/* User info */}

        <div className="pending-account">

          <span>
            Signed in as
          </span>

          <strong>
            {
              user?.email ||
              user?.username ||
              "Employee"
            }
          </strong>

        </div>

      </div>

    </div>
  );
}


/*
 * Convert backend errors into
 * readable messages.
 */

function getErrorMessage(
  error,
  fallback
) {

  const data =
    error?.response?.data;


  if (
    typeof data === "string" &&
    data.trim()
  ) {

    return data;
  }


  if (
    data?.message
  ) {

    return data.message;
  }


  if (
    data?.error
  ) {

    return data.error;
  }


  if (
    data?.errors &&
    Array.isArray(data.errors)
  ) {

    return data.errors
      .map(
        (item) =>
          item.message ||
          item.defaultMessage ||
          ""
      )
      .filter(Boolean)
      .join(" ");
  }


  return fallback;
}