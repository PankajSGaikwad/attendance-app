import {
  Camera,
  CheckCircle2,
  Crosshair,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
  RotateCcw,
  Upload,
  Clock3,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Html5Qrcode } from "html5-qrcode";

import PageHeader from "../../components/common/PageHeader";

import {
  startAttendanceScan,
  completeAttendanceScan,
} from "../../api/attendanceApi";

import api from "../../api/client";


function Attendance() {
  const [step, setStep] = useState(1);

  const [qrValue, setQrValue] = useState("");

  const [attempt, setAttempt] = useState(null);

  const [photoId, setPhotoId] = useState("");

  const [photoPreview, setPhotoPreview] = useState("");

  const [location, setLocation] = useState(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [scannerRunning, setScannerRunning] = useState(false);

  const [cameraRunning, setCameraRunning] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [completing, setCompleting] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(null);


  const scannerRef = useRef(null);

  const scannerStartedRef = useRef(false);

  const scanLockedRef = useRef(false);

  const videoRef = useRef(null);

  const photoStreamRef = useRef(null);

  const canvasRef = useRef(null);


  /*
   * ---------------------------------------------------------
   * ERROR HANDLING
   * ---------------------------------------------------------
   */

  const getErrorMessage = useCallback((err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong. Please try again."
    );
  }, []);


  /*
   * ---------------------------------------------------------
   * STOP QR SCANNER
   * ---------------------------------------------------------
   */

  const stopQrScanner = useCallback(async () => {
    try {
      if (
        scannerRef.current &&
        scannerStartedRef.current
      ) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.warn(
        "Unable to stop QR scanner:",
        err
      );
    }

    try {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    } catch (err) {
      console.warn(
        "Unable to clear QR scanner:",
        err
      );
    }

    scannerRef.current = null;

    scannerStartedRef.current = false;

    setScannerRunning(false);
  }, []);


  /*
   * ---------------------------------------------------------
   * START QR SCANNER
   * ---------------------------------------------------------
   */

  const startQrScanner = useCallback(async () => {
    setError("");
    setMessage("");

    scanLockedRef.current = false;

    try {
      await stopQrScanner();

      const scanner = new Html5Qrcode(
        "attendance-qr-reader"
      );

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: {
            exact: "environment",
          },
        },
        {
          fps: 10,

          qrbox: {
            width: 280,
            height: 280,
          },

          aspectRatio: 1,

          disableFlip: false,
        },

        async (decodedText) => {
          if (scanLockedRef.current) {
            return;
          }

          scanLockedRef.current = true;

          setQrValue(decodedText);

          await stopQrScanner();

          await handleQrSubmit(decodedText);
        },

        () => {
          /*
           * QR decode errors happen continuously while
           * scanning. Do not display them to the user.
           */
        }
      );

      scannerStartedRef.current = true;

      setScannerRunning(true);
    } catch (err) {
      console.error(
        "QR scanner error:",
        err
      );

      scannerRef.current = null;

      scannerStartedRef.current = false;

      setScannerRunning(false);

      setError(
        "Unable to access the camera. Please allow camera permission and try again."
      );
    }
  }, [stopQrScanner]);


  /*
   * ---------------------------------------------------------
   * START ATTENDANCE AFTER QR SCAN
   * ---------------------------------------------------------
   */

  const handleQrSubmit = async (value = qrValue) => {
    const finalQrValue = value?.trim();

    if (!finalQrValue) {
      setError(
        "Please scan the employee QR code."
      );

      scanLockedRef.current = false;

      return;
    }

    setError("");
    setMessage("Verifying employee QR...");

    try {
      const response =
        await startAttendanceScan({
          qrValue: finalQrValue,
        });

      const data = response.data;

      setAttempt(data);

      /*
       * Backend returns the real TTL.
       *
       * Current backend default = 60 seconds.
       */
      setRemainingSeconds(
        data.expiresInSeconds ?? 60
      );

      setMessage("");

      /*
       * Move directly to photo step.
       */
      setStep(3);
    } catch (err) {
      console.error(
        "Attendance scan failed:",
        err
      );

      setMessage("");

      setError(
        getErrorMessage(err)
      );

      scanLockedRef.current = false;

      /*
       * Restart scanner after backend rejects QR.
       */
      setTimeout(() => {
        startQrScanner();
      }, 500);
    }
  };


  /*
   * ---------------------------------------------------------
   * QR TIMER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!attempt || remainingSeconds === null) {
      return;
    }

    if (remainingSeconds <= 0) {
      setError(
        "The attendance attempt has expired. Please scan the QR code again."
      );

      stopCamera();

      setStep(1);

      setAttempt(null);

      setPhotoId("");

      setLocation(null);

      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(
        (current) =>
          current > 0
            ? current - 1
            : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    attempt,
    remainingSeconds,
  ]);


  /*
   * ---------------------------------------------------------
   * PHOTO CAMERA
   * ---------------------------------------------------------
   */

  const startPhotoCamera = async () => {
    setError("");
    setMessage("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "user",
            },

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },

          audio: false,
        });

      photoStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();
      }

      setCameraRunning(true);
    } catch (err) {
      console.error(
        "Photo camera error:",
        err
      );

      setError(
        "Unable to open camera. Please allow camera permission."
      );
    }
  };


  /*
   * ---------------------------------------------------------
   * STOP PHOTO CAMERA
   * ---------------------------------------------------------
   */

  const stopCamera = () => {
    if (photoStreamRef.current) {
      photoStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    photoStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraRunning(false);
  };


  /*
   * ---------------------------------------------------------
   * CAPTURE PHOTO
   * ---------------------------------------------------------
   */

  const capturePhoto = async () => {
    if (!videoRef.current) {
      setError(
        "Camera is not ready."
      );

      return;
    }

    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!canvas) {
      setError(
        "Unable to capture photo."
      );

      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError(
        "Camera is not ready yet. Please try again."
      );

      return;
    }

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError(
            "Unable to create photo."
          );

          return;
        }

        const previewUrl =
          URL.createObjectURL(blob);

        setPhotoPreview(
          previewUrl
        );

        stopCamera();

        await uploadPhoto(blob);
      },
      "image/jpeg",
      0.9
    );
  };


  /*
   * ---------------------------------------------------------
   * UPLOAD PHOTO TO MEDIA SERVICE
   * ---------------------------------------------------------
   */

  const uploadPhoto = async (blob) => {
    if (!attempt) {
      setError(
        "Attendance attempt is missing."
      );

      return;
    }

    setUploadingPhoto(true);

    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "attemptId",
        attempt.attemptId
      );

      formData.append(
        "completionToken",
        attempt.completionToken
      );

      formData.append(
        "photo",
        blob,
        `attendance-${Date.now()}.jpg`
      );

      const response =
        await api.post(
          "/api/media/employee/attendance-photo",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const media =
        response.data;

      setPhotoId(
        media.mediaId
      );

      setUploadingPhoto(false);

      setMessage(
        "Photo captured successfully."
      );

      /*
       * Photo done -> location.
       */
      setStep(4);
    } catch (err) {
      console.error(
        "Photo upload failed:",
        err
      );

      setUploadingPhoto(false);

      setError(
        getErrorMessage(err)
      );
    }
  };


  /*
   * ---------------------------------------------------------
   * LOCATION
   * ---------------------------------------------------------
   */

  const getLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords =
          position.coords;

        setLocation({
          latitude:
            coords.latitude,

          longitude:
            coords.longitude,

          accuracy:
            coords.accuracy,
        });

        setStep(5);

        setMessage(
          "Location verified successfully."
        );
      },

      (err) => {
        console.error(
          "Location error:",
          err
        );

        setError(
          "Location permission is required to complete attendance."
        );
      },

      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,
      }
    );
  };


  /*
   * ---------------------------------------------------------
   * COMPLETE ATTENDANCE
   * ---------------------------------------------------------
   */

  const completeAttendance =
    async () => {
      if (!attempt) {
        setError(
          "Attendance attempt is missing."
        );

        return;
      }

      if (!photoId) {
        setError(
          "Attendance photo is missing."
        );

        return;
      }

      if (!location) {
        setError(
          "Attendance location is missing."
        );

        return;
      }

      setCompleting(true);

      setError("");

      try {
        await completeAttendanceScan({
          attemptId:
            attempt.attemptId,

          completionToken:
            attempt.completionToken,

          photoId,

          latitude:
            location.latitude,

          longitude:
            location.longitude,

          accuracyMeters:
            location.accuracy,

          clientCapturedAt:
            new Date().toISOString(),
        });

        setCompleting(false);

        setStep(6);

        setRemainingSeconds(null);

        setMessage(
          "Attendance completed successfully."
        );
      } catch (err) {
        console.error(
          "Attendance completion failed:",
          err
        );

        setCompleting(false);

        setError(
          getErrorMessage(err)
        );
      }
    };


  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  const resetFlow = async () => {
    await stopQrScanner();

    stopCamera();

    if (photoPreview) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    setStep(1);

    setQrValue("");

    setAttempt(null);

    setPhotoId("");

    setPhotoPreview("");

    setLocation(null);

    setMessage("");

    setError("");

    setRemainingSeconds(null);

    scanLockedRef.current = false;
  };


  /*
   * ---------------------------------------------------------
   * START QR CAMERA WHEN STEP 1
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (step !== 1) {
      stopQrScanner();

      return;
    }

    const timer = setTimeout(() => {
      startQrScanner();
    }, 300);

    return () => {
      clearTimeout(timer);

      stopQrScanner();
    };
  }, [
    step,
    startQrScanner,
    stopQrScanner,
  ]);


  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      stopQrScanner();

      stopCamera();

      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }
    };
  }, []);


  /*
   * ---------------------------------------------------------
   * TIMER DISPLAY
   * ---------------------------------------------------------
   */

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const mins =
      Math.floor(seconds / 60);

    const secs =
      seconds % 60;

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };


  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div>
      <PageHeader
        eyebrow="ATTENDANCE"
        title="Mark attendance"
        description="Scan your employee QR, capture a live photo and verify your location."
      />

      {/* STEP INDICATOR */}

      <div className="flow-steps">
        {[
          "Scan QR",
          "Verify",
          "Photo",
          "Location",
          "Complete",
        ].map(
          (label, index) => {
            const number =
              index + 1;

            const displayNumber =
              number === 5
                ? 5
                : number;

            const status =
              step === number
                ? "active"
                : step > number
                ? "done"
                : "";

            return (
              <div
                className={`flow-step ${status}`}
                key={label}
              >
                <span>
                  {step > number ? (
                    <CheckCircle2
                      size={15}
                    />
                  ) : (
                    displayNumber
                  )}
                </span>

                {label}
              </div>
            );
          }
        )}
      </div>


      <section className="panel scanner-panel">

        {/* =========================================
            STEP 1 — QR SCANNER
        ========================================== */}

        {step === 1 && (
          <div className="attendance-step">

            <div className="scanner-header">
              <div>
                <div className="eyebrow">
                  STEP 1
                </div>

                <h2>
                  Scan employee QR
                </h2>

                <p>
                  Position the employee QR
                  code inside the scanning
                  frame.
                </p>
              </div>

              <QrCode
                size={32}
              />
            </div>


            <div className="attendance-qr-scanner">

              <div
                id="attendance-qr-reader"
                className="qr-reader"
              />

              {!scannerRunning && (
                <div className="scanner-overlay">

                  <ScanLine
                    size={52}
                  />

                  <strong>
                    Starting camera...
                  </strong>

                  <span>
                    Please allow camera
                    access.
                  </span>

                </div>
              )}

            </div>


            <div className="scanner-status">

              <span
                className={
                  scannerRunning
                    ? "status-dot online"
                    : "status-dot"
                }
              />

              {scannerRunning
                ? "Camera active — scanning for QR code"
                : "Camera starting..."}

            </div>


            <div className="scanner-divider">
              <span>
                OR
              </span>
            </div>


            <div className="form-field">

              <label>
                QR value
                <small>
                  Optional testing fallback
                </small>
              </label>

              <div className="input-wrapper">

                <QrCode
                  size={18}
                />

                <input
                  value={qrValue}
                  onChange={(event) =>
                    setQrValue(
                      event.target.value
                    )
                  }
                  placeholder="Paste QR value only for testing"
                />

              </div>

            </div>


            <button
              className="primary-btn full"
              onClick={() =>
                handleQrSubmit()
              }
            >
              Verify QR

              <QrCode
                size={17}
              />
            </button>


            {error && (
              <div className="error-box">
                <XCircle
                  size={18}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

          </div>
        )}


        {/* =========================================
            STEP 2 — VERIFIED
        ========================================== */}

        {step === 2 && (
          <div className="verify-card">

            <div className="success-icon">
              <ShieldCheck />
            </div>

            <div className="eyebrow">
              EMPLOYEE VERIFIED
            </div>

            <h2>
              Employee verified
            </h2>

            <p>
              The employee QR code has
              been successfully validated.
            </p>


            {attempt && (
              <div className="verify-grid">

                <div>
                  <span>
                    Employee
                  </span>

                  <strong>
                    {attempt.employeeName ||
                      "Employee"}
                  </strong>
                </div>


                <div>
                  <span>
                    Employee Code
                  </span>

                  <strong>
                    {attempt.employeeCode ||
                      "-"}
                  </strong>
                </div>


                <div>
                  <span>
                    Shift
                  </span>

                  <strong>
                    {attempt.shiftName ||
                      "-"}
                  </strong>
                </div>


                <div>
                  <span>
                    Action
                  </span>

                  <strong>
                    {attempt.action ||
                      "-"}
                  </strong>
                </div>

              </div>
            )}


            <button
              className="primary-btn full"
              onClick={() =>
                setStep(3)
              }
            >
              Continue

              <Camera
                size={17}
              />
            </button>

          </div>
        )}


        {/* =========================================
            STEP 3 — PHOTO
        ========================================== */}

        {step === 3 && (
          <div className="attendance-step">

            <div className="attendance-step-top">

              <div>
                <div className="eyebrow">
                  STEP 3 — LIVE PHOTO
                </div>

                <h2>
                  Capture attendance photo
                </h2>

                <p>
                  Take a live photo before
                  the attendance attempt
                  expires.
                </p>
              </div>


              {remainingSeconds !== null && (
                <div
                  className={`attempt-timer ${
                    remainingSeconds <= 10
                      ? "danger"
                      : ""
                  }`}
                >
                  <Clock3
                    size={17}
                  />

                  {formatTime(
                    remainingSeconds
                  )}
                </div>
              )}

            </div>


            <div className="photo-camera">

              {cameraRunning ? (
                <video
                  ref={videoRef}
                  className="camera-video"
                  autoPlay
                  playsInline
                  muted
                />
              ) : photoPreview ? (
                <img
                  src={photoPreview}
                  className="camera-video"
                  alt="Captured attendance"
                />
              ) : (
                <div className="camera-placeholder">

                  <Camera
                    size={52}
                  />

                  <strong>
                    Camera ready
                  </strong>

                  <span>
                    Click start camera
                    to continue.
                  </span>

                </div>
              )}

              <div className="camera-frame-overlay" />

            </div>


            <canvas
              ref={canvasRef}
              style={{
                display: "none",
              }}
            />


            {!cameraRunning &&
              !photoPreview && (
                <button
                  className="primary-btn full"
                  onClick={
                    startPhotoCamera
                  }
                >
                  Start camera

                  <Camera
                    size={17}
                  />
                </button>
              )}


            {cameraRunning && (
              <button
                className="primary-btn full"
                onClick={
                  capturePhoto
                }
                disabled={
                  uploadingPhoto
                }
              >
                {uploadingPhoto
                  ? "Uploading..."
                  : "Capture photo"}

                <Camera
                  size={17}
                />
              </button>
            )}


            {photoPreview &&
              !uploadingPhoto &&
              !photoId && (
                <button
                  className="secondary-btn full"
                  onClick={() => {
                    setPhotoPreview(
                      ""
                    );

                    startPhotoCamera();
                  }}
                >
                  <RotateCcw
                    size={17}
                  />

                  Retake photo
                </button>
              )}


            {uploadingPhoto && (
              <div className="info-box">
                <Upload
                  size={18}
                />

                Uploading photo securely...
              </div>
            )}


            {photoId && (
              <div className="success-box">
                <CheckCircle2
                  size={18}
                />

                Photo uploaded successfully.
              </div>
            )}


            {error && (
              <div className="error-box">
                <XCircle
                  size={18}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

          </div>
        )}


        {/* =========================================
            STEP 4 — LOCATION
        ========================================== */}

        {step === 4 && (
          <div className="verify-card">

            <div className="location-icon">
              <MapPin />
            </div>

            <div className="eyebrow">
              STEP 4 — LOCATION
            </div>

            <h2>
              Verify your location
            </h2>

            <p>
              Allow location access so
              the backend can verify where
              the attendance was recorded.
            </p>


            {remainingSeconds !== null && (
              <div
                className={`attempt-timer ${
                  remainingSeconds <= 10
                    ? "danger"
                    : ""
                }`}
              >
                <Clock3
                  size={17}
                />

                Attempt expires in{" "}
                {formatTime(
                  remainingSeconds
                )}
              </div>
            )}


            <button
              className="primary-btn full"
              onClick={
                getLocation
              }
            >
              <Crosshair
                size={17}
              />

              Get current location
            </button>


            {error && (
              <div className="error-box">
                <XCircle
                  size={18}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

          </div>
        )}


        {/* =========================================
            STEP 5 — REVIEW
        ========================================== */}

        {step === 5 && (
          <div className="verify-card">

            <div className="success-icon">
              <CheckCircle2 />
            </div>

            <div className="eyebrow">
              READY TO COMPLETE
            </div>

            <h2>
              Attendance verification ready
            </h2>

            <p>
              Review the verification
              details and complete your
              attendance.
            </p>


            <div className="verification-summary">

              <div className="summary-row">

                <span>
                  QR verification
                </span>

                <strong>
                  <CheckCircle2
                    size={16}
                  />

                  Verified
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Live photo
                </span>

                <strong>
                  <CheckCircle2
                    size={16}
                  />

                  Uploaded
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Location
                </span>

                <strong>
                  <CheckCircle2
                    size={16}
                  />

                  Verified
                </strong>

              </div>

            </div>


            {location && (
              <div className="location-data">

                <MapPin
                  size={15}
                />

                <span>
                  {location.latitude.toFixed(
                    6
                  )}

                  {" · "}

                  {location.longitude.toFixed(
                    6
                  )}

                  {" · ±"}

                  {Math.round(
                    location.accuracy
                  )}

                  m
                </span>

              </div>
            )}


            {remainingSeconds !== null && (
              <div
                className={`attempt-timer ${
                  remainingSeconds <= 10
                    ? "danger"
                    : ""
                }`}
              >
                <Clock3
                  size={17}
                />

                {formatTime(
                  remainingSeconds
                )}
              </div>
            )}


            <button
              className="primary-btn full"
              onClick={
                completeAttendance
              }
              disabled={completing}
            >
              {completing
                ? "Completing..."
                : "Complete attendance"}

              <CheckCircle2
                size={17}
              />
            </button>


            {error && (
              <div className="error-box">
                <XCircle
                  size={18}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

          </div>
        )}


        {/* =========================================
            STEP 6 — COMPLETE
        ========================================== */}

        {step === 6 && (
          <div className="verify-card">

            <div className="success-icon">
              <CheckCircle2 />
            </div>

            <div className="eyebrow">
              ATTENDANCE COMPLETED
            </div>

            <h2>
              Attendance marked successfully
            </h2>

            <p>
              Your attendance has been
              recorded successfully.
            </p>


            <div className="success-box">
              <CheckCircle2
                size={18}
              />

              Attendance recorded
              successfully.
            </div>


            <button
              className="primary-btn full"
              onClick={
                resetFlow
              }
            >
              Mark another attendance

              <RotateCcw
                size={17}
              />
            </button>

          </div>
        )}


        {message &&
          step !== 1 && (
            <div className="info-box">
              {message}
            </div>
          )}

      </section>
    </div>
  );
}


export default Attendance;