import {
  BadgeCheck,
  Check,
  Clock3,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  activateShift,
  createShift,
  deactivateShift,
  getShiftById,
  getShifts,
  updateShift,
} from "../../api/shiftApi";

import "./shifts.css";


/* =========================================================
   HELPERS
========================================================= */

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
    ).format(new Date(value));
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
    ).format(new Date(value));
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


/*
 * IMPORTANT
 *
 * The backend may return:
 *
 *   id
 *   _id
 *   shiftId
 *
 * We normalize all of them into `id`.
 */
function getShiftId(shift) {
  if (!shift) {
    return null;
  }

  return (
    shift.id ||
    shift._id ||
    shift.shiftId ||
    null
  );
}


function normalizeShift(shift) {
  if (!shift) {
    return null;
  }

  const id = getShiftId(shift);

  return {
    ...shift,
    id,
  };
}


function formatMinutes(minutes) {
  const value =
    Number(minutes || 0);

  if (value === 0) {
    return "None";
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours =
    Math.floor(value / 60);

  const remaining =
    value % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}


function calculateDuration(
  startTime,
  endTime
) {
  if (
    !startTime ||
    !endTime
  ) {
    return "—";
  }

  const [
    startHour,
    startMinute,
  ] = startTime
    .split(":")
    .map(Number);

  const [
    endHour,
    endMinute,
  ] = endTime
    .split(":")
    .map(Number);

  let start =
    startHour * 60 +
    startMinute;

  let end =
    endHour * 60 +
    endMinute;

  /*
   * Handles overnight shifts.
   *
   * Example:
   * 20:00 -> 04:00
   */
  if (end <= start) {
    end += 24 * 60;
  }

  const duration =
    end - start;

  const hours =
    Math.floor(duration / 60);

  const minutes =
    duration % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  active,
}) {
  return (
    <span
      className={`shift-status ${
        active
          ? "shift-status-active"
          : "shift-status-inactive"
      }`}
    >
      <span className="shift-status-dot" />

      {active
        ? "ACTIVE"
        : "INACTIVE"}
    </span>
  );
}


/* =========================================================
   DETAILS MODAL
========================================================= */

