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
  Play,
  Square,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { BrowserQRCodeReader } from "@zxing/browser";

import PageHeader from "../../components/common/PageHeader";

import {
  startAttendanceScan,
  completeAttendanceScan,
} from "../../api/attendanceApi";

import api from "../../api/client";

import "./attendance.css";


function Attendance() {
  /* =========================================================
     FLOW
     ========================================================= */

  const [step, setStep] = useState(1);

  /*
    1 = Scan QR
    2 = Verify
    3 = Photo
    4 = Location
    5 = Complete
    6 = Success
  */


  /* =========================================================
     QR STATE
     ========================================================= */

  const [qrValue, setQrValue] = useState("");

  const [scannerRunning, setScannerRunning] =
    useState(false);

  const [scannerStarting, setScannerStarting] =
    useState(false);


  /* =========================================================
     ATTENDANCE ATTEMPT
     ========================================================= */

  const [attempt, setAttempt] = useState(null);

  const [remainingSeconds, setRemainingSeconds] =
    useState(null);


  /* =========================================================
     PHOTO
     ========================================================= */

  const [cameraRunning, setCameraRunning] =
    useState(false);

  const [cameraStarting, setCameraStarting] =
    useState(false);

  const [photoId, setPhotoId] =
    useState("");

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);


  /* =========================================================
     LOCATION
     ========================================================= */

  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);


  /* =========================================================
     COMPLETION
     ========================================================= */

  const [completing, setCompleting] =
    useState(false);


  /* =========================================================
     MESSAGES
     ========================================================= */

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /* =========================================================
     REFS
     ========================================================= */

  const qrVideoRef =
    useRef(null);

  const qrReaderRef =
    useRef(null);

  const qrControlsRef =
    useRef(null);

  const qrLockedRef =
    useRef(false);

  const photoVideoRef =
    useRef(null);

  const photoStreamRef =
    useRef(null);

  const canvasRef =
    useRef(null);


  /* =========================================================
     ERROR MESSAGE
     ========================================================= */

  const getErrorMessage = useCallback(
    (err) => {
      return (
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        "Something went wrong. Please try again."
      );
    },
    []
  );


  /* =========================================================
     STOP QR CAMERA
     ========================================================= */

  const stopQrScanner = useCallback(() => {
    try {
      if (qrControlsRef.current) {
        qrControlsRef.current.stop();
      }
    } catch (err) {
      console.warn(
        "Unable to stop QR controls:",
        err
      );
    }

    qrControlsRef.current = null;

    try {
      if (qrReaderRef.current) {
        qrReaderRef.current.reset();
      }
    } catch (err) {
      console.warn(
        "Unable to reset QR reader:",
        err
      );
    }

    qrReaderRef.current = null;

    if (qrVideoRef.current) {
      const video =
        qrVideoRef.current;

      if (video.srcObject) {
        const stream =
          video.srcObject;

        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      video.pause();

      video.srcObject = null;
    }

    setScannerRunning(false);
    setScannerStarting(false);
  }, []);


  /* =========================================================
     START QR SCANNER
     ========================================================= */

  const startQrScanner = useCallback(
    async () => {
      if (scannerStarting) {
        return;
      }

      setError("");
      setMessage("");

      qrLockedRef.current = false;

      setScannerStarting(true);

      try {
        stopQrScanner();

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            "Camera access is not supported by this browser."
          );
        }

        /*
         * Create a fresh QR reader.
         */
        const reader =
          new BrowserQRCodeReader();

        qrReaderRef.current = reader;

        /*
         * Use environment/rear camera where possible.
         *
         * IMPORTANT:
         * We use "ideal", not "exact".
         *
         * "exact: environment" was one of
         * the reasons your previous implementation
         * could fail on Chrome/devices.
         */
        const constraints = {
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
        };

        /*
         * Start decoding directly from the video element.
         */
        const controls =
          await reader.decodeFromConstraints(
            constraints,
            qrVideoRef.current,
            async (result, decodeError) => {
              if (!result) {
                /*
                 * Normal QR decode failures happen
                 * continuously while scanning.
                 *
                 * Do not display them.
                 */
                return;
              }

              if (
                qrLockedRef.current
              ) {
                return;
              }

              qrLockedRef.current = true;

              const decodedText =
                result
                  .getText()
                  ?.trim();

              if (!decodedText) {
                qrLockedRef.current =
                  false;

                return;
              }

              console.log(
                "QR detected:",
                decodedText
              );

              setQrValue(
                decodedText
              );

              stopQrScanner();

              await handleQrSubmit(
                decodedText
              );
            }
          );

        qrControlsRef.current =
          controls;

        setScannerRunning(true);

        setScannerStarting(false);
      } catch (err) {
        console.error(
          "QR scanner start failed:",
          err
        );

        stopQrScanner();

        setError(
          getCameraErrorMessage(
            err
          )
        );

        setScannerStarting(false);
      }
    },
    [
      scannerStarting,
      stopQrScanner,
    ]
  );


  /* =========================================================
     CAMERA ERROR MESSAGE
     ========================================================= */

  const getCameraErrorMessage =
    (err) => {
      const name =
        err?.name;

      if (
        name ===
        "NotAllowedError"
      ) {
        return (
          "Camera permission was denied. Please click the camera icon in Chrome's address bar, allow Camera access for localhost, and try again."
        );
      }

      if (
        name ===
        "NotFoundError"
      ) {
        return (
          "No camera was found on this device."
        );
      }

      if (
        name ===
        "NotReadableError"
      ) {
        return (
          "The camera is already being used by another application or browser tab."
        );
      }

      if (
        name ===
        "OverconstrainedError"
      ) {
        return (
          "The selected camera does not support the requested settings. Please try again."
        );
      }

      if (
        name ===
        "SecurityError"
      ) {
        return (
          "The browser blocked camera access for security reasons."
        );
      }

      return (
        err?.message ||
        "Unable to access the camera. Please check camera permission and try again."
      );
    };


  /* =========================================================
     SUBMIT QR TO BACKEND
     ========================================================= */

  const handleQrSubmit =
    async (value = qrValue) => {
      const finalQrValue =
        value?.trim();

      if (!finalQrValue) {
        setError(
          "Please scan the employee QR code."
        );

        qrLockedRef.current =
          false;

        return;
      }

      setError("");

      setMessage(
        "QR detected. Verifying employee..."
      );

      try {
        const response =
          await startAttendanceScan({
            qrValue:
              finalQrValue,
          });

        const data =
          response.data;

        console.log(
          "Attendance scan response:",
          data
        );

        setAttempt(data);

        /*
         * Backend controls the actual TTL.
         */
        const ttl =
          Number(
            data?.expiresInSeconds
          );

        setRemainingSeconds(
          Number.isFinite(ttl) &&
            ttl > 0
            ? ttl
            : 60
        );

        setMessage("");

        /*
         * The backend may tell us whether
         * photo/location are required.
         *
         * Normally your attendance flow is:
         *
         * QR -> Photo -> Location -> Complete
         */

        if (
          data?.photoRequired ===
          false
        ) {
          if (
            data?.locationRequired ===
            false
          ) {
            setStep(5);
          } else {
            setStep(4);
          }
        } else {
          setStep(3);
        }
      } catch (err) {
        console.error(
          "Attendance scan failed:",
          err
        );

        setMessage("");

        setError(
          getErrorMessage(err)
        );

        qrLockedRef.current =
          false;

        /*
         * Do NOT automatically restart
         * the camera.
         *
         * Let the user click
         * "Start QR Scanner".
         */
      }
    };


  /* =========================================================
     COUNTDOWN
     ========================================================= */

  useEffect(() => {
    if (
      !attempt ||
      remainingSeconds === null
    ) {
      return;
    }

    if (
      remainingSeconds <= 0
    ) {
      setError(
        "The attendance attempt has expired. Please scan the employee QR code again."
      );

      stopPhotoCamera();

      setAttempt(null);

      setQrValue("");

      setPhotoId("");

      setPhotoPreview("");

      setLocation(null);

      setRemainingSeconds(null);

      setStep(1);

      return;
    }

    const timer =
      window.setInterval(() => {
        setRemainingSeconds(
          (current) => {
            if (
              current === null
            ) {
              return null;
            }

            return current > 0
              ? current - 1
              : 0;
          }
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    attempt,
    remainingSeconds,
  ]);


  /* =========================================================
     START PHOTO CAMERA
     ========================================================= */

  const startPhotoCamera =
    async () => {
      if (cameraStarting) {
        return;
      }

      setError("");
      setMessage("");

      setCameraStarting(true);

      try {
        stopPhotoCamera();

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          throw new Error(
            "Camera access is not supported by this browser."
          );
        }

        /*
         * Front/user-facing camera.
         */
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: false,

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
            }
          );

        photoStreamRef.current =
          stream;

        const video =
          photoVideoRef.current;

        if (!video) {
          throw new Error(
            "Photo camera element is not ready."
          );
        }

        video.srcObject =
          stream;

        video.muted = true;

        video.playsInline = true;

        await video.play();

        setCameraRunning(true);

        setCameraStarting(false);
      } catch (err) {
        console.error(
          "Photo camera error:",
          err
        );

        stopPhotoCamera();

        setError(
          getCameraErrorMessage(
            err
          )
        );

        setCameraStarting(false);
      }
    };


  /* =========================================================
     STOP PHOTO CAMERA
     ========================================================= */

  const stopPhotoCamera =
    () => {
      try {
        if (
          photoStreamRef.current
        ) {
          photoStreamRef.current
            .getTracks()
            .forEach(
              (track) => {
                track.stop();
              }
            );
        }
      } catch (err) {
        console.warn(
          "Unable to stop photo camera:",
          err
        );
      }

      photoStreamRef.current =
        null;

      if (
        photoVideoRef.current
      ) {
        const video =
          photoVideoRef.current;

        video.pause();

        video.srcObject = null;
      }

      setCameraRunning(false);
      setCameraStarting(false);
    };


  /* =========================================================
     CAPTURE PHOTO
     ========================================================= */

  const capturePhoto =
    async () => {
      if (!cameraRunning) {
        setError(
          "Please start the camera first."
        );

        return;
      }

      const video =
        photoVideoRef.current;

      const canvas =
        canvasRef.current;

      if (!video || !canvas) {
        setError(
          "Camera is not ready."
        );

        return;
      }

      if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        setError(
          "Camera is still starting. Please wait a moment and try again."
        );

        return;
      }

      if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        setError(
          "Camera image is not available yet. Please try again."
        );

        return;
      }

      setError("");

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        setError(
          "Unable to prepare photo capture."
        );

        return;
      }

      /*
       * Since the preview is mirrored,
       * mirror the captured image as well.
       */
      context.save();

      context.translate(
        canvas.width,
        0
      );

      context.scale(-1, 1);

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.restore();

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setError(
              "Unable to create photo."
            );

            return;
          }

          const previewUrl =
            URL.createObjectURL(
              blob
            );

          if (photoPreview) {
            URL.revokeObjectURL(
              photoPreview
            );
          }

          setPhotoPreview(
            previewUrl
          );

          stopPhotoCamera();

          await uploadPhoto(
            blob
          );
        },
        "image/jpeg",
        0.9
      );
    };


  /* =========================================================
     UPLOAD PHOTO
     ========================================================= */

  const uploadPhoto =
    async (blob) => {
      if (!attempt) {
        setError(
          "Attendance attempt is missing."
        );

        return;
      }

      if (
        !attempt.attemptId
      ) {
        setError(
          "Attendance attempt ID is missing."
        );

        return;
      }

      if (
        !attempt.completionToken
      ) {
        setError(
          "Attendance completion token is missing."
        );

        return;
      }

      setUploadingPhoto(true);

      setError("");

      setMessage(
        "Uploading attendance photo..."
      );

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

        /*
         * IMPORTANT:
         *
         * Do not manually set Content-Type.
         *
         * Axios/browser will add the correct
         * multipart boundary automatically.
         */
        const response =
          await api.post(
            "/api/media/employee/attendance-photo",
            formData
          );

        console.log(
          "Photo upload response:",
          response.data
        );

        const media =
          response.data || {};

        const returnedPhotoId =
          media.mediaId ||
          media.id ||
          media.photoId;

        if (!returnedPhotoId) {
          throw new Error(
            "Photo upload succeeded but media ID was not returned by the media service."
          );
        }

        setPhotoId(
          returnedPhotoId
        );

        setUploadingPhoto(
          false
        );

        setMessage(
          "Photo captured successfully."
        );

        /*
         * If location is not required,
         * go directly to completion.
         */
        if (
          attempt.locationRequired ===
          false
        ) {
          setStep(5);
        } else {
          setStep(4);
        }
      } catch (err) {
        console.error(
          "Photo upload failed:",
          err
        );

        setUploadingPhoto(
          false
        );

        setMessage("");

        setError(
          getErrorMessage(err)
        );
      }
    };


  /* =========================================================
     RETAKE PHOTO
     ========================================================= */

  const retakePhoto =
    () => {
      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

      setPhotoPreview("");

      setPhotoId("");

      setMessage("");

      setError("");

      startPhotoCamera();
    };


  /* =========================================================
     GET LOCATION
     ========================================================= */

  const getLocation =
    () => {
      setError("");

      setMessage("");

      if (!navigator.geolocation) {
        setError(
          "Geolocation is not supported by this browser."
        );

        return;
      }

      setLocationLoading(
        true
      );

      setMessage(
        "Getting your current location..."
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords =
            position.coords;

          const nextLocation =
            {
              latitude:
                coords.latitude,

              longitude:
                coords.longitude,

              accuracy:
                coords.accuracy,
            };

          console.log(
            "Attendance location:",
            nextLocation
          );

          setLocation(
            nextLocation
          );

          setLocationLoading(
            false
          );

          setMessage(
            "Location verified successfully."
          );

          setStep(5);
        },

        (err) => {
          console.error(
            "Location error:",
            err
          );

          setLocationLoading(
            false
          );

          setMessage("");

          if (
            err.code ===
            1
          ) {
            setError(
              "Location permission was denied. Please allow location access for localhost and try again."
            );
          } else if (
            err.code ===
            2
          ) {
            setError(
              "Your current location could not be determined. Please try again."
            );
          } else if (
            err.code ===
            3
          ) {
            setError(
              "Location request timed out. Please try again."
            );
          } else {
            setError(
              "Unable to get your current location."
            );
          }
        },

        {
          enableHighAccuracy:
            true,

          timeout: 15000,

          maximumAge: 0,
        }
      );
    };


  /* =========================================================
     COMPLETE ATTENDANCE
     ========================================================= */

  const completeAttendance =
    async () => {
      if (!attempt) {
        setError(
          "Attendance attempt is missing."
        );

        return;
      }

      if (
        attempt.photoRequired !==
          false &&
        !photoId
      ) {
        setError(
          "Attendance photo is missing."
        );

        return;
      }

      if (
        attempt.locationRequired !==
          false &&
        !location
      ) {
        setError(
          "Attendance location is missing."
        );

        return;
      }

      setCompleting(true);

      setError("");

      setMessage(
        "Completing attendance..."
      );

      try {
        const payload = {
          attemptId:
            attempt.attemptId,

          completionToken:
            attempt.completionToken,

          clientCapturedAt:
            new Date().toISOString(),
        };

        /*
         * Add photo only when we have one.
         */
        if (photoId) {
          payload.photoId =
            photoId;
        }

        /*
         * Add location only when available.
         */
        if (location) {
          payload.latitude =
            location.latitude;

          payload.longitude =
            location.longitude;

          payload.accuracyMeters =
            location.accuracy;
        }

        console.log(
          "Completing attendance:",
          payload
        );

        await completeAttendanceScan(
          payload
        );

        setCompleting(false);

        setRemainingSeconds(
          null
        );

        setMessage(
          "Attendance completed successfully."
        );

        setStep(6);
      } catch (err) {
        console.error(
          "Attendance completion failed:",
          err
        );

        setCompleting(false);

        setMessage("");

        setError(
          getErrorMessage(err)
        );
      }
    };


  /* =========================================================
     RESET FLOW
     ========================================================= */

  const resetFlow =
    async () => {
      stopQrScanner();

      stopPhotoCamera();

      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

      qrLockedRef.current =
        false;

      setStep(1);

      setQrValue("");

      setAttempt(null);

      setRemainingSeconds(
        null
      );

      setPhotoId("");

      setPhotoPreview("");

      setLocation(null);

      setMessage("");

      setError("");

      setScannerRunning(
        false
      );

      setCameraRunning(
        false
      );
    };


  /* =========================================================
     CLEANUP
     ========================================================= */

  useEffect(() => {
    return () => {
      stopQrScanner();

      stopPhotoCamera();

      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }
    };
  }, [
    stopQrScanner,
  ]);


  /* =========================================================
     STEP DATA
     ========================================================= */

  const steps = [
    {
      number: 1,
      label: "Scan QR",
    },
    {
      number: 2,
      label: "Verify",
    },
    {
      number: 3,
      label: "Photo",
    },
    {
      number: 4,
      label: "Location",
    },
    {
      number: 5,
      label: "Complete",
    },
  ];


  /* =========================================================
     FLOW STEP STATUS
     ========================================================= */

  const getStepClass =
    (number) => {
      if (step === 6) {
        return "done";
      }

      if (number < step) {
        return "done";
      }

      if (number === step) {
        return "current";
      }

      return "";
    };


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="attendance-page">

      <PageHeader
        eyebrow="ATTENDANCE"
        title="Mark attendance"
        description="Scan your employee QR, capture a live photo and verify your location."
      />


      {/* =====================================================
          FLOW
          ===================================================== */}

      <div className="attendance-flow">

        {steps.map(
          (item) => (
            <div
              key={item.number}
              className={`attendance-flow-step ${getStepClass(
                item.number
              )}`}
            >
              <div className="attendance-flow-number">
                {item.number}
              </div>

              <span>
                {item.label}
              </span>
            </div>
          )
        )}

      </div>


      {/* =====================================================
          MAIN PANEL
          ===================================================== */}

      <div className="attendance-panel">


        {/* ===================================================
            STEP 1 — QR
            =================================================== */}

        {step === 1 && (
          <div className="attendance-card">

            <div className="attendance-card-header">

              <div className="attendance-icon blue">
                <QrCode
                  size={24}
                />
              </div>

              <div>
                <div className="attendance-eyebrow">
                  STEP 1
                </div>

                <h2>
                  Scan employee QR
                </h2>

                <p>
                  Position the employee QR code inside the scanning frame.
                </p>
              </div>

            </div>


            {/* QR CAMERA */}

            <div className="qr-scanner-wrapper">

              <video
                ref={
                  qrVideoRef
                }
                className="attendance-qr-video"
                muted
                playsInline
              />

              {!scannerRunning &&
                !scannerStarting && (
                  <div className="scanner-empty">

                    <QrCode
                      size={52}
                    />

                    <strong>
                      Camera is ready
                    </strong>

                    <span>
                      Click the button below to start QR scanning.
                    </span>

                  </div>
                )}


              {scannerStarting && (
                <div className="scanner-loading">

                  <ScanLine
                    size={42}
                  />

                  <strong>
                    Starting camera...
                  </strong>

                  <span>
                    Please allow camera access.
                  </span>

                </div>
              )}


              {scannerRunning && (
                <div className="qr-frame">

                  <div className="qr-corner top-left" />
                  <div className="qr-corner top-right" />
                  <div className="qr-corner bottom-left" />
                  <div className="qr-corner bottom-right" />

                  <div className="qr-scan-line" />

                </div>
              )}

            </div>


            {/* QR STATUS */}

            {scannerRunning && (
              <div className="attendance-info">

                <ScanLine
                  size={16}
                />

                <span>
                  Scanning for employee QR...
                </span>

              </div>
            )}


            {/* BUTTONS */}

            <div className="attendance-actions">

              {!scannerRunning &&
                !scannerStarting && (
                  <button
                    type="button"
                    className="attendance-btn primary full"
                    onClick={
                      startQrScanner
                    }
                  >
                    <Play
                      size={17}
                    />

                    Start QR Scanner
                  </button>
                )}


              {scannerStarting && (
                <button
                  type="button"
                  className="attendance-btn secondary full"
                  disabled
                >
                  Starting camera...
                </button>
              )}


              {scannerRunning && (
                <button
                  type="button"
                  className="attendance-btn secondary full"
                  onClick={
                    stopQrScanner
                  }
                >
                  <Square
                    size={16}
                  />

                  Stop Scanner
                </button>
              )}

            </div>


            {/* OPTIONAL TEST INPUT */}

            <details className="attendance-test">

              <summary>
                Testing fallback
              </summary>

              <div className="attendance-test-body">

                <label>
                  QR value
                </label>

                <input
                  type="text"
                  value={qrValue}
                  onChange={(event) =>
                    setQrValue(
                      event.target
                        .value
                    )
                  }
                  placeholder="Paste QR value only for testing"
                />

                <button
                  type="button"
                  className="attendance-btn secondary"
                  onClick={() =>
                    handleQrSubmit(
                      qrValue
                    )
                  }
                  disabled={
                    !qrValue.trim()
                  }
                >
                  Verify QR
                </button>

              </div>

            </details>

          </div>
        )}


        {/* ===================================================
            STEP 3 — PHOTO
            =================================================== */}

        {step === 3 && (
          <div className="attendance-card">

            <div className="attendance-card-header">

              <div className="attendance-icon purple">
                <Camera
                  size={24}
                />
              </div>

              <div>
                <div className="attendance-eyebrow">
                  STEP 3
                </div>

                <h2>
                  Capture live photo
                </h2>

                <p>
                  Take a live photo to verify that you are the employee marking attendance.
                </p>
              </div>

            </div>


            {/* COUNTDOWN */}

            {remainingSeconds !==
              null && (
              <div
                className={`attendance-countdown ${
                  remainingSeconds <=
                  15
                    ? "danger"
                    : ""
                }`}
              >

                <Clock3
                  size={16}
                />

                <span>
                  Attendance attempt expires in{" "}
                  <strong>
                    {remainingSeconds}s
                  </strong>
                </span>

              </div>
            )}


            {/* CAMERA */}

            <div className="attendance-camera">

              <video
                ref={
                  photoVideoRef
                }
                className="attendance-camera-video"
                muted
                playsInline
              />


              {!cameraRunning &&
                !photoPreview && (
                  <div className="camera-overlay">

                    <UserRound
                      size={48}
                    />

                    <strong>
                      Camera is not running
                    </strong>

                    <span>
                      Start the camera to capture your photo.
                    </span>

                  </div>
                )}


              {cameraRunning && (
                <div className="camera-face-guide">

                  <div className="face-oval" />

                  <span>
                    Position your face inside the frame
                  </span>

                </div>
              )}

            </div>


            {/* PREVIEW */}

            {photoPreview && (
              <div className="attendance-photo-preview">

                <img
                  src={
                    photoPreview
                  }
                  alt="Attendance preview"
                />

              </div>
            )}


            {/* PHOTO STATUS */}

            {uploadingPhoto && (
              <div className="attendance-info">

                <Upload
                  size={16}
                />

                <span>
                  Uploading photo...
                </span>

              </div>
            )}


            {/* ACTIONS */}

            <div className="attendance-actions">

              {!cameraRunning &&
                !photoPreview &&
                !uploadingPhoto && (
                  <button
                    type="button"
                    className="attendance-btn primary"
                    onClick={
                      startPhotoCamera
                    }
                  >
                    <Camera
                      size={17}
                    />

                    Start Camera
                  </button>
                )}


              {cameraRunning && (
                <>
                  <button
                    type="button"
                    className="attendance-btn secondary"
                    onClick={
                      stopPhotoCamera
                    }
                  >
                    <Square
                      size={16}
                    />

                    Stop Camera
                  </button>

                  <button
                    type="button"
                    className="attendance-btn primary"
                    onClick={
                      capturePhoto
                    }
                  >
                    <Camera
                      size={17}
                    />

                    Capture Photo
                  </button>
                </>
              )}


              {photoPreview &&
                !uploadingPhoto && (
                  <>
                    <button
                      type="button"
                      className="attendance-btn secondary"
                      onClick={
                        retakePhoto
                      }
                    >
                      <RotateCcw
                        size={16}
                      />

                      Retake
                    </button>
                  </>
                )}

            </div>


            <div className="attendance-help">

              <ShieldCheck
                size={15}
              />

              <span>
                Your photo is captured directly from your device camera.
              </span>

            </div>

          </div>
        )}


        {/* ===================================================
            STEP 4 — LOCATION
            =================================================== */}

        {step === 4 && (
          <div className="attendance-card">

            <div className="attendance-card-header">

              <div className="attendance-icon green">
                <MapPin
                  size={24}
                />
              </div>

              <div>
                <div className="attendance-eyebrow">
                  STEP 4
                </div>

                <h2>
                  Verify your location
                </h2>

                <p>
                  Allow location access so the attendance service can verify where attendance was marked.
                </p>
              </div>

            </div>


            {remainingSeconds !==
              null && (
              <div
                className={`attendance-countdown ${
                  remainingSeconds <=
                  15
                    ? "danger"
                    : ""
                }`}
              >

                <Clock3
                  size={16}
                />

                <span>
                  Attendance attempt expires in{" "}
                  <strong>
                    {remainingSeconds}s
                  </strong>
                </span>

              </div>
            )}


            <div className="location-verification">

              <div className="location-icon">

                <Crosshair
                  size={42}
                />

              </div>

              <h3>
                Get your current location
              </h3>

              <p>
                Your browser will ask for location permission. Please select Allow.
              </p>

            </div>


            {location && (
              <div className="attendance-location">

                <MapPin
                  size={22}
                />

                <div>

                  <strong>
                    Location captured
                  </strong>

                  <span>
                    Accuracy:{" "}
                    {Math.round(
                      location.accuracy
                    )}{" "}
                    meters
                  </span>

                </div>

              </div>
            )}


            <div className="attendance-actions">

              <button
                type="button"
                className="attendance-btn primary full"
                onClick={
                  getLocation
                }
                disabled={
                  locationLoading
                }
              >

                <MapPin
                  size={17}
                />

                {locationLoading
                  ? "Getting location..."
                  : "Allow & Verify Location"}

              </button>

            </div>

          </div>
        )}


        {/* ===================================================
            STEP 5 — COMPLETE
            =================================================== */}

        {step === 5 && (
          <div className="attendance-card">

            <div className="attendance-card-header">

              <div className="attendance-icon blue">
                <ShieldCheck
                  size={24}
                />
              </div>

              <div>
                <div className="attendance-eyebrow">
                  STEP 5
                </div>

                <h2>
                  Review attendance
                </h2>

                <p>
                  All required verification information has been collected.
                </p>
              </div>

            </div>


            {remainingSeconds !==
              null && (
              <div
                className={`attendance-countdown ${
                  remainingSeconds <=
                  15
                    ? "danger"
                    : ""
                }`}
              >

                <Clock3
                  size={16}
                />

                <span>
                  Attendance attempt expires in{" "}
                  <strong>
                    {remainingSeconds}s
                  </strong>
                </span>

              </div>
            )}


            <div className="attendance-review">

              <div className="review-item">

                <div className="review-icon green">
                  <QrCode
                    size={18}
                  />
                </div>

                <div>

                  <span>
                    Employee QR
                  </span>

                  <strong>
                    Verified
                  </strong>

                </div>

                <CheckCircle2
                  size={20}
                  className="review-check"
                />

              </div>


              {photoId && (
                <div className="review-item">

                  <div className="review-icon purple">
                    <Camera
                      size={18}
                    />
                  </div>

                  <div>

                    <span>
                      Live photo
                    </span>

                    <strong>
                      Captured
                    </strong>

                  </div>

                  <CheckCircle2
                    size={20}
                    className="review-check"
                  />

                </div>
              )}


              {location && (
                <div className="review-item">

                  <div className="review-icon green">
                    <MapPin
                      size={18}
                    />
                  </div>

                  <div>

                    <span>
                      Location
                    </span>

                    <strong>
                      Verified
                    </strong>

                  </div>

                  <CheckCircle2
                    size={20}
                    className="review-check"
                  />

                </div>
              )}

            </div>


            {photoPreview && (
              <div className="attendance-photo-preview small">

                <img
                  src={
                    photoPreview
                  }
                  alt="Captured attendance"
                />

              </div>
            )}


            <div className="attendance-actions">

              <button
                type="button"
                className="attendance-btn secondary"
                onClick={
                  resetFlow
                }
                disabled={
                  completing
                }
              >
                <RotateCcw
                  size={16}
                />

                Start Again
              </button>

              <button
                type="button"
                className="attendance-btn primary"
                onClick={
                  completeAttendance
                }
                disabled={
                  completing
                }
              >

                <CheckCircle2
                  size={17}
                />

                {completing
                  ? "Completing..."
                  : "Mark Attendance"}

              </button>

            </div>

          </div>
        )}


        {/* ===================================================
            STEP 6 — SUCCESS
            =================================================== */}

        {step === 6 && (
          <div className="attendance-card completed">

            <div className="attendance-success-icon">

              <CheckCircle2
                size={42}
              />

            </div>

            <div className="attendance-eyebrow center">
              ATTENDANCE RECORDED
            </div>

            <h2>
              Attendance completed
            </h2>

            <p>
              Your attendance has been successfully marked and verified.
            </p>


            <div className="success-summary">

              <div>

                <CheckCircle2
                  size={18}
                />

                <span>
                  QR verified
                </span>

              </div>


              {photoId && (
                <div>

                  <CheckCircle2
                    size={18}
                  />

                  <span>
                    Photo verified
                  </span>

                </div>
              )}


              {location && (
                <div>

                  <CheckCircle2
                    size={18}
                  />

                  <span>
                    Location verified
                  </span>

                </div>
              )}

            </div>


            <button
              type="button"
              className="attendance-btn primary"
              onClick={
                resetFlow
              }
            >

              <RotateCcw
                size={17}
              />

              Mark Another Attendance

            </button>

          </div>
        )}


        {/* ===================================================
            GLOBAL MESSAGE
            =================================================== */}

        {message && (
          <div className="attendance-info">

            <CheckCircle2
              size={16}
            />

            <span>
              {message}
            </span>

          </div>
        )}


        {error && (
          <div className="attendance-error">

            <XCircle
              size={17}
            />

            <span>
              {error}
            </span>

          </div>
        )}

      </div>

    </div>
  );
}


export default Attendance;