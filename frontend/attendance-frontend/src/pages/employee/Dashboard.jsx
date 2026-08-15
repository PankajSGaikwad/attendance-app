import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  RefreshCw,
  Timer,
  TrendingUp,
  UserRound,
  XCircle,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

import { getMyProfile } from "../../api/employeeApi";
import { getMyAttendance } from "../../api/attendanceApi";

import "./dashboard.css";


/* =========================================================
   HELPERS
   ========================================================= */

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatMinutes(minutes = 0) {
  const total = Number(minutes) || 0;

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
}


function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}


function formatLongDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


function formatTime(time) {
  if (!time) {
    return "--:--";
  }

  return String(time).substring(0, 5);
}


function normalizeStatus(status) {
  if (!status) {
    return "NOT MARKED";
  }

  return String(status)
    .replaceAll("_", " ")
    .toUpperCase();
}


function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("present") ||
    value.includes("complete") ||
    value.includes("approved")
  ) {
    return "present";
  }

  if (
    value.includes("late") ||
    value.includes("partial")
  ) {
    return "late";
  }

  if (
    value.includes("absent") ||
    value.includes("rejected")
  ) {
    return "absent";
  }

  return "pending";
}


function getStatusIcon(status) {
  const className = getStatusClass(status);

  if (className === "present") {
    return <CheckCircle2 size={16} />;
  }

  if (className === "absent") {
    return <XCircle size={16} />;
  }

  return <Clock3 size={16} />;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  /* =======================================================
     LOAD DASHBOARD DATA
     ======================================================= */

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        profileResponse,
        attendanceResponse,
      ] = await Promise.all([
        getMyProfile(),
        getMyAttendance(),
      ]);

      setProfile(profileResponse?.data || null);

      const records = Array.isArray(
        attendanceResponse?.data
      )
        ? attendanceResponse.data
        : [];

      setAttendance(records);

    } catch (err) {
      console.error(
        "Dashboard loading failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard data."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  /* =======================================================
     TODAY
     ======================================================= */

  const today = getLocalDateString();

  const todayAttendance = useMemo(() => {
    return attendance.find(
      (record) =>
        record?.attendanceDate === today
    );
  }, [attendance, today]);


  /* =======================================================
     SORTED ATTENDANCE
     ======================================================= */

  const sortedAttendance = useMemo(() => {
    return [...attendance].sort((a, b) =>
      String(
        b?.attendanceDate || ""
      ).localeCompare(
        String(
          a?.attendanceDate || ""
        )
      )
    );
  }, [attendance]);


  /* =======================================================
     RECENT ATTENDANCE
     ======================================================= */

  const recentAttendance = useMemo(() => {
    return sortedAttendance.slice(0, 7);
  }, [sortedAttendance]);


  /* =======================================================
     ATTENDANCE STATISTICS
     ======================================================= */

  const attendanceStatistics = useMemo(() => {
    if (attendance.length === 0) {
      return {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        percentage: 0,
        workedMinutes: 0,
        breakMinutes: 0,
      };
    }

    let present = 0;
    let late = 0;
    let absent = 0;
    let workedMinutes = 0;
    let breakMinutes = 0;

    attendance.forEach((record) => {
      const status = String(
        record?.status || ""
      ).toLowerCase();

      if (
        status.includes("absent")
      ) {
        absent++;
      } else if (
        status.includes("late")
      ) {
        late++;
        present++;
      } else if (
        status.includes("present") ||
        status.includes("complete") ||
        status.includes("approved")
      ) {
        present++;
      }

      workedMinutes +=
        Number(
          record?.workedMinutes
        ) || 0;

      breakMinutes +=
        Number(
          record?.breakMinutes
        ) || 0;
    });

    const percentage =
      attendance.length > 0
        ? Math.round(
            (present / attendance.length) *
              100
          )
        : 0;

    return {
      total: attendance.length,
      present,
      late,
      absent,
      percentage,
      workedMinutes,
      breakMinutes,
    };
  }, [attendance]);


  /* =======================================================
     TODAY VALUES
     ======================================================= */

  const todayStatus =
    todayAttendance?.status ||
    "NOT MARKED";

  const todayWorkedMinutes =
    Number(
      todayAttendance?.workedMinutes
    ) || 0;

  const todayBreakMinutes =
    Number(
      todayAttendance?.breakMinutes
    ) || 0;

  const shiftName =
    todayAttendance?.shiftName ||
    "No shift assigned";

  const shiftStart =
    todayAttendance?.scheduledStartTime ||
    "--:--";

  const shiftEnd =
    todayAttendance?.scheduledEndTime ||
    "--:--";


  /* =======================================================
     EMPLOYEE DETAILS
     ======================================================= */

  const firstName =
    profile?.firstName ||
    profile?.name ||
    "Employee";

  const fullName = [
    profile?.firstName,
    profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || firstName;

  const employeeCode =
    profile?.employeeCode ||
    "Not assigned";

  const department =
    profile?.departmentName ||
    "Not assigned";

  const designation =
    profile?.designationName ||
    "Not assigned";

  const email =
    profile?.email ||
    "Not available";


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />

        <h3>
          Loading dashboard
        </h3>

        <p>
          Fetching your attendance information...
        </p>
      </div>
    );
  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="employee-dashboard">

      {/* =================================================
          HEADER
          ================================================= */}

      <PageHeader
        eyebrow="EMPLOYEE WORKSPACE"
        title={`Good morning, ${firstName}.`}
        description={
          todayAttendance
            ? `Here's your attendance overview for ${formatLongDate(today)}.`
            : `Here's your attendance overview for today.`
        }
        action={
          <div className="dashboard-header-actions">

            <button
              className="dashboard-refresh-btn"
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "spin"
                    : ""
                }
              />
            </button>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/attendance")
              }
            >
              <CalendarCheck2
                size={17}
              />

              Mark attendance
            </button>

          </div>
        }
      />


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="dashboard-error">

          <div>
            <strong>
              Unable to load dashboard data
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            onClick={() =>
              loadDashboard(true)
            }
          >
            Retry
          </button>

        </div>
      )}


      {/* =================================================
          TODAY SUMMARY
          ================================================= */}

      <div className="dashboard-welcome-card">

        <div className="welcome-left">

          <div className="welcome-icon">
            <CalendarDays size={24} />
          </div>

          <div>
            <span className="welcome-label">
              TODAY
            </span>

            <h2>
              {formatLongDate(today)}
            </h2>

            <p>
              {todayAttendance
                ? "Your attendance has been recorded."
                : "You have not marked attendance today."}
            </p>
          </div>

        </div>


        <div
          className={`today-status-pill ${getStatusClass(
            todayStatus
          )}`}
        >
          {getStatusIcon(todayStatus)}

          {normalizeStatus(todayStatus)}
        </div>

      </div>


      {/* =================================================
          KPI CARDS
          ================================================= */}

      <div className="stats-grid dashboard-stats">

        <StatCard
          label="Today's status"
          value={normalizeStatus(
            todayStatus
          )}
          hint={
            todayAttendance
              ? todayAttendance.late
                ? "Late check-in"
                : "Attendance recorded"
              : "Attendance not marked"
          }
          icon={CalendarCheck2}
        />


        <StatCard
          label="Today's shift"
          value={`${formatTime(
            shiftStart
          )} – ${formatTime(shiftEnd)}`}
          hint={shiftName}
          icon={Clock3}
          tone="violet"
        />


        <StatCard
          label="Worked today"
          value={formatMinutes(
            todayWorkedMinutes
          )}
          hint={
            todayAttendance
              ? `${formatMinutes(
                  todayBreakMinutes
                )} break`
              : "No working time"
          }
          icon={Timer}
          tone="cyan"
        />


        <StatCard
          label="Attendance rate"
          value={`${attendanceStatistics.percentage}%`}
          hint={`${attendanceStatistics.present} present records`}
          icon={TrendingUp}
          tone="green"
        />

      </div>


      {/* =================================================
          MAIN GRID
          ================================================= */}

      <div className="dashboard-main-grid">

        {/* ===============================================
            TODAY ATTENDANCE
            =============================================== */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-eyebrow">
                TODAY
              </span>

              <h2>
                Attendance overview
              </h2>
            </div>

            <span className="dashboard-live-pill">
              <i />
              Live
            </span>

          </div>


          {!todayAttendance ? (

            <div className="dashboard-empty">

              <div className="dashboard-empty-icon">
                <CalendarCheck2
                  size={24}
                />
              </div>

              <h3>
                Attendance not marked
              </h3>

              <p>
                You haven't recorded
                attendance for today.
              </p>

              <button
                className="secondary-btn"
                onClick={() =>
                  navigate("/attendance")
                }
              >
                Mark attendance

                <ArrowRight
                  size={16}
                />
              </button>

            </div>

          ) : (

            <div className="attendance-timeline">

              {/* RECORD */}

              <div className="timeline-item">

                <div className="timeline-marker done">
                  <CheckCircle2
                    size={15}
                  />
                </div>

                <div className="timeline-content">
                  <strong>
                    Attendance recorded
                  </strong>

                  <span>
                    {todayAttendance.late
                      ? "Late attendance"
                      : "Attendance recorded successfully"}
                  </span>
                </div>

                <time>
                  {todayAttendance.createdAt
                    ? new Date(
                        todayAttendance.createdAt
                      ).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "--:--"}
                </time>

              </div>


              {/* SHIFT */}

              <div className="timeline-item">

                <div className="timeline-marker done">
                  <Clock3
                    size={15}
                  />
                </div>

                <div className="timeline-content">
                  <strong>
                    Scheduled shift
                  </strong>

                  <span>
                    {shiftName}
                  </span>
                </div>

                <time>
                  {formatTime(
                    shiftStart
                  )}{" "}
                  –{" "}
                  {formatTime(
                    shiftEnd
                  )}
                </time>

              </div>


              {/* WORKED */}

              <div className="timeline-item">

                <div className="timeline-marker done">
                  <Timer
                    size={15}
                  />
                </div>

                <div className="timeline-content">
                  <strong>
                    Working time
                  </strong>

                  <span>
                    {formatMinutes(
                      todayWorkedMinutes
                    )}
                  </span>
                </div>

                <time>
                  {formatMinutes(
                    todayBreakMinutes
                  )}{" "}
                  break
                </time>

              </div>


              {/* STATUS */}

              <div className="timeline-item">

                <div className="timeline-marker done">
                  {getStatusIcon(
                    todayStatus
                  )}
                </div>

                <div className="timeline-content">
                  <strong>
                    Attendance status
                  </strong>

                  <span>
                    {normalizeStatus(
                      todayStatus
                    )}
                  </span>
                </div>

                <time>
                  {todayAttendance.late
                    ? "Late"
                    : "On time"}
                </time>

              </div>


              {/* FINALIZED */}

              <div className="timeline-item">

                <div
                  className={`timeline-marker ${
                    todayAttendance.finalizedAt
                      ? "done"
                      : "next"
                  }`}
                >
                  {todayAttendance.finalizedAt ? (
                    <CheckCircle2
                      size={15}
                    />
                  ) : (
                    <Clock3
                      size={15}
                    />
                  )}
                </div>

                <div className="timeline-content">
                  <strong>
                    Attendance finalization
                  </strong>

                  <span>
                    {todayAttendance.finalizedAt
                      ? "Attendance finalized"
                      : "Attendance pending finalization"}
                  </span>
                </div>

                <time>
                  {todayAttendance.finalizedAt
                    ? "Completed"
                    : "Pending"}
                </time>

              </div>

            </div>
          )}

        </section>


        {/* ===============================================
            SHIFT CARD
            =============================================== */}

        <section className="dashboard-panel dashboard-shift-panel">

          <span className="dashboard-eyebrow">
            YOUR SHIFT
          </span>

          <h2>
            {shiftName}
          </h2>

          <div className="dashboard-shift-time">

            <span>
              {formatTime(shiftStart)}
            </span>

            <span className="shift-arrow">
              →
            </span>

            <span>
              {formatTime(shiftEnd)}
            </span>

          </div>


          <div className="shift-details">

            <div>
              <span>
                WORKED
              </span>

              <strong>
                {formatMinutes(
                  todayWorkedMinutes
                )}
              </strong>
            </div>


            <div>
              <span>
                BREAK
              </span>

              <strong>
                {formatMinutes(
                  todayBreakMinutes
                )}
              </strong>
            </div>

          </div>


          <div className="shift-info">

            <div>
              <Clock3 size={17} />

              <span>
                {todayAttendance?.overnight
                  ? "Overnight shift"
                  : "Today's schedule"}
              </span>
            </div>


            <div>
              <CalendarCheck2 size={17} />

              <span>
                {todayAttendance
                  ? "Attendance recorded"
                  : "Attendance pending"}
              </span>
            </div>

          </div>


          <button
            className="secondary-btn full"
            onClick={() =>
              navigate(
                "/attendance/history"
              )
            }
          >
            View attendance

            <ArrowRight
              size={16}
            />
          </button>

        </section>

      </div>


      {/* =================================================
          ATTENDANCE ANALYTICS
          ================================================= */}

      <section className="dashboard-panel dashboard-analytics">

        <div className="dashboard-panel-header">

          <div>
            <span className="dashboard-eyebrow">
              PERFORMANCE
            </span>

            <h2>
              Attendance performance
            </h2>
          </div>

          <button
            className="text-btn"
            onClick={() =>
              navigate(
                "/attendance/history"
              )
            }
          >
            View all
            <ArrowRight size={15} />
          </button>

        </div>


        <div className="analytics-grid">

          <div className="analytics-summary">

            <div className="analytics-circle">

              <div>
                <strong>
                  {attendanceStatistics.percentage}%
                </strong>

                <span>
                  Attendance
                </span>
              </div>

            </div>


            <div className="analytics-stats">

              <div>
                <span>Present</span>
                <strong>
                  {attendanceStatistics.present}
                </strong>
              </div>

              <div>
                <span>Late</span>
                <strong>
                  {attendanceStatistics.late}
                </strong>
              </div>

              <div>
                <span>Absent</span>
                <strong>
                  {attendanceStatistics.absent}
                </strong>
              </div>

            </div>

          </div>


          <div className="attendance-bars">

            <div className="bars-title">
              Last 7 attendance records
            </div>

            {recentAttendance.length === 0 ? (

              <div className="analytics-empty">
                No attendance records available.
              </div>

            ) : (

              recentAttendance.map(
                (record) => {

                  const statusClass =
                    getStatusClass(
                      record?.status
                    );

                  return (
                    <div
                      className="attendance-bar-row"
                      key={
                        record?.id ||
                        record?.attendanceDate
                      }
                    >

                      <span className="bar-date">
                        {formatDate(
                          record?.attendanceDate
                        )}
                      </span>

                      <div className="bar-track">

                        <div
                          className={`bar-fill ${statusClass}`}
                          style={{
                            width:
                              statusClass ===
                              "absent"
                                ? "20%"
                                : "100%",
                          }}
                        />

                      </div>

                      <span
                        className={`bar-status ${statusClass}`}
                      >
                        {normalizeStatus(
                          record?.status
                        )}
                      </span>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

      </section>


      {/* =================================================
          RECENT ATTENDANCE TABLE
          ================================================= */}

      <section className="dashboard-panel dashboard-table-panel">

        <div className="dashboard-panel-header">

          <div>
            <span className="dashboard-eyebrow">
              RECENT
            </span>

            <h2>
              Recent attendance
            </h2>
          </div>

          <button
            className="text-btn"
            onClick={() =>
              navigate(
                "/attendance/history"
              )
            }
          >
            View all
            <ArrowRight size={15} />
          </button>

        </div>


        {recentAttendance.length === 0 ? (

          <div className="dashboard-empty-table">

            <CalendarDays size={22} />

            <span>
              No attendance records found.
            </span>

          </div>

        ) : (

          <div className="dashboard-table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Scheduled</th>
                  <th>Worked</th>
                  <th>Break</th>
                  <th>Status</th>
                </tr>
              </thead>


              <tbody>

                {recentAttendance.map(
                  (record) => (

                    <tr
                      key={
                        record?.id ||
                        record?.attendanceDate
                      }
                    >

                      <td>
                        <strong>
                          {formatDate(
                            record?.attendanceDate
                          )}
                        </strong>
                      </td>

                      <td>
                        {record?.shiftName ||
                          "-"}
                      </td>

                      <td>
                        {formatTime(
                          record?.scheduledStartTime
                        )}{" "}
                        –{" "}
                        {formatTime(
                          record?.scheduledEndTime
                        )}
                      </td>

                      <td>
                        {formatMinutes(
                          record?.workedMinutes
                        )}
                      </td>

                      <td>
                        {formatMinutes(
                          record?.breakMinutes
                        )}
                      </td>

                      <td>

                        <span
                          className={`dashboard-status-badge ${getStatusClass(
                            record?.status
                          )}`}
                        >
                          {getStatusIcon(
                            record?.status
                          )}

                          {normalizeStatus(
                            record?.status
                          )}
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>


      {/* =================================================
          EMPLOYEE INFORMATION
          ================================================= */}

      <section className="dashboard-profile-card">

        <div className="profile-card-icon">
          <UserRound size={22} />
        </div>


        <div className="profile-card-item">
          <span>
            EMPLOYEE
          </span>

          <strong>
            {fullName}
          </strong>
        </div>


        <div className="profile-card-item">
          <span>
            EMPLOYEE CODE
          </span>

          <strong>
            {employeeCode}
          </strong>
        </div>


        <div className="profile-card-item">
          <span>
            DEPARTMENT
          </span>

          <strong>
            {department}
          </strong>
        </div>


        <div className="profile-card-item">
          <span>
            DESIGNATION
          </span>

          <strong>
            {designation}
          </strong>
        </div>


        <div className="profile-card-item">
          <span>
            EMAIL
          </span>

          <strong>
            {email}
          </strong>
        </div>

      </section>


      {/* =================================================
          FOOTER ACTIONS
          ================================================= */}

      <div className="dashboard-footer-actions">

        <button
          className="secondary-btn"
          onClick={() =>
            navigate("/profile")
          }
        >
          <UserRound size={16} />
          View profile
        </button>


        <button
          className="secondary-btn"
          onClick={() =>
            navigate(
              "/attendance/history"
            )
          }
        >
          <CalendarDays size={16} />
          Attendance history
        </button>


        <button
          className="primary-btn"
          onClick={() =>
            navigate("/attendance")
          }
        >
          <CalendarCheck2 size={16} />
          Mark attendance
        </button>

      </div>

    </div>
  );
}