function ShiftDetailsModal({
  shift,
  onClose,
}) {
  if (!shift) {
    return null;
  }

  return (
    <div
      className="shift-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="shift-modal shift-details-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="shift-modal-header">

          <div>

            <div className="shift-modal-eyebrow">
              SHIFT DETAILS
            </div>

            <h2>
              {shift.name}
            </h2>

            <p>
              Complete shift configuration
            </p>

          </div>


          <button
            type="button"
            className="shift-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        {/* HERO */}

        <div className="shift-detail-hero">

          <div className="shift-detail-icon">
            <Clock3 size={22} />
          </div>

          <div className="shift-detail-hero-content">

            <strong>
              {shift.code}
            </strong>

            <span>
              {shift.startTime}
              {" — "}
              {shift.endTime}
            </span>

          </div>

          <StatusBadge
            active={shift.active}
          />

        </div>


        {/* SHIFT INFORMATION */}

        <div className="shift-detail-section">

          <div className="shift-detail-section-title">
            SHIFT INFORMATION
          </div>


          <div className="shift-detail-grid">

            <div className="shift-detail-item">

              <span>
                Shift ID
              </span>

              <strong>
                {getShiftId(shift) || "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Shift name
              </span>

              <strong>
                {shift.name || "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Shift code
              </span>

              <strong>
                {shift.code || "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Start time
              </span>

              <strong>
                {shift.startTime || "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                End time
              </span>

              <strong>
                {shift.endTime || "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Time zone
              </span>

              <strong>
                {shift.zoneId || "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Duration
              </span>

              <strong>
                {shift.nominalDurationMinutes
                  ? formatMinutes(
                      shift.nominalDurationMinutes
                    )
                  : calculateDuration(
                      shift.startTime,
                      shift.endTime
                    )}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Overnight
              </span>

              <strong>
                {shift.overnight
                  ? "Yes"
                  : "No"}
              </strong>

            </div>

          </div>

        </div>


        {/* ATTENDANCE RULES */}

        <div className="shift-detail-section">

          <div className="shift-detail-section-title">
            ATTENDANCE RULES
          </div>


          <div className="shift-detail-grid">

            <div className="shift-detail-item">

              <span>
                Early punch-in
              </span>

              <strong>
                {formatMinutes(
                  shift.earlyPunchInMinutes
                )}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Late grace
              </span>

              <strong>
                {formatMinutes(
                  shift.lateGraceMinutes
                )}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Punch-out allowance
              </span>

              <strong>
                {formatMinutes(
                  shift.maxPunchOutAfterMinutes
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* AUDIT INFORMATION */}

        <div className="shift-detail-section">

          <div className="shift-detail-section-title">
            AUDIT INFORMATION
          </div>


          <div className="shift-detail-grid">

            <div className="shift-detail-item">

              <span>
                Created by
              </span>

              <strong>
                {shift.createdBy ||
                  "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Created
              </span>

              <strong>
                {formatDateTime(
                  shift.createdAt
                )}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Updated by
              </span>

              <strong>
                {shift.updatedBy ||
                  "—"}
              </strong>

            </div>


            <div className="shift-detail-item">

              <span>
                Last updated
              </span>

              <strong>
                {formatDateTime(
                  shift.updatedAt
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="shift-modal-footer">

          <button
            type="button"
            className="shift-secondary-button"
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
   FORM MODAL
========================================================= */

function ShiftFormModal({
  mode,
  form,
  setForm,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit =
    mode === "edit";


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
      className="shift-modal-backdrop"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          if (!submitting) {
            onClose();
          }
        }

      }}
    >

      <div
        className="shift-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="shift-modal-header">

          <div>

            <div className="shift-modal-eyebrow">

              {isEdit
                ? "UPDATE SHIFT"
                : "NEW SHIFT"}

            </div>

            <h2>

              {isEdit
                ? "Edit shift"
                : "Create shift"}

            </h2>

            <p>

              {isEdit
                ? "Update the shift configuration."
                : "Create a reusable shift template for your organization."}

            </p>

          </div>


          <button
            type="button"
            className="shift-modal-close"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>

        </div>


        {/* FORM */}

        <form
          className="shift-form"
          onSubmit={onSubmit}
        >

          {/* CODE + NAME */}

          <div className="shift-form-row">

            <label className="shift-form-field">

              <span>
                Shift code
              </span>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. GEN"
                maxLength={30}
                disabled={
                  isEdit ||
                  submitting
                }
                readOnly={isEdit}
                autoComplete="off"
              />

              <small>

                {isEdit
                  ? "Shift code cannot be changed."
                  : "Letters, numbers, underscore and hyphen are allowed."}

              </small>

            </label>


            <label className="shift-form-field">

              <span>
                Shift name
              </span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. General Shift"
                maxLength={100}
                disabled={submitting}
                autoFocus
                autoComplete="off"
              />

              <small>
                Maximum 100 characters.
              </small>

            </label>

          </div>


          {/* TIMING */}

          <div className="shift-form-section">

            <div className="shift-form-section-title">
              SHIFT TIMING
            </div>


            <div className="shift-form-row">

              <label className="shift-form-field">

                <span>
                  Start time
                </span>

                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  disabled={submitting}
                />

              </label>


              <label className="shift-form-field">

                <span>
                  End time
                </span>

                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  disabled={submitting}
                />

              </label>

            </div>


            <label className="shift-form-field">

              <span>
                Time zone
              </span>

              <select
                name="zoneId"
                value={form.zoneId}
                onChange={handleChange}
                disabled={submitting}
              >

                <option value="Asia/Kolkata">
                  Asia/Kolkata — India
                </option>

                <option value="UTC">
                  UTC
                </option>

                <option value="Asia/Dubai">
                  Asia/Dubai — UAE
                </option>

                <option value="Asia/Singapore">
                  Asia/Singapore — Singapore
                </option>

                <option value="Europe/London">
                  Europe/London — UK
                </option>

                <option value="America/New_York">
                  America/New_York — US Eastern
                </option>

              </select>

            </label>

          </div>


          {/* ATTENDANCE RULES */}

          <div className="shift-form-section">

            <div className="shift-form-section-title">
              ATTENDANCE RULES
            </div>


            <div className="shift-form-row">

              {/* EARLY PUNCH */}

              <label className="shift-form-field">

                <span>
                  Early punch-in
                </span>

                <div className="shift-input-with-suffix">

                  <input
                    type="number"
                    name="earlyPunchInMinutes"
                    value={
                      form.earlyPunchInMinutes
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    max="180"
                    disabled={submitting}
                  />

                  <span>
                    min
                  </span>

                </div>

                <small>
                  0–180 minutes
                </small>

              </label>


              {/* LATE GRACE */}

              <label className="shift-form-field">

                <span>
                  Late grace
                </span>

                <div className="shift-input-with-suffix">

                  <input
                    type="number"
                    name="lateGraceMinutes"
                    value={
                      form.lateGraceMinutes
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    max="180"
                    disabled={submitting}
                  />

                  <span>
                    min
                  </span>

                </div>

                <small>
                  0–180 minutes
                </small>

              </label>


              {/* PUNCH OUT */}

              <label className="shift-form-field">

                <span>
                  Punch-out allowance
                </span>

                <div className="shift-input-with-suffix">

                  <input
                    type="number"
                    name="maxPunchOutAfterMinutes"
                    value={
                      form.maxPunchOutAfterMinutes
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    max="720"
                    disabled={submitting}
                  />

                  <span>
                    min
                  </span>

                </div>

                <small>
                  0–720 minutes
                </small>

              </label>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="shift-form-error">

              <XCircle size={16} />

              <span>
                {error}
              </span>

            </div>
          )}


          {/* FOOTER */}

          <div className="shift-modal-footer">

            <button
              type="button"
              className="shift-secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="shift-primary-button"
              disabled={submitting}
            >

              {submitting ? (

                <>
                  <Loader2
                    size={15}
                    className="shift-spin"
                  />

                  Saving...
                </>

              ) : (

                <>
                  {isEdit
                    ? "Save changes"
                    : "Create shift"}

                  <Check size={15} />
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

export default function Shifts() {

  const [
    shifts,
    setShifts,
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
    formMode,
    setFormMode,
  ] = useState("create");


  const [
    form,
    setForm,
  ] = useState({
    code: "",
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    zoneId: "Asia/Kolkata",
    earlyPunchInMinutes: 30,
    lateGraceMinutes: 15,
    maxPunchOutAfterMinutes: 120,
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
    selectedShift,
    setSelectedShift,
  ] = useState(null);


  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);


  /* =========================================================
     LOAD SHIFTS
  ========================================================= */

  const loadShifts = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      const response =
        await getShifts(false);


      const data =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];


      /*
       * IMPORTANT:
       *
       * Normalize id here.
       *
       * Backend can return:
       * id
       * _id
       * shiftId
       *
       * Frontend will always use:
       * shift.id
       */

      const normalizedShifts =
        data
          .map(normalizeShift)
          .filter(Boolean);


      setShifts(
        normalizedShifts
      );

    } catch (requestError) {

      console.error(
        "Unable to load shifts:",
        requestError
      );

      setError(
        getErrorMessage(
          requestError,
          "Unable to load shifts."
        )
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  useEffect(() => {

    loadShifts();

  }, []);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredShifts =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return shifts.filter(
        (shift) => {

          const matchesSearch =
            !query ||
            shift.name
              ?.toLowerCase()
              .includes(query) ||
            shift.code
              ?.toLowerCase()
              .includes(query) ||
            shift.zoneId
              ?.toLowerCase()
              .includes(query) ||
            shift.startTime
              ?.toLowerCase()
              .includes(query) ||
            shift.endTime
              ?.toLowerCase()
              .includes(query);


          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter === "ACTIVE"
                ? shift.active
                : !shift.active
            );


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      shifts,
      search,
      statusFilter,
    ]);


  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {

      const total =
        shifts.length;


      const active =
        shifts.filter(
          (shift) =>
            shift.active
        ).length;


      const inactive =
        total - active;


      const overnight =
        shifts.filter(
          (shift) =>
            shift.overnight
        ).length;


      return {
        total,
        active,
        inactive,
        overnight,
      };

    }, [
      shifts,
    ]);


  /* =========================================================
     CREATE
  ========================================================= */

  const openCreate = () => {

    setFormMode("create");

    setSelectedShift(null);

    setForm({
      code: "",
      name: "",
      startTime: "09:00",
      endTime: "18:00",
      zoneId: "Asia/Kolkata",
      earlyPunchInMinutes: 30,
      lateGraceMinutes: 15,
      maxPunchOutAfterMinutes: 120,
    });

    setFormError("");
    setError("");

    setShowForm(true);
  };


  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (
    shift
  ) => {

    /*
     * THIS WAS MISSING IN THE OLD CODE.
     *
     * Without this, handleSubmit()
     * could not know which shift to update.
     */

    const normalizedShift =
      normalizeShift(shift);


    if (
      !normalizedShift?.id
    ) {

      setError(
        "Unable to edit shift: Shift ID is missing."
      );

      return;
    }


    setSelectedShift(
      normalizedShift
    );


    setFormMode("edit");


    setForm({
      code:
        normalizedShift.code ||
        "",

      name:
        normalizedShift.name ||
        "",

      startTime:
        normalizedShift.startTime ||
        "09:00",

      endTime:
        normalizedShift.endTime ||
        "18:00",

      zoneId:
        normalizedShift.zoneId ||
        "Asia/Kolkata",

      earlyPunchInMinutes:
        normalizedShift.earlyPunchInMinutes ??
        0,

      lateGraceMinutes:
        normalizedShift.lateGraceMinutes ??
        0,

      maxPunchOutAfterMinutes:
        normalizedShift.maxPunchOutAfterMinutes ??
        0,
    });


    setFormError("");
    setError("");

    setShowForm(true);
  };


  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const closeForm = () => {

    if (submitting) {
      return;
    }

    setShowForm(false);

    setFormError("");

    setSelectedShift(null);
  };


  /* =========================================================
     SUBMIT CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setFormError("");


    const code =
      form.code.trim();


    const name =
      form.name.trim();


    const startTime =
      form.startTime;


    const endTime =
      form.endTime;


    const zoneId =
      form.zoneId.trim();


    const earlyPunchInMinutes =
      Number(
        form.earlyPunchInMinutes
      );


    const lateGraceMinutes =
      Number(
        form.lateGraceMinutes
      );


    const maxPunchOutAfterMinutes =
      Number(
        form.maxPunchOutAfterMinutes
      );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      formMode === "create" &&
      !code
    ) {

      setFormError(
        "Shift code is required."
      );

      return;
    }


    if (
      formMode === "create" &&
      !/^[A-Za-z][A-Za-z0-9_-]{0,29}$/.test(
        code
      )
    ) {

      setFormError(
        "Shift code must start with a letter and contain only letters, numbers, underscore or hyphen."
      );

      return;
    }


    if (!name) {

      setFormError(
        "Shift name is required."
      );

      return;
    }


    if (name.length > 100) {

      setFormError(
        "Shift name cannot exceed 100 characters."
      );

      return;
    }


    if (!startTime) {

      setFormError(
        "Start time is required."
      );

      return;
    }


    if (!endTime) {

      setFormError(
        "End time is required."
      );

      return;
    }


    if (!zoneId) {

      setFormError(
        "Time zone is required."
      );

      return;
    }


    if (
      Number.isNaN(
        earlyPunchInMinutes
      ) ||
      earlyPunchInMinutes < 0 ||
      earlyPunchInMinutes > 180
    ) {

      setFormError(
        "Early punch-in must be between 0 and 180 minutes."
      );

      return;
    }


    if (
      Number.isNaN(
        lateGraceMinutes
      ) ||
      lateGraceMinutes < 0 ||
      lateGraceMinutes > 180
    ) {

      setFormError(
        "Late grace must be between 0 and 180 minutes."
      );

      return;
    }


    if (
      Number.isNaN(
        maxPunchOutAfterMinutes
      ) ||
      maxPunchOutAfterMinutes < 0 ||
      maxPunchOutAfterMinutes > 720
    ) {

      setFormError(
        "Punch-out allowance must be between 0 and 720 minutes."
      );

      return;
    }


    /* =====================================================
       SAVE
    ===================================================== */

    try {

      setSubmitting(true);


      /*
       * UPDATE PAYLOAD
       *
       * Do NOT send code during update.
       *
       * The existing backend contract in your
       * implementation expects the editable
       * shift configuration only.
       */

      const payload = {
        name,
        startTime,
        endTime,
        zoneId,
        earlyPunchInMinutes,
        lateGraceMinutes,
        maxPunchOutAfterMinutes,
      };


      /* ===================================================
         CREATE
      =================================================== */

      if (
        formMode === "create"
      ) {

        await createShift({
          code,
          ...payload,
        });

      }


      /* ===================================================
         UPDATE
      =================================================== */

      else {

        const shiftId =
          getShiftId(
            selectedShift
          );


        if (!shiftId) {

          setFormError(
            "Shift ID is missing."
          );

          return;
        }


        console.log(
          "Updating shift:",
          shiftId,
          payload
        );


        await updateShift(
          shiftId,
          payload
        );

      }


      /*
       * IMPORTANT:
       *
       * Reload from backend after successful
       * create/update.
       *
       * This makes sure:
       *
       * - name is correct
       * - timing is correct
       * - status is correct
       * - updatedAt comes from backend
       */

      await loadShifts(true);


      setShowForm(false);

      setSelectedShift(null);

      setFormError("");

    } catch (requestError) {

      console.error(
        "Unable to save shift:",
        requestError
      );

      setFormError(
        getErrorMessage(
          requestError,
          "Unable to save shift."
        )
      );

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     VIEW DETAILS
  ========================================================= */

  const openDetails = async (
    shift
  ) => {

    const shiftId =
      getShiftId(
        shift
      );


    if (!shiftId) {

      setError(
        "Unable to view shift: Shift ID is missing."
      );

      return;
    }


    setSelectedShift(
      normalizeShift(shift)
    );


    setError("");


    try {

      const response =
        await getShiftById(
          shiftId
        );


      if (
        response.data
      ) {

        setSelectedShift(
          normalizeShift(
            response.data
          )
        );

      }

    } catch (requestError) {

      console.error(
        "Unable to load shift details:",
        requestError
      );

      /*
       * Keep the row data visible even if
       * the detail API fails.
       */

      setError(
        getErrorMessage(
          requestError,
          "Unable to load shift details."
        )
      );

    }
  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  const handleToggleStatus =
    async (
      shift
    ) => {

      const shiftId =
        getShiftId(
          shift
        );


      /*
       * This prevents:
       *
       * PATCH /api/shifts/undefined/deactivate
       */

      if (!shiftId) {

        setError(
          "Unable to change shift status: Shift ID is missing."
        );

        return;
      }


      const action =
        shift.active
          ? "deactivate"
          : "activate";


      const confirmed =
        window.confirm(
          shift.active
            ? `Deactivate "${shift.name}"?`
            : `Activate "${shift.name}"?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(
          shiftId
        );

        setError("");


        if (
          shift.active
        ) {

          await deactivateShift(
            shiftId
          );

        } else {

          await activateShift(
            shiftId
          );

        }


        /*
         * Reload backend data.
         *
         * This ensures updatedAt and active
         * status are fresh.
         */

        await loadShifts(true);

      } catch (requestError) {

        console.error(
          `Unable to ${action} shift:`,
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            `Unable to ${action} shift.`
          )
        );

      } finally {

        setActionLoading(
          null
        );

      }
    };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="shifts-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="shifts-page-header">

        <div>

          <div className="shifts-eyebrow">
            ORGANIZATION
          </div>

          <h1>
            Shift management
          </h1>

          <p>
            Configure working hours,
            grace periods and punch rules.
          </p>

        </div>


        <div className="shifts-header-actions">

          <button
            type="button"
            className="shifts-refresh-button"
            onClick={() =>
              loadShifts(true)
            }
            disabled={
              refreshing ||
              loading
            }
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "shift-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            type="button"
            className="shift-primary-button"
            onClick={openCreate}
          >

            <Plus size={17} />

            New shift

          </button>

        </div>

      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="shifts-stats">

        {/* TOTAL */}

        <div className="shift-stat-card">

          <div className="shift-stat-icon">
            <Clock3 size={19} />
          </div>

          <div>

            <span>
              Total shifts
            </span>

            <strong>
              {stats.total}
            </strong>

          </div>

        </div>


        {/* ACTIVE */}

        <div className="shift-stat-card">

          <div className="shift-stat-icon shift-stat-active">
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


        {/* INACTIVE */}

        <div className="shift-stat-card">

          <div className="shift-stat-icon shift-stat-inactive">
            <ToggleLeft size={19} />
          </div>

          <div>

            <span>
              Inactive
            </span>

            <strong>
              {stats.inactive}
            </strong>

          </div>

        </div>


        {/* OVERNIGHT */}

        <div className="shift-stat-card">

          <div className="shift-stat-icon shift-stat-night">
            <ShieldCheck size={19} />
          </div>

          <div>

            <span>
              Overnight
            </span>

            <strong>
              {stats.overnight}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="shifts-card">

        {/* TOOLBAR */}

        <div className="shifts-toolbar">

          <div className="shift-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search shift, code or timezone..."
            />

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="shift-search-clear"
                title="Clear search"
              >

                <X size={14} />

              </button>

            )}

          </div>


          <div className="shift-status-filter">

            <button
              type="button"
              className={
                statusFilter === "ALL"
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
                statusFilter === "ACTIVE"
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
                statusFilter === "INACTIVE"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "INACTIVE"
                )
              }
            >
              INACTIVE
            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="shifts-page-error">

            <XCircle size={16} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              title="Close error"
            >
              <X size={15} />
            </button>

          </div>

        )}


        {/* LOADING */}

        {loading ? (

          <div className="shifts-loading">

            <Loader2
              size={26}
              className="shift-spin"
            />

            <span>
              Loading shifts...
            </span>

          </div>

        ) : filteredShifts.length === 0 ? (

          /* EMPTY */

          <div className="shifts-empty">

            <Clock3 size={32} />

            <h3>
              No shifts found
            </h3>

            <p>
              Create a shift or change
              your search/filter.
            </p>


            {!search &&
              statusFilter === "ALL" && (

                <button
                  type="button"
                  className="shift-primary-button"
                  onClick={openCreate}
                >

                  <Plus size={16} />

                  Create first shift

                </button>

              )}

          </div>

        ) : (

          /* TABLE */

          <div className="shifts-table-wrapper">

            <table className="shifts-table">

              <thead>

                <tr>

                  <th>
                    SHIFT
                  </th>

                  <th>
                    CODE
                  </th>

                  <th>
                    TIMING
                  </th>

                  <th>
                    TIME ZONE
                  </th>

                  <th>
                    DURATION
                  </th>

                  <th>
                    GRACE
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

                {filteredShifts.map(
                  (shift) => {

                    const shiftId =
                      getShiftId(
                        shift
                      );


                    return (

                      <tr
                        key={
                          shiftId ||
                          shift.code
                        }
                      >

                        {/* SHIFT */}

                        <td>

                          <div className="shift-person">

                            <div className="shift-avatar">

                              <Clock3
                                size={17}
                              />

                            </div>


                            <div>

                              <strong>
                                {shift.name}
                              </strong>

                              <span>
                                {shiftId ||
                                  "ID unavailable"}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* CODE */}

                        <td>

                          <span className="shift-code">

                            {shift.code}

                          </span>

                        </td>


                        {/* TIMING */}

                        <td>

                          <div className="shift-timing">

                            <strong>

                              {shift.startTime}
                              {" — "}
                              {shift.endTime}

                            </strong>


                            {shift.overnight && (

                              <span>
                                Crosses midnight
                              </span>

                            )}

                          </div>

                        </td>


                        {/* TIME ZONE */}

                        <td>

                          <span className="shift-zone">

                            {shift.zoneId ||
                              "—"}

                          </span>

                        </td>


                        {/* DURATION */}

                        <td>

                          <strong>

                            {shift.nominalDurationMinutes
                              ? formatMinutes(
                                  shift.nominalDurationMinutes
                                )
                              : calculateDuration(
                                  shift.startTime,
                                  shift.endTime
                                )}

                          </strong>

                        </td>


                        {/* GRACE */}

                        <td>

                          <div className="shift-grace">

                            <strong>

                              {formatMinutes(
                                shift.lateGraceMinutes
                              )}

                            </strong>

                            <span>
                              late grace
                            </span>

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>

                          <StatusBadge
                            active={
                              shift.active
                            }
                          />

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="shift-actions">

                            {/* VIEW */}

                            <button
                              type="button"
                              className="shift-action-button"
                              title="View"
                              onClick={() =>
                                openDetails(
                                  shift
                                )
                              }
                              disabled={
                                !shiftId
                              }
                            >

                              <Eye
                                size={17}
                              />

                            </button>


                            {/* EDIT */}

                            <button
                              type="button"
                              className="shift-action-button shift-edit-action"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  shift
                                )
                              }
                              disabled={
                                !shiftId
                              }
                            >

                              <Pencil
                                size={17}
                              />

                            </button>


                            {/* ACTIVATE / DEACTIVATE */}

                            <button
                              type="button"
                              className="shift-action-button"
                              title={
                                shift.active
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              disabled={
                                !shiftId ||
                                actionLoading ===
                                  shiftId
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  shift
                                )
                              }
                            >

                              {actionLoading ===
                              shiftId ? (

                                <Loader2
                                  size={17}
                                  className="shift-spin"
                                />

                              ) : shift.active ? (

                                <ToggleRight
                                  size={17}
                                />

                              ) : (

                                <ToggleLeft
                                  size={17}
                                />

                              )}

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
          FORM MODAL
      ===================================================== */}

      {showForm && (

        <ShiftFormModal
          mode={
            formMode
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

      {selectedShift &&
        !showForm && (

          <ShiftDetailsModal
            shift={
              selectedShift
            }
            onClose={() =>
              setSelectedShift(
                null
              )
            }
          />

        )}

    </div>
  );
}