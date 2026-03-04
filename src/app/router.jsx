import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Public Pages
import Home from "../pages/public/Home";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import AdminHome from "../pages/admin/adminHome";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: "/", element: <Home /> }],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      {
        path: "content",
        element: <Navigate to="/admin/content/home" replace />,
      },
      { path: "content/home", element: <AdminHome /> },
      { path: "content/about", element: <Dashboard /> },
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
      { path: "team/founder", element: <Dashboard /> },
      { path: "contact", element: <Dashboard /> },
    ],
  },
]);

export default router;
