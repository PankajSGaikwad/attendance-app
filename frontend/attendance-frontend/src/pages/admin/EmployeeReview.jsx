import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  approveEmployee,
  getEmployeeById,
  rejectEmployee,
} from "../../api/adminApi";


export default function EmployeeReview() {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const [employee, setEmployee] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [showReject, setShowReject] =
    useState(false);

  const [reason, setReason] =
    useState("");


  const loadEmployee = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getEmployeeById(id);

      setEmployee(
        response.data
      );

    } catch (err) {

      console.error(
        "Unable to load employee:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load employee profile."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    loadEmployee();

  }, [id]);


  const handleApprove =
    async () => {

      if (!employee) {
        return;
      }

      try {

        setActionLoading(true);
        setError("");
        setMessage("");

        const response =
          await approveEmployee(
            employee.id
          );

        setEmployee(
          response.data
        );

        setMessage(
          "Employee approved successfully."
        );

      } catch (err) {

        console.error(
          "Approval failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to approve employee."
        );

      } finally {

        setActionLoading(false);
      }
    };


  const handleReject =
    async () => {

      const trimmedReason =
        reason.trim();

      if (!trimmedReason) {

        setError(
          "Please provide a rejection reason."
        );

        return;
      }

      if (
        trimmedReason.length >
        500
      ) {

        setError(
          "Rejection reason cannot exceed 500 characters."
        );

        return;
      }


      try {

        setActionLoading(true);
        setError("");
        setMessage("");

        const response =
          await rejectEmployee(
            employee.id,
            trimmedReason
          );

        setEmployee(
          response.data
        );

        setShowReject(false);
        setReason("");

        setMessage(
          "Employee profile rejected."
        );

      } catch (err) {

        console.error(
          "Rejection failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to reject employee."
        );

      } finally {

        setActionLoading(false);
      }
    };


  if (loading) {

    return (
      <div className="admin-review-loading">

        <div className="admin-loading-spinner" />

        <span>
          Loading employee profile...
        </span>

      </div>
    );
  }


  if (!employee) {

    return (
      <div className="admin-review-empty">

        <h2>
          Employee not found
        </h2>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={() =>
            navigate(
              "/admin/employees"
            )
          }
        >
          Back to employees
        </button>

      </div>
    );
  }


  const fullName =
    [
      employee.firstName,
      employee.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed employee";


  const status =
    String(
      employee.status ||
        "DRAFT"
    ).toUpperCase();


  return (
    <div className="admin-page">

      <div className="admin-container">

        {/* Header */}

        <div className="admin-review-header">

          <button
            type="button"
            className="admin-back-button"
            onClick={() =>
              navigate(
                "/admin/employees"
              )
            }
          >

            <ArrowLeft size={16} />

            Employees

          </button>


          <div className="admin-review-title-row">

            <div>

              <div className="admin-eyebrow">
                EMPLOYEE REVIEW
              </div>

              <h1>
                {fullName}
              </h1>

              <p>
                Review employee information
                and manage account approval.
              </p>

            </div>


            <span
              className={
                `admin-status-badge ${getStatusClass(
                  status
                )}`
              }
            >

              <span />

              {status}

            </span>

          </div>

        </div>


        {/* Alerts */}

        {message && (

          <div className="admin-alert admin-alert-success">

            <Check size={17} />

            {message}

          </div>
        )}


        {error && (

          <div className="admin-alert admin-alert-error">

            <X size={17} />

            {error}

          </div>
        )}


        {/* Personal information */}

        <section className="admin-review-card">

          <div className="admin-review-card-header">

            <div className="admin-review-card-icon">
              <UserRound size={18} />
            </div>

            <div>

              <h2>
                Personal information
              </h2>

              <p>
                Employee identity and contact
                details.
              </p>

            </div>

          </div>


          <div className="admin-detail-grid">

            <Detail
              label="First name"
              value={
                employee.firstName ||
                "-"
              }
            />

            <Detail
              label="Last name"
              value={
                employee.lastName ||
                "-"
              }
            />

            <Detail
              label="Email"
              value={
                employee.email ||
                "-"
              }
              icon={
                <Mail size={15} />
              }
            />

            <Detail
              label="Phone"
              value={
                employee.phone ||
                "-"
              }
              icon={
                <Phone size={15} />
              }
            />

          </div>

        </section>


        {/* Organization */}

        <section className="admin-review-card">

          <div className="admin-review-card-header">

            <div className="admin-review-card-icon">
              <ShieldCheck size={18} />
            </div>

            <div>

              <h2>
                Organization
              </h2>

              <p>
                Employee's organizational
                assignment.
              </p>

            </div>

          </div>


          <div className="admin-detail-grid">

            <Detail
              label="Employee code"
              value={
                employee.employeeCode ||
                "Not assigned"
              }
            />

            <Detail
              label="Department"
              value={
                employee.departmentName ||
                "-"
              }
            />

            <Detail
              label="Designation"
              value={
                employee.designationName ||
                "-"
              }
            />

            <Detail
              label="Active"
              value={
                employee.active
                  ? "Yes"
                  : "No"
              }
            />

          </div>

        </section>


        {/* Actions */}

        {status === "PENDING" && (

          <section className="admin-review-actions">

            <button
              type="button"
              className="admin-review-reject"
              onClick={() =>
                setShowReject(true)
              }
              disabled={
                actionLoading
              }
            >

              <X size={17} />

              Reject

            </button>


            <button
              type="button"
              className="admin-review-approve"
              onClick={
                handleApprove
              }
              disabled={
                actionLoading
              }
            >

              <Check size={17} />

              {actionLoading
                ? "Processing..."
                : "Approve employee"}

            </button>

          </section>

        )}


        {/* Rejection modal */}

        {showReject && (

          <div className="admin-modal-backdrop">

            <div className="admin-modal">

              <div className="admin-modal-header">

                <div>

                  <div className="admin-card-eyebrow">
                    REJECT EMPLOYEE
                  </div>

                  <h2>
                    Reject profile
                  </h2>

                </div>

                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() =>
                    setShowReject(false)
                  }
                >
                  <X size={18} />
                </button>

              </div>


              <div className="admin-modal-field">

                <label>
                  Rejection reason
                </label>

                <textarea
                  rows="5"
                  maxLength="500"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="Explain why the profile needs to be rejected..."
                />

                <span>
                  {reason.length}/500
                </span>

              </div>


              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={() =>
                    setShowReject(false)
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="admin-modal-reject"
                  onClick={
                    handleReject
                  }
                  disabled={
                    actionLoading
                  }
                >

                  {actionLoading
                    ? "Rejecting..."
                    : "Reject employee"}

                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


function Detail({
  label,
  value,
  icon,
}) {
  return (
    <div className="admin-detail">

      <span>
        {label}
      </span>

      <strong>

        {icon && (
          <span className="admin-detail-icon">
            {icon}
          </span>
        )}

        {value}

      </strong>

    </div>
  );
}


function getStatusClass(status) {

  const value =
    String(status || "")
      .toLowerCase();

  if (value === "approved") {
    return "admin-status-approved";
  }

  if (value === "pending") {
    return "admin-status-pending";
  }

  if (value === "rejected") {
    return "admin-status-rejected";
  }

  if (value === "suspended") {
    return "admin-status-suspended";
  }

  return "admin-status-draft";
}