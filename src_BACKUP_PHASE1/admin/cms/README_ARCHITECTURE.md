# CMS RUNTIME ARCHITECTURE

## PRINCIPLES

- No hardcode UI
- Dynamic block rendering
- Remote-driven layout
- Realtime CMS updates
- Admin-operable runtime
- Schema-driven frontend

---

# FLOW

Backend CMS Schema
        ↓
CMS Service
        ↓
CMS Store
        ↓
Dynamic Renderer
        ↓
Component Registry
        ↓
Runtime UI Render

---

# BLOCK EXAMPLE

{
  "id": "hero-1",
  "type": "hero-banner",
  "props": {
    "title": "Cing Hu Tang",
    "subtitle": "Realtime Loyalty Platform",
    "image": "https://..."
  }
}

---

# FUTURE BLOCKS

- carousel
- product-grid
- leaderboard
- realtime-feed
- campaign-banner
- game-entry
- loyalty-progress
- voucher-wallet
- notification-center
- analytics-widget