import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  ShieldCheck,
  UserCheck,
  UserX,
  LockKeyhole,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

import {
  createUser,
  getUserById,
  getUsers,
  updateUserRoles,
  updateUserStatus,
} from "../../api/usersApi";

import "./users.css";


const ROLES = [
  "ADMIN",
  "SUPERVISOR",
  "EMPLOYEE",
  "KIOSK",
];


const STATUSES = [
  "ACTIVE",
  "DISABLED",
  "LOCKED",
];


function formatDate(value) {
  if (!value) {
    return "Never";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(value));
  } catch {
    return "—";
  }
}


function getInitials(email = "") {
  return email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();
}


function getRoleLabel(role) {
  return String(role)
    .replaceAll("_", " ");
}


function Users() {

  const [
    users,
    setUsers,
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
    roleFilter,
    setRoleFilter,
  ] = useState("ALL");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");


  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);


  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);


  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);


  const [
    actionLoading,
    setActionLoading,
  ] = useState("");


  const [
    formError,
    setFormError,
  ] = useState("");


  const [
    form,
    setForm,
  ] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    roles: ["EMPLOYEE"],
  });


  const loadUsers = async (
    showRefresh = false
  ) => {

    try {

      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await getUsers();

      setUsers(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Unable to load users:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load users. Please try again."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, []);


  const stats = useMemo(() => {

    return {
      total: users.length,

      active: users.filter(
        (user) =>
          user.status === "ACTIVE"
      ).length,

      disabled: users.filter(
        (user) =>
          user.status === "DISABLED"
      ).length,

      locked: users.filter(
        (user) =>
          user.status === "LOCKED"
      ).length,
    };

  }, [users]);


  const filteredUsers = useMemo(() => {

    const query =
      search
        .trim()
        .toLowerCase();


    return users.filter(
      (user) => {

        const matchesSearch =
          !query ||
          user.email
            ?.toLowerCase()
            .includes(query) ||
          user.id
            ?.toLowerCase()
            .includes(query) ||
          Array.from(
            user.roles || []
          ).some(
            (role) =>
              role
                .toLowerCase()
                .includes(query)
          );


        const matchesRole =
          roleFilter === "ALL" ||
          (user.roles || []).includes(
            roleFilter
          );


        const matchesStatus =
          statusFilter === "ALL" ||
          user.status ===
            statusFilter;


        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus
        );
      }
    );

  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);


  const handleFormChange = (
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


  const toggleCreateRole = (
    role
  ) => {

    setForm(
      (current) => {

        const exists =
          current.roles.includes(
            role
          );


        if (exists) {

          if (
            current.roles.length ===
            1
          ) {
            return current;
          }

          return {
            ...current,
            roles:
              current.roles.filter(
                (item) =>
                  item !== role
              ),
          };
        }


        return {
          ...current,
          roles: [
            ...current.roles,
            role,
          ],
        };
      }
    );
  };


  const resetCreateForm = () => {

    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      roles: ["EMPLOYEE"],
    });

    setFormError("");
  };


  const closeCreateModal = () => {

    setShowCreateModal(false);
    resetCreateForm();
  };


  const handleCreateUser = async (
    event
  ) => {

    event.preventDefault();

    setFormError("");


    if (
      !form.email.trim()
    ) {
      setFormError(
        "Email address is required."
      );
      return;
    }


    if (
      form.password.length < 8
    ) {
      setFormError(
        "Password must contain at least 8 characters."
      );
      return;
    }


    if (
      form.password !==
      form.confirmPassword
    ) {
      setFormError(
        "Passwords do not match."
      );
      return;
    }


    if (
      form.roles.length === 0
    ) {
      setFormError(
        "Select at least one role."
      );
      return;
    }


    try {

      setActionLoading(
        "create"
      );


      await createUser({
        email:
          form.email.trim(),

        password:
          form.password,

        confirmPassword:
          form.confirmPassword,

        roles:
          form.roles,
      });


      closeCreateModal();

      await loadUsers(true);

    } catch (err) {

      console.error(
        "Unable to create user:",
        err
      );

      setFormError(
        err.response?.data?.message ||
        "Unable to create user. Please check the information and try again."
      );

    } finally {

      setActionLoading("");
    }
  };


  const openUserDetails = async (
    user
  ) => {

    setSelectedUser(
      user
    );

    setDetailsLoading(true);


    try {

      const response =
        await getUserById(
          user.id
        );

      setSelectedUser(
        response.data
      );

    } catch (err) {

      console.error(
        "Unable to load user details:",
        err
      );

    } finally {

      setDetailsLoading(false);
    }
  };


  const handleStatusChange = async (
    user,
    status
  ) => {

    if (
      !status ||
      status === user.status
    ) {
      return;
    }


    try {

      setActionLoading(
        `status-${user.id}`
      );


      const response =
        await updateUserStatus(
          user.id,
          status
        );


      setUsers(
        (current) =>
          current.map(
            (item) =>
              item.id === user.id
                ? response.data
                : item
          )
      );


      if (
        selectedUser?.id ===
        user.id
      ) {
        setSelectedUser(
          response.data
        );
      }

    } catch (err) {

      console.error(
        "Unable to update user status:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update user status."
      );

    } finally {

      setActionLoading("");
    }
  };


  const handleRoleToggle = async (
    user,
    role
  ) => {

    const currentRoles =
      Array.from(
        user.roles || []
      );


    const exists =
      currentRoles.includes(
        role
      );


    if (
      exists &&
      currentRoles.length === 1
    ) {
      return;
    }


    const nextRoles =
      exists
        ? currentRoles.filter(
            (item) =>
              item !== role
          )
        : [
            ...currentRoles,
            role,
          ];


    try {

      setActionLoading(
        `roles-${user.id}`
      );


      const response =
        await updateUserRoles(
          user.id,
          nextRoles
        );


      setUsers(
        (current) =>
          current.map(
            (item) =>
              item.id === user.id
                ? response.data
                : item
          )
      );


      if (
        selectedUser?.id ===
        user.id
      ) {
        setSelectedUser(
          response.data
        );
      }

    } catch (err) {

      console.error(
        "Unable to update user roles:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update user roles."
      );

    } finally {

      setActionLoading("");
    }
  };


  return (

    <div className="users-page">

      {/* HEADER */}

      <section className="users-page-header">

        <div>

          <div className="users-eyebrow">
            USER MANAGEMENT
          </div>

          <h1>
            Users
          </h1>

          <p>
            Manage system accounts,
            roles and access status.
          </p>

        </div>


        <div className="users-header-actions">

          <button
            type="button"
            className="users-refresh-button"
            onClick={() =>
              loadUsers(true)
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
                  ? "users-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            type="button"
            className="users-create-button"
            onClick={() =>
              setShowCreateModal(true)
            }
          >

            <Plus size={17} />

            Create user

          </button>

        </div>

      </section>


      {/* ERROR */}

      {error && (

        <div className="users-error">

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


      {/* STATS */}

      <section className="users-stat-grid">

        <div className="users-stat-card">

          <div className="users-stat-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>Total users</span>
            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="users-stat-card users-stat-active">

          <div className="users-stat-icon">
            <UserCheck size={18} />
          </div>

          <div>
            <span>Active</span>
            <strong>
              {stats.active}
            </strong>
          </div>

        </div>


        <div className="users-stat-card users-stat-disabled">

          <div className="users-stat-icon">
            <UserX size={18} />
          </div>

          <div>
            <span>Disabled</span>
            <strong>
              {stats.disabled}
            </strong>
          </div>

        </div>


        <div className="users-stat-card users-stat-locked">

          <div className="users-stat-icon">
            <LockKeyhole size={18} />
          </div>

          <div>
            <span>Locked</span>
            <strong>
              {stats.locked}
            </strong>
          </div>

        </div>

      </section>


      {/* USERS CARD */}

      <section className="users-card">

        <div className="users-card-header">

          <div>

            <div className="users-card-eyebrow">
              SYSTEM ACCOUNTS
            </div>

            <h2>
              All users
            </h2>

            <p>
              {filteredUsers.length}
              {" "}
              {filteredUsers.length === 1
                ? "user"
                : "users"}
              {" "}
              shown
            </p>

          </div>

        </div>


        {/* FILTERS */}

        <div className="users-filters">

          <div className="users-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search email, ID or role..."
            />

          </div>


          <div className="users-select-wrap">

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All roles
              </option>

              {ROLES.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {getRoleLabel(
                      role
                    )}
                  </option>
                )
              )}

            </select>

            <ChevronDown
              size={15}
            />

          </div>


          <div className="users-select-wrap">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All statuses
              </option>

              {STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

            <ChevronDown
              size={15}
            />

          </div>

        </div>


        {/* TABLE */}

        {loading ? (

          <div className="users-loading">

            <div className="users-spinner" />

            <p>
              Loading users...
            </p>

          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="users-empty">

            <div className="users-empty-icon">
              <UsersIcon />
            </div>

            <h3>
              No users found
            </h3>

            <p>
              Try changing your
              search or filters.
            </p>

          </div>

        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>

                <tr>

                  <th>
                    USER
                  </th>

                  <th>
                    ROLES
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    LAST LOGIN
                  </th>

                  <th>
                    CREATED
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredUsers.map(
                  (user) => (

                    <tr
                      key={user.id}
                    >

                      <td>

                        <div className="users-user-cell">

                          <div className="users-avatar">
                            {getInitials(
                              user.email
                            )}
                          </div>

                          <div className="users-user-info">

                            <strong>
                              {user.email}
                            </strong>

                            <span>
                              ID: {user.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <div className="users-role-list">

                          {(user.roles || []).map(
                            (role) => (

                              <span
                                key={role}
                                className={`users-role-badge users-role-${role.toLowerCase()}`}
                              >
                                {role}
                              </span>

                            )
                          )}

                        </div>

                      </td>


                      <td>

                        <div className="users-status-control">

                          <select
                            value={
                              user.status
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                user,
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={
                              actionLoading ===
                              `status-${user.id}`
                            }
                            className={`users-status-select users-status-${String(
                              user.status
                            ).toLowerCase()}`}
                          >

                            {STATUSES.map(
                              (status) => (

                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {status}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                      </td>


                      <td>

                        <span className="users-date">
                          {formatDate(
                            user.lastLoginAt
                          )}
                        </span>

                      </td>


                      <td>

                        <span className="users-date">
                          {formatDate(
                            user.createdAt
                          )}
                        </span>

                      </td>


                      <td>

                        <button
                          type="button"
                          className="users-view-button"
                          onClick={() =>
                            openUserDetails(
                              user
                            )
                          }
                        >

                          <Eye size={15} />

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

      </section>


      {/* CREATE MODAL */}

      {showCreateModal && (

        <div
          className="users-modal-backdrop"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }

          }}
        >

          <div className="users-modal">

            <div className="users-modal-header">

              <div>

                <div className="users-modal-eyebrow">
                  NEW ACCOUNT
                </div>

                <h2>
                  Create user
                </h2>

                <p>
                  Create a new system
                  account and assign
                  access roles.
                </p>

              </div>


              <button
                type="button"
                className="users-modal-close"
                onClick={
                  closeCreateModal
                }
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={
                handleCreateUser
              }
            >

              <div className="users-form-grid">

                <label className="users-form-field users-form-full">

                  <span>
                    Email address
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="user@company.com"
                    autoComplete="off"
                  />

                </label>


                <label className="users-form-field">

                  <span>
                    Password
                  </span>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />

                </label>


                <label className="users-form-field">

                  <span>
                    Confirm password
                  </span>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      form.confirmPassword
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />

                </label>

              </div>


              <div className="users-role-section">

                <div className="users-form-label">
                  Roles
                </div>

                <div className="users-role-options">

                  {ROLES.map(
                    (role) => {

                      const checked =
                        form.roles.includes(
                          role
                        );


                      return (

                        <button
                          type="button"
                          key={role}
                          className={`users-role-option ${
                            checked
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            toggleCreateRole(
                              role
                            )
                          }
                        >

                          <span className="users-role-check">

                            {checked && (
                              <Check
                                size={13}
                              />
                            )}

                          </span>

                          {role}

                        </button>

                      );
                    }
                  )}

                </div>

              </div>


              {formError && (

                <div className="users-form-error">
                  {formError}
                </div>

              )}


              <div className="users-modal-footer">

                <button
                  type="button"
                  className="users-cancel-button"
                  onClick={
                    closeCreateModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="users-submit-button"
                  disabled={
                    actionLoading ===
                    "create"
                  }
                >

                  {actionLoading ===
                  "create" ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="users-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create user
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* DETAILS MODAL */}

      {selectedUser && (

        <div
          className="users-modal-backdrop"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedUser(
                null
              );
            }

          }}
        >

          <div className="users-modal users-details-modal">

            <div className="users-modal-header">

              <div>

                <div className="users-modal-eyebrow">
                  USER DETAILS
                </div>

                <h2>
                  Account information
                </h2>

              </div>


              <button
                type="button"
                className="users-modal-close"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                <X size={18} />
              </button>

            </div>


            {detailsLoading ? (

              <div className="users-details-loading">

                <div className="users-spinner" />

                <p>
                  Loading user details...
                </p>

              </div>

            ) : (

              <>

                <div className="users-detail-profile">

                  <div className="users-detail-avatar">
                    {getInitials(
                      selectedUser.email
                    )}
                  </div>

                  <div>

                    <h3>
                      {selectedUser.email}
                    </h3>

                    <p>
                      {selectedUser.id}
                    </p>

                  </div>

                </div>


                <div className="users-detail-grid">

                  <div className="users-detail-item">

                    <span>
                      STATUS
                    </span>

                    <strong>
                      {selectedUser.status}
                    </strong>

                  </div>


                  <div className="users-detail-item">

                    <span>
                      LAST LOGIN
                    </span>

                    <strong>
                      {formatDate(
                        selectedUser.lastLoginAt
                      )}
                    </strong>

                  </div>


                  <div className="users-detail-item">

                    <span>
                      CREATED
                    </span>

                    <strong>
                      {formatDate(
                        selectedUser.createdAt
                      )}
                    </strong>

                  </div>


                  <div className="users-detail-item">

                    <span>
                      UPDATED
                    </span>

                    <strong>
                      {formatDate(
                        selectedUser.updatedAt
                      )}
                    </strong>

                  </div>

                </div>


                <div className="users-detail-roles">

                  <div className="users-form-label">
                    Assigned roles
                  </div>

                  <div className="users-role-options">

                    {ROLES.map(
                      (role) => {

                        const checked =
                          (
                            selectedUser
                              .roles ||
                            []
                          ).includes(
                            role
                          );


                        return (

                          <button
                            type="button"
                            key={role}
                            className={`users-role-option ${
                              checked
                                ? "selected"
                                : ""
                            }`}
                            disabled={
                              actionLoading ===
                              `roles-${selectedUser.id}`
                            }
                            onClick={() =>
                              handleRoleToggle(
                                selectedUser,
                                role
                              )
                            }
                          >

                            <span className="users-role-check">

                              {checked && (
                                <Check
                                  size={13}
                                />
                              )}

                            </span>

                            {role}

                          </button>

                        );
                      }
                    )}

                  </div>

                </div>


                <div className="users-detail-status">

                  <div className="users-form-label">
                    Account status
                  </div>

                  <div className="users-status-actions">

                    {STATUSES.map(
                      (status) => (

                        <button
                          type="button"
                          key={status}
                          className={`users-status-action ${
                            selectedUser.status ===
                            status
                              ? "selected"
                              : ""
                          }`}
                          disabled={
                            actionLoading ===
                            `status-${selectedUser.id}`
                          }
                          onClick={() =>
                            handleStatusChange(
                              selectedUser,
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

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


function UsersIcon() {

  return (

    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
      />

      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
      />

    </svg>
  );
}


export default Users;