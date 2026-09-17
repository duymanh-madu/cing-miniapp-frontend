import { useEffect, useRef, useState } from "react";
import { initializeApplication } from "../services/appBootstrapOrchestrator";
import {
  armStartupDiagnostic,
  getStartupDiagnostic,
  markStartup,
} from "@/runtime/startup/startupDiagnostic";

function AppBootstrapGate({ children }) {
  const [ready, setReady] = useState(false);
  const [, setDiagnosticTick] = useState(0);
  const [diagnosticArmed, setDiagnosticArmed] =
    useState(false);
  const diagnosticHoldRef = useRef(null);

  const clearDiagnosticHold = () => {
    if (diagnosticHoldRef.current !== null) {
      window.clearTimeout(
        diagnosticHoldRef.current
      );
      diagnosticHoldRef.current = null;
    }
  };

  const startDiagnosticHold = () => {
    clearDiagnosticHold();

    diagnosticHoldRef.current =
      window.setTimeout(() => {
        diagnosticHoldRef.current = null;

        if (armStartupDiagnostic()) {
          setDiagnosticArmed(true);
          setDiagnosticTick(
            (value) => value + 1
          );
        }
      }, 2500);
  };

  markStartup("gate-render");

  useEffect(() => {
    const refreshDiagnostic = () => {
      setDiagnosticTick((value) => value + 1);
    };

    window.addEventListener(
      "cing:startup-diagnostic",
      refreshDiagnostic
    );

    return () => {
      window.removeEventListener(
        "cing:startup-diagnostic",
        refreshDiagnostic
      );
    };
  }, []);

  useEffect(() => {
    async function boot() {
      markStartup("initialize-app-start");

      await initializeApplication();

      markStartup("initialize-app-ready");
      setReady(true);
    }
    boot();
  }, []);

  if (!ready) {
    const diagnostic =
      getStartupDiagnostic();

    const firstAt =
      diagnostic.marks[0]?.at ?? 0;

    return (
      <div style={{
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        height:"100vh",
        background:"#080810",
        color:"#fff"
      }}>
        <div
          onPointerDown={startDiagnosticHold}
          onPointerUp={clearDiagnosticHold}
          onPointerCancel={clearDiagnosticHold}
          onPointerLeave={clearDiagnosticHold}
          style={{
            width:32,
            height:32,
            border:"3px solid #D4531C",
            borderTop:"3px solid transparent",
            borderRadius:"50%",
            animation:"spin 1s linear infinite",
            touchAction:"none"
          }}
        />
        {diagnosticArmed && (
          <div style={{
            marginTop:16,
            fontSize:12,
            fontFamily:"monospace",
            opacity:0.9
          }}>
            STARTUP DIAGNOSTIC ARMED
          </div>
        )}

        {diagnostic.enabled && (
          <div style={{
            marginTop:24,
            width:"88%",
            maxWidth:420,
            fontSize:12,
            lineHeight:1.6,
            fontFamily:"monospace",
            whiteSpace:"pre-wrap"
          }}>
            {diagnostic.marks.map((mark) => (
              <div key={`${mark.name}-${mark.at}`}>
                {mark.name}:{" "}
                {(mark.at - firstAt).toFixed(0)} ms
              </div>
            ))}
          </div>
        )}

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return children;
}

export default AppBootstrapGate;
