import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  trackEvent,
} from "../services/analyticsTracker";

export function usePageAnalytics() {

  const location =
    useLocation();

  useEffect(() => {

    trackEvent({

      type:
        "page_view",

      payload: {

        path:
          location.pathname,

      },

    });

  }, [location.pathname]);

}