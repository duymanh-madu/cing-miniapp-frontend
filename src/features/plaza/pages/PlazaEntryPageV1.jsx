import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import PlazaPageV1 from "./PlazaPageV1";

export default function PlazaEntryPageV1() {
  const navigate = useNavigate();
  const authenticated = useAuthStore(state => state.authenticated);
  const featureEnabled =
    import.meta.env.VITE_CING_PLAZA_ENABLED === "true";
  const [legalEnabled, setLegalEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let requestVersion = 0;
    setLegalEnabled(false);

    if (!featureEnabled || !authenticated) {
      return () => { cancelled = true; };
    }

    async function refresh() {
      const version = ++requestVersion;
      // Close locally until current availability is confirmed.
      setLegalEnabled(false);
      try {
        const response = await apiClient.get("/app-config/public");
        if (!cancelled && version === requestVersion) {
          setLegalEnabled(
            response?.data?.data?.customer_multiplayer_enabled === true
          );
        }
      } catch (_) {
        if (!cancelled && version === requestVersion) {
          setLegalEnabled(false);
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

  return (
    <PlazaPageV1
      enabled={featureEnabled && authenticated && legalEnabled}
      onClose={() => navigate("/game-center")}
    />
  );
}
