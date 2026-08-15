import {
  CalendarDays,
  Check,
  Clock3,
  Eye,
  History,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getDepartments,
} from "../../api/departmentApi";

import {
  getShifts,
} from "../../api/shiftApi";

import {
  assignDepartmentShift,
  getDepartmentShiftHistory,
} from "../../api/shiftAssignmentsApi";

import "./shiftAssignments.css";


/* =========================================================
   HELPERS
========================================================= */

function getTodayDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        `${value}T00:00:00`
      )
    );
  } catch {
    return "—";
  }
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return "—";
  }
}


function getErrorMessage(
  error,
  fallback
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}


function getId(value) {
  if (!value) {
    return null;
  }

  return (
    value.id ||
    value._id ||
    value.departmentId ||
    value.shiftId ||
    null
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function AssignmentStatusBadge({
  assignment,
  today,
}) {
  const effectiveFrom =
    assignment.effectiveFrom;

  const effectiveTo =
    assignment.effectiveTo;


  const beforeStart =
    effectiveFrom &&
    today < effectiveFrom;


  const expired =
    effectiveTo &&
    today > effectiveTo;


  if (beforeStart) {
    return (
      <span className="assignment-status assignment-status-upcoming">
        <span />
        UPCOMING
      </span>
    );
  }


  if (expired) {
    return (
      <span className="assignment-status assignment-status-expired">
        <span />
        EXPIRED
      </span>
    );
  }


  return (
    <span className="assignment-status assignment-status-active">
      <span />
      ACTIVE
    </span>
  );
}


/* =========================================================
   ASSIGNMENT DETAILS MODAL
========================================================= */

function AssignmentDetailsModal({
  assignment,
  department,
  onClose,
}) {
  if (!assignment) {
    return null;
  }


  const shift =
    assignment.shift;


  return (
    <div
      className="assignment-modal-backdrop"
      onClick={onClose}
    >

      <div
        className="assignment-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="assignment-modal-header">

          <div>

            <div className="assignment-modal-eyebrow">
              SHIFT ASSIGNMENT
            </div>

            <h2>
              {department?.name ||
                "Department"}
            </h2>

            <p>
              Assignment details and
              effective period.
            </p>

          </div>


          <button
            type="button"
            className="assignment-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        {/* SHIFT HERO */}

        <div className="assignment-detail-hero">

          <div className="assignment-detail-icon">
            <Clock3 size={22} />
          </div>


          <div className="assignment-detail-hero-content">

            <strong>
              {shift?.name ||
                "Unknown shift"}
            </strong>

            <span>
              {shift?.code ||
                "—"}

              {" · "}

              {shift?.startTime ||
                "--:--"}

              {" — "}

              {shift?.endTime ||
                "--:--"}
            </span>

          </div>

        </div>


        {/* ASSIGNMENT INFORMATION */}

        <div className="assignment-detail-section">

          <div className="assignment-detail-section-title">
            ASSIGNMENT INFORMATION
          </div>


          <div className="assignment-detail-grid">

            <div className="assignment-detail-item">

              <span>
                Assignment ID
              </span>

              <strong>
                {assignment.id ||
                  "—"}
              </strong>

            </div>


            <div className="assignment-detail-item">

              <span>
                Department
              </span>

              <strong>
                {department?.name ||
                  assignment.departmentId}
              </strong>

            </div>


            <div className="assignment-detail-item">

              <span>
                Effective from
              </span>

              <strong>
                {formatDate(
                  assignment.effectiveFrom
                )}
              </strong>

            </div>


            <div className="assignment-detail-item">

              <span>
                Effective to
              </span>

              <strong>
                {assignment.effectiveTo
                  ? formatDate(
                      assignment.effectiveTo
                    )
                  : "No end date"}
              </strong>

            </div>


            <div className="assignment-detail-item">

              <span>
                Assigned by
              </span>

              <strong>
                {assignment.assignedBy ||
                  "—"}
              </strong>

            </div>


            <div className="assignment-detail-item">

              <span>
                Status
              </span>

              <AssignmentStatusBadge
                assignment={
                  assignment
                }
                today={
                  getTodayDate()
                }
              />

            </div>

          </div>

        </div>


        {/* SHIFT INFORMATION */}

        {shift && (

          <div className="assignment-detail-section">

            <div className="assignment-detail-section-title">
              SHIFT INFORMATION
            </div>


            <div className="assignment-detail-grid">

              <div className="assignment-detail-item">

                <span>
                  Shift code
                </span>

                <strong>
                  {shift.code ||
                    "—"}
                </strong>

              </div>


              <div className="assignment-detail-item">

                <span>
                  Time zone
                </span>

                <strong>
                  {shift.zoneId ||
                    "—"}
                </strong>

              </div>


              <div className="assignment-detail-item">

                <span>
                  Late grace
                </span>

                <strong>
                  {shift.lateGraceMinutes ??
                    0}{" "}
                  min
                </strong>

              </div>


              <div className="assignment-detail-item">

                <span>
                  Early punch-in
                </span>

                <strong>
                  {shift.earlyPunchInMinutes ??
                    0}{" "}
                  min
                </strong>

              </div>

            </div>

          </div>

        )}


        {/* AUDIT */}

        <div className="assignment-detail-section">

          <div className="assignment-detail-section-title">
            AUDIT INFORMATION
          </div>


          <div className="assignment-detail-grid">

            <div className="assignment-detail-item">

              <span>
                Created
              </span>

              <strong>
                {formatDateTime(
                  assignment.createdAt
                )}
              </strong>

            </div>


            <div className="assignment-detail-item">

              <span>
                Last updated
              </span>

              <strong>
                {formatDateTime(
                  assignment.updatedAt
                )}
              </strong>

            </div>

          </div>

        </div>


        <div className="assignment-modal-footer">

          <button
            type="button"
            className="assignment-secondary-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ASSIGN SHIFT MODAL
========================================================= */

function AssignShiftModal({
  departments,
  shifts,
  form,
  setForm,
  submitting,
  error,
  onClose,
  onSubmit,
}) {

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };


  return (
    <div
      className="assignment-modal-backdrop"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget &&
          !submitting
        ) {
          onClose();
        }

      }}
    >

      <div
        className="assignment-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="assignment-modal-header">

          <div>

            <div className="assignment-modal-eyebrow">
              NEW ASSIGNMENT
            </div>

            <h2>
              Assign shift
            </h2>

            <p>
              Assign a shift to a department
              from a selected effective date.
            </p>

          </div>


          <button
            type="button"
            className="assignment-modal-close"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>

        </div>


        <form
          className="assignment-form"
          onSubmit={onSubmit}
        >

          {/* DEPARTMENT */}

          <label className="assignment-form-field">

            <span>
              Department
            </span>

            <select
              name="departmentId"
              value={
                form.departmentId
              }
              onChange={
                handleChange
              }
              disabled={
                submitting
              }
            >

              <option value="">
                Select department
              </option>


              {departments
                .filter(
                  (department) =>
                    department.active
                )
                .map(
                  (department) => (

                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >

                      {department.name}

                      {" ("}

                      {department.code}

                      {")"}

                    </option>

                  )
                )}

            </select>

            <small>
              Only active departments can receive
              a new assignment.
            </small>

          </label>


          {/* SHIFT */}

          <label className="assignment-form-field">

            <span>
              Shift
            </span>

            <select
              name="shiftId"
              value={
                form.shiftId
              }
              onChange={
                handleChange
              }
              disabled={
                submitting
              }
            >

              <option value="">
                Select shift
              </option>


              {shifts
                .filter(
                  (shift) =>
                    shift.active
                )
                .map(
                  (shift) => (

                    <option
                      key={
                        shift.id
                      }
                      value={
                        shift.id
                      }
                    >

                      {shift.name}

                      {" — "}

                      {shift.code}

                      {" ("}

                      {shift.startTime}

                      {" - "}

                      {shift.endTime}

                      {")"}

                    </option>

                  )
                )}

            </select>

            <small>
              Only active shifts can be assigned.
            </small>

          </label>


          {/* EFFECTIVE DATE */}

          <label className="assignment-form-field">

            <span>
              Effective from
            </span>

            <input
              type="date"
              name="effectiveFrom"
              value={
                form.effectiveFrom
              }
              min={
                getTodayDate()
              }
              onChange={
                handleChange
              }
              disabled={
                submitting
              }
            />

            <small>
              The backend does not allow an
              effective date in the past.
            </small>

          </label>


          {/* PREVIEW */}

          {form.departmentId &&
            form.shiftId && (

              <div className="assignment-preview">

                <CalendarDays
                  size={18}
                />

                <div>

                  <span>
                    Assignment preview
                  </span>

                  <strong>

                    Department{" "}
                    {departments.find(
                      (department) =>
                        department.id ===
                        form.departmentId
                    )?.name ||
                      "—"}

                    {" → "}

                    {shifts.find(
                      (shift) =>
                        shift.id ===
                        form.shiftId
                    )?.name ||
                      "—"}

                  </strong>

                  <small>

                    Effective from{" "}
                    {
                      formatDate(
                        form.effectiveFrom
                      )
                    }

                  </small>

                </div>

              </div>

            )}


          {/* ERROR */}

          {error && (

            <div className="assignment-form-error">

              <XCircle size={16} />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* FOOTER */}

          <div className="assignment-modal-footer">

            <button
              type="button"
              className="assignment-secondary-button"
              onClick={
                onClose
              }
              disabled={
                submitting
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="assignment-primary-button"
              disabled={
                submitting
              }
            >

              {submitting ? (

                <>
                  <Loader2
                    size={15}
                    className="assignment-spin"
                  />

                  Assigning...

                </>

              ) : (

                <>
                  <Check size={15} />

                  Assign shift

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ShiftAssignments() {

  const [
    departments,
    setDepartments,
  ] = useState([]);


  const [
    shifts,
    setShifts,
  ] = useState([]);


  const [
    assignments,
    setAssignments,
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
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");


  const [
    showForm,
    setShowForm,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState({
    departmentId: "",
    shiftId: "",
    effectiveFrom:
      getTodayDate(),
  });


  const [
    formError,
    setFormError,
  ] = useState("");


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    selectedAssignment,
    setSelectedAssignment,
  ] = useState(null);


  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState(null);


  const [
    showHistory,
    setShowHistory,
  ] = useState(false);


  const [
    history,
    setHistory,
  ] = useState([]);


  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);


  const [
    today,
    setToday,
  ] = useState(
    getTodayDate()
  );


  /* =========================================================
     LOAD DEPARTMENTS + SHIFTS + ASSIGNMENTS
  ========================================================= */

  const loadData = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      setToday(
        getTodayDate()
      );


      /*
       * Departments
       */

      const departmentResponse =
        await getDepartments(
          false
        );


      const departmentData =
        Array.isArray(
          departmentResponse.data
        )
          ? departmentResponse.data
          : [];


      const normalizedDepartments =
        departmentData
          .map(
            (department) => ({
              ...department,
              id: getId(
                department
              ),
            })
          )
          .filter(
            (department) =>
              department.id
          );


      setDepartments(
        normalizedDepartments
      );


      /*
       * Shifts
       */

      const shiftResponse =
        await getShifts(
          false
        );


      const shiftData =
        Array.isArray(
          shiftResponse.data
        )
          ? shiftResponse.data
          : [];


      const normalizedShifts =
        shiftData
          .map(
            (shift) => ({
              ...shift,
              id: getId(
                shift
              ),
            })
          )
          .filter(
            (shift) =>
              shift.id
          );


      setShifts(
        normalizedShifts
      );


      /*
       * Load assignment history for
       * every department.
       *
       * The backend exposes history
       * department-by-department.
       */

      const historyResults =
        await Promise.all(
          normalizedDepartments.map(
            async (
              department
            ) => {

              try {

                const response =
                  await getDepartmentShiftHistory(
                    department.id
                  );


                const list =
                  Array.isArray(
                    response.data
                  )
                    ? response.data
                    : [];


                return list.map(
                  (assignment) => ({
                    ...assignment,
                    id:
                      getId(
                        assignment
                      ),
                  })
                );

              } catch (
                requestError
              ) {

                /*
                 * One department having
                 * no assignments should not
                 * break the entire page.
                 */

                console.warn(
                  `No assignment history for department ${department.id}`,
                  requestError
                );

                return [];
              }

            }
          )
        );


      const allAssignments =
        historyResults
          .flat()
          .filter(
            (assignment) =>
              assignment.id
          );


      setAssignments(
        allAssignments
      );

    } catch (requestError) {

      console.error(
        "Unable to load shift assignments:",
        requestError
      );


      setError(
        getErrorMessage(
          requestError,
          "Unable to load shift assignments."
        )
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  useEffect(() => {

    loadData();

  }, []);


  /* =========================================================
     DEPARTMENT LOOKUP
  ========================================================= */

  const departmentMap =
    useMemo(() => {

      const map = {};

      departments.forEach(
        (department) => {

          map[
            department.id
          ] = department;

        }
      );

      return map;

    }, [
      departments,
    ]);


  /* =========================================================
     FILTERED ASSIGNMENTS
  ========================================================= */

  const filteredAssignments =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return assignments.filter(
        (assignment) => {

          const department =
            departmentMap[
              assignment.departmentId
            ];


          const departmentName =
            department?.name ||
            "";


          const departmentCode =
            department?.code ||
            "";


          const shift =
            assignment.shift ||
            {};


          const shiftName =
            shift.name ||
            "";


          const shiftCode =
            shift.code ||
            "";


          const beforeStart =
            assignment.effectiveFrom &&
            today <
              assignment.effectiveFrom;


          const expired =
            assignment.effectiveTo &&
            today >
              assignment.effectiveTo;


          const status =
            beforeStart
              ? "UPCOMING"
              : expired
                ? "EXPIRED"
                : "ACTIVE";


          const matchesSearch =
            !query ||
            departmentName
              .toLowerCase()
              .includes(query) ||
            departmentCode
              .toLowerCase()
              .includes(query) ||
            shiftName
              .toLowerCase()
              .includes(query) ||
            shiftCode
              .toLowerCase()
              .includes(query);


          const matchesStatus =
            statusFilter ===
              "ALL" ||
            statusFilter ===
              status;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      assignments,
      departmentMap,
      search,
      statusFilter,
      today,
    ]);


  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {

      let active =
        0;

      let upcoming =
        0;

      let expired =
        0;


      assignments.forEach(
        (assignment) => {

          const beforeStart =
            assignment.effectiveFrom &&
            today <
              assignment.effectiveFrom;


          const isExpired =
            assignment.effectiveTo &&
            today >
              assignment.effectiveTo;


          if (beforeStart) {

            upcoming += 1;

          } else if (isExpired) {

            expired += 1;

          } else {

            active += 1;

          }

        }
      );


      return {
        total:
          assignments.length,
        active,
        upcoming,
        expired,
      };

    }, [
      assignments,
      today,
    ]);


  /* =========================================================
     OPEN CREATE
  ========================================================= */

  const openCreate = () => {

    setForm({
      departmentId: "",
      shiftId: "",
      effectiveFrom:
        getTodayDate(),
    });


    setFormError("");

    setError("");

    setShowForm(true);

  };


  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const closeForm = () => {

    if (
      submitting
    ) {
      return;
    }


    setShowForm(false);

    setFormError("");

  };


  /* =========================================================
     ASSIGN SHIFT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setFormError("");


    const departmentId =
      form.departmentId.trim();


    const shiftId =
      form.shiftId.trim();


    const effectiveFrom =
      form.effectiveFrom;


    if (!departmentId) {

      setFormError(
        "Please select a department."
      );

      return;
    }


    if (!shiftId) {

      setFormError(
        "Please select a shift."
      );

      return;
    }


    if (!effectiveFrom) {

      setFormError(
        "Effective-from date is required."
      );

      return;
    }


    if (
      effectiveFrom <
      getTodayDate()
    ) {

      setFormError(
        "Effective-from date cannot be in the past."
      );

      return;
    }


    try {

      setSubmitting(true);


      await assignDepartmentShift(
        departmentId,
        {
          shiftId,
          effectiveFrom,
        }
      );


      setShowForm(false);

      setFormError("");


      await loadData(
        true
      );

    } catch (requestError) {

      console.error(
        "Unable to assign shift:",
        requestError
      );


      setFormError(
        getErrorMessage(
          requestError,
          "Unable to assign shift."
        )
      );

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     VIEW ASSIGNMENT
  ========================================================= */

  const openDetails = (
    assignment
  ) => {

    setSelectedAssignment(
      assignment
    );

    setSelectedDepartment(
      departmentMap[
        assignment.departmentId
      ] ||
        null
    );

  };


  /* =========================================================
     VIEW HISTORY
  ========================================================= */

  const openHistory =
    async (
      department
    ) => {

      try {

        setSelectedDepartment(
          department
        );

        setShowHistory(true);

        setHistoryLoading(true);

        setHistory([]);


        const response =
          await getDepartmentShiftHistory(
            department.id
          );


        const list =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];


        setHistory(
          list.map(
            (assignment) => ({
              ...assignment,
              id:
                getId(
                  assignment
                ),
            })
          )
        );

      } catch (requestError) {

        console.error(
          "Unable to load assignment history:",
          requestError
        );


        setError(
          getErrorMessage(
            requestError,
            "Unable to load assignment history."
          )
        );

        setShowHistory(false);

      } finally {

        setHistoryLoading(false);

      }
    };


  return (
    <div className="shift-assignments-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="shift-assignments-header">

        <div>

          <div className="shift-assignments-eyebrow">
            ORGANIZATION
          </div>

          <h1>
            Shift assignments
          </h1>

          <p>
            Assign effective shifts to departments
            and manage assignment history.
          </p>

        </div>


        <div className="shift-assignments-header-actions">

          <button
            type="button"
            className="shift-assignments-refresh-button"
            onClick={() =>
              loadData(
                true
              )
            }
            disabled={
              refreshing
            }
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "assignment-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            type="button"
            className="assignment-primary-button"
            onClick={
              openCreate
            }
          >

            <Plus size={17} />

            Assign shift

          </button>

        </div>

      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="shift-assignment-stats">

        <div className="assignment-stat-card">

          <div className="assignment-stat-icon">
            <Clock3 size={19} />
          </div>

          <div>

            <span>
              Total assignments
            </span>

            <strong>
              {stats.total}
            </strong>

          </div>

        </div>


        <div className="assignment-stat-card">

          <div className="assignment-stat-icon assignment-stat-active">
            <Check size={19} />
          </div>

          <div>

            <span>
              Active
            </span>

            <strong>
              {stats.active}
            </strong>

          </div>

        </div>


        <div className="assignment-stat-card">

          <div className="assignment-stat-icon assignment-stat-upcoming">
            <CalendarDays size={19} />
          </div>

          <div>

            <span>
              Upcoming
            </span>

            <strong>
              {stats.upcoming}
            </strong>

          </div>

        </div>


        <div className="assignment-stat-card">

          <div className="assignment-stat-icon assignment-stat-expired">
            <History size={19} />
          </div>

          <div>

            <span>
              Expired
            </span>

            <strong>
              {stats.expired}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="shift-assignments-card">

        {/* TOOLBAR */}

        <div className="shift-assignments-toolbar">

          <div className="assignment-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search department, code or shift..."
            />

          </div>


          <div className="assignment-status-filter">

            <button
              type="button"
              className={
                statusFilter ===
                "ALL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "ALL"
                )
              }
            >
              ALL
            </button>


            <button
              type="button"
              className={
                statusFilter ===
                "ACTIVE"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "ACTIVE"
                )
              }
            >
              ACTIVE
            </button>


            <button
              type="button"
              className={
                statusFilter ===
                "UPCOMING"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "UPCOMING"
                )
              }
            >
              UPCOMING
            </button>


            <button
              type="button"
              className={
                statusFilter ===
                "EXPIRED"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "EXPIRED"
                )
              }
            >
              EXPIRED
            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="shift-assignment-error">

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


        {/* LOADING */}

        {loading ? (

          <div className="shift-assignment-loading">

            <Loader2
              size={27}
              className="assignment-spin"
            />

            <span>
              Loading shift assignments...
            </span>

          </div>

        ) : filteredAssignments.length ===
          0 ? (

          <div className="shift-assignment-empty">

            <Clock3 size={32} />

            <h3>
              No shift assignments found
            </h3>

            <p>
              Assign a shift to a department
              to get started.
            </p>

            {statusFilter ===
                "ALL" &&
              !search && (

                <button
                  type="button"
                  className="assignment-primary-button"
                  onClick={
                    openCreate
                  }
                >

                  <Plus size={16} />

                  Assign first shift

                </button>

              )}

          </div>

        ) : (

          <div className="shift-assignment-table-wrapper">

            <table className="shift-assignment-table">

              <thead>

                <tr>

                  <th>
                    DEPARTMENT
                  </th>

                  <th>
                    SHIFT
                  </th>

                  <th>
                    EFFECTIVE FROM
                  </th>

                  <th>
                    EFFECTIVE TO
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ASSIGNED BY
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredAssignments.map(
                  (assignment) => {

                    const department =
                      departmentMap[
                        assignment.departmentId
                      ];


                    const shift =
                      assignment.shift ||
                      {};


                    return (

                      <tr
                        key={
                          assignment.id ||
                          `${assignment.departmentId}-${assignment.effectiveFrom}`
                        }
                      >

                        {/* DEPARTMENT */}

                        <td>

                          <div className="assignment-department-cell">

                            <div className="assignment-department-icon">

                              <Check
                                size={16}
                              />

                            </div>


                            <div>

                              <strong>
                                {department?.name ||
                                  assignment.departmentId}
                              </strong>

                              <span>
                                {department?.code ||
                                  "—"}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* SHIFT */}

                        <td>

                          <div className="assignment-shift-cell">

                            <strong>
                              {shift.name ||
                                "Unknown shift"}
                            </strong>

                            <span>

                              {shift.code ||
                                "—"}

                              {" · "}

                              {shift.startTime ||
                                "--:--"}

                              {" — "}

                              {shift.endTime ||
                                "--:--"}

                            </span>

                          </div>

                        </td>


                        {/* FROM */}

                        <td>

                          <span className="assignment-date">

                            {formatDate(
                              assignment.effectiveFrom
                            )}

                          </span>

                        </td>


                        {/* TO */}

                        <td>

                          <span className="assignment-date">

                            {assignment.effectiveTo
                              ? formatDate(
                                  assignment.effectiveTo
                                )
                              : "No end date"}

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <AssignmentStatusBadge
                            assignment={
                              assignment
                            }
                            today={
                              today
                            }
                          />

                        </td>


                        {/* ASSIGNED BY */}

                        <td>

                          <span className="assignment-assigned-by">

                            {assignment.assignedBy ||
                              "—"}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <div className="assignment-actions">

                            <button
                              type="button"
                              className="assignment-action-button"
                              title="View"
                              onClick={() =>
                                openDetails(
                                  assignment
                                )
                              }
                            >

                              <Eye
                                size={17}
                              />

                            </button>


                            <button
                              type="button"
                              className="assignment-action-button"
                              title="View history"
                              onClick={() => {

                                if (
                                  department?.id
                                ) {
                                  openHistory(
                                    department
                                  );
                                }

                              }}
                              disabled={
                                !department?.id
                              }
                            >

                              <History
                                size={17}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          CREATE MODAL
      ===================================================== */}

      {showForm && (

        <AssignShiftModal
          departments={
            departments
          }
          shifts={
            shifts
          }
          form={
            form
          }
          setForm={
            setForm
          }
          submitting={
            submitting
          }
          error={
            formError
          }
          onClose={
            closeForm
          }
          onSubmit={
            handleSubmit
          }
        />

      )}


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedAssignment && (

        <AssignmentDetailsModal
          assignment={
            selectedAssignment
          }
          department={
            selectedDepartment
          }
          onClose={() =>
            setSelectedAssignment(
              null
            )
          }
        />

      )}


      {/* =====================================================
          HISTORY MODAL
      ===================================================== */}

      {showHistory && (

        <div
          className="assignment-modal-backdrop"
          onClick={() =>
            setShowHistory(
              false
            )
          }
        >

          <div
            className="assignment-modal assignment-history-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="assignment-modal-header">

              <div>

                <div className="assignment-modal-eyebrow">
                  ASSIGNMENT HISTORY
                </div>

                <h2>
                  {selectedDepartment?.name ||
                    "Department"}
                </h2>

                <p>
                  Previous and current
                  shift assignments.
                </p>

              </div>


              <button
                type="button"
                className="assignment-modal-close"
                onClick={() =>
                  setShowHistory(
                    false
                  )
                }
              >
                <X size={18} />
              </button>

            </div>


            {historyLoading ? (

              <div className="assignment-history-loading">

                <Loader2
                  size={25}
                  className="assignment-spin"
                />

                <span>
                  Loading history...
                </span>

              </div>

            ) : history.length ===
              0 ? (

              <div className="assignment-history-empty">

                <History
                  size={30}
                />

                <h3>
                  No assignment history
                </h3>

                <p>
                  This department has
                  no recorded shift assignments.
                </p>

              </div>

            ) : (

              <div className="assignment-history-list">

                {history.map(
                  (assignment) => (

                    <div
                      className="assignment-history-item"
                      key={
                        assignment.id ||
                        assignment.effectiveFrom
                      }
                    >

                      <div className="assignment-history-icon">
                        <Clock3
                          size={17}
                        />
                      </div>


                      <div className="assignment-history-content">

                        <strong>

                          {assignment.shift?.name ||
                            "Unknown shift"}

                        </strong>


                        <span>

                          {assignment.shift?.code ||
                            "—"}

                          {" · "}

                          {assignment.shift?.startTime ||
                            "--:--"}

                          {" — "}

                          {assignment.shift?.endTime ||
                            "--:--"}

                        </span>


                        <small>

                          {formatDate(
                            assignment.effectiveFrom
                          )}

                          {" → "}

                          {assignment.effectiveTo
                            ? formatDate(
                                assignment.effectiveTo
                              )
                            : "No end date"}

                        </small>

                      </div>


                      <AssignmentStatusBadge
                        assignment={
                          assignment
                        }
                        today={
                          today
                        }
                      />

                    </div>

                  )
                )}

              </div>

            )}


            <div className="assignment-modal-footer">

              <button
                type="button"
                className="assignment-secondary-button"
                onClick={() =>
                  setShowHistory(
                    false
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}