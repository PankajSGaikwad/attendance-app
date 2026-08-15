import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  QrCode,
  Download,
  RefreshCw,
  ArrowLeft,
  User,
  Mail,
  BadgeCheck,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import {
  getMyQr,
  getMyProfile,
} from "../../api/employeeApi";


export default function MyQr() {

  const navigate = useNavigate();


  const [qrUrl, setQrUrl] =
    useState("");

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * Load employee QR.
   */
  const loadQr =
    async (isRefresh = false) => {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      try {

        const response =
          await getMyQr();


        /*
         * Backend returns image/blob.
         */
        const blob =
          response.data;


        if (
          !blob ||
          blob.size === 0
        ) {

          throw new Error(
            "QR code was not returned by the server."
          );
        }


        /*
         * Release previous object URL
         * before creating a new one.
         */
        if (qrUrl) {

          URL.revokeObjectURL(
            qrUrl
          );
        }


        const objectUrl =
          URL.createObjectURL(
            blob
          );


        setQrUrl(
          objectUrl
        );


      } catch (qrError) {

        console.error(
          "Unable to load QR code:",
          qrError
        );


        setError(
          getErrorMessage(
            qrError,
            "Unable to load your QR code."
          )
        );


      } finally {

        setLoading(false);
        setRefreshing(false);
      }
    };


  /*
   * Load employee profile.
   */
  const loadProfile =
    async () => {

      try {

        const response =
          await getMyProfile();


        setProfile(
          response.data
        );

      } catch (profileError) {

        console.error(
          "Unable to load profile:",
          profileError
        );

        /*
         * Profile is supplementary.
         * QR should still attempt to load.
         */
      }
    };


  /*
   * Initial load.
   */
  useEffect(() => {

    loadProfile();

    loadQr();


    /*
     * Cleanup generated blob URL.
     */
    return () => {

      setQrUrl(
        (currentUrl) => {

          if (currentUrl) {

            URL.revokeObjectURL(
              currentUrl
            );
          }

          return "";
        }
      );

    };

  }, []);


  /*
   * Download QR.
   */
  const handleDownload =
    () => {

      if (!qrUrl) {
        return;
      }


      const link =
        document.createElement(
          "a"
        );


      link.href =
        qrUrl;


      link.download =
        `${
          profile?.employeeCode ||
          "employee"
        }-attendance-qr.png`;


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );
    };


  /*
   * Refresh QR.
   */
  const handleRefresh =
    async () => {

      await loadQr(
        true
      );
    };


  /*
   * Loading state.
   */
  if (loading) {

    return (
      <div className="employee-qr-page">

        <div className="employee-qr-loading">

          <div className="employee-qr-spinner" />

          <p>
            Loading your QR code...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="employee-qr-page">

      <div className="employee-qr-container">

        {/* =====================================
            HEADER
            ===================================== */}

        <div className="employee-qr-header">

          <div>

            <div className="employee-qr-eyebrow">
              ATTENDANCE
            </div>

            <h1>
              My QR code
            </h1>

            <p>
              Use this QR code for attendance
              verification.
            </p>

          </div>


          <div className="employee-qr-header-actions">

            <button
              type="button"
              className="employee-qr-refresh-button"
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "employee-qr-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </div>


        {/* =====================================
            ERROR
            ===================================== */}

        {error && (

          <div className="employee-qr-alert">

            <AlertCircle
              size={18}
            />

            <div>

              <strong>
                QR code unavailable
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>

        )}


        {/* =====================================
            MAIN QR CARD
            ===================================== */}

        <div className="employee-qr-layout">

          <section className="employee-qr-card">

            <div className="employee-qr-card-header">

              <div className="employee-qr-icon">

                <QrCode
                  size={21}
                />

              </div>

              <div>

                <h2>
                  Attendance QR
                </h2>

                <p>
                  Keep this QR code ready when
                  marking your attendance.
                </p>

              </div>

            </div>


            <div className="employee-qr-display">

              {qrUrl ? (

                <div className="employee-qr-image-wrapper">

                  <img
                    src={qrUrl}
                    alt="Employee attendance QR code"
                    className="employee-qr-image"
                  />

                </div>

              ) : (

                <div className="employee-qr-empty">

                  <QrCode
                    size={50}
                  />

                  <h3>
                    QR code unavailable
                  </h3>

                  <p>
                    Please refresh and try again.
                  </p>

                </div>

              )}

            </div>


            {qrUrl && (

              <button
                type="button"
                className="employee-qr-download-button"
                onClick={
                  handleDownload
                }
              >

                <Download
                  size={17}
                />

                Download QR

              </button>

            )}


            <div className="employee-qr-security-note">

              <ShieldCheck
                size={17}
              />

              <span>
                This QR code is linked to your
                employee account.
              </span>

            </div>

          </section>


          {/* =====================================
              EMPLOYEE INFORMATION
              ===================================== */}

          <section className="employee-qr-info-card">

            <div className="employee-qr-info-header">

              <div className="employee-qr-info-avatar">

                {profile?.firstName
                  ?.charAt(0)
                  ?.toUpperCase() || "E"}

                {profile?.lastName
                  ?.charAt(0)
                  ?.toUpperCase() || ""
                }

              </div>


              <div>

                <h2>

                  {profile?.firstName || ""}
                  {" "}
                  {profile?.lastName || ""}

                </h2>

                <p>
                  Employee
                </p>

              </div>

            </div>


            <div className="employee-qr-details">

              <QrDetail
                icon={
                  <BadgeCheck
                    size={17}
                  />
                }
                label="Employee code"
                value={
                  profile?.employeeCode ||
                  "—"
                }
              />


              <QrDetail
                icon={
                  <Mail
                    size={17}
                  />
                }
                label="Email"
                value={
                  profile?.email ||
                  "—"
                }
              />


              <QrDetail
                icon={
                  <User
                    size={17}
                  />
                }
                label="Department"
                value={
                  profile?.departmentName ||
                  "—"
                }
              />


              <QrDetail
                icon={
                  <BadgeCheck
                    size={17}
                  />
                }
                label="Designation"
                value={
                  profile?.designationName ||
                  "—"
                }
              />

            </div>


            <div className="employee-qr-instructions">

              <h3>
                How to use
              </h3>

              <ol>

                <li>
                  Open your QR code before
                  marking attendance.
                </li>

                <li>
                  Show the QR code to the
                  attendance scanner.
                </li>

                <li>
                  Wait for attendance
                  confirmation.
                </li>

              </ol>

            </div>

          </section>

        </div>


        {/* =====================================
            FOOTER
            ===================================== */}

        <div className="employee-qr-footer">

          <button
            type="button"
            className="employee-qr-back-button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >

            <ArrowLeft
              size={16}
            />

            Back to dashboard

          </button>


          <button
            type="button"
            className="employee-qr-profile-button"
            onClick={() =>
              navigate(
                "/profile"
              )
            }
          >

            View profile

          </button>

        </div>

      </div>

    </div>
  );
}


/*
 * QR information row.
 */
function QrDetail({
  icon,
  label,
  value,
}) {

  return (
    <div className="employee-qr-detail">

      <div className="employee-qr-detail-icon">

        {icon}

      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/*
 * Backend error helper.
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
    error?.message
  ) {

    return error.message;
  }


  return fallback;
}