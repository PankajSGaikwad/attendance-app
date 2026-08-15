import {
  BarChart3,
  Building2,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  Clock3,
  IdCard,
  LayoutDashboard,
  QrCode,
  Settings2,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

const employeeLinks = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/attendance",
    label: "Mark Attendance",
    icon: CalendarCheck2,
  },
  {
    path: "/attendance/history",
    label: "My Attendance",
    icon: ClipboardList,
  },
  {
    path: "/profile",
    label: "My Profile",
    icon: IdCard,
  },
  {
    path: "/my-qr",
    label: "My QR",
    icon: QrCode,
  },
];

const adminLinks = [
  {
    path: "/admin",
    label: "Admin Dashboard",
    icon: BarChart3,
  },
  {
    path: "/admin/attendance",
    label: "Attendance",
    icon: CalendarCheck2,
  },
  {
    path: "/admin/employees",
    label: "Employees",
    icon: Users,
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    path: "/admin/departments",
    label: "Departments",
    icon: Building2,
  },
  {
    path: "/admin/shifts",
    label: "Shifts",
    icon: Clock3,
  },
  {
    path: "/admin/shift-assignments",
    label: "Shift Assignments",
    icon: Settings2,
  },
];

function NavigationItem({
  item,
  onClose,
}) {

  const Icon = item.icon;

  return (

    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        `nav-item ${
          isActive
            ? "active"
            : ""
        }`
      }
    >

      <Icon size={18} />

      <span>
        {item.label}
      </span>

      <ChevronRight
        className="nav-arrow"
        size={14}
      />

    </NavLink>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
  isAdmin,
}) {

  return (
    <>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >

        <div className="brand">

          <div className="brand-mark">
            <QrCode size={21} />
          </div>

          <div>
            <strong>
              Attend<span>ance</span>
            </strong>

            <small>
              WORKFORCE HUB
            </small>
          </div>

          <button
            className="icon-btn mobile-only"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>

        <div className="nav-section">

          <div className="nav-label">
            WORKSPACE
          </div>

          {employeeLinks.map(
            (item) => (
              <NavigationItem
                key={item.path}
                item={item}
                onClose={onClose}
              />
            )
          )}

        </div>

        {isAdmin && (

          <div className="nav-section">

            <div className="nav-label">
              MANAGEMENT
            </div>

            {adminLinks.map(
              (item) => (
                <NavigationItem
                  key={item.path}
                  item={item}
                  onClose={onClose}
                />
              )
            )}

          </div>

        )}

        <div className="sidebar-footer">

          <div className="help-card">

            <div className="system-status">
              <span className="status-dot" />
              System operational
            </div>

            <div className="help-text">
              Attendance services
              are online.
            </div>

          </div>

        </div>

      </aside>
    </>
  );
}