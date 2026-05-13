import {
  createBrowserRouter,
} from "react-router-dom";

import AppRouter
  from "./AppRouter";

const router =
  createBrowserRouter([
    {
      path: "*",
      element:
        <AppRouter />,
    },
  ]);

export default router;