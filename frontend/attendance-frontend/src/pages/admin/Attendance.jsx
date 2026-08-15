import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../api/client";

import "./attendance.css";


function getEmployeeName(employee) {
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


function getInitials(employee) {
  const first =
    employee?.firstName?.charAt(0) || "";

  const last =
    employee?.lastName?.charAt(0) || "";

  return (
    `${first}${last}` ||
    "E"
  ).toUpperCase();
}


function formatDate(value) {
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


function formatTime(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "—";
  }
}


function formatMinutes(minutes) {
  if (
    minutes === null ||
    minutes === undefined
  ) {
    return "0h 0m";
  }

  const hours =
    Math.floor(minutes / 60);

  const remaining =
    minutes % 60;

  return `${hours}h ${remaining}m`;
}


function formatStatus(status) {
  if (!status) {
    return "UNKNOWN";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


function StatusBadge({ status }) {
  const normalized =
    status?.toUpperCase() ||
    "UNKNOWN";

  let icon = (
    <Clock3 size={13} />
  );

  if (
    normalized === "FINALIZED"
  ) {
    icon = (
      <CheckCircle2 size={13} />
    );
  }

  if (
    normalized === "REVIEW_REQUIRED"
  ) {
    icon = (
      <XCircle size={13} />
    );
  }

  return (
    <span
      className={`attendance-status status-${normalized.toLowerCase()}`}
    >
      {icon}

      <span>
        {formatStatus(normalized)}
      </span>
    </span>
  );
}


function AttendanceDetailsModal({
  attendance,
  onClose,
}) {
  if (!attendance) {
    return null;
  }

  return (
    <div
      className="attendance-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="attendance-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="attendance-modal-header">

          <div>
            <div className="attendance-modal-eyebrow">
              ATTENDANCE DETAILS
            </div>

            <h2>
              {attendance.employeeName ||
                "Employee attendance"}
            </h2>

            <p>
              {formatDate(
                attendance.attendanceDate
              )}
            </p>
          </div>

          <button
            type="button"
            className="attendance-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>

        </div>


        <div className="attendance-detail-status-row">

          <StatusBadge
            status={attendance.status}
          />

          {attendance.late && (
            <span className="attendance-late-badge">
              Late
            </span>
          )}

        </div>


        <div className="attendance-detail-grid">

          <div className="attendance-detail-item">
            <span>
              Employee code
            </span>

            <strong>
              {attendance.employeeCode ||
                "Not assigned"}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Department
            </span>

            <strong>
              {attendance.departmentId ||
                "Not available"}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Shift
            </span>

            <strong>
              {attendance.shiftName ||
                attendance.shiftCode ||
                "No shift"}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Scheduled time
            </span>

            <strong>
              {attendance.scheduledStartTime ||
                "—"}
              {" → "}
              {attendance.scheduledEndTime ||
                "—"}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Worked
            </span>

            <strong>
              {formatMinutes(
                attendance.workedMinutes
              )}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Break
            </span>

            <strong>
              {formatMinutes(
                attendance.breakMinutes
              )}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Created
            </span>

            <strong>
              {formatTime(
                attendance.createdAt
              )}
            </strong>
          </div>


          <div className="attendance-detail-item">
            <span>
              Finalized
            </span>

            <strong>
              {formatTime(
                attendance.finalizedAt
              )}
            </strong>
          </div>

        </div>


        <div className="attendance-interval-section">

          <div className="attendance-section-title">
            Work intervals
          </div>

          {attendance.intervals?.length ? (

            <div className="attendance-interval-list">

              {attendance.intervals.map(
                (interval, index) => (
                  <div
                    className="attendance-interval"
                    key={
                      interval.id ||
                      index
                    }
                  >

                    <div>
                      <span>
                        Interval {index + 1}
                      </span>

                      <strong>
                        {formatTime(
                          interval
                            .punchIn
                            ?.recordedAt
                        )}

                        {" → "}

                        {formatTime(
                          interval
                            .punchOut
                            ?.recordedAt
                        )}
                      </strong>
                    </div>

                    <strong>
                      {formatMinutes(
                        interval.workedMinutes
                      )}
                    </strong>

                  </div>
                )
              )}

            </div>

          ) : (

            <div className="attendance-empty-inline">
              No work intervals recorded.
            </div>

          )}

        </div>


        <div className="attendance-modal-footer">

          <button
            type="button"
            className="attendance-secondary-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}


function Attendance() {

  const [
    employees,
    setEmployees,
  ] = useState([]);


  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState(null);


  const [
    attendanceRecords,
    setAttendanceRecords,
  ] = useState([]);


  const [
    selectedAttendance,
    setSelectedAttendance,
  ] = useState(null);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    attendanceSearch,
    setAttendanceSearch,
  ] = useState("");


  const [
    loadingEmployees,
    setLoadingEmployees,
  ] = useState(true);


  const [
    loadingAttendance,
    setLoadingAttendance,
  ] = useState(false);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);


  const loadEmployees =
    async (
      isRefresh = false
    ) => {

      try {

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingEmployees(true);
        }

        setError("");

        const response =
          await api.get(
            "/api/admin/employees",
            {
              params: {
                status: "APPROVED",
              },
            }
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setEmployees(data);

        if (
          selectedEmployee
        ) {

          const updated =
            data.find(
              (employee) =>
                employee.id ===
                selectedEmployee.id
            );

          if (updated) {
            setSelectedEmployee(
              updated
            );
          }
        }

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

        setLoadingEmployees(false);
        setRefreshing(false);

      }
    };


  const loadAttendance =
    async (
      employee
    ) => {

      if (!employee?.id) {
        setAttendanceRecords([]);
        return;
      }

      try {

        setLoadingAttendance(
          true
        );

        setError("");

        const response =
          await api.get(
            `/api/admin/attendance/employees/${employee.id}`
          );

        setAttendanceRecords(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );

      } catch (requestError) {

        console.error(
          "Unable to load attendance:",
          requestError
        );

        setAttendanceRecords([]);

        setError(
          requestError.response
            ?.data?.message ||
            "Unable to load attendance history."
        );

      } finally {

        setLoadingAttendance(
          false
        );
      }
    };


  useEffect(() => {

    loadEmployees();

  }, []);


  useEffect(() => {

    if (selectedEmployee) {
      loadAttendance(
        selectedEmployee
      );
    }

  }, [selectedEmployee]);


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

          return (
            name.includes(query) ||
            email.includes(query) ||
            code.includes(query) ||
            department.includes(query)
          );
        }
      );

    }, [
      employees,
      searchTerm,
    ]);


  const filteredAttendance =
    useMemo(() => {

      const query =
        attendanceSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return attendanceRecords;
      }

      return attendanceRecords.filter(
        (record) => {

          const date =
            (
              record.attendanceDate ||
              ""
            ).toLowerCase();

          const status =
            formatStatus(
              record.status
            ).toLowerCase();

          const shift =
            (
              record.shiftName ||
              record.shiftCode ||
              ""
            ).toLowerCase();

          return (
            date.includes(query) ||
            status.includes(query) ||
            shift.includes(query)
          );
        }
      );

    }, [
      attendanceRecords,
      attendanceSearch,
    ]);


  const openAttendanceDetails =
    async (
      attendance
    ) => {

      if (!attendance?.id) {
        return;
      }

      try {

        setDetailLoading(true);

        const response =
          await api.get(
            `/api/admin/attendance/${attendance.id}`
          );

        setSelectedAttendance(
          response.data
        );

      } catch (requestError) {

        console.error(
          "Unable to load attendance details:",
          requestError
        );

        setError(
          requestError.response
            ?.data?.message ||
            "Unable to load attendance details."
        );

      } finally {

        setDetailLoading(false);

      }
    };


  const totalWorkedMinutes =
    attendanceRecords.reduce(
      (
        total,
        record
      ) =>
        total +
        (
          record.workedMinutes ||
          0
        ),
      0
    );


  return (

    <div className="admin-attendance-page">


      <div className="admin-attendance-header">

        <div>

          <div className="admin-attendance-eyebrow">
            ATTENDANCE MANAGEMENT
          </div>

          <h1>
            Attendance records
          </h1>

          <p>
            Review attendance history
            for employees and inspect
            individual attendance details.
          </p>

        </div>


        <button
          type="button"
          className="admin-attendance-refresh"
          onClick={() =>
            loadEmployees(true)
          }
          disabled={
            refreshing ||
            loadingEmployees
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


      {error && (

        <div className="admin-attendance-error">

          <XCircle size={16} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={15} />
          </button>

        </div>

      )}


      <div className="admin-attendance-layout">


        {/* EMPLOYEE LIST */}

        <section className="attendance-employee-panel">

          <div className="attendance-panel-header">

            <div>

              <div className="attendance-panel-eyebrow">
                EMPLOYEES
              </div>

              <h2>
                Select employee
              </h2>

            </div>

            <span className="attendance-count">
              {employees.length}
            </span>

          </div>


          <div className="attendance-search">

            <Search size={16} />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search employee..."
            />

          </div>


          {loadingEmployees ? (

            <div className="attendance-loading">

              <Loader2
                size={22}
                className="spin"
              />

              <span>
                Loading employees...
              </span>

            </div>

          ) : filteredEmployees.length === 0 ? (

            <div className="attendance-empty">

              <UserRound size={24} />

              <strong>
                No employees found
              </strong>

              <span>
                Try another search.
              </span>

            </div>

          ) : (

            <div className="attendance-employee-list">

              {filteredEmployees.map(
                (employee) => {

                  const isSelected =
                    selectedEmployee?.id ===
                    employee.id;

                  return (

                    <button
                      type="button"
                      className={`attendance-employee-card ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      key={employee.id}
                      onClick={() =>
                        setSelectedEmployee(
                          employee
                        )
                      }
                    >

                      <div className="attendance-avatar">

                        {getInitials(
                          employee
                        )}

                      </div>


                      <div className="attendance-employee-info">

                        <strong>
                          {getEmployeeName(
                            employee
                          )}
                        </strong>

                        <span>
                          {employee.employeeCode ||
                            "No employee code"}
                        </span>

                        <small>
                          {employee.departmentName ||
                            "No department"}
                        </small>

                      </div>

                    </button>

                  );
                }
              )}

            </div>

          )}

        </section>


        {/* ATTENDANCE */}

        <section className="attendance-record-panel">

          {!selectedEmployee ? (

            <div className="attendance-select-state">

              <CalendarDays size={34} />

              <h2>
                Select an employee
              </h2>

              <p>
                Choose an employee from
                the list to view their
                attendance history.
              </p>

            </div>

          ) : (

            <>

              <div className="attendance-record-header">

                <div className="attendance-selected-profile">

                  <div className="attendance-large-avatar">

                    {getInitials(
                      selectedEmployee
                    )}

                  </div>

                  <div>

                    <div className="attendance-panel-eyebrow">
                      ATTENDANCE HISTORY
                    </div>

                    <h2>
                      {getEmployeeName(
                        selectedEmployee
                      )}
                    </h2>

                    <p>
                      {selectedEmployee.employeeCode ||
                        "No employee code"}
                      {" · "}
                      {selectedEmployee.departmentName ||
                        "No department"}
                    </p>

                  </div>

                </div>


                <div className="attendance-summary">

                  <div>

                    <span>
                      Records
                    </span>

                    <strong>
                      {attendanceRecords.length}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Worked
                    </span>

                    <strong>
                      {formatMinutes(
                        totalWorkedMinutes
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              <div className="attendance-record-toolbar">

                <div className="attendance-search attendance-record-search">

                  <Search size={16} />

                  <input
                    type="text"
                    value={
                      attendanceSearch
                    }
                    onChange={(
                      event
                    ) =>
                      setAttendanceSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search date, shift or status..."
                  />

                </div>

              </div>


              {loadingAttendance ? (

                <div className="attendance-loading attendance-record-loading">

                  <Loader2
                    size={24}
                    className="spin"
                  />

                  <span>
                    Loading attendance history...
                  </span>

                </div>

              ) : filteredAttendance.length === 0 ? (

                <div className="attendance-empty attendance-record-empty">

                  <CalendarDays size={26} />

                  <strong>
                    No attendance records
                  </strong>

                  <span>
                    No attendance history
                    is available for this
                    employee.
                  </span>

                </div>

              ) : (

                <div className="attendance-table-wrapper">

                  <table className="attendance-table">

                    <thead>

                      <tr>

                        <th>
                          DATE
                        </th>

                        <th>
                          SHIFT
                        </th>

                        <th>
                          SCHEDULE
                        </th>

                        <th>
                          WORKED
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTION
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredAttendance.map(
                        (record) => (

                          <tr
                            key={
                              record.id
                            }
                          >

                            <td>

                              <div className="attendance-date-cell">

                                <CalendarDays
                                  size={15}
                                />

                                <strong>
                                  {formatDate(
                                    record.attendanceDate
                                  )}
                                </strong>

                              </div>

                            </td>


                            <td>

                              <div className="attendance-shift-cell">

                                <strong>
                                  {record.shiftName ||
                                    record.shiftCode ||
                                    "No shift"}
                                </strong>

                                {record.shiftCode &&
                                  record.shiftName && (
                                    <span>
                                      {
                                        record.shiftCode
                                      }
                                    </span>
                                  )}

                              </div>

                            </td>


                            <td>

                              <span className="attendance-schedule">

                                {record.scheduledStartTime ||
                                  "—"}

                                {" → "}

                                {record.scheduledEndTime ||
                                  "—"}

                              </span>

                              {record.late && (
                                <span className="attendance-late-text">
                                  Late
                                </span>
                              )}

                            </td>


                            <td>

                              <strong>
                                {formatMinutes(
                                  record.workedMinutes
                                )}
                              </strong>

                              {record.breakMinutes >
                                0 && (
                                <span className="attendance-break-text">
                                  {
                                    formatMinutes(
                                      record.breakMinutes
                                    )
                                  }{" "}
                                  break
                                </span>
                              )}

                            </td>


                            <td>

                              <StatusBadge
                                status={
                                  record.status
                                }
                              />

                            </td>


                            <td>

                              <button
                                type="button"
                                className="attendance-view-button"
                                onClick={() =>
                                  openAttendanceDetails(
                                    record
                                  )
                                }
                                disabled={
                                  detailLoading
                                }
                              >

                                {detailLoading ? (
                                  <Loader2
                                    size={15}
                                    className="spin"
                                  />
                                ) : (
                                  <Eye
                                    size={15}
                                  />
                                )}

                                View

                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

        </section>

      </div>


      <AttendanceDetailsModal
        attendance={
          selectedAttendance
        }
        onClose={() =>
          setSelectedAttendance(
            null
          )
        }
      />

    </div>
  );
}


export default Attendance;