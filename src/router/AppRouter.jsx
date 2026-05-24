import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AppLoadingScreen from "@/app/AppLoadingScreen";
import { routeManifest } from "@/app/routeManifest";

const lazyCache = {};
function getLazy(loader, key) {
  if (!lazyCache[key]) lazyCache[key] = lazy(loader);
  return lazyCache[key];
}

export default function AppRouter() {
  return (
    <HashRouter>
      <AppLayout>
        <Suspense fallback={<AppLoadingScreen />}>
          <Routes>
            {routeManifest.map(route => {
              const Component = getLazy(route.loader, route.key);
              return <Route key={route.key} path={route.path} element={<Component />} />;
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </HashRouter>
  );
}
