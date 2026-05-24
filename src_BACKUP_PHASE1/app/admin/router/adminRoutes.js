import DashboardPage from "../pages/DashboardPage";

import CampaignPage from "../pages/CampaignPage";

import LoyaltyPage from "../pages/LoyaltyPage";

import AnalyticsPage from "../pages/AnalyticsPage";

import CmsPage from "../pages/CmsPage";

const adminRoutes = [

  {
    id: "dashboard",

    path: "/admin",

    component:
      DashboardPage,
  },

  {
    id: "campaign",

    path: "/admin/campaigns",

    component:
      CampaignPage,
  },

  {
    id: "loyalty",

    path: "/admin/loyalty",

    component:
      LoyaltyPage,
  },

  {
    id: "analytics",

    path: "/admin/analytics",

    component:
      AnalyticsPage,
  },

  {
    id: "cms",

    path: "/admin/cms",

    component:
      CmsPage,
  },

];

export default
  adminRoutes;