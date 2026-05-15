import {
  useEffect,
  useState,
} from "react";

import adminAnalyticsEngine from "../services/adminAnalyticsEngine";

function DashboardPage() {

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  useEffect(() => {

    adminAnalyticsEngine
      .getDashboard()
      .then(
        setDashboard
      );

  }, []);

  return (

    <div>

      <h1
        className="
          text-3xl
          font-black
        "
      >
        Admin Dashboard
      </h1>

      <pre
        className="
          mt-6
          overflow-auto
          rounded-2xl
          bg-white
          p-6
        "
      >
        {
          JSON.stringify(
            dashboard,
            null,
            2
          )
        }
      </pre>

    </div>

  );

}

export default
  DashboardPage;