import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
} from "./auth/AuthContext";

import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AppShell from "./components/layout/AppShell";

import Dashboard from "./pages/employee/Dashboard";
import Attendance from "./pages/employee/Attendance";
import CompleteProfile from "./pages/employee/CompleteProfile";
import ProfilePending from "./pages/employee/ProfilePending";
import Profile from "./pages/employee/Profile";
import MyQr from "./pages/employee/MyQr";
import MarkAttendance from "./pages/employee/MarkAttendance";
import MyAttendance from "./pages/employee/MyAttendance";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Employees from "./pages/admin/Employees";
import EmployeeReview from "./pages/admin/EmployeeReview";
import AdminAttendance from "./pages/admin/Attendance";
import Users from "./pages/admin/Users";
import Departments from "./pages/admin/Departments";
import Designations from "./pages/admin/Designations";
import Shifts from "./pages/admin/Shifts";
import ShiftAssignments from "./pages/admin/ShiftAssignments";


function App() {

  return (

    <AuthProvider>

      <Routes>

        {/* =========================================
            PUBLIC
            ========================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =========================================
            PROTECTED
            ========================================= */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

          <Route
            element={
              <AppShell />
            }
          >

            {/* =====================================
                EMPLOYEE
                ===================================== */}

            <Route
              path="/dashboard"
              element={
                <Dashboard />
              }
            />


            <Route
              path="/attendance"
              element={
                <Attendance />
              }
            />

            <Route
              path="/attendance/history"
              element={
                <MyAttendance />
              }
            />

            <Route
              path="/profile"
              element={
                <Profile />
              }
            />

            <Route
              path="/complete-profile"
              element={
                <CompleteProfile />
              }
            />


            <Route
              path="/profile-pending"
              element={
                <ProfilePending />
              }
            />

            <Route
              path="/my-qr"
              element={
                <MyQr />
              }
            />

            <Route
              path="/mark-attendance"
              element={
                <MarkAttendance />
              }
            />

            {/* =====================================
                ADMIN
                ===================================== */}

            <Route
              path="/admin"
              element={
                <AdminDashboard />
              }
            />


            <Route
              path="/admin/employees"
              element={
                <Employees />
              }
            />


            <Route
              path="/admin/employees/:id"
              element={
                <EmployeeReview />
              }
            />


            <Route
              path="/admin/attendance"
              element={
                <AdminAttendance />
              }
            />


            <Route
              path="/admin/users"
              element={
                <Users />
              }
            />

            <Route
              path="/admin/departments"
              element={
                <Departments />
              }
            />

            <Route
              path="/admin/designations"
              element={
                <Designations />
              }
            />

            <Route
              path="/admin/shifts"
              element={
                <Shifts />
              }
            />

            <Route
              path="/admin/shift-assignments"
              element={
                <ShiftAssignments />
              }
            />

          </Route>

        </Route>


        {/* =========================================
            DEFAULT
            ========================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </AuthProvider>
  );
}


export default App;