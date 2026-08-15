import {
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../api/client";

import "./employees.css";


const STATUS_TABS = [
  {
    key: "PENDING",
    label: "Pending",
  },
  {
    key: "APPROVED",
    label: "Approved",
  },
  {
    key: "REJECTED",
    label: "Rejected",
  },
  {
    key: "SUSPENDED",
    label: "Suspended",
  },
  {
    key: "DRAFT",
    label: "Draft",
  },
];


function getInitials(
  firstName,
  lastName
) {

  const first =
    firstName?.charAt(0) || "";

  const last =
    lastName?.charAt(0) || "";

  return (
    `${first}${last}` ||
    "E"
  ).toUpperCase();
}


function formatDate(
  value
) {

  if (!value) {
    return "—";
  }

  try {

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  } catch {

    return "—";
  }
}


function getEmployeeName(
  employee
) {

  const name = [
    employee?.firstName,
    employee?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    name ||
    employee?.email ||
    "Unnamed employee"
  );
}


function StatusBadge({
  status,
}) {

  const normalized =
    status?.toUpperCase() ||
    "UNKNOWN";


  return (

    <span
      className={`employee-status-badge status-${normalized.toLowerCase()}`}
    >

      {normalized ===
        "PENDING" && (
        <Clock3 size={12} />
      )}

      {normalized ===
        "APPROVED" && (
        <CheckCircle2 size={12} />
      )}

      {normalized ===
        "REJECTED" && (
        <XCircle size={12} />
      )}

      {normalized ===
        "SUSPENDED" && (
        <XCircle size={12} />
      )}

      <span>
        {normalized}
      </span>

    </span>
  );
}


function EmployeeDetailsModal({
  employee,
  onClose,
}) {

  if (!employee) {
    return null;
  }


  const name =
    getEmployeeName(
      employee
    );


  return (

    <div
      className="employee-modal-backdrop"
      onClick={onClose}
    >

      <div
        className="employee-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="employee-modal-header">

          <div>

            <div className="employee-modal-eyebrow">
              EMPLOYEE PROFILE
            </div>

            <h2>
              {name}
            </h2>

            <p>
              Employee details and
              account information
            </p>

          </div>


          <button
            type="button"
            className="employee-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>

        </div>


        <div className="employee-modal-profile">

          <div className="employee-large-avatar">

            {getInitials(
              employee.firstName,
              employee.lastName
            )}

          </div>


          <div>

            <strong>
              {name}
            </strong>

            <span>
              {employee.email ||
                "No email available"}
            </span>

          </div>

        </div>


        <div className="employee-detail-grid">

          <div className="employee-detail-item">

            <span>
              Employee Code
            </span>

            <strong>
              {employee.employeeCode ||
                "Not assigned"}
            </strong>

          </div>


          <div className="employee-detail-item">

            <span>
              Phone
            </span>

            <strong>
              {employee.phone ||
                "Not provided"}
            </strong>

          </div>


          <div className="employee-detail-item">

            <span>
              Department
            </span>

            <strong>
              {employee.departmentName ||
                "Not assigned"}
            </strong>

          </div>


          <div className="employee-detail-item">

            <span>
              Designation
            </span>

            <strong>
              {employee.designationName ||
                "Not assigned"}
            </strong>

          </div>


          <div className="employee-detail-item">

            <span>
              Submitted
            </span>

            <strong>
              {formatDate(
                employee.submittedAt
              )}
            </strong>

          </div>


          <div className="employee-detail-item">

            <span>
              Status
            </span>

            <StatusBadge
              status={
                employee.status
              }
            />

          </div>

        </div>


        {employee.rejectionReason && (

          <div className="employee-rejection-box">

            <span>
              Rejection reason
            </span>

            <p>
              {employee.rejectionReason}
            </p>

          </div>

        )}


        <div className="employee-modal-footer">

          <button
            type="button"
            className="employee-secondary-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


function RejectModal({
  employee,
  reason,
  setReason,
  submitting,
  onClose,
  onConfirm,
}) {

  if (!employee) {
    return null;
  }


  return (

    <div
      className="employee-modal-backdrop"
      onClick={onClose}
    >

      <div
        className="employee-modal reject-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="employee-modal-header">

          <div>

            <div className="employee-modal-eyebrow rejection">
              REJECT EMPLOYEE
            </div>

            <h2>
              Reject profile?
            </h2>

            <p>
              Provide a reason so the
              employee knows what needs
              to be corrected.
            </p>

          </div>


          <button
            type="button"
            className="employee-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        <div className="reject-employee-summary">

          <div className="employee-small-avatar">

            {getInitials(
              employee.firstName,
              employee.lastName
            )}

          </div>


          <div>

            <strong>
              {getEmployeeName(
                employee
              )}
            </strong>

            <span>
              {employee.email}
            </span>

          </div>

        </div>


        <label className="employee-form-label">

          Rejection reason

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            placeholder="Enter the reason for rejecting this profile..."
            maxLength={500}
            rows={5}
          />

        </label>


        <div className="reject-character-count">
          {reason.length}/500
        </div>


        <div className="employee-modal-footer">

          <button
            type="button"
            className="employee-secondary-button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>


          <button
            type="button"
            className="employee-danger-button"
            onClick={onConfirm}
            disabled={
              submitting ||
              !reason.trim()
            }
          >

            {submitting ? (
              <>
                <Loader2
                  size={15}
                  className="spin"
                />

                Rejecting...
              </>
            ) : (
              <>
                <XCircle size={15} />

                Reject profile
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}


function Employees() {

  const [
    employees,
    setEmployees,
  ] = useState([]);


  const [
    activeStatus,
    setActiveStatus,
  ] = useState(
    "PENDING"
  );


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState(null);


  const [
    rejectEmployee,
    setRejectEmployee,
  ] = useState(null);


  const [
    rejectReason,
    setRejectReason,
  ] = useState("");


  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);


  const loadEmployees =
    async (
      status = activeStatus,
      isRefresh = false
    ) => {

      try {

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");


        const response =
          await api.get(
            "/api/admin/employees",
            {
              params: {
                status,
              },
            }
          );


        setEmployees(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );

      } catch (requestError) {

        console.error(
          "Unable to load employees:",
          requestError
        );

        setError(
          requestError.response
            ?.data?.message ||
            "Unable to load employees. Please try again."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);
      }
    };


  useEffect(() => {

    loadEmployees(
      activeStatus
    );

  }, [activeStatus]);


  const filteredEmployees =
    useMemo(() => {

      const query =
        searchTerm
          .trim()
          .toLowerCase();


      if (!query) {
        return employees;
      }


      return employees.filter(
        (employee) => {

          const name =
            getEmployeeName(
              employee
            ).toLowerCase();


          const email =
            (
              employee.email ||
              ""
            ).toLowerCase();


          const code =
            (
              employee.employeeCode ||
              ""
            ).toLowerCase();


          const department =
            (
              employee.departmentName ||
              ""
            ).toLowerCase();


          const designation =
            (
              employee.designationName ||
              ""
            ).toLowerCase();


          return (
            name.includes(query) ||
            email.includes(query) ||
            code.includes(query) ||
            department.includes(query) ||
            designation.includes(query)
          );
        }
      );

    }, [
      employees,
      searchTerm,
    ]);


  const approveEmployee =
    async (
      employee
    ) => {

      const confirmed =
        window.confirm(
          `Approve ${getEmployeeName(
            employee
          )}'s profile?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(
          true
        );

        setError("");


        await api.patch(
          `/api/admin/employees/${employee.id}/approve`
        );


        await loadEmployees(
          activeStatus,
          true
        );

      } catch (requestError) {

        console.error(
          "Unable to approve employee:",
          requestError
        );

        setError(
          requestError.response
            ?.data?.message ||
            "Unable to approve this employee."
        );

      } finally {

        setActionLoading(
          false
        );
      }
    };


  const openRejectModal =
    (employee) => {

      setRejectEmployee(
        employee
      );

      setRejectReason("");
    };


  const closeRejectModal =
    () => {

      if (actionLoading) {
        return;
      }

      setRejectEmployee(
        null
      );

      setRejectReason("");
    };


  const confirmReject =
    async () => {

      if (
        !rejectEmployee ||
        !rejectReason.trim()
      ) {
        return;
      }


      try {

        setActionLoading(
          true
        );

        setError("");


        await api.patch(
          `/api/admin/employees/${rejectEmployee.id}/reject`,
          {
            reason:
              rejectReason.trim(),
          }
        );


        closeRejectModal();


        await loadEmployees(
          activeStatus,
          true
        );

      } catch (requestError) {

        console.error(
          "Unable to reject employee:",
          requestError
        );

        setError(
          requestError.response
            ?.data?.message ||
            "Unable to reject this employee."
        );

      } finally {

        setActionLoading(
          false
        );
      }
    };


  return (

    <div className="employees-page">


      {/* PAGE HEADER */}

      <div className="employees-page-header">

        <div>

          <div className="employees-eyebrow">
            EMPLOYEE MANAGEMENT
          </div>


          <h1>
            Employee approvals
          </h1>


          <p>
            Review employee profiles
            and manage access to the
            attendance platform.
          </p>

        </div>


        <button
          type="button"
          className="employees-refresh-button"
          onClick={() =>
            loadEmployees(
              activeStatus,
              true
            )
          }
          disabled={
            refreshing ||
            loading
          }
        >

          <RefreshCw
            size={15}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="employees-error">

          <XCircle size={16} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* TOOLBAR */}

      <div className="employees-toolbar">

        <div className="employees-search">

          <Search
            size={16}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search name, email, employee code..."
          />

          {searchTerm && (

            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="clear-search"
            >
              <X size={14} />
            </button>

          )}

        </div>


        <div className="employee-count">

          <Users size={15} />

          <span>
            {filteredEmployees.length}
          </span>

          employees

        </div>

      </div>


      {/* STATUS TABS */}

      <div className="employee-tabs">

        {STATUS_TABS.map(
          (tab) => (

            <button
              key={tab.key}
              type="button"
              className={
                activeStatus ===
                tab.key
                  ? "active"
                  : ""
              }
              onClick={() => {

                setActiveStatus(
                  tab.key
                );

                setSearchTerm("");

              }}
            >

              {tab.label}

            </button>

          )
        )}

      </div>


      {/* TABLE CARD */}

      <div className="employees-card">

        <div className="employees-card-header">

          <div>

            <div className="employees-card-eyebrow">
              EMPLOYEES
            </div>

            <h2>
              {activeStatus}
            </h2>

          </div>


          <div className="employees-card-total">

            {filteredEmployees.length}

          </div>

        </div>


        {loading ? (

          <div className="employees-loading">

            <Loader2
              size={22}
              className="spin"
            />

            <span>
              Loading employees...
            </span>

          </div>

        ) : filteredEmployees.length ===
          0 ? (

          <div className="employees-empty">

            <div className="employees-empty-icon">

              <Users size={21} />

            </div>


            <h3>
              No employees found
            </h3>


            <p>

              {searchTerm
                ? "Try changing your search."
                : `There are no ${activeStatus.toLowerCase()} employee profiles.`}

            </p>

          </div>

        ) : (

          <div className="employees-table-wrapper">

            <table className="employees-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Designation
                  </th>

                  <th>
                    Submitted
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredEmployees.map(
                  (employee) => (

                    <tr
                      key={
                        employee.id
                      }
                    >

                      {/* EMPLOYEE */}

                      <td>

                        <div className="employee-person">

                          <div className="employee-avatar">

                            {getInitials(
                              employee.firstName,
                              employee.lastName
                            )}

                          </div>


                          <div className="employee-person-info">

                            <strong>
                              {
                                getEmployeeName(
                                  employee
                                )
                              }
                            </strong>

                            <span>
                              {
                                employee.email ||
                                "No email"
                              }
                            </span>

                            {employee.employeeCode && (

                              <small>
                                {
                                  employee.employeeCode
                                }
                              </small>

                            )}

                          </div>

                        </div>

                      </td>


                      {/* DEPARTMENT */}

                      <td>

                        <span className="employee-table-value">

                          {
                            employee.departmentName ||
                            "Not assigned"
                          }

                        </span>

                      </td>


                      {/* DESIGNATION */}

                      <td>

                        <span className="employee-table-value">

                          {
                            employee.designationName ||
                            "Not assigned"
                          }

                        </span>

                      </td>


                      {/* SUBMITTED */}

                      <td>

                        <span className="employee-date">

                          {formatDate(
                            employee.submittedAt
                          )}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <StatusBadge
                          status={
                            employee.status
                          }
                        />

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="employee-actions">

                          <button
                            type="button"
                            className="employee-action view"
                            title="View employee"
                            onClick={() =>
                              setSelectedEmployee(
                                employee
                              )
                            }
                          >

                            <Eye
                              size={15}
                            />

                          </button>


                          {employee.status ===
                            "PENDING" && (

                            <>

                              <button
                                type="button"
                                className="employee-action approve"
                                title="Approve employee"
                                onClick={() =>
                                  approveEmployee(
                                    employee
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >

                                <Check
                                  size={15}
                                />

                              </button>


                              <button
                                type="button"
                                className="employee-action reject"
                                title="Reject employee"
                                onClick={() =>
                                  openRejectModal(
                                    employee
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >

                                <X
                                  size={15}
                                />

                              </button>

                            </>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* DETAILS MODAL */}

      <EmployeeDetailsModal
        employee={
          selectedEmployee
        }
        onClose={() =>
          setSelectedEmployee(
            null
          )
        }
      />


      {/* REJECT MODAL */}

      <RejectModal
        employee={
          rejectEmployee
        }
        reason={
          rejectReason
        }
        setReason={
          setRejectReason
        }
        submitting={
          actionLoading
        }
        onClose={
          closeRejectModal
        }
        onConfirm={
          confirmReject
        }
      />

    </div>
  );
}


export default Employees;