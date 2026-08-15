import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Download,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  UserCheck,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader from "../../components/common/PageHeader";

import {
  getMyAttendance,
} from "../../api/attendanceApi";

import "./myAttendance.css";


/* =========================================================
   HELPERS
   ========================================================= */

function getApiData(response) {
  return response?.data ?? response ?? [];
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(
    `${dateValue}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatMinutes(minutes) {
  const totalMinutes =
    Number(minutes) || 0;

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const mins =
    totalMinutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}


function getStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  switch (
    status.toUpperCase()
  ) {
    case "ACTIVE":
      return "Active";

    case "FINALIZED":
      return "Finalized";

    case "MISSED_PUNCH_OUT":
      return "Missed Punch Out";

    case "REVIEW_REQUIRED":
      return "Review Required";

    default:
      return status.replaceAll(
        "_",
        " "
      );
  }
}


function getStatusClass(status) {
  if (!status) {
    return "unknown";
  }

  switch (
    status.toUpperCase()
  ) {
    case "ACTIVE":
      return "active";

    case "FINALIZED":
      return "finalized";

    case "MISSED_PUNCH_OUT":
      return "missed";

    case "REVIEW_REQUIRED":
      return "review";

    default:
      return "unknown";
  }
}


function getMonthKey(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue)
    .substring(0, 7);
}


function getFirstPunch(record) {
  const intervals =
    Array.isArray(record?.intervals)
      ? record.intervals
      : [];

  return (
    intervals[0]?.punchIn ||
    null
  );
}


function getLastPunchOut(record) {
  const intervals =
    Array.isArray(record?.intervals)
      ? record.intervals
      : [];

  for (
    let index =
      intervals.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      intervals[index]?.punchOut
    ) {
      return intervals[index]
        .punchOut;
    }
  }

  return null;
}


function getPunchOut(record) {
  return getLastPunchOut(
    record
  );
}


/* =========================================================
   COMPONENT
   ========================================================= */

function MyAttendance() {

  /* =======================================================
     STATE
     ======================================================= */

  const [
    attendance,
    setAttendance,
  ] = useState([]);

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
    search,
    setSearch,
  ] = useState("");

  const [
    monthFilter,
    setMonthFilter,
  ] = useState("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    selectedRecord,
    setSelectedRecord,
  ] = useState(null);


  /* =======================================================
     LOAD ATTENDANCE
     ======================================================= */

  const loadAttendance =
    async (
      showRefresh = false
    ) => {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {

        const response =
          await getMyAttendance();

        const data =
          getApiData(response);

        if (
          Array.isArray(data)
        ) {

          setAttendance(data);

        } else {

          setAttendance([]);

          setError(
            "Unexpected attendance response from server."
          );

        }

      } catch (err) {

        console.error(
          "Unable to load attendance:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Unable to load your attendance."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }
    };


  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    loadAttendance();

  }, []);


  /* =======================================================
     AVAILABLE MONTHS
     ======================================================= */

  const months =
    useMemo(() => {

      const uniqueMonths =
        new Set();

      attendance.forEach(
        (record) => {

          const month =
            getMonthKey(
              record?.attendanceDate
            );

          if (month) {
            uniqueMonths.add(
              month
            );
          }

        }
      );

      return Array.from(
        uniqueMonths
      ).sort(
        (a, b) =>
          b.localeCompare(a)
      );

    }, [attendance]);


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredAttendance =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase();

      return attendance
        .filter(
          (record) => {

            /* Month */

            if (
              monthFilter !==
                "ALL" &&
              getMonthKey(
                record?.attendanceDate
              ) !== monthFilter
            ) {
              return false;
            }


            /* Status */

            if (
              statusFilter !==
                "ALL" &&
              record?.status !==
                statusFilter
            ) {
              return false;
            }


            /* Search */

            if (
              !searchValue
            ) {
              return true;
            }

            const searchableText =
              [
                record?.attendanceDate,
                record?.employeeCode,
                record?.employeeName,
                record?.shiftCode,
                record?.shiftName,
                record?.status,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
              searchValue
            );

          }
        )
        .sort(
          (a, b) =>
            String(
              b?.attendanceDate ||
              ""
            ).localeCompare(
              String(
                a?.attendanceDate ||
                ""
              )
            )
        );

    }, [
      attendance,
      monthFilter,
      statusFilter,
      search,
    ]);


  /* =======================================================
     SUMMARY
     ======================================================= */

  const summary =
    useMemo(() => {

      const records =
        filteredAttendance;

      const finalized =
        records.filter(
          (record) =>
            record?.status ===
            "FINALIZED"
        ).length;

      const active =
        records.filter(
          (record) =>
            record?.status ===
            "ACTIVE"
        ).length;

      const late =
        records.filter(
          (record) =>
            record?.late === true
        ).length;

      const workedMinutes =
        records.reduce(
          (
            total,
            record
          ) =>
            total +
            (
              Number(
                record?.workedMinutes
              ) || 0
            ),
          0
        );

      const breakMinutes =
        records.reduce(
          (
            total,
            record
          ) =>
            total +
            (
              Number(
                record?.breakMinutes
              ) || 0
            ),
          0
        );

      return {
        total: records.length,
        finalized,
        active,
        late,
        workedMinutes,
        breakMinutes,
      };

    }, [
      filteredAttendance,
    ]);


  /* =======================================================
     MONTH LABEL
     ======================================================= */

  const getMonthLabel =
    (monthKey) => {

      if (
        !monthKey ||
        monthKey === "ALL"
      ) {
        return "All months";
      }

      const date =
        new Date(
          `${monthKey}-01T00:00:00`
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return monthKey;
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric",
        }
      );
    };


  /* =======================================================
     CSV EXPORT
     ======================================================= */

  const exportCsv = () => {

    if (
      filteredAttendance.length ===
      0
    ) {
      return;
    }

    const headers = [
      "Date",
      "Employee Code",
      "Employee Name",
      "Shift",
      "Scheduled Start",
      "Scheduled End",
      "Check In",
      "Check Out",
      "Worked Minutes",
      "Break Minutes",
      "Late",
      "Status",
    ];

    const rows =
      filteredAttendance.map(
        (record) => {

          const punchIn =
            getFirstPunch(
              record
            );

          const punchOut =
            getPunchOut(
              record
            );

          return [
            record?.attendanceDate ||
              "",
            record?.employeeCode ||
              "",
            record?.employeeName ||
              "",
            record?.shiftName ||
              record?.shiftCode ||
              "",
            record?.scheduledStartTime ||
              "",
            record?.scheduledEndTime ||
              "",
            punchIn?.recordedAt
              ? formatDateTime(
                  punchIn.recordedAt
                )
              : "",
            punchOut?.recordedAt
              ? formatDateTime(
                  punchOut.recordedAt
                )
              : "",
            record?.workedMinutes ??
              0,
            record?.breakMinutes ??
              0,
            record?.late
              ? "Yes"
              : "No",
            getStatusLabel(
              record?.status
            ),
          ];

        }
      );

    const csv =
      [
        headers,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value ?? ""
                  ).replaceAll(
                    '"',
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `my-attendance-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };


  /* =======================================================
     RECORD DETAILS
     ======================================================= */

  const renderPunchDetails =
    (record) => {

      const intervals =
        Array.isArray(
          record?.intervals
        )
          ? record.intervals
          : [];

      if (
        intervals.length ===
        0
      ) {
        return (
          <div className="attendance-no-punch">
            No punch interval information
            is available for this record.
          </div>
        );
      }

      return (
        <div className="attendance-intervals">

          {intervals.map(
            (
              interval,
              index
            ) => {

              const punchIn =
                interval?.punchIn;

              const punchOut =
                interval?.punchOut;

              return (
                <div
                  className="attendance-interval"
                  key={
                    interval?.id ||
                    index
                  }
                >

                  <div className="interval-title">
                    Work interval{" "}
                    {index + 1}
                  </div>

                  <div className="interval-grid">

                    <div className="punch-card">

                      <div className="punch-card-title">
                        <UserCheck
                          size={16}
                        />

                        Punch in
                      </div>

                      <strong>
                        {
                          formatDateTime(
                            punchIn?.recordedAt
                          )
                        }
                      </strong>

                      {punchIn && (
                        <div className="punch-meta">

                          <span>
                            <MapPin
                              size={13}
                            />

                            {Number(
                              punchIn.latitude
                            ).toFixed(5)}
                            ,{" "}
                            {Number(
                              punchIn.longitude
                            ).toFixed(5)}
                          </span>

                          <span>
                            Accuracy:{" "}
                            {Number(
                              punchIn.accuracyMeters ||
                                0
                            ).toFixed(1)}
                            m
                          </span>

                          {punchIn.photoId && (
                            <span>
                              Photo ID:{" "}
                              {punchIn.photoId}
                            </span>
                          )}

                        </div>
                      )}

                    </div>


                    <div className="punch-card">

                      <div className="punch-card-title">
                        <CheckCircle2
                          size={16}
                        />

                        Punch out
                      </div>

                      <strong>
                        {
                          formatDateTime(
                            punchOut?.recordedAt
                          )
                        }
                      </strong>

                      {punchOut && (
                        <div className="punch-meta">

                          <span>
                            <MapPin
                              size={13}
                            />

                            {Number(
                              punchOut.latitude
                            ).toFixed(5)}
                            ,{" "}
                            {Number(
                              punchOut.longitude
                            ).toFixed(5)}
                          </span>

                          <span>
                            Accuracy:{" "}
                            {Number(
                              punchOut.accuracyMeters ||
                                0
                            ).toFixed(1)}
                            m
                          </span>

                          {punchOut.photoId && (
                            <span>
                              Photo ID:{" "}
                              {punchOut.photoId}
                            </span>
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                  <div className="interval-worked">
                    Worked{" "}
                    {formatMinutes(
                      interval?.workedMinutes
                    )}
                  </div>

                </div>
              );
            }
          )}

        </div>
      );
    };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="my-attendance-page">

      <PageHeader
        eyebrow="ATTENDANCE"
        title="My Attendance"
        description="View your attendance history, working hours and punch details."
        action={
          <button
            type="button"
            className="my-attendance-refresh"
            onClick={() =>
              loadAttendance(true)
            }
            disabled={
              loading ||
              refreshing
            }
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            Refresh
          </button>
        }
      />


      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (

        <div className="my-attendance-error">

          <XCircle size={18} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadAttendance(true)
            }
          >
            Try again
          </button>

        </div>

      )}


      {/* ===================================================
          SUMMARY
          =================================================== */}

      {!loading && (

        <div className="attendance-summary-grid">

          <div className="attendance-summary-card">

            <div className="summary-icon">
              <CalendarDays
                size={20}
              />
            </div>

            <div>
              <span>
                Attendance days
              </span>

              <strong>
                {summary.total}
              </strong>
            </div>

          </div>


          <div className="attendance-summary-card">

            <div className="summary-icon">
              <CheckCircle2
                size={20}
              />
            </div>

            <div>
              <span>
                Finalized
              </span>

              <strong>
                {summary.finalized}
              </strong>
            </div>

          </div>


          <div className="attendance-summary-card">

            <div className="summary-icon">
              <Clock3
                size={20}
              />
            </div>

            <div>
              <span>
                Late days
              </span>

              <strong>
                {summary.late}
              </strong>
            </div>

          </div>


          <div className="attendance-summary-card">

            <div className="summary-icon">
              <Timer
                size={20}
              />
            </div>

            <div>
              <span>
                Worked
              </span>

              <strong>
                {formatMinutes(
                  summary.workedMinutes
                )}
              </strong>
            </div>

          </div>


          <div className="attendance-summary-card">

            <div className="summary-icon">
              <Coffee
                size={20}
              />
            </div>

            <div>
              <span>
                Break time
              </span>

              <strong>
                {formatMinutes(
                  summary.breakMinutes
                )}
              </strong>
            </div>

          </div>

        </div>

      )}


      {/* ===================================================
          FILTER BAR
          =================================================== */}

      <section className="attendance-panel">

        <div className="attendance-filter-header">

          <div>

            <div className="attendance-panel-eyebrow">
              HISTORY
            </div>

            <h2>
              Attendance records
            </h2>

          </div>

          <button
            type="button"
            className="attendance-export-btn"
            onClick={exportCsv}
            disabled={
              filteredAttendance.length ===
              0
            }
          >
            <Download
              size={16}
            />

            Export CSV
          </button>

        </div>


        <div className="attendance-filters">

          <div className="attendance-search">

            <Search
              size={17}
            />

            <input
              type="search"
              placeholder="Search attendance..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <select
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(
                event.target.value
              )
            }
            aria-label="Filter by month"
          >

            <option value="ALL">
              All months
            </option>

            {months.map(
              (month) => (

                <option
                  value={month}
                  key={month}
                >
                  {getMonthLabel(
                    month
                  )}
                </option>

              )
            )}

          </select>


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            aria-label="Filter by status"
          >

            <option value="ALL">
              All status
            </option>

            <option value="FINALIZED">
              Finalized
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="MISSED_PUNCH_OUT">
              Missed punch out
            </option>

            <option value="REVIEW_REQUIRED">
              Review required
            </option>

          </select>

        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (

          <div className="attendance-loading">

            <RefreshCw
              size={22}
              className="spin"
            />

            <span>
              Loading your attendance...
            </span>

          </div>

        )}


        {/* =================================================
            EMPTY
            ================================================= */}

        {!loading &&
          filteredAttendance.length ===
            0 && (

            <div className="attendance-empty">

              <div className="attendance-empty-icon">
                <CalendarDays
                  size={28}
                />
              </div>

              <h3>
                No attendance records found
              </h3>

              <p>
                Try changing your filters or
                mark attendance to create a
                record.
              </p>

            </div>

          )}


        {/* =================================================
            DESKTOP TABLE
            ================================================= */}

        {!loading &&
          filteredAttendance.length >
            0 && (

            <div className="attendance-table-wrapper">

              <table className="attendance-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Shift
                    </th>

                    <th>
                      Check in
                    </th>

                    <th>
                      Check out
                    </th>

                    <th>
                      Worked
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

                  {filteredAttendance.map(
                    (record) => {

                      const punchIn =
                        getFirstPunch(
                          record
                        );

                      const punchOut =
                        getPunchOut(
                          record
                        );

                      return (

                        <tr
                          key={
                            record?.id ||
                            record?.attendanceDate
                          }
                        >

                          <td>

                            <div className="date-cell">

                              <strong>
                                {
                                  formatDate(
                                    record?.attendanceDate
                                  )
                                }
                              </strong>

                              {record?.late && (
                                <span className="late-label">
                                  Late
                                </span>
                              )}

                            </div>

                          </td>


                          <td>

                            <div className="shift-cell">

                              <strong>
                                {
                                  record?.shiftName ||
                                  record?.shiftCode ||
                                  "—"
                                }
                              </strong>

                              {record?.scheduledStartTime &&
                                record?.scheduledEndTime && (
                                  <span>
                                    {
                                      record.scheduledStartTime
                                    }
                                    {" – "}
                                    {
                                      record.scheduledEndTime
                                    }
                                  </span>
                                )}

                            </div>

                          </td>


                          <td>
                            <div className="time-cell">
                              <Clock3
                                size={14}
                              />

                              {
                                formatTime(
                                  punchIn?.recordedAt
                                )
                              }
                            </div>
                          </td>


                          <td>
                            <div className="time-cell">
                              <Clock3
                                size={14}
                              />

                              {
                                formatTime(
                                  punchOut?.recordedAt
                                )
                              }
                            </div>
                          </td>


                          <td>

                            <strong className="worked-cell">
                              {
                                formatMinutes(
                                  record?.workedMinutes
                                )
                              }
                            </strong>

                          </td>


                          <td>

                            <span
                              className={
                                `attendance-status ${getStatusClass(
                                  record?.status
                                )}`
                              }
                            >

                              {record?.status ===
                                "FINALIZED" && (
                                <CheckCircle2
                                  size={14}
                                />
                              )}

                              {record?.status ===
                                "ACTIVE" && (
                                <Clock3
                                  size={14}
                                />
                              )}

                              {record?.status !==
                                "FINALIZED" &&
                                record?.status !==
                                "ACTIVE" && (
                                  <XCircle
                                    size={14}
                                  />
                                )}

                              {
                                getStatusLabel(
                                  record?.status
                                )
                              }

                            </span>

                          </td>


                          <td>

                            <button
                              type="button"
                              className="attendance-view-btn"
                              onClick={() =>
                                setSelectedRecord(
                                  record
                                )
                              }
                            >

                              <Eye
                                size={15}
                              />

                              View

                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {/* ===================================================
          DETAILS
          =================================================== */}

      {selectedRecord && (

        <div
          className="attendance-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedRecord(
                null
              );
            }

          }}
        >

          <div className="attendance-modal">

            <div className="attendance-modal-header">

              <div>

                <div className="attendance-panel-eyebrow">
                  ATTENDANCE DETAILS
                </div>

                <h2>
                  {
                    formatDate(
                      selectedRecord.attendanceDate
                    )
                  }
                </h2>

              </div>


              <button
                type="button"
                className="attendance-modal-close"
                onClick={() =>
                  setSelectedRecord(
                    null
                  )
                }
                aria-label="Close details"
              >
                ×
              </button>

            </div>


            <div className="attendance-detail-summary">

              <div>

                <span>
                  Status
                </span>

                <strong
                  className={
                    `attendance-status ${getStatusClass(
                      selectedRecord.status
                    )}`
                  }
                >
                  {getStatusLabel(
                    selectedRecord.status
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Worked
                </span>

                <strong>
                  {
                    formatMinutes(
                      selectedRecord.workedMinutes
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  Break
                </span>

                <strong>
                  {
                    formatMinutes(
                      selectedRecord.breakMinutes
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  Late
                </span>

                <strong>
                  {
                    selectedRecord.late
                      ? "Yes"
                      : "No"
                  }
                </strong>

              </div>

            </div>


            <div className="attendance-detail-section">

              <div className="detail-section-title">
                Shift
              </div>

              <div className="detail-grid">

                <div>
                  <span>
                    Shift
                  </span>

                  <strong>
                    {
                      selectedRecord.shiftName ||
                      selectedRecord.shiftCode ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Scheduled
                  </span>

                  <strong>
                    {
                      selectedRecord.scheduledStartTime ||
                      "—"
                    }
                    {" – "}
                    {
                      selectedRecord.scheduledEndTime ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Created
                  </span>

                  <strong>
                    {
                      formatDateTime(
                        selectedRecord.createdAt
                      )
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Finalized
                  </span>

                  <strong>
                    {
                      formatDateTime(
                        selectedRecord.finalizedAt
                      )
                    }
                  </strong>
                </div>

              </div>

            </div>


            <div className="attendance-detail-section">

              <div className="detail-section-title">
                Punch details
              </div>

              {renderPunchDetails(
                selectedRecord
              )}

            </div>


            <div className="attendance-detail-footer">

              <span>
                Attendance ID:
              </span>

              <code>
                {
                  selectedRecord.id ||
                  "—"
                }
              </code>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


export default MyAttendance;