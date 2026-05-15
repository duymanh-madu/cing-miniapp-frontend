import {
  lazy,
} from "react";

/**
 * =========================================================
 * CORE PAGES
 * =========================================================
 */

const AdminDashboardPage =
  lazy(() =>
    import(
      "@/admin/dashboard/pages/AdminDashboardPage"
    )
  );

const AnalyticsPage =
  lazy(() =>
    import(
      "@/admin/analytics/pages/AnalyticsPage"
    )
  );

const RealtimeMonitoringPage =
  lazy(() =>
    import(
      "@/admin/monitoring/pages/RealtimeMonitoringPage"
    )
  );

const SettingsPage =
  lazy(() =>
    import(
      "@/admin/settings/pages/SettingsPage"
    )
  );

/**
 * =========================================================
 * CAMPAIGN OPERATING SYSTEM
 * =========================================================
 */

const CampaignsPage =
  lazy(() =>
    import(
      "@/admin/campaigns/pages/CampaignsPage"
    )
  );

const CampaignSchedulerPage =
  lazy(() =>
    import(
      "@/admin/scheduler/pages/CampaignSchedulerPage"
    )
  );

/**
 * =========================================================
 * CMS
 * =========================================================
 */

const CMSPage =
  lazy(() =>
    import(
      "@/admin/cms/pages/CMSPage"
    )
  );

/**
 * =========================================================
 * MEMBERS + CDP
 * =========================================================
 */

const MembersPage =
  lazy(() =>
    import(
      "@/admin/members/pages/MembersPage"
    )
  );

const Customer360Page =
  lazy(() =>
    import(
      "@/admin/customer360/pages/Customer360Page"
    )
  );

const AudiencePage =
  lazy(() =>
    import(
      "@/admin/audience/pages/AudiencePage"
    )
  );

/**
 * =========================================================
 * LOYALTY + VOUCHERS
 * =========================================================
 */

const LoyaltyPage =
  lazy(() =>
    import(
      "@/admin/loyalty/pages/LoyaltyPage"
    )
  );

const VoucherPage =
  lazy(() =>
    import(
      "@/admin/vouchers/pages/VoucherPage"
    )
  );

/**
 * =========================================================
 * AI + AUTOMATION
 * =========================================================
 */

const AutomationPage =
  lazy(() =>
    import(
      "@/admin/automation/pages/AutomationPage"
    )
  );

const AiInsightsPage =
  lazy(() =>
    import(
      "@/admin/ai/pages/AiInsightsPage"
    )
  );

/**
 * =========================================================
 * COMMUNICATION PLATFORM
 * =========================================================
 */

const NotificationPage =
  lazy(() =>
    import(
      "@/admin/notifications/pages/NotificationPage"
    )
  );

const ChannelManagementPage =
  lazy(() =>
    import(
      "@/admin/channels/pages/ChannelManagementPage"
    )
  );

/**
 * =========================================================
 * GAMES
 * =========================================================
 */

const GamesPage =
  lazy(() =>
    import(
      "@/admin/games/pages/GamesPage"
    )
  );

  const EcosystemPlatformPage =
  lazy(() =>
    import(
      "@/admin/ecosystem/pages/EcosystemPlatformPage"
    )
  );

  const AiAutonomousPage =
  lazy(() =>
    import(
      "@/admin/ai-agents/pages/AiAutonomousPage"
    )
  );

const AiRuntimePage =
  lazy(() =>
    import(
      "@/admin/ai-runtime/pages/AiRuntimePage"
    )
  );

  const FranchiseManagementPage =
  lazy(() =>
    import(
      "@/admin/franchise/pages/FranchiseManagementPage"
    )
  );

const TenantManagementPage =
  lazy(() =>
    import(
      "@/admin/tenants/pages/TenantManagementPage"
    )
  );

  const ObservabilityPage =
  lazy(() =>
    import(
      "@/admin/observability/pages/ObservabilityPage"
    )
  );

const ReleaseManagementPage =
  lazy(() =>
    import(
      "@/admin/releases/pages/ReleaseManagementPage"
    )
  );

  const PageBuilderPage =
  lazy(() =>
    import(
      "@/admin/builder/pages/PageBuilderPage"
    )

  );

const SchemaDesignerPage =
  lazy(() =>
    import(
      "@/admin/schema/pages/SchemaDesignerPage"
    )
  );

const OrdersPage =
  lazy(() =>
    import(
      "@/admin/orders/pages/OrdersPage"
    )

  );

const IposOperationsPage =
  lazy(() =>
    import(
      "@/admin/ipos/pages/IposOperationsPage"
    )
  );

