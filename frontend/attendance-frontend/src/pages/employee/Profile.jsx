import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Pencil,
  Save,
  X,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
} from "../../api/employeeApi";

import api from "../../api/client";


export default function Profile() {

  const navigate =
    useNavigate();


  const [profile, setProfile] =
    useState(null);

  const [form, setForm] =
    useState({
      firstName: "",
      lastName: "",
      phone: "",
      departmentId: "",
      designationId: "",
    });


  const [departments, setDepartments] =
    useState([]);

  const [designations, setDesignations] =
    useState([]);


  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);


  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /*
   * Load departments.
   */
  const loadDepartments =
    useCallback(async () => {

      try {

        const response =
          await api.get(
            "/api/departments/options"
          );

        setDepartments(
          response.data || []
        );

      } catch (departmentError) {

        console.error(
          "Unable to load departments:",
          departmentError
        );

        throw departmentError;
      }

    }, []);


  /*
   * Load designations for department.
   */
  const loadDesignations =
    useCallback(
      async (departmentId) => {

        if (!departmentId) {

          setDesignations([]);

          return;
        }


        try {

          const response =
            await api.get(
              `/api/departments/${departmentId}/designations/options`
            );

          setDesignations(
            response.data || []
          );

        } catch (designationError) {

          console.error(
            "Unable to load designations:",
            designationError
          );

          setDesignations([]);

          throw designationError;
        }

      },
      []
    );


  /*
   * Copy backend profile
   * into editable form.
   */
  const populateForm =
    useCallback((data) => {

      setForm({

        firstName:
          data?.firstName || "",

        lastName:
          data?.lastName || "",

        phone:
          data?.phone || "",

        departmentId:
          data?.departmentId || "",

        designationId:
          data?.designationId || "",
      });

    }, []);


  /*
   * Load complete profile.
   */
  const loadProfile =
    useCallback(
      async (showRefreshing = false) => {

        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setSuccess("");


        try {

          const profileResponse =
            await getMyProfile();

          const profileData =
            profileResponse.data;


          setProfile(
            profileData
          );


          populateForm(
            profileData
          );


          /*
           * Load department list.
           */
          await loadDepartments();


          /*
           * Load designations for
           * current department.
           */
          if (
            profileData?.departmentId
          ) {

            await loadDesignations(
              profileData.departmentId
            );

          } else {

            setDesignations([]);
          }


        } catch (profileError) {

          console.error(
            "Unable to load employee profile:",
            profileError
          );


          setError(
            getErrorMessage(
              profileError,
              "Unable to load your profile."
            )
          );

        } finally {

          setLoading(false);
          setRefreshing(false);
        }

      },
      [
        loadDepartments,
        loadDesignations,
        populateForm,
      ]
    );


  /*
   * Initial page load.
   */
  useEffect(() => {

    loadProfile();

  }, [loadProfile]);


  /*
   * Handle text fields.
   */
  const handleChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );


      setError("");
      setSuccess("");
    };


  /*
   * Department changed.
   */
  const handleDepartmentChange =
    async (event) => {

      const departmentId =
        event.target.value;


      setForm(
        (previous) => ({
          ...previous,
          departmentId,
          designationId: "",
        })
      );


      setDesignations([]);

      setError("");
      setSuccess("");


      if (!departmentId) {
        return;
      }


      try {

        await loadDesignations(
          departmentId
        );

      } catch (designationError) {

        setError(
          getErrorMessage(
            designationError,
            "Unable to load designations."
          )
        );
      }
    };


  /*
   * Validate form before PUT.
   */
  const validateForm =
    () => {

      if (
        !form.firstName.trim()
      ) {

        setError(
          "First name is required."
        );

        return false;
      }


      if (
        !form.lastName.trim()
      ) {

        setError(
          "Last name is required."
        );

        return false;
      }


      if (
        !form.phone.trim()
      ) {

        setError(
          "Phone number is required."
        );

        return false;
      }


      const phonePattern =
        /^[0-9+()\-\s]{7,20}$/;


      if (
        !phonePattern.test(
          form.phone.trim()
        )
      ) {

        setError(
          "Please enter a valid phone number."
        );

        return false;
      }


      if (
        !form.departmentId
      ) {

        setError(
          "Please select a department."
        );

        return false;
      }


      if (
        !form.designationId
      ) {

        setError(
          "Please select a designation."
        );

        return false;
      }


      return true;
    };


  /*
   * Save profile.
   */
  const handleSave =
    async () => {

      if (!validateForm()) {
        return;
      }


      setSaving(true);

      setError("");
      setSuccess("");


      try {

        const response =
          await updateMyProfile(
            {
              firstName:
                form.firstName.trim(),

              lastName:
                form.lastName.trim(),

              phone:
                form.phone.trim(),

              departmentId:
                form.departmentId,

              designationId:
                form.designationId,
            }
          );


        /*
         * Backend returns the
         * updated EmployeeResponse.
         */
        const updatedProfile =
          response.data;


        setProfile(
          updatedProfile
        );


        populateForm(
          updatedProfile
        );


        /*
         * Reload designations in case
         * department changed.
         */
        if (
          updatedProfile?.departmentId
        ) {

          await loadDesignations(
            updatedProfile.departmentId
          );
        }


        setEditing(false);

        setSuccess(
          "Profile updated successfully."
        );

      } catch (saveError) {

        console.error(
          "Unable to update profile:",
          saveError
        );


        setError(
          getErrorMessage(
            saveError,
            "Unable to update your profile."
          )
        );

      } finally {

        setSaving(false);
      }
    };


  /*
   * Cancel editing.
   */
  const handleCancel =
    () => {

      if (profile) {

        populateForm(
          profile
        );

        if (
          profile.departmentId
        ) {

          loadDesignations(
            profile.departmentId
          ).catch(() => {});
        }
      }


      setEditing(false);

      setError("");
      setSuccess("");
    };


  /*
   * Start editing.
   */
  const handleEdit =
    async () => {

      setEditing(true);

      setError("");
      setSuccess("");


      if (
        profile?.departmentId
      ) {

        try {

          await loadDesignations(
            profile.departmentId
          );

        } catch (designationError) {

          setError(
            getErrorMessage(
              designationError,
              "Unable to load designations."
            )
          );
        }
      }
    };


  /*
   * Format dates.
   */
  const formatDate =
    (value) => {

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
          new Date(value)
        );

      } catch {

        return "—";
      }
    };


  /*
   * Format date + time.
   */
  const formatDateTime =
    (value) => {

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
    };


  /*
   * Status.
   */
  const getStatus =
    () => {

      const status =
        String(
          profile?.status || "PENDING"
        ).toUpperCase();


      if (
        status === "APPROVED"
      ) {
        return {
          label: "Approved",
          className: "employee-profile-status-approved",
        };
      }


      if (
        status === "REJECTED"
      ) {
        return {
          label: "Rejected",
          className: "employee-profile-status-rejected",
        };
      }


      return {
        label: "Pending",
        className: "employee-profile-status-pending",
      };
    };


  /*
   * Loading.
   */
  if (loading) {

    return (
      <div className="employee-profile-page">

        <div className="employee-profile-loading">

          <div className="employee-profile-spinner" />

          <p>
            Loading your profile...
          </p>

        </div>

      </div>
    );
  }


  /*
   * No profile.
   */
  if (!profile) {

    return (
      <div className="employee-profile-page">

        <div className="employee-profile-empty">

          <div className="employee-profile-empty-icon">
            <User size={30} />
          </div>

          <h1>
            Profile not found
          </h1>

          <p>
            Your employee profile has not been
            created yet.
          </p>

          <button
            type="button"
            className="employee-profile-primary-button"
            onClick={() =>
              navigate(
                "/complete-profile"
              )
            }
          >
            Complete profile
          </button>

        </div>

      </div>
    );
  }


  const status =
    getStatus();


  return (
    <div className="employee-profile-page">

      <div className="employee-profile-container">

        {/* =====================================
            PAGE HEADER
            ===================================== */}

        <div className="employee-profile-header">

          <div>

            <div className="employee-profile-eyebrow">
              EMPLOYEE WORKSPACE
            </div>

            <h1>
              My profile
            </h1>

            <p>
              View and manage your employee
              information.
            </p>

          </div>


          <div className="employee-profile-header-actions">

            <button
              type="button"
              className="employee-profile-refresh-button"
              onClick={() =>
                loadProfile(true)
              }
              disabled={refreshing}
              title="Refresh profile"
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "employee-profile-spin"
                    : ""
                }
              />

              Refresh

            </button>


            {!editing && (

              <button
                type="button"
                className="employee-profile-edit-button"
                onClick={handleEdit}
              >

                <Pencil size={17} />

                Edit profile

              </button>

            )}

          </div>

        </div>


        {/* =====================================
            ALERTS
            ===================================== */}

        {error && (

          <div className="employee-profile-alert employee-profile-alert-error">

            <div className="employee-profile-alert-icon">
              !
            </div>

            <span>
              {error}
            </span>

          </div>

        )}


        {success && (

          <div className="employee-profile-alert employee-profile-alert-success">

            <div className="employee-profile-alert-icon">
              ✓
            </div>

            <span>
              {success}
            </span>

          </div>

        )}


        {/* =====================================
            PROFILE HERO
            ===================================== */}

        <section className="employee-profile-hero">

          <div className="employee-profile-avatar">

            {profile.firstName
              ?.charAt(0)
              ?.toUpperCase() || "E"}

            {profile.lastName
              ?.charAt(0)
              ?.toUpperCase() || ""
            }

          </div>


          <div className="employee-profile-hero-info">

            <h2>

              {profile.firstName || ""}
              {" "}
              {profile.lastName || ""}

            </h2>


            <p>
              {profile.email || "No email available"}
            </p>


            <div className="employee-profile-hero-meta">

              {profile.employeeCode && (

                <span>
                  Employee ID: {profile.employeeCode}
                </span>

              )}


              {profile.departmentName && (

                <span>
                  {profile.departmentName}
                </span>

              )}


              {profile.designationName && (

                <span>
                  {profile.designationName}
                </span>

              )}

            </div>

          </div>


          <div
            className={
              `employee-profile-status ${status.className}`
            }
          >

            <span className="employee-profile-status-dot" />

            {status.label}

          </div>

        </section>


        {/* =====================================
            PERSONAL INFORMATION
            ===================================== */}

        <section className="employee-profile-card">

          <div className="employee-profile-card-header">

            <div className="employee-profile-card-title">

              <div className="employee-profile-card-icon">
                <User size={18} />
              </div>

              <div>

                <h2>
                  Personal information
                </h2>

                <p>
                  Your basic employee information.
                </p>

              </div>

            </div>

          </div>


          <div className="employee-profile-grid">

            {/* First name */}

            <ProfileField
              label="First name"
              icon={<User size={16} />}
              editing={editing}
              input={
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="First name"
                />
              }
              value={profile.firstName}
            />


            {/* Last name */}

            <ProfileField
              label="Last name"
              icon={<User size={16} />}
              editing={editing}
              input={
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="Last name"
                />
              }
              value={profile.lastName}
            />


            {/* Email */}

            <ProfileField
              label="Email"
              icon={<Mail size={16} />}
              value={profile.email}
            />


            {/* Phone */}

            <ProfileField
              label="Phone number"
              icon={<Phone size={16} />}
              editing={editing}
              input={
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="Phone number"
                />
              }
              value={profile.phone}
            />

          </div>

        </section>


        {/* =====================================
            ORGANIZATION
            ===================================== */}

        <section className="employee-profile-card">

          <div className="employee-profile-card-header">

            <div className="employee-profile-card-title">

              <div className="employee-profile-card-icon">
                <Building2 size={18} />
              </div>

              <div>

                <h2>
                  Organization
                </h2>

                <p>
                  Your department and designation.
                </p>

              </div>

            </div>

          </div>


          <div className="employee-profile-grid">

            {/* Department */}

            <div className="employee-profile-field">

              <label>
                <Building2 size={15} />
                Department
              </label>


              {editing ? (

                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={
                    handleDepartmentChange
                  }
                >

                  <option value="">
                    Select department
                  </option>


                  {departments.map(
                    (department) => {

                      const id =
                        department.id ||
                        department.departmentId;


                      const name =
                        department.name ||
                        department.departmentName;


                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                        </option>
                      );

                    }
                  )}

                </select>

              ) : (

                <div className="employee-profile-value">
                  {profile.departmentName || "—"}
                </div>

              )}

            </div>


            {/* Designation */}

            <div className="employee-profile-field">

              <label>
                <BriefcaseBusiness size={15} />
                Designation
              </label>


              {editing ? (

                <select
                  name="designationId"
                  value={form.designationId}
                  onChange={handleChange}
                  disabled={
                    !form.departmentId
                  }
                >

                  <option value="">
                    {!form.departmentId
                      ? "Select department first"
                      : "Select designation"
                    }
                  </option>


                  {designations.map(
                    (designation) => {

                      const id =
                        designation.id ||
                        designation.designationId;


                      const name =
                        designation.name ||
                        designation.designationName;


                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                        </option>
                      );

                    }
                  )}

                </select>

              ) : (

                <div className="employee-profile-value">
                  {profile.designationName || "—"}
                </div>

              )}

            </div>


            {/* Employee code */}

            <ProfileField
              label="Employee code"
              icon={<BadgeCheck size={16} />}
              value={
                profile.employeeCode || "—"
              }
            />


            {/* QR */}

            <div className="employee-profile-field">

              <label>
                <BadgeCheck size={15} />
                QR availability
              </label>

              <div className="employee-profile-value">

                {profile.qrAvailable
                  ? "Available"
                  : "Not available"
                }

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            ACCOUNT STATUS
            ===================================== */}

        <section className="employee-profile-card">

          <div className="employee-profile-card-header">

            <div className="employee-profile-card-title">

              <div className="employee-profile-card-icon">
                <BadgeCheck size={18} />
              </div>

              <div>

                <h2>
                  Account status
                </h2>

                <p>
                  Employee profile approval information.
                </p>

              </div>

            </div>

          </div>


          <div className="employee-profile-status-grid">

            <div className="employee-profile-status-item">

              <span>
                Profile status
              </span>

              <strong
                className={
                  status.className
                }
              >
                {status.label}
              </strong>

            </div>


            <div className="employee-profile-status-item">

              <span>
                Active
              </span>

              <strong>
                {profile.active
                  ? "Yes"
                  : "No"
                }
              </strong>

            </div>


            <div className="employee-profile-status-item">

              <span>
                Submitted
              </span>

              <strong>
                {formatDateTime(
                  profile.submittedAt
                )}
              </strong>

            </div>


            <div className="employee-profile-status-item">

              <span>
                Approved
              </span>

              <strong>
                {formatDateTime(
                  profile.approvedAt
                )}
              </strong>

            </div>


            {profile.rejectionReason && (

              <div className="employee-profile-rejection">

                <strong>
                  Rejection reason
                </strong>

                <p>
                  {profile.rejectionReason}
                </p>

              </div>

            )}

          </div>

        </section>


        {/* =====================================
            PROFILE DATES
            ===================================== */}

        <section className="employee-profile-card">

          <div className="employee-profile-card-header">

            <div className="employee-profile-card-title">

              <div className="employee-profile-card-icon">
                <CalendarDays size={18} />
              </div>

              <div>

                <h2>
                  Profile activity
                </h2>

                <p>
                  Profile creation and update information.
                </p>

              </div>

            </div>

          </div>


          <div className="employee-profile-date-grid">

            <div className="employee-profile-date-item">

              <CalendarDays size={17} />

              <div>

                <span>
                  Created
                </span>

                <strong>
                  {formatDate(
                    profile.createdAt
                  )}
                </strong>

              </div>

            </div>


            <div className="employee-profile-date-item">

              <Clock3 size={17} />

              <div>

                <span>
                  Last updated
                </span>

                <strong>
                  {formatDateTime(
                    profile.updatedAt
                  )}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            EDIT ACTIONS
            ===================================== */}

        {editing && (

          <div className="employee-profile-edit-actions">

            <button
              type="button"
              className="employee-profile-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >

              <X size={17} />

              Cancel

            </button>


            <button
              type="button"
              className="employee-profile-save-button"
              onClick={handleSave}
              disabled={saving}
            >

              {saving ? (
                <>
                  <RefreshCw
                    size={17}
                    className="employee-profile-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Save changes
                </>
              )}

            </button>

          </div>

        )}


        {/* =====================================
            BACK BUTTON
            ===================================== */}

        {!editing && (

          <div className="employee-profile-footer">

            <button
              type="button"
              className="employee-profile-back-button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >

              <ArrowLeft size={16} />

              Back to dashboard

            </button>

          </div>

        )}

      </div>

    </div>
  );
}


/*
 * Reusable read/edit field.
 */
function ProfileField({
  label,
  icon,
  value,
  editing = false,
  input = null,
}) {

  return (
    <div className="employee-profile-field">

      <label>
        {icon}
        {label}
      </label>


      {editing && input ? (

        input

      ) : (

        <div className="employee-profile-value">
          {value || "—"}
        </div>

      )}

    </div>
  );
}


/*
 * Backend error helper.
 */
function getErrorMessage(
  error,
  fallback
) {

  const data =
    error?.response?.data;


  if (
    typeof data === "string" &&
    data.trim()
  ) {

    return data;
  }


  if (
    data?.message
  ) {

    return data.message;
  }


  if (
    data?.error
  ) {

    return data.error;
  }


  if (
    data?.errors &&
    Array.isArray(
      data.errors
    )
  ) {

    const messages =
      data.errors
        .map(
          (item) =>
            item?.message ||
            item?.defaultMessage ||
            ""
        )
        .filter(Boolean);


    if (messages.length) {

      return messages.join(" ");
    }
  }


  return fallback;
}