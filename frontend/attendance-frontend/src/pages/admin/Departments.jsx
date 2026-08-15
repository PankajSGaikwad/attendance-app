import {
  Building2,
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
  activateDepartment,
  createDepartment,
  deactivateDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "../../api/departmentApi";

import "./departments.css";


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


function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ active }) {
  return (
    <span
      className={`department-status ${
        active
          ? "department-status-active"
          : "department-status-inactive"
      }`}
    >
      <span className="department-status-dot" />

      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}


/* =========================================================
   DETAILS MODAL
========================================================= */

function DepartmentDetailsModal({
  department,
  onClose,
}) {
  if (!department) {
    return null;
  }

  return (
    <div
      className="department-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="department-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="department-modal-header">

          <div>

            <div className="department-modal-eyebrow">
              DEPARTMENT DETAILS
            </div>

            <h2>
              {department.name}
            </h2>

            <p>
              Department configuration and
              current status.
            </p>

          </div>


          <button
            type="button"
            className="department-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        {/* HERO */}

        <div className="department-detail-hero">

          <div className="department-detail-icon">
            <Building2 size={22} />
          </div>


          <div>

            <strong>
              {department.code}
            </strong>

            <span>
              Department code
            </span>

          </div>


          <StatusBadge
            active={department.active}
          />

        </div>


        {/* DETAILS */}

        <div className="department-detail-grid">

          <div className="department-detail-item">

            <span>
              Department ID
            </span>

            <strong>
              {department.id}
            </strong>

          </div>


          <div className="department-detail-item">

            <span>
              Department name
            </span>

            <strong>
              {department.name}
            </strong>

          </div>


          <div className="department-detail-item">

            <span>
              Created
            </span>

            <strong>
              {formatDate(
                department.createdAt
              )}
            </strong>

          </div>


          <div className="department-detail-item">

            <span>
              Last updated
            </span>

            <strong>
              {formatDate(
                department.updatedAt
              )}
            </strong>

          </div>

        </div>


        {/* FOOTER */}

        <div className="department-modal-footer">

          <button
            type="button"
            className="department-secondary-button"
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

function DepartmentFormModal({
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


  /* -------------------------------------------------------
     FORM CHANGE
  ------------------------------------------------------- */

  const handleChange = (event) => {

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
      className="department-modal-backdrop"
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
        className="department-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="department-modal-header">

          <div>

            <div className="department-modal-eyebrow">

              {isEdit
                ? "UPDATE DEPARTMENT"
                : "NEW DEPARTMENT"}

            </div>


            <h2>

              {isEdit
                ? "Edit department"
                : "Create department"}

            </h2>


            <p>

              {isEdit
                ? "Only the department name can be changed."
                : "Add a new department to your workforce."}

            </p>

          </div>


          <button
            type="button"
            className="department-modal-close"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>

        </div>


        {/* FORM */}

        <form
          className="department-form"
          onSubmit={onSubmit}
        >

          {/* =================================================
              DEPARTMENT CODE
          ================================================= */}

          <label className="department-form-field">

            <span>
              Department code
            </span>


            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. DEV"
              maxLength={30}
              disabled={isEdit}
              readOnly={isEdit}
              autoComplete="off"
            />


            <small>

              {isEdit
                ? "Department code cannot be changed."
                : "Starts with a letter. Letters, numbers, underscore and hyphen are allowed."}

            </small>

          </label>


          {/* =================================================
              DEPARTMENT NAME
          ================================================= */}

          <label className="department-form-field">

            <span>
              Department name
            </span>


            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Development"
              maxLength={100}
              autoComplete="off"
              autoFocus={isEdit}
            />


            <small>
              Maximum 100 characters.
            </small>

          </label>


          {/* ERROR */}

          {error && (

            <div className="department-form-error">

              <XCircle size={15} />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* FOOTER */}

          <div className="department-modal-footer">

            <button
              type="button"
              className="department-secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="department-primary-button"
              disabled={submitting}
            >

              {submitting ? (

                <>

                  <Loader2
                    size={15}
                    className="department-spin"
                  />

                  Saving...

                </>

              ) : (

                <>

                  {isEdit
                    ? "Save changes"
                    : "Create department"}

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

export default function Departments() {

  const [
    departments,
    setDepartments,
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
    selectedDepartment,
    setSelectedDepartment,
  ] = useState(null);


  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);


  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);


  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

  const loadDepartments = async (
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
        await getDepartments(false);


      const data =
        Array.isArray(response.data)
          ? response.data
          : [];


      setDepartments(data);

    } catch (requestError) {

      console.error(
        "Unable to load departments:",
        requestError
      );


      setError(
        getErrorMessage(
          requestError,
          "Unable to load departments."
        )
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    loadDepartments();

  }, []);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredDepartments =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return departments.filter(
        (department) => {

          const matchesSearch =
            !query ||
            department.name
              ?.toLowerCase()
              .includes(query) ||
            department.code
              ?.toLowerCase()
              .includes(query);


          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter === "ACTIVE"
                ? department.active
                : !department.active
            );


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      departments,
      search,
      statusFilter,
    ]);


  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {

      const total =
        departments.length;


      const active =
        departments.filter(
          (department) =>
            department.active
        ).length;


      const inactive =
        total - active;


      return {
        total,
        active,
        inactive,
      };

    }, [
      departments,
    ]);


  /* =========================================================
     CREATE
  ========================================================= */

  const openCreate = () => {

    setFormMode("create");

    setSelectedDepartment(null);


    setForm({
      code: "",
      name: "",
    });


    setFormError("");

    setShowForm(true);

  };


  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (department) => {

    /*
     * Keep the complete selected department object.
     * We need its ID for PUT /departmentId.
     */

    setSelectedDepartment(
      department
    );


    setFormMode("edit");


    /*
     * Code is displayed but cannot be modified.
     * The code is NOT sent during update.
     */

    setForm({
      code:
        department.code || "",

      name:
        department.name || "",
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
     CREATE / UPDATE
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


    /* =====================================================
       NAME VALIDATION
    ===================================================== */

    if (!name) {

      setFormError(
        "Department name is required."
      );

      return;

    }


    /* =====================================================
       CREATE ONLY - CODE VALIDATION
    ===================================================== */

    if (
      formMode === "create" &&
      !code
    ) {

      setFormError(
        "Department code is required."
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
        "Department code must start with a letter and contain only letters, numbers, underscore or hyphen."
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

        await createDepartment({
          code: code,
          name: name,
        });

      }


      /* =====================================================
         UPDATE
         
         IMPORTANT:
         
         Backend endpoint:
         
         PUT /department/{departmentId}
         
         Request body:
         
         {
           "name": "New Department Name"
         }
         
         DO NOT SEND CODE HERE.
      ===================================================== */

      else {

        const departmentId =
          selectedDepartment?.id;


        if (!departmentId) {

          throw new Error(
            "Department ID is missing."
          );

        }


        /*
         * This is intentionally ONLY:
         *
         * { name }
         *
         * The existing code remains unchanged.
         */

        await updateDepartment(
          departmentId,
          {
            name: name,
          }
        );

      }


      /* =====================================================
         RELOAD FROM BACKEND
         
         This is important.
         
         Do NOT manually update:
         
         setDepartments(...)
         
         because the backend is responsible for generating
         updatedAt.
      ===================================================== */

      await loadDepartments(true);


      /* =====================================================
         CLOSE FORM ONLY AFTER SUCCESS
      ===================================================== */

      setShowForm(false);

      setSelectedDepartment(null);

      setFormError("");

    } catch (requestError) {

      console.error(
        "Unable to save department:",
        requestError
      );


      setFormError(
        getErrorMessage(
          requestError,
          "Unable to save department."
        )
      );

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     DETAILS
  ========================================================= */

  const openDetails = async (
    department
  ) => {

    setSelectedDepartment(
      department
    );

    setDetailsLoading(true);

    setError("");


    try {

      const response =
        await getDepartmentById(
          department.id
        );


      /*
       * Replace the selected department
       * with the latest backend object.
       *
       * This ensures updatedAt is fresh.
       */

      setSelectedDepartment(
        response.data
      );

    } catch (requestError) {

      console.error(
        "Unable to load department details:",
        requestError
      );


      setError(
        getErrorMessage(
          requestError,
          "Unable to load department details."
        )
      );

    } finally {

      setDetailsLoading(false);

    }
  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  const handleToggle = async (
    department
  ) => {

    try {

      setActionLoading(
        department.id
      );

      setError("");


      if (
        department.active
      ) {

        await deactivateDepartment(
          department.id
        );

      } else {

        await activateDepartment(
          department.id
        );

      }


      await loadDepartments(true);

    } catch (requestError) {

      console.error(
        "Unable to change department status:",
        requestError
      );


      setError(
        getErrorMessage(
          requestError,
          "Unable to change department status."
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

    <div className="departments-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="departments-page-header">

        <div>

          <div className="departments-eyebrow">
            ORGANIZATION MANAGEMENT
          </div>


          <h1>
            Departments
          </h1>


          <p>
            Create and manage the departments
            used across your workforce.
          </p>

        </div>


        <div className="departments-header-actions">

          <button
            type="button"
            className="departments-refresh-button"
            onClick={() =>
              loadDepartments(true)
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
                  ? "department-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            type="button"
            className="departments-create-button"
            onClick={openCreate}
          >

            <Plus size={16} />

            Add department

          </button>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="departments-error">

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


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="departments-stat-grid">

        {/* TOTAL */}

        <div className="departments-stat-card">

          <div className="departments-stat-icon">

            <Building2 size={18} />

          </div>


          <div>

            <span>
              Total departments
            </span>

            <strong>
              {stats.total}
            </strong>

          </div>

        </div>


        {/* ACTIVE */}

        <div className="departments-stat-card departments-stat-active">

          <div className="departments-stat-icon">

            <Check size={18} />

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

        <div className="departments-stat-card departments-stat-inactive">

          <div className="departments-stat-icon">

            <ToggleLeft size={18} />

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
          MAIN CARD
      ===================================================== */}

      <section className="departments-card">

        <div className="departments-card-header">

          <div>

            <div className="departments-card-eyebrow">
              ORGANIZATION
            </div>


            <h2>
              All departments
            </h2>


            <p>

              {filteredDepartments.length}

              {" "}

              {filteredDepartments.length === 1
                ? "department"
                : "departments"}

              {" "}
              shown

            </p>

          </div>

        </div>


        {/* ===================================================
            FILTER
        =================================================== */}

        <div className="departments-toolbar">

          <div className="departments-search">

            <Search size={16} />


            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search department or code..."
            />


            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="departments-clear-search"
              >
                <X size={14} />
              </button>

            )}

          </div>


          <div className="departments-status-tabs">

            {[
              "ALL",
              "ACTIVE",
              "INACTIVE",
            ].map(
              (status) => (

                <button
                  type="button"
                  key={status}
                  className={
                    statusFilter === status
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      status
                    )
                  }
                >
                  {status}
                </button>

              )
            )}

          </div>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        {loading ? (

          <div className="departments-loading">

            <Loader2
              size={23}
              className="department-spin"
            />

            <span>
              Loading departments...
            </span>

          </div>

        ) : filteredDepartments.length === 0 ? (

          <div className="departments-empty">

            <div className="departments-empty-icon">

              <Building2 size={21} />

            </div>


            <h3>
              No departments found
            </h3>


            <p>
              Try changing your search
              or create a new department.
            </p>

          </div>

        ) : (

          <div className="departments-table-wrapper">

            <table className="departments-table">

              <thead>

                <tr>

                  <th>
                    Department
                  </th>

                  <th>
                    Code
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                  <th>
                    Updated
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredDepartments.map(
                  (department) => (

                    <tr
                      key={department.id}
                    >

                      {/* DEPARTMENT */}

                      <td>

                        <div className="department-person">

                          <div className="department-avatar">

                            <Building2
                              size={16}
                            />

                          </div>


                          <div>

                            <strong>
                              {department.name}
                            </strong>


                            <span>
                              {department.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CODE */}

                      <td>

                        <span className="department-code">
                          {department.code}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <StatusBadge
                          active={
                            department.active
                          }
                        />

                      </td>


                      {/* CREATED */}

                      <td>

                        <span className="department-date">

                          {formatDate(
                            department.createdAt
                          )}

                        </span>

                      </td>


                      {/* UPDATED */}

                      <td>

                        <span className="department-date">

                          {formatDate(
                            department.updatedAt
                          )}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="department-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="department-action view"
                            onClick={() =>
                              openDetails(
                                department
                              )
                            }
                            title="View department"
                          >

                            <Eye size={15} />

                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            className="department-action edit"
                            onClick={() =>
                              openEdit(
                                department
                              )
                            }
                            title="Edit department"
                          >

                            <Pencil size={15} />

                          </button>


                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            type="button"
                            className={`department-action toggle ${
                              department.active
                                ? "active"
                                : "inactive"
                            }`}
                            onClick={() =>
                              handleToggle(
                                department
                              )
                            }
                            disabled={
                              actionLoading ===
                              department.id
                            }
                            title={
                              department.active
                                ? "Deactivate department"
                                : "Activate department"
                            }
                          >

                            {actionLoading ===
                            department.id ? (

                              <Loader2
                                size={15}
                                className="department-spin"
                              />

                            ) : department.active ? (

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

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          FORM MODAL
      ===================================================== */}

      {showForm && (

        <DepartmentFormModal
          mode={formMode}
          form={form}
          setForm={setForm}
          submitting={submitting}
          error={formError}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />

      )}


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedDepartment &&
        !showForm && (

          <DepartmentDetailsModal
            department={
              detailsLoading
                ? null
                : selectedDepartment
            }
            onClose={() =>
              setSelectedDepartment(null)
            }
          />

        )}

    </div>

  );
}