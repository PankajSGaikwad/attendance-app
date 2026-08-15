import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  Crosshair,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  startAttendanceScan,
  completeAttendanceScan,
} from "../../api/attendanceApi";

import {
  uploadAttendancePhoto,
} from "../../api/mediaApi";


/* =========================================================
   HELPERS
========================================================= */

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


function formatSeconds(
  seconds
) {
  const value =
    Math.max(
      0,
      Number(seconds || 0)
    );

  const minutes =
    Math.floor(
      value / 60
    );

  const remaining =
    value % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    remaining
  ).padStart(
    2,
    "0"
  )}`;
}


function getActionLabel(
  action
) {
  if (
    String(action).toUpperCase() ===
    "CHECK_OUT"
  ) {
    return "Check out";
  }

  return "Check in";
}


/* =========================================================
   COMPONENT
========================================================= */

export default function MarkAttendance() {

  const navigate =
    useNavigate();


  /* =======================================================
     QR
  ======================================================= */

  const [
    qrValue,
    setQrValue,
  ] = useState("");


  /* =======================================================
     SCAN SESSION
  ======================================================= */

  const [
    scanSession,
    setScanSession,
  ] = useState(null);


  /* =======================================================
     PHOTO
  ======================================================= */

  const [
    photo,
    setPhoto,
  ] = useState(null);


  const [
    photoPreview,
    setPhotoPreview,
  ] = useState("");


  const [
    photoMediaId,
    setPhotoMediaId,
  ] = useState("");


  /* =======================================================
     LOCATION
  ======================================================= */

  const [
    location,
    setLocation,
  ] = useState(null);


  /* =======================================================
     RESULT
  ======================================================= */

  const [
    completionResult,
    setCompletionResult,
  ] = useState(null);


  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);


  const [
    completing,
    setCompleting,
  ] = useState(false);


  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);


  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {

    if (
      !scanSession?.expiresAt
    ) {
      setRemainingSeconds(
        0
      );

      return undefined;
    }


    const updateTimer =
      () => {

        const expiry =
          new Date(
            scanSession.expiresAt
          ).getTime();

        const now =
          Date.now();

        const seconds =
          Math.max(
            0,
            Math.floor(
              (
                expiry -
                now
              ) / 1000
            )
          );

        setRemainingSeconds(
          seconds
        );

        if (
          seconds === 0
        ) {
          setError(
            "The attendance scan has expired. Please start a new scan."
          );
        }
      };


    updateTimer();


    const interval =
      window.setInterval(
        updateTimer,
        1000
      );


    return () =>
      window.clearInterval(
        interval
      );

  }, [
    scanSession,
  ]);


  /* =======================================================
     CLEAN PREVIEW
  ======================================================= */

  useEffect(() => {

    return () => {

      if (
        photoPreview
      ) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

    };

  }, [
    photoPreview,
  ]);


  /* =======================================================
     START SCAN
  ======================================================= */

  const handleStartScan =
    async () => {

      const value =
        qrValue.trim();


      if (!value) {

        setError(
          "Please enter the QR value."
        );

        return;
      }


      setLoading(true);

      setError("");
      setSuccess("");
      setCompletionResult(null);


      try {

        const response =
          await startAttendanceScan(
            value
          );


        const data =
          response.data;


        setScanSession(
          data
        );


        /*
         * If backend requires location,
         * request it immediately.
         */
        if (
          data.locationRequired
        ) {
          await requestLocation();
        }

      } catch (
        requestError
      ) {

        console.error(
          "Start attendance scan failed:",
          requestError
        );


        setError(
          getErrorMessage(
            requestError,
            "Unable to start attendance scan."
          )
        );

      } finally {

        setLoading(false);

      }
    };


  /* =======================================================
     LOCATION
  ======================================================= */

  const requestLocation =
    async () => {

      if (
        !navigator.geolocation
      ) {

        setError(
          "Geolocation is not supported by this browser."
        );

        return null;
      }


      setLocationLoading(
        true
      );

      setError("");


      try {

        const position =
          await new Promise(
            (
              resolve,
              reject
            ) => {

              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 0,
                }
              );

            }
          );


        const locationData = {

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracyMeters:
            position.coords.accuracy,

        };


        setLocation(
          locationData
        );


        return locationData;

      } catch (
        locationError
      ) {

        console.error(
          "Location error:",
          locationError
        );


        setError(
          getLocationErrorMessage(
            locationError
          )
        );


        return null;

      } finally {

        setLocationLoading(
          false
        );

      }
    };


  /* =======================================================
     PHOTO SELECT / CAMERA
  ======================================================= */

  const handlePhotoChange =
    async (
      event
    ) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        setError(
          "Please select a valid image."
        );

        return;
      }


      const maxSize =
        10 * 1024 * 1024;


      if (
        file.size > maxSize
      ) {

        setError(
          "Photo size cannot exceed 10 MB."
        );

        return;
      }


      if (
        photoPreview
      ) {

        URL.revokeObjectURL(
          photoPreview
        );

      }


      const preview =
        URL.createObjectURL(
          file
        );


      setPhoto(
        file
      );

      setPhotoPreview(
        preview
      );

      setPhotoMediaId("");

      setError("");
      setSuccess("");


      /*
       * Upload immediately after capture.
       *
       * Backend requires:
       * attemptId
       * completionToken
       * photo
       */
      if (
        scanSession
      ) {

        await uploadPhoto(
          file
        );
      }

    };


  /* =======================================================
     UPLOAD PHOTO
  ======================================================= */

  const uploadPhoto =
    async (
      file
    ) => {

      if (
        !scanSession
      ) {

        setError(
          "Start the attendance scan before capturing the photo."
        );

        return;
      }


      setUploadingPhoto(
        true
      );

      setError("");
      setSuccess("");


      try {

        const response =
          await uploadAttendancePhoto(
            scanSession.attemptId,
            scanSession.completionToken,
            file
          );


        const data =
          response.data;


        /*
         * This is the REAL media ID
         * returned by media-service.
         */
        setPhotoMediaId(
          data.mediaId
        );


        setSuccess(
          "Attendance photo uploaded successfully."
        );


      } catch (
        uploadError
      ) {

        console.error(
          "Attendance photo upload failed:",
          uploadError
        );


        setPhotoMediaId(
          ""
        );


        setError(
          getErrorMessage(
            uploadError,
            "Unable to upload attendance photo."
          )
        );

      } finally {

        setUploadingPhoto(
          false
        );

      }
    };


  /* =======================================================
     COMPLETE ATTENDANCE
  ======================================================= */

  const handleComplete =
    async () => {

      if (
        !scanSession
      ) {

        setError(
          "Please start the attendance scan first."
        );

        return;
      }


      if (
        remainingSeconds <= 0
      ) {

        setError(
          "The attendance scan has expired. Please start again."
        );

        return;
      }


      /*
       * Photo requirement.
       */
      if (
        scanSession.photoRequired &&
        !photoMediaId
      ) {

        setError(
          "Please capture and upload the attendance photo first."
        );

        return;
      }


      /*
       * Location requirement.
       */
      let finalLocation =
        location;


      if (
        scanSession.locationRequired &&
        !finalLocation
      ) {

        finalLocation =
          await requestLocation();


        if (
          !finalLocation
        ) {
          return;
        }
      }


      setCompleting(
        true
      );

      setError("");
      setSuccess("");


      try {

        const payload = {

          attemptId:
            scanSession.attemptId,

          completionToken:
            scanSession.completionToken,

          photoId:
            photoMediaId,

          latitude:
            finalLocation?.latitude ?? null,

          longitude:
            finalLocation?.longitude ?? null,

          accuracyMeters:
            finalLocation?.accuracyMeters ?? null,

          clientCapturedAt:
            new Date().toISOString(),

        };


        console.log(
          "Completing attendance:",
          payload
        );


        const response =
          await completeAttendanceScan(
            payload
          );


        const result =
          response.data;


        setCompletionResult(
          result
        );


        setSuccess(
          `${getActionLabel(
            result.actionRecorded
          )} recorded successfully.`
        );


        /*
         * Clear active scan.
         */
        setScanSession(
          null
        );

        setQrValue(
          ""
        );

        setPhotoMediaId(
          ""
        );

      } catch (
        completeError
      ) {

        console.error(
          "Attendance completion failed:",
          completeError
        );


        setError(
          getErrorMessage(
            completeError,
            "Unable to complete attendance."
          )
        );

      } finally {

        setCompleting(
          false
        );

      }
    };


  /* =======================================================
     RESET
  ======================================================= */

  const resetAttendance =
    () => {

      if (
        photoPreview
      ) {

        URL.revokeObjectURL(
          photoPreview
        );

      }


      setQrValue("");

      setScanSession(null);

      setPhoto(null);

      setPhotoPreview("");

      setPhotoMediaId("");

      setLocation(null);

      setCompletionResult(null);

      setRemainingSeconds(0);

      setError("");

      setSuccess("");

    };


  /* =======================================================
     ACTION
  ======================================================= */

  const action =
    scanSession?.action ||
    "CHECK_IN";


  const actionLabel =
    getActionLabel(
      action
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="employee-mark-attendance-page">

      <div className="employee-mark-attendance-container">

        {/* HEADER */}

        <div className="employee-mark-attendance-header">

          <div>

            <div className="employee-mark-attendance-eyebrow">
              ATTENDANCE
            </div>

            <h1>
              Mark attendance
            </h1>

            <p>
              Verify your attendance using
              QR, photo and location.
            </p>

          </div>


          <button
            type="button"
            className="employee-mark-attendance-back-button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >

            <ArrowLeft
              size={16}
            />

            Dashboard

          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="employee-attendance-alert employee-attendance-alert-error">

            <AlertCircle
              size={18}
            />

            <div>

              <strong>
                Attendance action failed
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>

        )}


        {/* SUCCESS */}

        {success && (

          <div className="employee-attendance-alert employee-attendance-alert-success">

            <CheckCircle2
              size={18}
            />

            <div>

              <strong>
                Attendance update
              </strong>

              <p>
                {success}
              </p>

            </div>

          </div>

        )}


        {/* COMPLETED */}

        {completionResult ? (

          <section className="employee-attendance-success-card">

            <div className="employee-attendance-success-icon">

              <CheckCircle2
                size={36}
              />

            </div>


            <div>

              <div className="employee-attendance-success-eyebrow">
                ATTENDANCE RECORDED
              </div>

              <h2>

                {getActionLabel(
                  completionResult.actionRecorded
                )}

                {" "}
                successful

              </h2>

              <p>

                {
                  completionResult.attendanceDate ||
                  "Today's attendance"
                }

                {" • "}

                {
                  completionResult.status ||
                  "Recorded"
                }

              </p>

            </div>


            <div className="employee-attendance-result-grid">

              <ResultItem
                label="Session count"
                value={
                  completionResult.sessionCount ??
                  "—"
                }
              />

              <ResultItem
                label="Worked minutes"
                value={
                  completionResult.workedMinutes ??
                  "0"
                }
              />

              <ResultItem
                label="Break minutes"
                value={
                  completionResult.breakMinutes ??
                  "0"
                }
              />

              <ResultItem
                label="Next action"
                value={
                  completionResult.nextAction
                    ? getActionLabel(
                        completionResult.nextAction
                      )
                    : "—"
                }
              />

            </div>


            <div className="employee-attendance-success-actions">

              <button
                type="button"
                className="employee-attendance-primary-button"
                onClick={
                  resetAttendance
                }
              >

                <RefreshCw
                  size={17}
                />

                Mark again

              </button>


              <button
                type="button"
                className="employee-attendance-secondary-button"
                onClick={() =>
                  navigate(
                    "/attendance"
                  )
                }
              >

                View attendance history

              </button>

            </div>

          </section>

        ) : (

          <div className="employee-attendance-grid">

            {/* =================================================
                STEP 1
            ================================================= */}

            <section className="employee-attendance-card">

              <div className="employee-attendance-card-header">

                <div className="employee-attendance-step">
                  01
                </div>

                <div>

                  <h2>
                    Scan employee QR
                  </h2>

                  <p>
                    Enter the QR value to begin.
                  </p>

                </div>

              </div>


              <div className="employee-attendance-qr-visual">

                <div className="employee-attendance-qr-icon">

                  <QrCode
                    size={40}
                  />

                </div>

                <ScanLine
                  size={25}
                  className="employee-attendance-scan-line"
                />

              </div>


              <label className="employee-attendance-field">

                <span>
                  QR value
                </span>

                <div className="employee-attendance-input-wrap">

                  <QrCode
                    size={17}
                  />

                  <input
                    type="text"
                    value={
                      qrValue
                    }
                    onChange={(event) => {

                      setQrValue(
                        event.target.value
                      );

                      setError("");
                      setSuccess("");

                    }}
                    placeholder="Paste or enter QR value"
                    disabled={
                      loading ||
                      !!scanSession
                    }
                  />

                </div>

              </label>


              {!scanSession && (

                <button
                  type="button"
                  className="employee-attendance-primary-button employee-attendance-full-button"
                  onClick={
                    handleStartScan
                  }
                  disabled={
                    loading ||
                    !qrValue.trim()
                  }
                >

                  {loading ? (

                    <>

                      <Loader2
                        size={17}
                        className="employee-attendance-spin"
                      />

                      Starting...

                    </>

                  ) : (

                    <>

                      <ScanLine
                        size={17}
                      />

                      Start scan

                    </>

                  )}

                </button>

              )}

            </section>


            {/* =================================================
                STEP 2
            ================================================= */}

            <section className="employee-attendance-card">

              <div className="employee-attendance-card-header">

                <div className="employee-attendance-step">
                  02
                </div>

                <div>

                  <h2>
                    Verification
                  </h2>

                  <p>
                    Complete the requested
                    verification.
                  </p>

                </div>

              </div>


              {scanSession ? (

                <div className="employee-attendance-verification">

                  {/* ACTION */}

                  <div className="employee-attendance-action-banner">

                    <Clock3
                      size={19}
                    />

                    <div>

                      <span>
                        Current action
                      </span>

                      <strong>
                        {actionLabel}
                      </strong>

                    </div>

                  </div>


                  {/* EMPLOYEE */}

                  <div className="employee-attendance-employee">

                    <div className="employee-attendance-employee-icon">

                      <Smartphone
                        size={20}
                      />

                    </div>

                    <div>

                      <strong>
                        {
                          scanSession.employeeName ||
                          "Employee"
                        }
                      </strong>

                      <span>
                        {
                          scanSession.employeeCode ||
                          "—"
                        }
                      </span>

                    </div>

                  </div>


                  {/* SHIFT */}

                  <div className="employee-attendance-shift">

                    <div>

                      <span>
                        Attendance date
                      </span>

                      <strong>
                        {
                          scanSession.attendanceDate ||
                          "—"
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Shift
                      </span>

                      <strong>
                        {
                          scanSession.shiftName ||
                          "—"
                        }
                      </strong>

                    </div>

                  </div>


                  {/* REQUIREMENTS */}

                  <div className="employee-attendance-requirements">

                    <Requirement
                      icon={
                        <Camera
                          size={17}
                        />
                      }
                      label="Photo"
                      required={
                        scanSession.photoRequired
                      }
                      completed={
                        !!photoMediaId
                      }
                    />


                    <Requirement
                      icon={
                        <MapPin
                          size={17}
                        />
                      }
                      label="Location"
                      required={
                        scanSession.locationRequired
                      }
                      completed={
                        !!location
                      }
                    />

                  </div>


                  {/* PHOTO */}

                  {scanSession.photoRequired && (

                    <div className="employee-attendance-photo-section">

                      <div className="employee-attendance-photo-header">

                        <span>
                          Attendance photo
                        </span>

                        {uploadingPhoto && (

                          <small className="employee-attendance-photo-uploading">

                            Uploading...

                          </small>

                        )}

                        {!uploadingPhoto &&
                          photoMediaId && (

                          <small>
                            Uploaded
                          </small>

                        )}

                      </div>


                      {photoPreview ? (

                        <div className="employee-attendance-photo-preview">

                          <img
                            src={
                              photoPreview
                            }
                            alt="Attendance"
                          />

                        </div>

                      ) : (

                        <div className="employee-attendance-photo-placeholder">

                          <Camera
                            size={28}
                          />

                          <span>
                            Capture your attendance photo
                          </span>

                        </div>

                      )}


                      <input
                        id="attendance-photo"
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="employee-attendance-hidden-input"
                        onChange={
                          handlePhotoChange
                        }
                      />


                      <label
                        htmlFor="attendance-photo"
                        className="employee-attendance-secondary-button employee-attendance-full-button"
                      >

                        <Camera
                          size={17}
                        />

                        {photo
                          ? "Retake photo"
                          : "Capture photo"}

                      </label>


                      {uploadingPhoto && (

                        <div className="employee-attendance-upload-status">

                          <Loader2
                            size={15}
                            className="employee-attendance-spin"
                          />

                          Uploading photo securely...

                        </div>

                      )}

                    </div>

                  )}


                  {/* LOCATION */}

                  {scanSession.locationRequired && (

                    <div className="employee-attendance-location-section">

                      <div>

                        <div className="employee-attendance-location-icon">

                          <MapPin
                            size={18}
                          />

                        </div>

                        <div>

                          <strong>
                            Location
                          </strong>

                          <span>

                            {location
                              ? `${location.latitude.toFixed(
                                  5
                                )}, ${location.longitude.toFixed(
                                  5
                                )}`
                              : "Not captured"}

                          </span>

                        </div>

                      </div>


                      <button
                        type="button"
                        className="employee-attendance-small-button"
                        onClick={
                          requestLocation
                        }
                        disabled={
                          locationLoading
                        }
                      >

                        {locationLoading ? (

                          <Loader2
                            size={15}
                            className="employee-attendance-spin"
                          />

                        ) : (

                          <Crosshair
                            size={15}
                          />

                        )}

                        {location
                          ? "Refresh"
                          : "Get location"}

                      </button>

                    </div>

                  )}


                  {/* EXPIRY */}

                  <div className="employee-attendance-expiry">

                    <Clock3
                      size={16}
                    />

                    <span>
                      Scan expires in
                    </span>

                    <strong>
                      {formatSeconds(
                        remainingSeconds
                      )}
                    </strong>

                  </div>


                  {/* COMPLETE */}

                  <button
                    type="button"
                    className="employee-attendance-primary-button employee-attendance-full-button"
                    onClick={
                      handleComplete
                    }
                    disabled={

                      completing ||

                      uploadingPhoto ||

                      remainingSeconds <= 0 ||

                      (
                        scanSession.photoRequired &&
                        !photoMediaId
                      ) ||

                      (
                        scanSession.locationRequired &&
                        !location
                      )

                    }
                  >

                    {completing ? (

                      <>

                        <Loader2
                          size={17}
                          className="employee-attendance-spin"
                        />

                        Completing...

                      </>

                    ) : (

                      <>

                        <CheckCircle2
                          size={17}
                        />

                        {actionLabel}

                      </>

                    )}

                  </button>


                  <button
                    type="button"
                    className="employee-attendance-link-button"
                    onClick={
                      resetAttendance
                    }
                    disabled={
                      completing ||
                      uploadingPhoto
                    }
                  >

                    Start over

                  </button>

                </div>

              ) : (

                <div className="employee-attendance-verification-empty">

                  <ShieldCheck
                    size={35}
                  />

                  <h3>
                    Waiting for scan
                  </h3>

                  <p>
                    Start the QR scan to begin
                    attendance verification.
                  </p>

                </div>

              )}

            </section>

          </div>

        )}


        {/* FOOTER INFO */}

        <div className="employee-attendance-info">

          <ShieldCheck
            size={17}
          />

          <span>
            Your attendance photo is uploaded
            through the secure media service.
            Location is used only when required
            by the attendance policy.
          </span>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   REQUIREMENT
========================================================= */

function Requirement({
  icon,
  label,
  required,
  completed,
}) {

  if (!required) {

    return (
      <div className="employee-attendance-requirement optional">

        {icon}

        <span>
          {label}
        </span>

        <small>
          Optional
        </small>

      </div>
    );
  }


  return (
    <div
      className={
        `employee-attendance-requirement ${
          completed
            ? "completed"
            : ""
        }`
      }
    >

      {completed ? (
        <CheckCircle2
          size={17}
        />
      ) : (
        icon
      )}

      <span>
        {label}
      </span>

      <small>
        {completed
          ? "Ready"
          : "Required"}
      </small>

    </div>
  );
}


/* =========================================================
   RESULT
========================================================= */

function ResultItem({
  label,
  value,
}) {

  return (
    <div className="employee-attendance-result-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   LOCATION ERROR
========================================================= */

function getLocationErrorMessage(
  error
) {

  if (!error) {
    return "Unable to access your location.";
  }


  switch (
    error.code
  ) {

    case 1:

      return "Location permission was denied. Please allow location access and try again.";

    case 2:

      return "Your current location could not be determined.";

    case 3:

      return "Location request timed out. Please try again.";

    default:

      return "Unable to access your location.";

  }
}