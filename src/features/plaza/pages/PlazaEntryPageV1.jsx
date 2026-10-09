import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { createPortal } from "react-dom";
import { usePlazaViewportV6 } from "../runtime/usePlazaViewportV6.js";
import PlazaPageV1 from "./PlazaPageV1";

export default function PlazaEntryPageV1() {
  const navigate = useNavigate();
  usePlazaViewportV6();
  const authenticated = useAuthStore(state => state.authenticated);
  const featureEnabled =
    import.meta.env.VITE_CING_PLAZA_ENABLED === "true";
  const [legalEnabled, setLegalEnabled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let requestVersion = 0;
    setLegalEnabled(false);
    setChecking(true);

    if (!featureEnabled || !authenticated) {
      return () => { cancelled = true; };
    }

    async function refresh() {
      const version = ++requestVersion;
      // Keep the confirmed state while checking; server still authorizes every operation.
      try {
        const response = await apiClient.get("/app-config/public");
        if (!cancelled && version === requestVersion) {
          setChecking(false);
          setLegalEnabled(
            response?.data?.data?.customer_multiplayer_enabled === true
          );
        }
      } catch (_) {
        if (!cancelled && version === requestVersion) {
          // Retain the last confirmed view on a transient read failure.
          // Server permission checks remain authoritative for all actions.
          setChecking(false);
        }
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") void refresh();
    }

    void refresh();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      requestVersion += 1;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [featureEnabled, authenticated]);

  return createPortal(
    <PlazaPageV1
      checking={featureEnabled && authenticated && checking}
      enabled={featureEnabled && authenticated && legalEnabled}
      onClose={() => navigate("/game-center")}
    />, document.body
  );
}
