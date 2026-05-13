import AdminLayout from "../layouts/AdminLayout";

import AdminDashboardPage from "../pages/AdminDashboardPage";

import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";

import AdminGuard from "../../guards/AdminGuard";

/**
 * ============================================
 * ADMIN ROUTES
 * ============================================
 */

const adminRoutes = {
  path: "/admin",

  element: (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  ),

  children: [
    {
      index: true,

      element:
        <AdminDashboardPage />,
    },

    {
      path:
        "analytics",

      element:
        <AdminAnalyticsPage />,
    },
  ],
};

export default adminRoutes;