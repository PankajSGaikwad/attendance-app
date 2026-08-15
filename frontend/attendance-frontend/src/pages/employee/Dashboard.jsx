import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  Clock3,
  Timer,
  TrendingUp,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

import { getMyProfile } from "../../api/employeeApi";
import { getMyAttendance } from "../../api/attendanceApi";


function formatMinutes(minutes = 0) {
  const totalMinutes = Number(minutes) || 0;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}


function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  try {
    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateString;
  }
}


function formatTime(timeString) {
  if (!timeString) {
    return "--:--";
  }

  return timeString;
}


function getStatusClass(status) {
  if (!status) {
    return "pending";
  }

  const normalized =
    String(status).toLowerCase();

  if (
    normalized.includes("present") ||
    normalized.includes("completed") ||
    normalized.includes("approved")
  ) {
    return "present";
  }

  if (
    normalized.includes("late") ||
    normalized.includes("partial")
  ) {
    return "late";
  }

  if (
    normalized.includes("absent") ||
    normalized.includes("rejected")
  ) {
    return "absent";
  }

  return "pending";
}


function Dashboard() {
  const [profile, setProfile] =
    useState(null);

  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * Load employee dashboard data
   */

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          attendanceResponse,
        ] = await Promise.all([
          getMyProfile(),
          getMyAttendance(),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(
          profileResponse.data
        );

        setAttendance(
          Array.isArray(
            attendanceResponse.data
          )
            ? attendanceResponse.data
            : []
        );

      } catch (err) {
        console.error(
          "Dashboard loading failed:",
          err
        );

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load dashboard data."
          );
        }

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };

  }, []);


  /*
   * Find today's attendance
   */

  const todayAttendance =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      return attendance.find(
        (record) =>
          record.attendanceDate === today
      );

    }, [attendance]);


  /*
   * Recent attendance
   */

  const recentAttendance =
    useMemo(() => {
      return [...attendance]
        .sort((a, b) =>
          String(
            b.attendanceDate || ""
          ).localeCompare(
            String(
              a.attendanceDate || ""
            )
          )
        )
        .slice(0, 5);

    }, [attendance]);


  /*
   * Dashboard values
   */

  const employeeName =
    profile?.firstName ||
    "there";

  const employeeEmail =
    profile?.email ||
    "Employee";

  const todayStatus =
    todayAttendance?.status ||
    "NOT MARKED";

  const workedToday =
    formatMinutes(
      todayAttendance?.workedMinutes ||
        0
    );

  const shiftName =
    todayAttendance?.shiftName ||
    "No shift assigned";

  const shiftStart =
    todayAttendance?.scheduledStartTime ||
    "--:--";

  const shiftEnd =
    todayAttendance?.scheduledEndTime ||
    "--:--";


  /*
   * Loading state
   */

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="loading-spinner" />

        <p>
          Loading your attendance
          dashboard...
        </p>

      </div>
    );
  }


  return (
    <div>

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <PageHeader
        eyebrow="EMPLOYEE WORKSPACE"
        title={`Good morning, ${employeeName}.`}
        description="Here's your attendance overview for today."
        action={
          <button
            className="primary-btn"
            onClick={() =>
              window.location.href =
                "/attendance"
            }
          >
            <CalendarCheck2 size={17} />

            Mark attendance
          </button>
        }
      />


      {/* =====================================================
          ERROR MESSAGE
          ===================================================== */}

      {error && (
        <div className="dashboard-error">

          <strong>
            Unable to load some data
          </strong>

          <span>
            {error}
          </span>

        </div>
      )}


      {/* =====================================================
          STAT CARDS
          ===================================================== */}

      <div className="stats-grid">

        <StatCard
          label="Today's status"
          value={todayStatus}
          hint={
            todayAttendance
              ? todayAttendance.late
                ? "Late check-in"
                : "Attendance recorded"
              : "No attendance recorded yet"
          }
          icon={CalendarCheck2}
        />


        <StatCard
          label="Today's shift"
          value={`${shiftStart}–${shiftEnd}`}
          hint={shiftName}
          icon={Clock3}
          tone="violet"
        />


        <StatCard
          label="Worked today"
          value={workedToday}
          hint={
            todayAttendance
              ? `${formatMinutes(
                  todayAttendance.breakMinutes ||
                    0
                )} break`
              : "No working time recorded"
          }
          icon={Timer}
          tone="cyan"
        />


        <StatCard
          label="Attendance records"
          value={attendance.length}
          hint={
            profile?.employeeCode
              ? `Employee ${profile.employeeCode}`
              : "Total records"
          }
          icon={TrendingUp}
          tone="green"
        />

      </div>


      {/* =====================================================
          MAIN DASHBOARD
          ===================================================== */}

      <div className="dashboard-grid">


        {/* ===================================================
            TODAY'S ATTENDANCE
            =================================================== */}

        <section className="panel">

          <div className="panel-title">

            <div>

              <div className="eyebrow">
                TODAY
              </div>

              <h2>
                Attendance overview
              </h2>

            </div>


            <span className="live-pill">

              <i />

              Live

            </span>

          </div>


          {!todayAttendance ? (

            <div className="empty-dashboard-state">

              <div className="empty-state-icon">

                <CalendarCheck2
                  size={22}
                />

              </div>

              <strong>
                Attendance not marked
              </strong>

              <span>
                You haven't recorded
                attendance for today.
              </span>

              <button
                className="secondary-btn"
                onClick={() =>
                  window.location.href =
                    "/attendance"
                }
              >
                Mark attendance

                <ArrowRight
                  size={16}
                />
              </button>

            </div>

          ) : (

            <div className="timeline">

              <div className="timeline-line" />


              {/* CHECK IN */}

              <div className="timeline-row">

                <div className="timeline-dot done" />

                <div>

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
                  {formatTime(
                    todayAttendance
                      .scheduledStartTime
                  )}
                </time>

              </div>


              {/* WORKED */}

              <div className="timeline-row">

                <div className="timeline-dot done" />

                <div>

                  <strong>
                    Working time
                  </strong>

                  <span>
                    {formatMinutes(
                      todayAttendance
                        .workedMinutes || 0
                    )}
                  </span>

                </div>

                <time>
                  {formatMinutes(
                    todayAttendance
                      .breakMinutes || 0
                  )}{" "}
                  break
                </time>

              </div>


              {/* STATUS */}

              <div className="timeline-row">

                <div className="timeline-dot done" />

                <div>

                  <strong>
                    Status
                  </strong>

                  <span>
                    {todayAttendance.status}
                  </span>

                </div>

                <time>
                  {todayAttendance.late
                    ? "Late"
                    : "On time"}
                </time>

              </div>


              {/* CHECK OUT */}

              <div className="timeline-row">

                <div className="timeline-dot next" />

                <div>

                  <strong>
                    Scheduled end
                  </strong>

                  <span>
                    {todayAttendance
                      .scheduledEndTime ||
                      "Not available"}
                  </span>

                </div>

                <time>
                  {todayAttendance
                    .finalizedAt
                    ? "Finalized"
                    : "Pending"}
                </time>

              </div>

            </div>

          )}

        </section>


        {/* ===================================================
            SHIFT CARD
            =================================================== */}

        <section className="panel shift-card">

          <div className="eyebrow">
            YOUR SHIFT
          </div>

          <h2>
            {shiftName}
          </h2>


          <div className="shift-time">

            {shiftStart}

            <span>
              →
            </span>

            {shiftEnd}

          </div>


          <div className="shift-meta">

            <span>

              {todayAttendance?.overnight
                ? "Overnight shift"
                : "Today's schedule"}

            </span>

            <span>

              {todayAttendance
                ? formatMinutes(
                    todayAttendance
                      .workedMinutes || 0
                  )
                : "0h 0m"}

            </span>

          </div>


          <button
            className="secondary-btn full"
            onClick={() =>
              window.location.href =
                "/attendance"
            }
          >

            View attendance

            <ArrowRight
              size={16}
            />

          </button>

        </section>

      </div>


      {/* =====================================================
          RECENT ATTENDANCE
          ===================================================== */}

      <section className="panel table-panel">

        <div className="panel-title">

          <div>

            <div className="eyebrow">
              RECENT
            </div>

            <h2>
              Attendance history
            </h2>

          </div>


          <button
            className="text-btn"
            onClick={() =>
              window.location.href =
                "/attendance"
            }
          >

            View all

            <ArrowRight
              size={15}
            />

          </button>

        </div>


        {recentAttendance.length === 0 ? (

          <div className="empty-table-state">

            <Activity size={20} />

            <span>
              No attendance records
              found.
            </span>

          </div>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Shift
                  </th>

                  <th>
                    Scheduled
                  </th>

                  <th>
                    Worked
                  </th>

                  <th>
                    Break
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentAttendance.map(
                  (record) => (

                    <tr
                      key={
                        record.id ||
                        record.attendanceDate
                      }
                    >

                      <td>
                        {formatDate(
                          record.attendanceDate
                        )}
                      </td>


                      <td>
                        {record.shiftName ||
                          "-"}
                      </td>


                      <td>

                        {formatTime(
                          record.scheduledStartTime
                        )}

                        {" – "}

                        {formatTime(
                          record.scheduledEndTime
                        )}

                      </td>


                      <td>
                        {formatMinutes(
                          record.workedMinutes ||
                            0
                        )}
                      </td>


                      <td>
                        {formatMinutes(
                          record.breakMinutes ||
                            0
                        )}
                      </td>


                      <td>

                        <span
                          className={
                            `badge ${getStatusClass(
                              record.status
                            )}`
                          }
                        >

                          {record.status ||
                            "PENDING"}

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


      {/* =====================================================
          EMPLOYEE INFORMATION
          ===================================================== */}

      <section className="dashboard-profile-strip">

        <div>

          <span>
            EMPLOYEE
          </span>

          <strong>
            {employeeName}{" "}
            {profile?.lastName || ""}
          </strong>

        </div>


        <div>

          <span>
            EMPLOYEE CODE
          </span>

          <strong>
            {profile?.employeeCode ||
              "Not assigned"}
          </strong>

        </div>


        <div>

          <span>
            DEPARTMENT
          </span>

          <strong>
            {profile?.departmentName ||
              "Not assigned"}
          </strong>

        </div>


        <div>

          <span>
            DESIGNATION
          </span>

          <strong>
            {profile?.designationName ||
              "Not assigned"}
          </strong>

        </div>


        <div>

          <span>
            EMAIL
          </span>

          <strong>
            {employeeEmail}
          </strong>

        </div>

      </section>

    </div>
  );
}


export default Dashboard;