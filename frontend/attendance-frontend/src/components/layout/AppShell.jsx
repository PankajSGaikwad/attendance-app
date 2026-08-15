import {
  Bell,
  LogOut,
  Menu,
  UserCircle,
} from "lucide-react";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import Sidebar from "./Sidebar";

import {
  useAuth,
} from "../../auth/AuthContext";


export default function AppShell() {

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  const {
    user,
    isManagementUser,
    logout,
  } = useAuth();


  const navigate =
    useNavigate();


  const location =
    useLocation();


  const logoutUser =
    async () => {

      await logout();

      navigate(
        "/login"
      );
    };


  const profilePath =
    isManagementUser
      ? "/admin"
      : "/profile";


  /*
   * Convert URL into a
   * readable breadcrumb.
   */

  const breadcrumb =
    location.pathname
      .replaceAll(
        "/",
        " / "
      )
      .replace(
        /^\//,
        ""
      )
      .replaceAll(
        "-",
        " "
      );


  return (

    <div className="app-shell">


      <Sidebar
        mobileOpen={
          mobileOpen
        }
        onClose={() =>
          setMobileOpen(
            false
          )
        }
        isAdmin={
          isManagementUser
        }
      />


      <main className="main-area">


        {/* TOP BAR */}

        <header className="topbar">


          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() =>
              setMobileOpen(
                true
              )
            }
            aria-label="Open menu"
          >

            <Menu size={20} />

          </button>


          <div className="topbar-heading">

            <div className="eyebrow">
              ATTENDANCE PLATFORM
            </div>


            <div className="breadcrumb">
              {breadcrumb}
            </div>

          </div>


          <div className="top-actions">


            <button
              type="button"
              className="icon-btn"
              aria-label="Notifications"
            >

              <Bell size={18} />

              <span className="notification-dot" />

            </button>


            <button
              type="button"
              className="profile-chip"
              onClick={() =>
                navigate(
                  profilePath
                )
              }
            >

              <UserCircle
                size={22}
              />


              <span>
                {
                  user?.email ||
                  "Account"
                }
              </span>

            </button>


            <button
              type="button"
              className="icon-btn danger"
              onClick={
                logoutUser
              }
              aria-label="Logout"
            >

              <LogOut size={18} />

            </button>

          </div>

        </header>


        {/* PAGE */}

        <div className="page-content">

          <Outlet />

        </div>

      </main>

    </div>
  );
}