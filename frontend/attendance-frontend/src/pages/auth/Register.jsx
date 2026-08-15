import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  QrCode,
  ShieldCheck,
} from "lucide-react";

import { register as registerUser } from "../../api/authApi";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      navigate("/login");

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-background-grid" />

      <div className="auth-glow auth-glow-blue" />
      <div className="auth-glow auth-glow-white" />

      <section className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-brand-panel">

          <div className="auth-brand">

            <div className="brand-mark">
              <QrCode size={24} />
            </div>

            <div>
              <strong>
                Attend<span>ance</span>
              </strong>

              <small>
                WORKFORCE HUB
              </small>
            </div>

          </div>

          <div className="auth-hero-content">

            <div className="eyebrow">
              JOIN THE WORKFORCE HUB
            </div>

            <h1>
              Work smarter.
              <br />
              <span>Track attendance.</span>
            </h1>

            <p>
              Create your account and get
              access to secure attendance,
              workforce and shift management.
            </p>

            <div className="auth-features">

              <div className="auth-feature">

                <div className="feature-icon">
                  <QrCode size={18} />
                </div>

                <div>
                  <strong>
                    Quick Attendance
                  </strong>

                  <span>
                    QR-based check-in
                  </span>
                </div>

              </div>

              <div className="auth-feature">

                <div className="feature-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <strong>
                    Secure Access
                  </strong>

                  <span>
                    Protected employee data
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="auth-footer-note">
            © 2026 Attendance App Pankaj Gaikwad
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">

            <div className="mobile-auth-brand">

              <div className="brand-mark">
                <QrCode size={22} />
              </div>

              <strong>
                Attend<span>ance</span>
              </strong>

            </div>

            <div className="auth-heading">

              <div className="eyebrow">
                GET STARTED
              </div>

              <h2>
                Create your account
              </h2>

              <p>
                Set up your account to access
                the attendance workspace.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="form-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="form-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="form-field">

                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* ERROR */}

              {error && (

                <div className="auth-error">
                  {error}
                </div>

              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="primary-btn auth-submit"
                disabled={loading}
              >

                {loading
                  ? "Creating account..."
                  : "Create account"}

                {!loading && (
                  <ArrowRight size={17} />
                )}

              </button>

            </form>

            {/* LOGIN */}

            <div className="auth-register">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Register;