/**
 * =========================================================
 * ADMIN ROUTES
 * =========================================================
 */

const adminRoutes = [

  {
  path:
    "/admin/ecosystem",

  permission:
    "ecosystem.read",

  component:
    EcosystemPlatformPage,
},

  {
  path:
    "/admin/ai-autonomous",

  permission:
    "ai.autonomous.read",

  component:
    AiAutonomousPage,
},

{
  path:
    "/admin/ai-runtime",

  permission:
    "ai.runtime.read",

  component:
    AiRuntimePage,
},

  {
  path:
    "/admin/franchise",

  permission:
    "franchise.read",

  component:
    FranchiseManagementPage,
},

{
  path:
    "/admin/tenants",

  permission:
    "tenants.read",

  component:
    TenantManagementPage,
},

{
  path:
    "/admin/observability",

  permission:
    "observability.read",

  component:
    ObservabilityPage,
},

{
  path:
    "/admin/releases",

  permission:
    "releases.read",

  component:
    ReleaseManagementPage,
},

{
  path:
    "/admin/builder",

  permission:
    "builder.read",

  component:
    PageBuilderPage,
},

{
  path:
    "/admin/schema",

  permission:
    "schema.read",

  component:
    SchemaDesignerPage,
},

  {
  path:
    "/admin/orders",
  permission:
    "orders.read",
  component:
    OrdersPage,
},

{
  path:
    "/admin/ipos",
  permission:
    "ipos.read",
  component:
    IposOperationsPage,
},

  /**
   * =========================================
   * DASHBOARD
   * =========================================
   */

  {
    path:
      "/admin",

    permission:
      "admin.dashboard.read",

    component:
      AdminDashboardPage,
  },

  /**
   * =========================================
   * ANALYTICS
   * =========================================
   */

  {
    path:
      "/admin/analytics",

    permission:
      "analytics.read",

    component:
      AnalyticsPage,
  },

  {
    path:
      "/admin/realtime",

    permission:
      "realtime.read",

    component:
      RealtimeMonitoringPage,
  },

  /**
   * =========================================
   * CAMPAIGNS
   * =========================================
   */

  {
    path:
      "/admin/campaigns",

    permission:
      "campaigns.read",

    component:
      CampaignsPage,
  },

  {
    path:
      "/admin/campaign-scheduler",

    permission:
      "campaign.scheduler.read",

    component:
      CampaignSchedulerPage,
  },

  /**
   * =========================================
   * CMS
   * =========================================
   */

  {
    path:
      "/admin/cms",

    permission:
      "cms.read",

    component:
      CMSPage,
  },

  /**
   * =========================================
   * MEMBERS + CDP
   * =========================================
   */

  {
    path:
      "/admin/members",

    permission:
      "members.read",

    component:
      MembersPage,
  },

  {
    path:
      "/admin/customer360",

    permission:
      "customer360.read",

    component:
      Customer360Page,
  },

  {
    path:
      "/admin/audiences",

    permission:
      "audiences.read",

    component:
      AudiencePage,
  },

  /**
   * =========================================
   * LOYALTY
   * =========================================
   */

  {
    path:
      "/admin/loyalty",

    permission:
      "loyalty.read",

    component:
      LoyaltyPage,
  },

  /**
   * =========================================
   * VOUCHERS
   * =========================================
   */

  {
    path:
      "/admin/vouchers",

    permission:
      "vouchers.read",

    component:
      VoucherPage,
  },

  /**
   * =========================================
   * AI + AUTOMATION
   * =========================================
   */

  {
    path:
      "/admin/automation",

    permission:
      "automation.read",

    component:
      AutomationPage,
  },

  {
    path:
      "/admin/ai",

    permission:
      "ai.read",

    component:
      AiInsightsPage,
  },

  /**
   * =========================================
   * COMMUNICATION
   * =========================================
   */

  {
    path:
      "/admin/notifications",

    permission:
      "notifications.read",

    component:
      NotificationPage,
  },

  {
    path:
      "/admin/channels",

    permission:
      "channels.read",

    component:
      ChannelManagementPage,
  },

  /**
   * =========================================
   * GAMES
   * =========================================
   */

  {
    path:
      "/admin/games",

    permission:
      "games.read",

    component:
      GamesPage,
  },

  /**
   * =========================================
   * SETTINGS
   * =========================================
   */

  {
    path:
      "/admin/settings",

    permission:
      "settings.read",

    component:
      SettingsPage,
  },

];

export default
  adminRoutes;