import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";


// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import AdminHome from "../pages/admin/AdminHome";
import AdminAbout from "../pages/admin/AdminAbout";
import ProtectedRoute from "../components/admin_ui/ProtectdRoute";
import Login from "../pages/admin/Login";
import AdminContact from "../pages/admin/AdminContact";
import AdminPrograms from "../pages/admin/AdminPrograms";
import AdminProjects from "../pages/admin/AdminProjects";
import AdminMembers from "../pages/admin/AdminMembers";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
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
      { path: "academics/programs", element: <AdminPrograms /> },
      { path: "academics/projects", element: <AdminProjects /> },
      {
        path: "team",
        element: <Navigate to="/admin/team/members" replace />,
      },
      { path: "team/members", element: <AdminMembers /> },
      { path: "contact", element: <AdminContact /> },
    ],
  },
]);

export default router;
