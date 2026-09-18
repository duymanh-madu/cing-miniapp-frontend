import { useEffect, useRef, useState } from "react";
import HomeHero from "@/components/home/HomeHero";
import {
  armStartupDiagnostic,
  getStartupDiagnostic,
} from "@/runtime/startup/startupDiagnostic";
import {
  clearStartupLifecycleTrace,
  getStartupLifecycleTrace,
  recordStartupLifecycleEvent,
} from "@/runtime/startup/startupLifecycleDiagnostic";
import AppPopup from "@/components/AppPopup";
import HomeMenuPreview from "@/components/home/HomeMenuPreview";
import HomeQuickActions from "@/features/home/components/HomeQuickActions";
import HomeMembershipCard from "@/features/home/components/HomeMembershipCard";
import HomeWalletSnapshot from "@/features/wallet/components/HomeWalletSnapshot";
import HomeGameTeaser from "@/features/home/components/HomeGameTeaser";
import { PageContainer } from "@/components/ui";

export default function HomePage() {
  const holdRef = useRef(null);

  const [diagnosticEnabled, setDiagnosticEnabled] =
    useState(() => {
      try {
        return Boolean(
          getStartupDiagnostic().enabled
        );
      } catch {
        return false;
      }
    });

  const [trace, setTrace] = useState(() =>
    getStartupLifecycleTrace()
  );

  useEffect(() => {
    const refresh = () => {
      setTrace(
        getStartupLifecycleTrace()
      );
    };

    window.addEventListener(
      "cing:startup-lifecycle-diagnostic",
      refresh
    );

    return () => {
      window.removeEventListener(
        "cing:startup-lifecycle-diagnostic",
        refresh
      );
    };
  }, []);

  const clearHold = () => {
    if (holdRef.current !== null) {
      window.clearTimeout(
        holdRef.current
      );

      holdRef.current = null;
    }
  };

  const startHold = () => {
    clearHold();

    holdRef.current =
      window.setTimeout(() => {
        holdRef.current = null;

        if (
          armStartupDiagnostic()
        ) {
          clearStartupLifecycleTrace();

          setDiagnosticEnabled(true);

          recordStartupLifecycleEvent(
            "diagnostic:armed"
          );

          setTrace(
            getStartupLifecycleTrace()
          );
        }
      }, 2500);
  };

  return (
    <PageContainer className="pb-24">
      <AppPopup />
      <div
        className="px-4 pt-4"
        onPointerDown={startHold}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onPointerLeave={clearHold}
        style={{ touchAction: "manipulation" }}
      >
        <HomeHero />
      </div>

      {diagnosticEnabled && (
        <div
          style={{
            margin: "12px 16px 0",
            padding: 12,
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            fontSize: 11,
            lineHeight: 1.55,
            fontFamily: "monospace",
            overflowWrap: "anywhere",
          }}
        >
          <div
            style={{
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            LIFECYCLE DIAGNOSTIC ARMED
          </div>

          {trace.slice(-24).map(
            (item, index) => (
              <div
                key={`${item.at}-${index}`}
              >
                {new Date(
                  item.at
                ).toLocaleTimeString()}
                {" · "}
                {item.event}
                {" · "}
                {item.visibility}
              </div>
            )
          )}
        </div>
      )}
      <div className="px-4 mt-6"><HomeQuickActions /></div>
      <div className="px-4 mt-5"><HomeWalletSnapshot /></div>
      <div className="px-4 mt-5"><HomeMembershipCard /></div>
      <div className="px-4 mt-6"><HomeMenuPreview /></div>
      <div className="px-4 mt-6 mb-4"><HomeGameTeaser /></div>
    </PageContainer>
  );
}
