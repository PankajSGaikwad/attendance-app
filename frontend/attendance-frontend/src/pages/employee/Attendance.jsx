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
     PHOTO STATE
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
     CAMERA ERROR
     ========================================================= */

  const getCameraErrorMessage = useCallback(
    (err) => {
      const name = err?.name;

      if (name === "NotAllowedError") {
        return (
          "Camera permission was denied. Please allow camera access for localhost and try again."
        );
      }

      if (name === "NotFoundError") {
        return (
          "No camera was found on this device."
        );
      }

      if (name === "NotReadableError") {
        return (
          "The camera is already being used by another application or browser tab."
        );
      }

      if (name === "OverconstrainedError") {
        return (
          "The selected camera does not support the requested settings."
        );
      }

      if (name === "SecurityError") {
        return (
          "The browser blocked camera access for security reasons."
        );
      }

      return (
        err?.message ||
        "Unable to access the camera. Please check camera permission and try again."
      );
    },
    []
  );


  /* =========================================================
     STOP QR SCANNER
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

    /*
     * IMPORTANT:
     *
     * @zxing/browser reader does not always expose
     * reset() in the browser implementation.
     *
     * Therefore DO NOT call:
     *
     * qrReaderRef.current.reset()
     *
     * This removes the console error you were seeing.
     */

    qrReaderRef.current = null;

    if (qrVideoRef.current) {
      const video =
        qrVideoRef.current;

      try {
        video.pause();
      } catch {
        // ignore
      }

      if (video.srcObject) {
        const stream =
          video.srcObject;

        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      video.srcObject = null;
    }

    setScannerRunning(false);
    setScannerStarting(false);
  }, []);


  /* =========================================================
     STOP PHOTO CAMERA
     ========================================================= */

  const stopPhotoCamera = useCallback(() => {
    try {
      if (photoStreamRef.current) {
        photoStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }
    } catch (err) {
      console.warn(
        "Unable to stop photo camera:",
        err
      );
    }

    photoStreamRef.current = null;

    if (photoVideoRef.current) {
      const video =
        photoVideoRef.current;

      try {
        video.pause();
      } catch {
        // ignore
      }

      video.srcObject = null;
    }

    setCameraRunning(false);
    setCameraStarting(false);
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

        const video =
          qrVideoRef.current;

        if (!video) {
          throw new Error(
            "QR camera element is not ready."
          );
        }

        const reader =
          new BrowserQRCodeReader();

        qrReaderRef.current =
          reader;

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

        const controls =
          await reader.decodeFromConstraints(
            constraints,
            video,
            async (result) => {
              if (!result) {
                return;
              }

              if (qrLockedRef.current) {
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
          getCameraErrorMessage(err)
        );

        setScannerStarting(false);
      }
    },
    [
      scannerStarting,
      stopQrScanner,
      getCameraErrorMessage,
    ]
  );


  /* =========================================================
     SUBMIT QR
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
         * Backend controls TTL.
         *
         * Your backend response should normally
         * contain expiresInSeconds.
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
         * PHOTO REQUIRED
         */

        if (
          data?.photoRequired === false
        ) {
          /*
           * PHOTO NOT REQUIRED
           */

          if (
            data?.locationRequired === false
          ) {
            setStep(5);
          } else {
            setStep(4);
          }

          return;
        }

        /*
         * PHOTO REQUIRED
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

        qrLockedRef.current =
          false;
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

    if (remainingSeconds <= 0) {
      setError(
        "The attendance attempt has expired. Please scan the employee QR code again."
      );

      stopPhotoCamera();

      setAttempt(null);

      setQrValue("");

      setPhotoId("");

      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

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
    stopPhotoCamera,
    photoPreview,
  ]);


  /* =========================================================
     START PHOTO CAMERA
     ========================================================= */

  const startPhotoCamera =
    useCallback(
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
            !navigator.mediaDevices.getUserMedia
          ) {
            throw new Error(
              "Camera access is not supported by this browser."
            );
          }

          const video =
            photoVideoRef.current;

          if (!video) {
            throw new Error(
              "Photo camera element is not ready."
            );
          }

          /*
           * Front camera.
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

          video.srcObject =
            stream;

          video.muted = true;

          video.playsInline = true;

          video.autoplay = true;

          /*
           * Wait until browser has loaded
           * actual video metadata.
           */

          await new Promise(
            (resolve) => {
              if (
                video.readyState >=
                HTMLMediaElement.HAVE_METADATA
              ) {
                resolve();
                return;
              }

              const handleLoadedMetadata =
                () => {
                  video.removeEventListener(
                    "loadedmetadata",
                    handleLoadedMetadata
                  );

                  resolve();
                };

              video.addEventListener(
                "loadedmetadata",
                handleLoadedMetadata
              );
            }
          );

          await video.play();

          /*
           * Wait until actual video dimensions
           * are available.
           */

          await new Promise(
            (resolve) => {
              const checkVideo =
                () => {
                  if (
                    video.videoWidth > 0 &&
                    video.videoHeight > 0
                  ) {
                    resolve();
                    return;
                  }

                  window.requestAnimationFrame(
                    checkVideo
                  );
                };

              checkVideo();
            }
          );

          setCameraRunning(true);

          setCameraStarting(false);

          console.log(
            "Photo camera ready:",
            {
              width:
                video.videoWidth,

              height:
                video.videoHeight,
            }
          );
        } catch (err) {
          console.error(
            "Photo camera error:",
            err
          );

          stopPhotoCamera();

          setError(
            getCameraErrorMessage(err)
          );

          setCameraStarting(false);
        }
      },
      [
        cameraStarting,
        stopPhotoCamera,
        getCameraErrorMessage,
      ]
    );


  /* =========================================================
     AUTO START PHOTO CAMERA
     ========================================================= */

  useEffect(() => {
    if (
      step !== 3 ||
      photoPreview ||
      cameraRunning ||
      cameraStarting
    ) {
      return;
    }

    /*
     * Give React one render cycle so
     * photoVideoRef is attached to DOM.
     */

    const timer =
      window.setTimeout(() => {
        startPhotoCamera();
      }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    step,
    photoPreview,
    cameraRunning,
    cameraStarting,
    startPhotoCamera,
  ]);


  /* =========================================================
     CAPTURE PHOTO
     ========================================================= */

  const capturePhoto =
    async () => {
      /*
       * IMPORTANT:
       *
       * Do NOT use canvasRef here.
       *
       * We create a fresh canvas dynamically.
       * This completely removes the previous
       * "canvasRef.current is null" problem.
       */

      const video =
        photoVideoRef.current;

      if (!video) {
        setError(
          "Photo camera element is not available."
        );

        return;
      }

      if (
        !photoStreamRef.current
      ) {
        setError(
          "Camera stream is not available. Please start the camera again."
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
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        setError(
          "Camera image is not available yet. Please wait a moment and try again."
        );

        return;
      }

      setError("");

      setMessage(
        "Capturing photo..."
      );

      try {
        /*
         * Create canvas dynamically.
         */

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          video.videoWidth;

        canvas.height =
          video.videoHeight;

        const context =
          canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Unable to prepare photo capture."
          );
        }

        /*
         * Mirror the captured image
         * because front camera preview
         * is mirrored.
         */

        context.save();

        context.translate(
          canvas.width,
          0
        );

        context.scale(
          -1,
          1
        );

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.restore();

        /*
         * Convert canvas to JPEG.
         */

        const blob =
          await new Promise(
            (resolve) => {
              canvas.toBlob(
                resolve,
                "image/jpeg",
                0.9
              );
            }
          );

        if (!blob) {
          throw new Error(
            "Unable to create photo."
          );
        }

        console.log(
          "Photo captured:",
          {
            size: blob.size,
            type: blob.type,
            width:
              canvas.width,
            height:
              canvas.height,
          }
        );

        /*
         * Create preview.
         */

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

        /*
         * Stop camera AFTER capture.
         */

        stopPhotoCamera();

        /*
         * Upload photo.
         */

        await uploadPhoto(
          blob
        );
      } catch (err) {
        console.error(
          "Photo capture failed:",
          err
        );

        setMessage("");

        setError(
          getErrorMessage(err)
        );
      }
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
         * Do NOT manually set Content-Type.
         *
         * Browser/Axios will add multipart
         * boundary automatically.
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
         * Continue to location.
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
    async () => {
      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

      setPhotoPreview("");

      setPhotoId("");

      setMessage("");

      setError("");

      /*
       * Camera automatically starts
       * because step remains 3.
       */
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

      setLocationLoading(true);

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
            err.code === 1
          ) {
            setError(
              "Location permission was denied. Please allow location access for localhost and try again."
            );
          } else if (
            err.code === 2
          ) {
            setError(
              "Your current location could not be determined. Please try again."
            );
          } else if (
            err.code === 3
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

        if (photoId) {
          payload.photoId =
            photoId;
        }

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
    () => {
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

      setUploadingPhoto(
        false
      );

      setLocationLoading(
        false
      );

      setCompleting(
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
    };
  }, [
    stopQrScanner,
    stopPhotoCamera,
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
     STEP CLASS
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
              key={
                item.number
              }
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
                <QrCode size={24} />
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


            <div className="qr-scanner-wrapper">

              <video
                ref={qrVideoRef}
                className="attendance-qr-video"
                muted
                playsInline
                autoPlay
              />


              {!scannerRunning &&
                !scannerStarting && (
                  <div className="scanner-empty">

                    <QrCode size={52} />

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

                  <ScanLine size={42} />

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


            {scannerRunning && (
              <div className="attendance-info">

                <ScanLine size={16} />

                <span>
                  Scanning for employee QR...
                </span>

              </div>
            )}


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

                    <Play size={17} />

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

                  <Square size={16} />

                  Stop Scanner

                </button>
              )}

            </div>


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
                      event.target.value
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
                <Camera size={24} />
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

            {remainingSeconds !== null && (
              <div
                className={`attendance-countdown ${
                  remainingSeconds <= 15
                    ? "danger"
                    : ""
                }`}
              >

                <Clock3 size={16} />

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
                ref={photoVideoRef}
                className="attendance-camera-video"
                muted
                playsInline
                autoPlay
              />


              {!cameraRunning &&
                !cameraStarting &&
                !photoPreview && (
                  <div className="camera-overlay">

                    <UserRound size={48} />

                    <strong>
                      Camera is not running
                    </strong>

                    <span>
                      Starting camera...
                    </span>

                  </div>
                )}


              {cameraStarting && (
                <div className="camera-overlay">

                  <Camera size={48} />

                  <strong>
                    Starting camera...
                  </strong>

                  <span>
                    Please allow camera access.
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
                  src={photoPreview}
                  alt="Attendance preview"
                />

              </div>
            )}


            {/* UPLOAD */}

            {uploadingPhoto && (
              <div className="attendance-info">

                <Upload size={16} />

                <span>
                  Uploading photo...
                </span>

              </div>
            )}


            {/* ACTIONS */}

            <div className="attendance-actions">

              {cameraRunning && (
                <>

                  <button
                    type="button"
                    className="attendance-btn secondary"
                    onClick={
                      stopPhotoCamera
                    }
                    disabled={
                      uploadingPhoto
                    }
                  >

                    <Square size={16} />

                    Stop Camera

                  </button>


                  <button
                    type="button"
                    className="attendance-btn primary"
                    onClick={
                      capturePhoto
                    }
                    disabled={
                      uploadingPhoto
                    }
                  >

                    <Camera size={17} />

                    {uploadingPhoto
                      ? "Uploading..."
                      : "Capture Photo"}

                  </button>

                </>
              )}


              {photoPreview &&
                !uploadingPhoto && (
                  <button
                    type="button"
                    className="attendance-btn secondary"
                    onClick={
                      retakePhoto
                    }
                  >

                    <RotateCcw size={16} />

                    Retake

                  </button>
                )}

            </div>


            <div className="attendance-help">

              <ShieldCheck size={15} />

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
                <MapPin size={24} />
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


            {remainingSeconds !== null && (
              <div
                className={`attendance-countdown ${
                  remainingSeconds <= 15
                    ? "danger"
                    : ""
                }`}
              >

                <Clock3 size={16} />

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

                <Crosshair size={42} />

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

                <MapPin size={22} />

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

                <MapPin size={17} />

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
                <ShieldCheck size={24} />
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


            {remainingSeconds !== null && (
              <div
                className={`attendance-countdown ${
                  remainingSeconds <= 15
                    ? "danger"
                    : ""
                }`}
              >

                <Clock3 size={16} />

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

                  <QrCode size={18} />

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

                    <Camera size={18} />

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

                    <MapPin size={18} />

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
                  src={photoPreview}
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

                <RotateCcw size={16} />

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

                <CheckCircle2 size={17} />

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

              <CheckCircle2 size={42} />

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

                <CheckCircle2 size={18} />

                <span>
                  QR verified
                </span>

              </div>


              {photoId && (
                <div>

                  <CheckCircle2 size={18} />

                  <span>
                    Photo verified
                  </span>

                </div>
              )}


              {location && (
                <div>

                  <CheckCircle2 size={18} />

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

              <RotateCcw size={17} />

              Mark Another Attendance

            </button>

          </div>
        )}


        {/* ===================================================
            GLOBAL MESSAGE
            =================================================== */}

        {message && (
          <div className="attendance-info">

            <CheckCircle2 size={16} />

            <span>
              {message}
            </span>

          </div>
        )}


        {error && (
          <div className="attendance-error">

            <XCircle size={17} />

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