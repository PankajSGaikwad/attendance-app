import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getEmployees,
} from "../../api/adminApi";

import "./admin.css";


export default function AdminDashboard() {

  const navigate =
    useNavigate();


  const [counts, setCounts] =
    useState({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    });


  const [pendingEmployees, setPendingEmployees] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const loadDashboard =
    async () => {

      try {

        setLoading(true);
        setError("");


        const [
          pendingResponse,
          approvedResponse,
          rejectedResponse,
        ] =
          await Promise.all([
            getEmployees("PENDING"),
            getEmployees("APPROVED"),
            getEmployees("REJECTED"),
          ]);


        const pending =
          Array.isArray(
            pendingResponse.data
          )
            ? pendingResponse.data
            : [];


        const approved =
          Array.isArray(
            approvedResponse.data
          )
            ? approvedResponse.data
            : [];


        const rejected =
          Array.isArray(
            rejectedResponse.data
          )
            ? rejectedResponse.data
            : [];


        setCounts({
          total:
            pending.length +
            approved.length +
            rejected.length,

          pending:
            pending.length,

          approved:
            approved.length,

          rejected:
            rejected.length,
        });


        setPendingEmployees(
          pending.slice(
            0,
            5
          )
        );

      } catch (err) {

        console.error(
          "Admin dashboard loading failed:",
          err
        );


        setError(
          err.response?.data?.message ||
            "Unable to load admin dashboard."
        );

      } finally {

        setLoading(
          false
        );
      }
    };


  useEffect(() => {

    loadDashboard();

  }, []);


  return (
    <div className="admin-dashboard">

      {/* HEADER */}

      <div className="admin-dashboard-header">

        <div>

          <div className="eyebrow">
            MANAGEMENT WORKSPACE
          </div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor employee access and
            manage workforce approvals.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-button"
          onClick={
            loadDashboard
          }
          disabled={
            loading
          }
        >

          <RefreshCw
            size={16}
            className={
              loading
                ? "admin-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="admin-dashboard-error">

          <XCircle size={17} />

          {error}

        </div>
      )}


      {/* STATS */}

      <div className="admin-stat-grid">


        <StatCard
          title="Total employees"
          value={counts.total}
          description="Registered employee profiles"
          icon={
            <Users size={20} />
          }
        />


        <StatCard
          title="Pending approval"
          value={counts.pending}
          description="Profiles waiting for review"
          icon={
            <Clock3 size={20} />
          }
          accent="pending"
          onClick={() =>
            navigate(
              "/admin/employees"
            )
          }
        />


        <StatCard
          title="Approved"
          value={counts.approved}
          description="Employees with active access"
          icon={
            <CheckCircle2 size={20} />
          }
          accent="approved"
          onClick={() =>
            navigate(
              "/admin/employees"
            )
          }
        />


        <StatCard
          title="Rejected"
          value={counts.rejected}
          description="Profiles requiring correction"
          icon={
            <XCircle size={20} />
          }
          accent="rejected"
          onClick={() =>
            navigate(
              "/admin/employees"
            )
          }
        />

      </div>


      {/* MAIN GRID */}

      <div className="admin-dashboard-grid">


        {/* PENDING */}

        <section className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <div className="admin-card-eyebrow">
                REQUIRES ATTENTION
              </div>

              <h2>
                Pending approvals
              </h2>

              <p>
                Review employee profiles
                waiting for approval.
              </p>

            </div>


            <button
              type="button"
              className="admin-view-all"
              onClick={() =>
                navigate(
                  "/admin/employees"
                )
              }
            >

              View all

              <ArrowRight
                size={15}
              />

            </button>

          </div>


          {loading ? (

            <div className="admin-dashboard-loading">

              <div className="admin-loading-spinner" />

              <span>
                Loading employees...
              </span>

            </div>

          ) : pendingEmployees.length === 0 ? (

            <div className="admin-dashboard-empty">

              <div className="admin-empty-icon">
                <CheckCircle2
                  size={23}
                />
              </div>

              <strong>
                All caught up
              </strong>

              <p>
                There are no pending
                employee approvals.
              </p>

            </div>

          ) : (

            <div className="admin-pending-list">

              {pendingEmployees.map(
                (employee) => {

                  const name =
                    [
                      employee.firstName,
                      employee.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    "Unnamed employee";


                  return (

                    <button
                      type="button"
                      className="admin-pending-row"
                      key={
                        employee.id
                      }
                      onClick={() =>
                        navigate(
                          `/admin/employees/${employee.id}`
                        )
                      }
                    >

                      <div className="admin-avatar">

                        {name
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div className="admin-pending-info">

                        <strong>
                          {name}
                        </strong>

                        <span>
                          {
                            employee.email ||
                            "-"
                          }
                        </span>

                      </div>


                      <div className="admin-pending-meta">

                        <span>
                          {
                            employee.departmentName ||
                            "-"
                          }
                        </span>

                        <ArrowRight
                          size={15}
                        />

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* QUICK ACTIONS */}

        <section className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <div className="admin-card-eyebrow">
                MANAGEMENT
              </div>

              <h2>
                Quick actions
              </h2>

              <p>
                Common administration tasks.
              </p>

            </div>

          </div>


          <div className="admin-quick-actions">


            <QuickAction
              icon={
                <Users size={19} />
              }
              title="Review employees"
              description="Approve or reject profiles"
              onClick={() =>
                navigate(
                  "/admin/employees"
                )
              }
            />


            <QuickAction
              icon={
                <ShieldCheck size={19} />
              }
              title="Employee approvals"
              description={
                `${counts.pending} profiles waiting`
              }
              onClick={() =>
                navigate(
                  "/admin/employees"
                )
              }
            />


          </div>

        </section>

      </div>


      {/* SYSTEM STATUS */}

      <section className="admin-system-card">

        <div className="admin-system-indicator">

          <span />

        </div>


        <div>

          <strong>
            Attendance system operational
          </strong>

          <p>
            Authentication and workforce
            services are currently available.
          </p>

        </div>

      </section>

    </div>
  );
}


function StatCard({
  title,
  value,
  description,
  icon,
  accent,
  onClick,
}) {

  return (

    <button
      type="button"
      className={
        `admin-stat-card ${
          accent
            ? `admin-stat-${accent}`
            : ""
        }`
      }
      onClick={
        onClick
      }
    >

      <div className="admin-stat-top">

        <span>
          {title}
        </span>

        <div className="admin-stat-icon">
          {icon}
        </div>

      </div>


      <strong>
        {value}
      </strong>


      <p>
        {description}
      </p>

    </button>
  );
}


function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {

  return (

    <button
      type="button"
      className="admin-quick-action"
      onClick={
        onClick
      }
    >

      <div className="admin-quick-icon">
        {icon}
      </div>


      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <ArrowRight
        size={16}
      />

    </button>
  );
}