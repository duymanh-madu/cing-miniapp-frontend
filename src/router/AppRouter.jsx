import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AppLoadingScreen from "@/app/AppLoadingScreen";
import { routeManifest } from "@/app/routeManifest";
import useAuthStore from "@/stores/auth/authStore";

const PAGE_NAMES = {
  "/":              "Trang chủ",
  "/menu":          "Thực đơn",
  "/checkout":      "Thanh toán",
  "/order-success": "Đặt hàng thành công",
  "/leaderboard":   "Đại sảnh danh vọng",
  "/game-center":   "Game Center",
  "/account":       "Tài khoản",
  "/membership":    "Membership",
};

function PageTracker() {
  const location = useLocation();
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  useEffect(() => {
    const phone = (runtimePhone||"").replace(/\D/g,"").replace(/^84/,"0");
    if (!phone || phone === "pending") return;
    const path = location.pathname;
    const pageName = PAGE_NAMES[path] || path;
    const socket = getRuntimeSocket();
    if (socket?.connected) {
      socket.emit("user:page", { userId: phone, page: pageName, action: "" });
    }
  }, [location.pathname, runtimePhone]);

  return null;
}

const lazyCache = {};
function getLazy(loader, key) {
  if (!lazyCache[key]) lazyCache[key] = lazy(loader);
  return lazyCache[key];
}

function AuthRequired({ children }) {
  const authenticated = useAuthStore(s => s.authenticated);
  if (!authenticated) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", minHeight:"70vh", padding:"24px", textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🔐</div>
        <h2 style={{ fontSize:20, fontWeight:900, color:"#1a1a1a", margin:"0 0 8px" }}>
          Cần đăng nhập
        </h2>
        <p style={{ fontSize:14, color:"#666", margin:"0 0 24px", lineHeight:1.6 }}>
          Vui lòng đăng nhập qua Zalo<br/>để truy cập tính năng này
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }
  return children;
}

export default function AppRouter() {
  return (
    <HashRouter>
      <PageTracker />
      <AppLayout>
        <Suspense fallback={<AppLoadingScreen />}>
          <Routes>
            {routeManifest.map(route => {
              const Component = getLazy(route.loader, route.key);
              const element = route.requireAuth
                ? <AuthRequired><Component /></AuthRequired>
                : <Component />;
              return <Route key={route.key} path={route.path} element={element} />;
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </HashRouter>
  );
}
