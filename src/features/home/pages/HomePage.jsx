import { useEffect, useRef, useState } from "react";
import HomeHero from "@/components/home/HomeHero";
import {
  getStartupLifecycleTrace,
} from "@/runtime/startup/startupLifecycleDiagnostic";
import AppPopup from "@/components/AppPopup";
import HomeMenuPreview from "@/components/home/HomeMenuPreview";
import HomeQuickActions from "@/features/home/components/HomeQuickActions";
import HomeMembershipCard from "@/features/home/components/HomeMembershipCard";
import HomeWalletSnapshot from "@/features/wallet/components/HomeWalletSnapshot";
import HomeGameTeaser from "@/features/home/components/HomeGameTeaser";
import { PageContainer } from "@/components/ui";

export default function HomePage() {
  const [trace, setTrace] = useState(() =>
    getStartupLifecycleTrace()
  );

  const [showTrace, setShowTrace] = useState(false);

  const tapCountRef = useRef(0);
  const tapResetTimerRef = useRef(null);

  const revealTrace = () => {
    tapCountRef.current += 1;

    if (tapResetTimerRef.current !== null) {
      window.clearTimeout(
        tapResetTimerRef.current
      );
    }

    if (tapCountRef.current >= 7) {
      tapCountRef.current = 0;
      tapResetTimerRef.current = null;

      setTrace(
        getStartupLifecycleTrace()
      );

      setShowTrace(true);
      return;
    }

    tapResetTimerRef.current =
      window.setTimeout(() => {
        tapCountRef.current = 0;
        tapResetTimerRef.current = null;
      }, 4000);
  };

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

    refresh();

    return () => {
      window.removeEventListener(
        "cing:startup-lifecycle-diagnostic",
        refresh
      );
    };
  }, []);

  return (
    <PageContainer className="pb-24">
      <AppPopup />

      <div
        className="px-4 pt-4"
        onClick={revealTrace}
      >
        <HomeHero />
      </div>

      {showTrace && trace.length > 0 && (
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
            WARM RE-ENTRY TRACE
          </div>

          {trace.slice(-30).map(
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

      <div className="px-4 mt-6">
        <HomeQuickActions />
      </div>

      <div className="px-4 mt-5">
        <HomeWalletSnapshot />
      </div>

      <div className="px-4 mt-5">
        <HomeMembershipCard />
      </div>

      <div className="px-4 mt-6">
        <HomeMenuPreview />
      </div>

      <div className="px-4 mt-6 mb-4">
        <HomeGameTeaser />
      </div>
    </PageContainer>
  );
}
