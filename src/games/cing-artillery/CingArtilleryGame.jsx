import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPremiumArtilleryGame,
} from "./engine/createPremiumArtilleryGame";

import {
  destroyPremiumArtilleryGame,
} from "./engine/destroyPremiumArtilleryGame";

import {
  detectPremiumDeviceCapability,
} from "./platform/premiumDeviceCapability";

export default function CingArtilleryGame() {
  const mountRef =
    useRef(null);

  const gameRef =
    useRef(null);

  const [state, setState] =
    useState({
      phase: "checking",
      reason: null,
    });

  useEffect(() => {
    let cancelled =
      false;

    const capability =
      detectPremiumDeviceCapability();

    if (!capability.supported) {
      setState({
        phase: "unsupported",
        reason: capability.reason,
      });

      return undefined;
    }

    const boot =
      async () => {
        try {
          const game =
            await createPremiumArtilleryGame(
              mountRef.current
            );

          if (cancelled) {
            destroyPremiumArtilleryGame(
              game
            );

            return;
          }

          gameRef.current =
            game;

          setState({
            phase: "ready",
            reason: null,
          });
        } catch {
          if (!cancelled) {
            setState({
              phase: "failed",
              reason:
                "ENGINE_BOOT_FAILED",
            });
          }
        }
      };

    void boot();

    return () => {
      cancelled =
        true;

      if (
        gameRef.current
      ) {
        destroyPremiumArtilleryGame(
          gameRef.current
        );

        gameRef.current =
          null;
      }

      if (
        mountRef.current
      ) {
        mountRef.current
          .replaceChildren();
      }
    };
  }, []);

  if (
    state.phase ===
    "unsupported"
  ) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07111f",
          color: "white",
          padding: 24,
          textAlign: "center",
        }}
      >
        Thiết bị hiện tại chưa đáp ứng
        yêu cầu đồ họa của trò chơi.
      </div>
    );
  }

  if (
    state.phase ===
    "failed"
  ) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07111f",
          color: "white",
          padding: 24,
          textAlign: "center",
        }}
      >
        Không thể khởi tạo engine trò chơi.
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        overflow: "hidden",
        background: "#07111f",
      }}
    >
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          touchAction: "none",
        }}
      />

      {state.phase === "checking" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            background: "#07111f",
            fontWeight: 800,
          }}
        >
          Đang khởi tạo engine...
        </div>
      )}
    </div>
  );
}
