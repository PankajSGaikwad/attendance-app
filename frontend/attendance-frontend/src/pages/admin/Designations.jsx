import {
  BadgeCheck,
  Check,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
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
  getDepartments,
} from "../../api/departmentApi";

import {
  activateDesignation,
  createDesignation,
  deactivateDesignation,
  getDesignationById,
  getDesignationsByDepartment,
  updateDesignation,
} from "../../api/designationApi";

import "./designations.css";


/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
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
    fallback
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  active,
}) {
  return (
    <span
      className={`designation-status ${
        active
          ? "designation-status-active"
          : "designation-status-inactive"
      }`}
    >
      <span className="designation-status-dot" />

      {active
        ? "ACTIVE"
        : "INACTIVE"}
    </span>
  );
}


/* =========================================================
   DETAILS MODAL
========================================================= */

function DesignationDetailsModal({
  designation,
  departmentName,
  onClose,
}) {
  if (!designation) {
    return null;
  }

  return (
    <div
      className="designation-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="designation-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="designation-modal-header">

          <div>

            <div className="designation-modal-eyebrow">
              DESIGNATION DETAILS
            </div>

            <h2>
              {designation.name}
            </h2>

            <p>
              Designation configuration
              and current status.
            </p>

          </div>

          <button
            type="button"
            className="designation-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        {/* HERO */}

        <div className="designation-detail-hero">

          <div className="designation-detail-icon">
            <BadgeCheck size={22} />
          </div>

          <div>

            <strong>
              {designation.code}
            </strong>

            <span>
              Designation code
            </span>

          </div>

          <StatusBadge
            active={designation.active}
          />

        </div>


        {/* DETAILS */}

        <div className="designation-detail-grid">

          <div className="designation-detail-item">

            <span>
              Designation ID
            </span>

            <strong>
              {designation.id}
            </strong>

          </div>


          <div className="designation-detail-item">

            <span>
              Designation name
            </span>

            <strong>
              {designation.name}
            </strong>

          </div>


          <div className="designation-detail-item">

            <span>
              Department
            </span>

            <strong>
              {departmentName ||
                designation.departmentId ||
                "—"}
            </strong>

          </div>


          <div className="designation-detail-item">

            <span>
              Created
            </span>

            <strong>
              {formatDate(
                designation.createdAt
              )}
            </strong>

          </div>


          <div className="designation-detail-item">

            <span>
              Last updated
            </span>

            <strong>
              {formatDate(
                designation.updatedAt
              )}
            </strong>

          </div>

        </div>


        <div className="designation-modal-footer">

          <button
            type="button"
            className="designation-secondary-button"
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
   CREATE / EDIT MODAL
========================================================= */

function DesignationFormModal({
  mode,
  form,
  setForm,
  departments,
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

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  return (
    <div
      className="designation-modal-backdrop"
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
        className="designation-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="designation-modal-header">

          <div>

            <div className="designation-modal-eyebrow">

              {isEdit
                ? "UPDATE DESIGNATION"
                : "NEW DESIGNATION"}

            </div>

            <h2>

              {isEdit
                ? "Edit designation"
                : "Create designation"}

            </h2>

            <p>

              {isEdit
                ? "Only the designation name can be changed."
                : "Add a designation under a department."}

            </p>

          </div>


          <button
            type="button"
            className="designation-modal-close"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>

        </div>


        <form
          className="designation-form"
          onSubmit={onSubmit}
        >

          {/* DEPARTMENT */}

          <label className="designation-form-field">

            <span>
              Department
            </span>

            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={
                isEdit ||
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
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                      {" "}
                      ({department.code})
                    </option>
                  )
                )}

            </select>

            <small>

              {isEdit
                ? "Department cannot be changed."
                : "Select the department for this designation."}

            </small>

          </label>


          {/* CODE */}

          <label className="designation-form-field">

            <span>
              Designation code
            </span>

            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. DEV"
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
                ? "Designation code cannot be changed."
                : "Starts with a letter. Letters, numbers, underscore and hyphen are allowed."}

            </small>

          </label>


          {/* NAME */}

          <label className="designation-form-field">

            <span>
              Designation name
            </span>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Software Developer"
              maxLength={100}
              autoComplete="off"
              autoFocus={isEdit}
              disabled={submitting}
            />

            <small>
              Maximum 100 characters.
            </small>

          </label>


          {/* ERROR */}

          {error && (
            <div className="designation-form-error">

              <XCircle size={15} />

              <span>
                {error}
              </span>

            </div>
          )}


          {/* FOOTER */}

          <div className="designation-modal-footer">

            <button
              type="button"
              className="designation-secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="designation-primary-button"
              disabled={submitting}
            >

              {submitting ? (
                <>
                  <Loader2
                    size={15}
                    className="designation-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  {isEdit
                    ? "Save changes"
                    : "Create designation"}

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

export default function Designations() {

  const [
    departments,
    setDepartments,
  ] = useState([]);


  const [
    designations,
    setDesignations,
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
    departmentFilter,
    setDepartmentFilter,
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
    departmentId: "",
    code: "",
    name: "",
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
    selectedDesignation,
    setSelectedDesignation,
  ] = useState(null);


  const [
    selectedDepartmentName,
    setSelectedDepartmentName,
  ] = useState("");


  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);


  /* =========================================================
     LOAD DATA
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


      /*
       * First load departments.
       */

      const departmentResponse =
        await getDepartments(false);


      const departmentData =
        Array.isArray(
          departmentResponse.data
        )
          ? departmentResponse.data
          : [];


      setDepartments(
        departmentData
      );


      /*
       * Then load designations
       * for every department.
       */

      const designationResults =
        await Promise.all(
          departmentData.map(
            async (department) => {

              try {

                const response =
                  await getDesignationsByDepartment(
                    department.id,
                    false
                  );

                return Array.isArray(
                  response.data
                )
                  ? response.data
                  : [];

              } catch (requestError) {

                console.error(
                  `Unable to load designations for department ${department.id}:`,
                  requestError
                );

                return [];
              }

            }
          )
        );


      const allDesignations =
        designationResults.flat();


      setDesignations(
        allDesignations
      );

    } catch (requestError) {

      console.error(
        "Unable to load designations:",
        requestError
      );

      setError(
        getErrorMessage(
          requestError,
          "Unable to load designations."
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
     DEPARTMENT NAME LOOKUP
  ========================================================= */

  const departmentMap =
    useMemo(() => {

      const map = {};

      departments.forEach(
        (department) => {

          map[department.id] =
            department;

        }
      );

      return map;

    }, [departments]);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredDesignations =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return designations.filter(
        (designation) => {

          const department =
            departmentMap[
              designation.departmentId
            ];


          const departmentName =
            department?.name ||
            "";


          const departmentCode =
            department?.code ||
            "";


          const matchesSearch =
            !query ||
            designation.name
              ?.toLowerCase()
              .includes(query) ||
            designation.code
              ?.toLowerCase()
              .includes(query) ||
            departmentName
              .toLowerCase()
              .includes(query) ||
            departmentCode
              .toLowerCase()
              .includes(query);


          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter === "ACTIVE"
                ? designation.active
                : !designation.active
            );


          const matchesDepartment =
            departmentFilter === "ALL" ||
            designation.departmentId ===
              departmentFilter;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesDepartment
          );

        }
      );

    }, [
      designations,
      departmentMap,
      search,
      statusFilter,
      departmentFilter,
    ]);


  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {

      const total =
        designations.length;


      const active =
        designations.filter(
          (designation) =>
            designation.active
        ).length;


      const inactive =
        total - active;


      return {
        total,
        active,
        inactive,
      };

    }, [
      designations,
    ]);


  /* =========================================================
     CREATE
  ========================================================= */

  const openCreate = () => {

    setFormMode("create");

    setSelectedDesignation(null);

    setForm({
      departmentId: "",
      code: "",
      name: "",
    });

    setFormError("");

    setShowForm(true);
  };


  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (
    designation
  ) => {

    setFormMode("edit");

    setSelectedDesignation(
      designation
    );

    setForm({
      departmentId:
        designation.departmentId ||
        "",

      code:
        designation.code ||
        "",

      name:
        designation.name ||
        "",
    });

    setFormError("");

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
  };


  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setFormError("");


    const departmentId =
      form.departmentId.trim();


    const code =
      form.code.trim();


    const name =
      form.name.trim();


    /* CREATE VALIDATION */

    if (
      formMode === "create" &&
      !departmentId
    ) {

      setFormError(
        "Please select a department."
      );

      return;
    }


    if (
      formMode === "create" &&
      !code
    ) {

      setFormError(
        "Designation code is required."
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
        "Designation code must start with a letter and contain only letters, numbers, underscore or hyphen."
      );

      return;
    }


    if (!name) {

      setFormError(
        "Designation name is required."
      );

      return;
    }


    if (name.length > 100) {

      setFormError(
        "Designation name cannot exceed 100 characters."
      );

      return;
    }


    try {

      setSubmitting(true);


      /* =====================================================
         CREATE
      ===================================================== */

      if (
        formMode === "create"
      ) {

        await createDesignation(
          departmentId,
          {
            code,
            name,
          }
        );

      }


      /* =====================================================
         UPDATE

         IMPORTANT:
         Backend accepts ONLY:

         {
           "name": "..."
         }

         Do NOT send code.
         Do NOT send departmentId.
      ===================================================== */

      else {

        const designationId =
          selectedDesignation?.id;


        if (!designationId) {

          setFormError(
            "Designation ID is missing."
          );

          return;
        }


        await updateDesignation(
          designationId,
          {
            name,
          }
        );

      }


      setShowForm(false);

      setFormError("");

      await loadData(true);

    } catch (requestError) {

      console.error(
        "Unable to save designation:",
        requestError
      );

      setFormError(
        getErrorMessage(
          requestError,
          "Unable to save designation."
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
    designation
  ) => {

    try {

      setSelectedDesignation(
        designation
      );


      const department =
        departmentMap[
          designation.departmentId
        ];


      setSelectedDepartmentName(
        department?.name || ""
      );


      /*
       * Fetch latest version
       * from backend.
       */

      const response =
        await getDesignationById(
          designation.id
        );


      if (response.data) {

        setSelectedDesignation(
          response.data
        );

        const latestDepartment =
          departmentMap[
            response.data.departmentId
          ];

        setSelectedDepartmentName(
          latestDepartment?.name || ""
        );

      }

    } catch (requestError) {

      console.error(
        "Unable to load designation details:",
        requestError
      );

      /*
       * Even if detail request fails,
       * show the data already present
       * in the table.
       */

      setSelectedDesignation(
        designation
      );

    }
  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  const handleToggleStatus =
    async (
      designation
    ) => {

      const action =
        designation.active
          ? "deactivate"
          : "activate";


      const confirmed =
        window.confirm(
          designation.active
            ? `Deactivate "${designation.name}"?`
            : `Activate "${designation.name}"?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(
          designation.id
        );


        if (
          designation.active
        ) {

          await deactivateDesignation(
            designation.id
          );

        } else {

          await activateDesignation(
            designation.id
          );

        }


        await loadData(true);

      } catch (requestError) {

        console.error(
          `Unable to ${action} designation:`,
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            `Unable to ${action} designation.`
          )
        );

      } finally {

        setActionLoading(null);

      }
    };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="designations-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="designations-page-header">

        <div>

          <div className="designations-eyebrow">
            ORGANIZATION
          </div>

          <h1>
            All designations
          </h1>

          <p>
            {filteredDesignations.length}
            {" "}
            designations shown
          </p>

        </div>


        <div className="designations-header-actions">

          <button
            type="button"
            className="designations-refresh-button"
            onClick={() =>
              loadData(true)
            }
            disabled={refreshing}
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "designation-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            type="button"
            className="designations-primary-button"
            onClick={openCreate}
          >

            <Plus size={17} />

            New designation

          </button>

        </div>

      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="designations-stats">

        <div className="designation-stat-card">

          <div className="designation-stat-icon">
            <BadgeCheck size={19} />
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="designation-stat-card">

          <div className="designation-stat-icon designation-stat-active">
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


        <div className="designation-stat-card">

          <div className="designation-stat-icon designation-stat-inactive">
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

      </div>


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="designations-card">

        <div className="designations-toolbar">

          <div className="designation-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search designation, code or department..."
            />

          </div>


          <select
            className="designation-department-filter"
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All departments
            </option>

            {departments.map(
              (department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              )
            )}

          </select>


          <div className="designation-status-filter">

            <button
              type="button"
              className={
                statusFilter === "ALL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter("ALL")
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
                setStatusFilter("ACTIVE")
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
                setStatusFilter("INACTIVE")
              }
            >
              INACTIVE
            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="designations-page-error">

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

          <div className="designations-loading">

            <Loader2
              size={25}
              className="designation-spin"
            />

            <span>
              Loading designations...
            </span>

          </div>

        ) : filteredDesignations.length === 0 ? (

          <div className="designations-empty">

            <BadgeCheck size={30} />

            <h3>
              No designations found
            </h3>

            <p>
              Try changing your search
              or filters.
            </p>

          </div>

        ) : (

          <div className="designations-table-wrapper">

            <table className="designations-table">

              <thead>

                <tr>

                  <th>
                    DESIGNATION
                  </th>

                  <th>
                    CODE
                  </th>

                  <th>
                    DEPARTMENT
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    CREATED
                  </th>

                  <th>
                    UPDATED
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredDesignations.map(
                  (designation) => {

                    const department =
                      departmentMap[
                        designation.departmentId
                      ];


                    return (
                      <tr
                        key={
                          designation.id
                        }
                      >

                        <td>

                          <div className="designation-name-cell">

                            <div className="designation-row-icon">
                              <BadgeCheck
                                size={18}
                              />
                            </div>

                            <div>

                              <strong>
                                {designation.name}
                              </strong>

                              <span>
                                {designation.id}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="designation-code">
                            {designation.code}
                          </span>

                        </td>


                        <td>

                          <div className="designation-department-cell">

                            <strong>
                              {department?.name ||
                                "Unknown"}
                            </strong>

                            <span>
                              {department?.code ||
                                designation.departmentId}
                            </span>

                          </div>

                        </td>


                        <td>

                          <StatusBadge
                            active={
                              designation.active
                            }
                          />

                        </td>


                        <td>
                          {formatDate(
                            designation.createdAt
                          )}
                        </td>


                        <td>
                          {formatDate(
                            designation.updatedAt
                          )}
                        </td>


                        <td>

                          <div className="designation-actions">

                            <button
                              type="button"
                              className="designation-action-button"
                              title="View"
                              onClick={() =>
                                openDetails(
                                  designation
                                )
                              }
                            >
                              <Eye
                                size={17}
                              />
                            </button>


                            <button
                              type="button"
                              className="designation-action-button designation-edit-action"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  designation
                                )
                              }
                            >
                              <Pencil
                                size={17}
                              />
                            </button>


                            <button
                              type="button"
                              className="designation-action-button"
                              title={
                                designation.active
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              disabled={
                                actionLoading ===
                                designation.id
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  designation
                                )
                              }
                            >

                              {actionLoading ===
                              designation.id ? (

                                <Loader2
                                  size={17}
                                  className="designation-spin"
                                />

                              ) : designation.active ? (

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
        <DesignationFormModal
          mode={formMode}
          form={form}
          setForm={setForm}
          departments={departments}
          submitting={submitting}
          error={formError}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedDesignation &&
        !showForm && (
          <DesignationDetailsModal
            designation={
              selectedDesignation
            }
            departmentName={
              selectedDepartmentName
            }
            onClose={() =>
              setSelectedDesignation(
                null
              )
            }
          />
        )}

    </div>
  );
}