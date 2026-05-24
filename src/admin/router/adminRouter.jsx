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
      "@/admin/dashboa../features/AdminDashboardPage"
    )
  );

const AnalyticsPage =
  lazy(() =>
    import(
      "@/admin/analyti../features/AnalyticsPage"
    )
  );

const RealtimeMonitoringPage =
  lazy(() =>
    import(
      "@/admin/monitori../features/RealtimeMonitoringPage"
    )
  );

const SettingsPage =
  lazy(() =>
    import(
      "@/admin/settin../features/SettingsPage"
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
      "@/admin/campaig../features/CampaignsPage"
    )
  );

const CampaignSchedulerPage =
  lazy(() =>
    import(
      "@/admin/schedul../features/CampaignSchedulerPage"
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
      "@/admin/c../features/CMSPage"
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
      "@/admin/membe../features/MembersPage"
    )
  );

const Customer360Page =
  lazy(() =>
    import(
      "@/admin/customer3../features/Customer360Page"
    )
  );

const AudiencePage =
  lazy(() =>
    import(
      "@/admin/audien../features/AudiencePage"
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
      "@/admin/loyal../features/LoyaltyPage"
    )
  );

const VoucherPage =
  lazy(() =>
    import(
      "@/admin/vouche../features/VoucherPage"
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
      "@/admin/automati../features/AutomationPage"
    )
  );

const AiInsightsPage =
  lazy(() =>
    import(
      "@/admin/../features/AiInsightsPage"
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
      "@/admin/notificatio../features/NotificationPage"
    )
  );

const ChannelManagementPage =
  lazy(() =>
    import(
      "@/admin/channe../features/ChannelManagementPage"
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
      "@/admin/gam../features/GamesPage"
    )
  );

  const EcosystemPlatformPage =
  lazy(() =>
    import(
      "@/admin/ecosyst../features/EcosystemPlatformPage"
    )
  );

  const AiAutonomousPage =
  lazy(() =>
    import(
      "@/admin/ai-agen../features/AiAutonomousPage"
    )
  );

const AiRuntimePage =
  lazy(() =>
    import(
      "@/admin/ai-runti../features/AiRuntimePage"
    )
  );

  const FranchiseManagementPage =
  lazy(() =>
    import(
      "@/admin/franchi../features/FranchiseManagementPage"
    )
  );

const TenantManagementPage =
  lazy(() =>
    import(
      "@/admin/tenan../features/TenantManagementPage"
    )
  );

  const ObservabilityPage =
  lazy(() =>
    import(
      "@/admin/observabili../features/ObservabilityPage"
    )
  );

const ReleaseManagementPage =
  lazy(() =>
    import(
      "@/admin/releas../features/ReleaseManagementPage"
    )
  );

  const PageBuilderPage =
  lazy(() =>
    import(
      "@/admin/build../features/PageBuilderPage"
    )

  );

const SchemaDesignerPage =
  lazy(() =>
    import(
      "@/admin/sche../features/SchemaDesignerPage"
    )
  );

const OrdersPage =
  lazy(() =>
    import(
      "@/admin/orde../features/OrdersPage"
    )

  );

const IposOperationsPage =
  lazy(() =>
    import(
      "@/admin/ip../features/IposOperationsPage"
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