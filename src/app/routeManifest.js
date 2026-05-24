export const routeManifest = [
  { key:"home",          path:"/",               feature:"home",          loader:() => import("@/features/home") },
  { key:"game-center",   path:"/game-center",    feature:"game-center",   loader:() => import("@/features/game-center") },
  { key:"game",          path:"/game",           feature:"game",          loader:() => import("@/features/game") },
  { key:"menu",          path:"/menu",           feature:"menu",          loader:() => import("@/features/menu") },
  { key:"leaderboard",   path:"/leaderboard",    feature:"leaderboard",   loader:() => import("@/features/leaderboard") },
  { key:"account",       path:"/account",        feature:"account",       loader:() => import("@/features/account") },
  { key:"voucher",       path:"/voucher",       loader:() => import("@/features/voucher") },
  { key:"checkout",      path:"/checkout",       feature:"checkout",      loader:() => import("@/features/checkout") },
  { key:"order-success", path:"/order-success",  feature:"order-success", loader:() => import("@/features/order-success") },
];
export const routeMap = Object.fromEntries(routeManifest.map(r => [r.key, r]));
