/**
 * =========================================================
 * REALTIME EVENT NAMESPACES
 * =========================================================
 */

const NAMESPACE = {

  SYSTEM:
    "system",

  SOCKET:
    "socket",

  MENU:
    "menu",

  CAMPAIGN:
    "campaign",

  LOYALTY:
    "loyalty",

  VOUCHER:
    "voucher",

  NOTIFICATION:
    "notification",

  PAYMENT:
    "payment",

  GAME:
    "game",

  ADMIN:
    "admin",

};

/**
 * =========================================================
 * REALTIME EVENTS
 * =========================================================
 */

export const REALTIME_EVENTS =
  Object.freeze({

    /**
     * =====================================================
     * SYSTEM
     * =====================================================
     */

    SYSTEM_HEALTH:
      `${NAMESPACE.SYSTEM}:health`,

    SYSTEM_CONFIG_UPDATED:
      `${NAMESPACE.SYSTEM}:config_updated`,

    SYSTEM_MAINTENANCE:
      `${NAMESPACE.SYSTEM}:maintenance`,

    /**
     * =====================================================
     * SOCKET
     * =====================================================
     */

    SOCKET_CONNECTED:
      `${NAMESPACE.SOCKET}:connected`,

    SOCKET_DISCONNECTED:
      `${NAMESPACE.SOCKET}:disconnected`,

    SOCKET_RECONNECTING:
      `${NAMESPACE.SOCKET}:reconnecting`,

    SOCKET_RECONNECTED:
      `${NAMESPACE.SOCKET}:reconnected`,

    SOCKET_RECOVERED:
      `${NAMESPACE.SOCKET}:recovered`,

    /**
     * =====================================================
     * MENU
     * =====================================================
     */

    MENU_UPDATED:
      `${NAMESPACE.MENU}:updated`,

    MENU_ITEM_UPDATED:
      `${NAMESPACE.MENU}:item_updated`,

    MENU_PRICE_UPDATED:
      `${NAMESPACE.MENU}:price_updated`,

    MENU_INVENTORY_UPDATED:
      `${NAMESPACE.MENU}:inventory_updated`,

    MENU_CATEGORY_UPDATED:
      `${NAMESPACE.MENU}:category_updated`,

    MENU_SYNCED:
      `${NAMESPACE.MENU}:synced`,

    /**
     * =====================================================
     * CAMPAIGN
     * =====================================================
     */

    CAMPAIGN_UPDATED:
      `${NAMESPACE.CAMPAIGN}:updated`,

    CAMPAIGN_STARTED:
      `${NAMESPACE.CAMPAIGN}:started`,

    CAMPAIGN_ENDED:
      `${NAMESPACE.CAMPAIGN}:ended`,

    CAMPAIGN_BUDGET_UPDATED:
      `${NAMESPACE.CAMPAIGN}:budget_updated`,

    CAMPAIGN_ANALYTICS_UPDATED:
      `${NAMESPACE.CAMPAIGN}:analytics_updated`,

    /**
     * =====================================================
     * LOYALTY
     * =====================================================
     */

    LOYALTY_UPDATED:
      `${NAMESPACE.LOYALTY}:updated`,

    LOYALTY_POINTS_UPDATED:
      `${NAMESPACE.LOYALTY}:points_updated`,

    LOYALTY_TIER_UPDATED:
      `${NAMESPACE.LOYALTY}:tier_updated`,

    LOYALTY_TRANSACTION_CREATED:
      `${NAMESPACE.LOYALTY}:transaction_created`,

    LOYALTY_LEADERBOARD_UPDATED:
      `${NAMESPACE.LOYALTY}:leaderboard_updated`,

    /**
     * =====================================================
     * VOUCHER
     * =====================================================
     */

    VOUCHER_UPDATED:
      `${NAMESPACE.VOUCHER}:updated`,

    VOUCHER_CREATED:
      `${NAMESPACE.VOUCHER}:created`,

    VOUCHER_CLAIMED:
      `${NAMESPACE.VOUCHER}:claimed`,

    VOUCHER_EXPIRED:
      `${NAMESPACE.VOUCHER}:expired`,

    /**
     * =====================================================
     * NOTIFICATION
     * =====================================================
     */

    NOTIFICATION_RECEIVED:
      `${NAMESPACE.NOTIFICATION}:received`,

    NOTIFICATION_READ:
      `${NAMESPACE.NOTIFICATION}:read`,

    NOTIFICATION_BROADCAST:
      `${NAMESPACE.NOTIFICATION}:broadcast`,

    /**
     * =====================================================
     * PAYMENT
     * =====================================================
     */

    PAYMENT_CREATED:
      `${NAMESPACE.PAYMENT}:created`,

    PAYMENT_VERIFIED:
      `${NAMESPACE.PAYMENT}:verified`,

    PAYMENT_FAILED:
      `${NAMESPACE.PAYMENT}:failed`,

    PAYMENT_REFUNDED:
      `${NAMESPACE.PAYMENT}:refunded`,

    /**
     * =====================================================
     * GAME
     * =====================================================
     */

    GAME_STARTED:
      `${NAMESPACE.GAME}:started`,

    GAME_FINISHED:
      `${NAMESPACE.GAME}:finished`,

    GAME_REWARD_GRANTED:
      `${NAMESPACE.GAME}:reward_granted`,

    GAME_LEADERBOARD_UPDATED:
      `${NAMESPACE.GAME}:leaderboard_updated`,

    GAME_SPIN_COMPLETED:
      `${NAMESPACE.GAME}:spin_completed`,

    /**
     * =====================================================
     * ADMIN
     * =====================================================
     */

    ADMIN_DASHBOARD_UPDATED:
      `${NAMESPACE.ADMIN}:dashboard_updated`,

    ADMIN_ANALYTICS_UPDATED:
      `${NAMESPACE.ADMIN}:analytics_updated`,

    ADMIN_METRICS_UPDATED:
      `${NAMESPACE.ADMIN}:metrics_updated`,

    ADMIN_NOTIFICATION_SENT:
      `${NAMESPACE.ADMIN}:notification_sent`,

  });

/**
 * =========================================================
 * REALTIME EVENT GROUPS
 * =========================================================
 */

export const REALTIME_EVENT_GROUPS =
  Object.freeze({

    MENU: [

      REALTIME_EVENTS.MENU_UPDATED,

      REALTIME_EVENTS.MENU_ITEM_UPDATED,

      REALTIME_EVENTS.MENU_PRICE_UPDATED,

      REALTIME_EVENTS.MENU_INVENTORY_UPDATED,

    ],

    LOYALTY: [

      REALTIME_EVENTS.LOYALTY_UPDATED,

      REALTIME_EVENTS.LOYALTY_POINTS_UPDATED,

      REALTIME_EVENTS.LOYALTY_TIER_UPDATED,

      REALTIME_EVENTS.LOYALTY_LEADERBOARD_UPDATED,

    ],

    CAMPAIGN: [

      REALTIME_EVENTS.CAMPAIGN_UPDATED,

      REALTIME_EVENTS.CAMPAIGN_STARTED,

      REALTIME_EVENTS.CAMPAIGN_ENDED,

    ],

  });

export default
  REALTIME_EVENTS;