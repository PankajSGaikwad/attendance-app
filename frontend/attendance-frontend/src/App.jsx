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


import AdminDashboard from "./pages/admin/AdminDashboard";
import Employees from "./pages/admin/Employees";
import EmployeeReview from "./pages/admin/EmployeeReview";


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