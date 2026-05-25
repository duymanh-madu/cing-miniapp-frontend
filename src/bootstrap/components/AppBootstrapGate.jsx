import {
  useEffect,
  useState,
} from "react";



import {
  initializeApplication,
} from "../services/appBootstrapOrchestrator";

function AppBootstrapGate({

  children,

}) {

  const [

    ready,

    setReady,

  ] = useState(false);

  useEffect(() => {

    async function boot() {

      await initializeApplication();

      setReady(true);

    }

    boot();

  }, []);

  if (!ready) {

    return (

      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}><div style={{width:32,height:32,border:"3px solid #D4531C",borderTop:"3px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/></div>

    );

  }

  return children;

}

export default AppBootstrapGate;