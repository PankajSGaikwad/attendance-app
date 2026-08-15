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

import { useState } from "react";

import Sidebar from "./Sidebar";
import { useAuth } from "../../auth/AuthContext";

export default function AppShell() {

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const roles =
    user?.roles || [];

  const isAdmin =
    roles.includes("ADMIN") ||
    roles.includes("SUPERVISOR");

  const logoutUser = async () => {

    await logout();

    navigate("/login");
  };

  return (

    <div className="app-shell">

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
        isAdmin={isAdmin}
      />

      <main className="main-area">

        <header className="topbar">

          <button
            className="icon-btn mobile-only"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu size={20} />
          </button>

          <div>

            <div className="eyebrow">
              ATTENDANCE PLATFORM
            </div>

            <div className="breadcrumb">
              {location.pathname
                .replaceAll("/", " / ")
                .replace(
                  /^ \/ /,
                  ""
                )}
            </div>

          </div>

          <div className="top-actions">

            <button className="icon-btn">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>

            <button
              className="profile-chip"
              onClick={() =>
                navigate("/profile")
              }
            >
              <UserCircle size={22} />

              <span>
                {user?.email ||
                  "Account"}
              </span>
            </button>

            <button
              className="icon-btn danger"
              onClick={logoutUser}
            >
              <LogOut size={18} />
            </button>

          </div>

        </header>

        <div className="page-content">
          <Outlet />
        </div>

      </main>

    </div>
  );
}