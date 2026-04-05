import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/admin_ui/ProtectdRoute";
import LoadingFallback from "../components/ui/LoadingFallback";

// Helper function to wrap lazy components in Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

// Public Pages (Lazy Loaded)
const Home = React.lazy(() => import("../pages/public/Home"));
const About = React.lazy(() => import("../pages/public/About"));
const Contact = React.lazy(() => import("../pages/public/Contact"));
const ProjectDetail = React.lazy(() => import("../pages/public/ProjectDetail"));
const Projects = React.lazy(() => import("../pages/public/Projects"));
const Program = React.lazy(() => import("../pages/public/Program"));
const ProgramDetail = React.lazy(() => import("../pages/public/ProgramDetail"));
const Instructor = React.lazy(() => import("../pages/public/Instructor"));
const InstructorDetail = React.lazy(() => import("../pages/public/InstructorDetail"));

// Admin Pages (Lazy Loaded)
const Dashboard = React.lazy(() => import("../pages/admin/Dashboard"));
const AdminHome = React.lazy(() => import("../pages/admin/AdminHome"));
const AdminAbout = React.lazy(() => import("../pages/admin/AdminAbout"));
const Login = React.lazy(() => import("../pages/admin/Login"));
const AdminContact = React.lazy(() => import("../pages/admin/AdminContact"));
const AdminPrograms = React.lazy(() => import("../pages/admin/AdminPrograms"));
const AdminProjects = React.lazy(() => import("../pages/admin/AdminProjects"));
const AdminMembers = React.lazy(() => import("../pages/admin/AdminMembers"));
const AdminStudents = React.lazy(() => import("../pages/admin/AdminStudents"));
const AcceptInvite = React.lazy(() => import("../pages/admin/AcceptInvite"));
const ResetPassword = React.lazy(() => import("../pages/admin/ResetPassword"));
const AdminManagement = React.lazy(() => import("../pages/admin/AdminManagement"));

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: withSuspense(Home) },
      { path: "/about", element: withSuspense(About) },
      { path: "/contact", element: withSuspense(Contact) },

      { path: "/projects", element: withSuspense(Projects) },
      { path: "/projects/:id", element: withSuspense(ProjectDetail) },

      { path: "/programs", element: withSuspense(Program) },
      { path: "/programs/:id", element: withSuspense(ProgramDetail) },
      { path: "/program", element: <Navigate to="/programs" replace /> },
      
      { path: "/instructors", element: withSuspense(Instructor) },
      { path: "/instructors/:id", element: withSuspense(InstructorDetail) },
      { path: "/instructor", element: <Navigate to="/instructors" replace /> },
      { path: "/instructor/:id", element: withSuspense(InstructorDetail) },
    ],
  },

  {
    path: "/admin/login",
    element: withSuspense(Login),
  },

  {
    path: "/admin/accept-invite",
    element: withSuspense(AcceptInvite),
  },

  {
    path: "/admin/reset-password",
    element: withSuspense(ResetPassword),
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
      { path: "dashboard", element: withSuspense(Dashboard) },
      {
        path: "content",
        element: <Navigate to="/admin/content/home" replace />,
      },
      { path: "content/home", element: withSuspense(AdminHome) },
      { path: "content/about", element: withSuspense(AdminAbout) },
      {
        path: "academics",
        element: <Navigate to="/admin/academics/programs" replace />,
      },
      { path: "academics/programs", element: withSuspense(AdminPrograms) },
      { path: "academics/projects", element: withSuspense(AdminProjects) },
      {
        path: "team",
        element: <Navigate to="/admin/team/members" replace />,
      },
      { path: "team/members", element: withSuspense(AdminMembers) },
      { path: "team/students", element: withSuspense(AdminStudents) },
      { path: "contact", element: withSuspense(AdminContact) },
      { path: "management", element: withSuspense(AdminManagement) },
    ],
  },
]);

export default router;
