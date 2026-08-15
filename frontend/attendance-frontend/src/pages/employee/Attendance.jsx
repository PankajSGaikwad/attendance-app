import {
  Camera,
  CheckCircle2,
  Crosshair,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import PageHeader from "../../components/common/PageHeader";

function Attendance() {
  const [step, setStep] = useState(1);
  const [qrValue, setQrValue] = useState("");
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");

  const handleQrSubmit = () => {
    if (!qrValue.trim()) {
      setMessage(
        "Please enter or scan a QR value."
      );
      return;
    }

    setMessage("");
    setStep(2);
  };

  const getLocation = () => {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setStep(5);
      },
      () => {
        setMessage(
          "Location permission is required to complete attendance."
        );
      }
    );
  };

  const resetFlow = () => {
    setStep(1);
    setQrValue("");
    setLocation(null);
    setMessage("");
  };

  return (
    <div>

      <PageHeader
        eyebrow="ATTENDANCE"
        title="Mark attendance"
        description="Complete the secure QR, photo and location verification flow."
      />

      {/* STEP INDICATOR */}

      <div className="flow-steps">

        {[
          "Scan QR",
          "Verify",
          "Photo",
          "Location",
          "Complete",
        ].map((label, index) => {

          const number = index + 1;

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
                  <CheckCircle2 size={15} />
                ) : (
                  number
                )}
              </span>

              {label}

            </div>
          );
        })}

      </div>

      <section className="panel scanner-panel">

        {/* STEP 1 */}

        {step === 1 && (

          <div className="attendance-step">

            <div className="scanner-frame">

              <div className="scanner-corners" />

              <ScanLine size={48} />

              <strong>
                Scan employee QR
              </strong>

              <span>
                Position the QR code inside
                the scanning area.
              </span>

            </div>

            <div className="scanner-divider">
              <span>OR</span>
            </div>

            <div className="form-field">

              <label>
                QR value
              </label>

              <div className="input-wrapper">

                <QrCode size={18} />

                <input
                  value={qrValue}
                  onChange={(event) =>
                    setQrValue(
                      event.target.value
                    )
                  }
                  placeholder="Enter QR value for testing"
                />

              </div>

            </div>

            <button
              className="primary-btn full"
              onClick={handleQrSubmit}
            >
              Verify QR
              <QrCode size={17} />
            </button>

          </div>
        )}

        {/* STEP 2 */}

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
              The QR code has been
              successfully validated.
            </p>

            <div className="verify-grid">

              <div>
                <span>Employee</span>
                <strong>
                  Pankaj Gaikwad
                </strong>
              </div>

              <div>
                <span>Employee Code</span>
                <strong>
                  EMP-0001
                </strong>
              </div>

              <div>
                <span>Shift</span>
                <strong>
                  General Shift
                </strong>
              </div>

              <div>
                <span>Action</span>
                <strong>
                  Check In
                </strong>
              </div>

            </div>

            <button
              className="primary-btn full"
              onClick={() => setStep(3)}
            >
              Continue
              <Camera size={17} />
            </button>

          </div>
        )}

        {/* STEP 3 */}

        {step === 3 && (

          <div className="verify-card">

            <div className="camera-placeholder">

              <Camera size={42} />

              <span>
                Camera preview
              </span>

            </div>

            <h2>
              Take attendance photo
            </h2>

            <p>
              Capture a clear photo to
              verify this attendance action.
            </p>

            <button
              className="primary-btn full"
              onClick={() => setStep(4)}
            >
              Capture photo
              <Camera size={17} />
            </button>

          </div>
        )}

        {/* STEP 4 */}

        {step === 4 && (

          <div className="verify-card">

            <div className="location-icon">
              <MapPin />
            </div>

            <h2>
              Verify your location
            </h2>

            <p>
              Allow location access so we
              can verify where the attendance
              was recorded.
            </p>

            <button
              className="primary-btn full"
              onClick={getLocation}
            >
              <Crosshair size={17} />
              Get current location
            </button>

          </div>
        )}

        {/* STEP 5 */}

        {step === 5 && (

          <div className="verify-card">

            <div className="success-icon">
              <CheckCircle2 />
            </div>

            <div className="eyebrow">
              READY TO COMPLETE
            </div>

            <h2>
              Attendance verified
            </h2>

            <p>
              Your QR, photo and location
              verification are ready.
            </p>

            {location && (

              <div className="location-data">

                <MapPin size={15} />

                <span>
                  {location.latitude.toFixed(6)}
                  {" · "}
                  {location.longitude.toFixed(6)}
                  {" · "}
                  ±
                  {Math.round(
                    location.accuracy
                  )}
                  m
                </span>

              </div>

            )}

            <button
              className="primary-btn full"
              onClick={() => {
                setMessage(
                  "Attendance completed successfully."
                );
              }}
            >
              Complete attendance
              <CheckCircle2 size={17} />
            </button>

            <button
              className="secondary-btn full"
              onClick={resetFlow}
            >
              Start another attendance
            </button>

          </div>
        )}

        {message && (

          <div className="info-box">
            {message}
          </div>

        )}

      </section>

    </div>
  );
}

export default Attendance;