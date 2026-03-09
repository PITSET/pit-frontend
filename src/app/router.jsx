import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import AdminHome from "../pages/admin/AdminHome";
import AdminAbout from "../pages/admin/AdminAbout";
import ProtectedRoute from "../components/admin_ui/ProtectdRoute";
import Login from "../pages/admin/Login";
import AdminContact from "../pages/admin/AdminContact";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <About /> },
    ],
  },

  {
    path: "/admin/login",
    element: <Login />,
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      {
        path: "content",
        element: <Navigate to="/admin/content/home" replace />,
      },
      { path: "content/home", element: <AdminHome /> },
      { path: "content/about", element: <AdminAbout /> },
      {
        path: "academics",
        element: <Navigate to="/admin/academics/programs" replace />,
      },
      { path: "academics/programs", element: <Dashboard /> },
      { path: "academics/projects", element: <Dashboard /> },
      {
        path: "team",
        element: <Navigate to="/admin/team/instructors" replace />,
      },
      { path: "team/instructors", element: <Dashboard /> },
      { path: "contact", element: <AdminContact /> },
    ],
  },
]);

export default router;
