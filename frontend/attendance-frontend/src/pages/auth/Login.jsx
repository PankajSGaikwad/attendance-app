import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  QrCode,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../auth/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      await login(
        form.email,
        form.password
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to sign in. Please check your credentials."
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
              SMART WORKFORCE ATTENDANCE
            </div>

            <h1>
              One scan.
              <br />
              <span>One secure record.</span>
            </h1>

            <p>
              Manage attendance, shifts and
              workforce operations from one
              secure platform.
            </p>

            <div className="auth-features">

              <div className="auth-feature">

                <div className="feature-icon">
                  <QrCode size={18} />
                </div>

                <div>
                  <strong>
                    QR Attendance
                  </strong>

                  <span>
                    Fast and secure check-in
                  </span>
                </div>

              </div>

              <div className="auth-feature">

                <div className="feature-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <strong>
                    Secure Verification
                  </strong>

                  <span>
                    Photo and location validation
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="auth-footer-note">
            © 2026 Attendance Pankaj Gaikwad
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
                WELCOME BACK
              </div>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Enter your credentials to
                continue to your workspace.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {error && (

                <div className="auth-error">
                  {error}
                </div>

              )}

              <button
                type="submit"
                className="primary-btn auth-submit"
                disabled={loading}
              >

                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && (
                  <ArrowRight size={17} />
                )}

              </button>

            </form>

            <div className="auth-register">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create account
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;