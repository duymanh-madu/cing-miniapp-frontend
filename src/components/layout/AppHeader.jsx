import {
  useLocation,
} from "react-router-dom";

/**
 * =========================================================
 * TITLES
 * =========================================================
 */

const titles = {

  "/":
    "Cing Hu Tang",

  "/menu":
    "Menu",

  "/game":
    "Mini Game",

  "/leaderboard":
    "Bảng xếp hạng",

  "/account":
    "Tài khoản",

};

/**
 * =========================================================
 * APP HEADER
 * =========================================================
 */

function AppHeader() {

  const location =
    useLocation();

  const title =

    titles[
      location.pathname
    ] ||

    "Cing Hu Tang";

  return (

    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-[#f3f4f6]
        bg-white/90
        px-4
        py-4
        backdrop-blur
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <h1
          className="
            text-lg
            font-black
            tracking-tight
            text-[#111827]
          "
        >
          {title}
        </h1>

      </div>

    </header>

  );

}

export default
  AppHeader;