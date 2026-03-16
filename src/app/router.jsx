import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

import ProjectDetail from "../pages/public/ProjectDetail";
import Projects from "../pages/public/Projects";

import Program from "../pages/public/Program";
import ProgramDetail from "../pages/public/ProgramDetail";
import Instructor from "../pages/public/Instructor";
import InstructorDetail from "../pages/public/InstructorDetail";




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
import AdminStudents from "../pages/admin/AdminStudents";
import AcceptInvite from "../pages/admin/AcceptInvite";
import ResetPassword from "../pages/admin/ResetPassword";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },

      { path: "/projects", element: <Projects /> },
      { path: "/projects/:id", element: <ProjectDetail /> },

      { path: "/programs", element: <Program /> },
      { path: "/programs/:id", element: <ProgramDetail /> },
      { path: "/program", element: <Navigate to="/programs" replace /> },
      
      { path: "/instructors", element: <Instructor /> },
      { path: "/instructors/:id", element: <InstructorDetail /> },
      { path: "/instructor", element: <Navigate to="/instructors" replace /> },
      { path: "/instructor/:id", element: <InstructorDetail /> },

    ],
  },

  {
    path: "/admin/login",
    element: <Login />,
  },

  {
    path: "/admin/accept-invite",
    element: <AcceptInvite />,
  },

  {
    path: "/admin/reset-password",
    element: <ResetPassword />,
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
      { path: "team/students", element: <AdminStudents /> },
      { path: "contact", element: <AdminContact /> },
    ],
  },
]);

export default router;
