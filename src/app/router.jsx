import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Public Pages
import Home from "../pages/public/Home";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: "/", element: <Home /> }],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ path: "dashboard", element: <Dashboard /> }],
  },
]);

export default router;
