import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AppLoadingScreen from "@/app/AppLoadingScreen";
import { routeManifest } from "@/app/routeManifest";
import useAuthStore from "@/stores/auth/authStore";

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
