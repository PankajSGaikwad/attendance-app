import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  getMyProfile,
  updateMyProfile,
  submitMyProfile,
} from "../../api/employeeApi";

import api from "../../api/client";


export default function CompleteProfile() {

  const navigate =
    useNavigate();

  const {
    user,
    employee,
    refreshEmployeeProfile,
  } = useAuth();


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

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /*
   * Load employee profile and
   * department options.
   */

  useEffect(() => {

    const loadPage =
      async () => {

        setLoading(true);

        setError("");

        try {

          /*
           * Load departments.
           */

          const departmentResponse =
            await api.get(
              "/api/departments/options"
            );

          setDepartments(
            departmentResponse.data || []
          );


          /*
           * Try to load existing
           * employee profile.
           */

          try {

            const profileResponse =
              await getMyProfile();

            const profile =
              profileResponse.data;

            setForm({
              firstName:
                profile?.firstName || "",

              lastName:
                profile?.lastName || "",

              phone:
                profile?.phone || "",

              departmentId:
                profile?.departmentId || "",

              designationId:
                profile?.designationId || "",
            });


            /*
             * If a department already
             * exists, load its
             * designations.
             */

            if (
              profile?.departmentId
            ) {

              await loadDesignations(
                profile.departmentId
              );
            }

          } catch (profileError) {

            /*
             * 404 simply means the
             * employee profile hasn't
             * been created yet.
             */

            if (
              profileError.response
                ?.status !== 404
            ) {

              console.error(
                "Unable to load profile:",
                profileError
              );
            }
          }

        } catch (pageError) {

          console.error(
            "Unable to load profile page:",
            pageError
          );

          setError(
            "Unable to load profile information. Please try again."
          );

        } finally {

          setLoading(false);
        }
      };


    loadPage();

  }, []);


  /*
   * Load designations for
   * selected department.
   */

  const loadDesignations =
    async (
      departmentId
    ) => {

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

      } catch (error) {

        console.error(
          "Unable to load designations:",
          error
        );

        setDesignations([]);

        setError(
          "Unable to load designations for this department."
        );
      }
    };


  /*
   * Handle normal inputs.
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


      if (departmentId) {

        await loadDesignations(
          departmentId
        );
      }
    };


  /*
   * Basic frontend validation.
   */

  const validateForm =
    () => {

      if (
        !form.firstName.trim()
      ) {

        setError(
          "Please enter your first name."
        );

        return false;
      }


      if (
        !form.lastName.trim()
      ) {

        setError(
          "Please enter your last name."
        );

        return false;
      }


      if (
        !form.phone.trim()
      ) {

        setError(
          "Please enter your phone number."
        );

        return false;
      }


      if (
        !form.departmentId
      ) {

        setError(
          "Please select your department."
        );

        return false;
      }


      if (
        !form.designationId
      ) {

        setError(
          "Please select your designation."
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

        /*
         * If employee already exists,
         * update it.
         *
         * Otherwise create it.
         */

        if (employee) {

          await updateMyProfile(
            form
          );

        } else {

          await api.post(
            "/api/employees/profile",
            form
          );
        }


        await refreshEmployeeProfile();


        setSuccess(
          "Your profile has been saved successfully."
        );

      } catch (saveError) {

        console.error(
          "Unable to save profile:",
          saveError
        );

        setError(
          getErrorMessage(
            saveError,
            "Unable to save your profile."
          )
        );

      } finally {

        setSaving(false);
      }
    };


  /*
   * Submit profile for admin
   * approval.
   */

  const handleSubmit =
    async () => {

      if (!validateForm()) {
        return;
      }


      setSubmitting(true);

      setError("");

      setSuccess("");


      try {

        /*
         * Save the latest profile
         * information first.
         */

        if (employee) {

          await updateMyProfile(
            form
          );

        } else {

          await api.post(
            "/api/employees/profile",
            form
          );
        }


        /*
         * Submit for approval.
         */

        await submitMyProfile();


        /*
         * Refresh authentication
         * context so employee status
         * becomes PENDING.
         */

        await refreshEmployeeProfile();


        /*
         * Go to pending page.
         */

        navigate(
          "/profile-pending",
          {
            replace: true,
          }
        );

      } catch (submitError) {

        console.error(
          "Unable to submit profile:",
          submitError
        );

        setError(
          getErrorMessage(
            submitError,
            "Unable to submit your profile for approval."
          )
        );

      } finally {

        setSubmitting(false);
      }
    };


  /*
   * Loading state.
   */

  if (loading) {

    return (
      <div className="profile-page">

        <div className="profile-loading">

          <div className="profile-spinner" />

          <p>
            Loading your profile...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* Header */}

        <div className="profile-page-header">

          <div>

            <div className="profile-eyebrow">
              EMPLOYEE ONBOARDING
            </div>

            <h1>
              Complete your profile
            </h1>

            <p>
              Add your employee information
              before submitting your profile
              for approval.
            </p>

          </div>


          <div className="profile-step">

            <span>
              STEP
            </span>

            <strong>
              01
            </strong>

            <span>
              / 01
            </span>

          </div>

        </div>


        {/* Error */}

        {error && (

          <div className="profile-alert profile-alert-error">

            <div className="profile-alert-icon">
              !
            </div>

            <div>
              {error}
            </div>

          </div>

        )}


        {/* Success */}

        {success && (

          <div className="profile-alert profile-alert-success">

            <div className="profile-alert-icon">
              ✓
            </div>

            <div>
              {success}
            </div>

          </div>

        )}


        {/* Personal Information */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              👤
            </div>

            <div>

              <h2>
                Personal information
              </h2>

              <p>
                Tell us a little about yourself.
              </p>

            </div>

          </div>


          <div className="profile-form-grid">

            {/* First name */}

            <div className="profile-field">

              <label htmlFor="firstName">
                First name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                maxLength={50}
              />

            </div>


            {/* Last name */}

            <div className="profile-field">

              <label htmlFor="lastName">
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                maxLength={50}
              />

            </div>


            {/* Phone */}

            <div className="profile-field">

              <label htmlFor="phone">
                Phone number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                maxLength={20}
              />

              <span className="profile-field-hint">
                Use a valid contact number.
              </span>

            </div>


            {/* Email */}

            <div className="profile-field">

              <label htmlFor="email">
                Work email
              </label>

              <input
                id="email"
                type="email"
                value={
                  user?.email ||
                  user?.username ||
                  ""
                }
                disabled
              />

              <span className="profile-field-hint">
                Email is linked to your account.
              </span>

            </div>

          </div>

        </section>


        {/* Organization */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              🏢
            </div>

            <div>

              <h2>
                Organization
              </h2>

              <p>
                Select your department and
                designation.
              </p>

            </div>

          </div>


          <div className="profile-form-grid">

            {/* Department */}

            <div className="profile-field">

              <label htmlFor="departmentId">
                Department
              </label>

              <select
                id="departmentId"
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
                  (department) => (

                    <option
                      key={
                        department.id ||
                        department.departmentId
                      }
                      value={
                        department.id ||
                        department.departmentId
                      }
                    >
                      {
                        department.name ||
                        department.departmentName
                      }
                    </option>

                  )
                )}

              </select>

              <span className="profile-field-hint">
                Choose your primary department.
              </span>

            </div>


            {/* Designation */}

            <div className="profile-field">

              <label htmlFor="designationId">
                Designation
              </label>

              <select
                id="designationId"
                name="designationId"
                value={form.designationId}
                onChange={handleChange}
                disabled={
                  !form.departmentId ||
                  designations.length === 0
                }
              >

                <option value="">
                  {
                    !form.departmentId
                      ? "Select department first"
                      : designations.length === 0
                        ? "No designations available"
                        : "Select designation"
                  }
                </option>

                {designations.map(
                  (designation) => (

                    <option
                      key={
                        designation.id ||
                        designation.designationId
                      }
                      value={
                        designation.id ||
                        designation.designationId
                      }
                    >
                      {
                        designation.name ||
                        designation.designationName
                      }
                    </option>

                  )
                )}

              </select>

              <span className="profile-field-hint">
                Your role within the department.
              </span>

            </div>

          </div>

        </section>


        {/* Actions */}

        <div className="profile-actions">

          <div className="profile-action-note">

            <span className="profile-action-dot" />

            Your profile will be reviewed by an
            administrator before attendance
            features are enabled.

          </div>


          <div className="profile-buttons">

            <button
              type="button"
              className="profile-btn profile-btn-secondary"
              onClick={handleSave}
              disabled={
                saving ||
                submitting
              }
            >

              {saving
                ? "Saving..."
                : "Save profile"
              }

            </button>


            <button
              type="button"
              className="profile-btn profile-btn-primary"
              onClick={handleSubmit}
              disabled={
                saving ||
                submitting
              }
            >

              {submitting
                ? "Submitting..."
                : "Submit for approval"
              }

              {!submitting && (
                <span className="profile-btn-arrow">
                  →
                </span>
              )}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/*
 * Convert backend errors into
 * readable messages.
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
    Array.isArray(data.errors)
  ) {

    return data.errors
      .map(
        (item) =>
          item.message ||
          item.defaultMessage ||
          ""
      )
      .filter(Boolean)
      .join(" ");
  }


  return fallback;
}