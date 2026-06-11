export const routeManifest = [
  { key:"home",          path:"/",               feature:"home",          loader:() => import("@/features/home") },
  { key:"game-center",   path:"/game-center",    feature:"game-center",   loader:() => import("@/features/game-center") },
  { key:"game",          path:"/game",           feature:"game",          loader:() => import("@/features/game") },
  { key:"menu",          path:"/menu",           feature:"menu",          loader:() => import("@/features/menu") },
  { key:"leaderboard",   path:"/leaderboard",    feature:"leaderboard",   loader:() => import("@/features/leaderboard") },
  { key:"account",       path:"/account",        feature:"account",       loader:() => import("@/features/account") },
  { key:"voucher",       path:"/voucher",       loader:() => import("@/features/voucher") },
  { key:"checkout",      path:"/checkout",       feature:"checkout",      loader:() => import("@/features/checkout") },
  { key:"admin", path:"/admin", loader:() => import("@/features/admin") },
  { key:"order-success", path:"/order-success",  feature:"order-success", loader:() => import("@/features/order-success") },
  { key:"orders",    path:"/orders",    loader:() => import("@/features/order-history/OrderHistoryPage") },
  { key:"my-orders", path:"/my-orders", loader:() => import("@/features/order-history/MyOrdersPage") },
  { key:"membership-benefits", path:"/membership-benefits", loader:() => import("@/features/membership/pages/MembershipBenefitsPage") },
  { key:"loyalty",       path:"/loyalty",        loader:() => import("@/membership/pages/MembershipPage") },
  { key:"game-plays",    path:"/game-plays",     loader:() => import("@/features/game-plays/GamePlaysHistoryPage") },
  { key:"badge-store",   path:"/badge-store",    loader:() => import("@/features/badge-store/BadgeStorePage") },
  { key:"profile",       path:"/profile/:userId", loader:() => import("@/features/profile/ProfilePage") },
  { key:"my-profile",    path:"/profile",         loader:() => import("@/features/profile/ProfilePage") },
];
export const routeMap = Object.fromEntries(routeManifest.map(r => [r.key, r]));
// Sat Jun  6 09:20:55 +07 2026
// Sat Jun  6 09:23:21 +07 2026
