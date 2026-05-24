import {
  Routes,

  Route,

}
from "react-router-dom";

import HomePage from "@/pages/HomePage";

import MenuPage from "@/pages/MenuPage";

function AppRouter() {

  return (
    <Routes>

      <Route
        path="/"
        element={
          <HomePage />
        }
      />

      <Route
        path="/menu"
        element={
          <MenuPage />
        }
      />

    </Routes>
  );

}

export default
  AppRouter;