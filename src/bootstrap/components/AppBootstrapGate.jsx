import { useEffect, useState } from "react";
import { initializeApplication } from "../services/appBootstrapOrchestrator";
import {
  getStartupDiagnostic,
  markStartup,
} from "@/runtime/startup/startupDiagnostic";

function AppBootstrapGate({ children }) {
  const [ready, setReady] = useState(false);
  const [, setDiagnosticTick] = useState(0);

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
        <div style={{
          width:32,
          height:32,
          border:"3px solid #D4531C",
          borderTop:"3px solid transparent",
          borderRadius:"50%",
          animation:"spin 1s linear infinite"
        }}/>

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
