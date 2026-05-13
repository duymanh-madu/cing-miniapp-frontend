import {
  FaBell,
  FaWifi,
  FaTriangleExclamation,
} from "react-icons/fa6";

import useRuntimeStore
  from "@/stores/runtimeStore";

import {
  useSocket,
} from "@/providers/SocketProvider";

/**
 * =========================================================
 * APP HEADER
 * =========================================================
 */

function AppHeader() {

  /**
   * =======================================================
   * RUNTIME CONFIG
   * =======================================================
   */

  const config =
    useRuntimeStore(
      (state) =>
        state.config
    );

  /**
   * =======================================================
   * SOCKET
   * =======================================================
   */

  const socketContext =
    useSocket();

  const connected =
    socketContext?.connected ||
    false;

  /**
   * =======================================================
   * APP CONFIG
   * =======================================================
   */

  const app =
    config?.app || {};

  const appName =
    app.name ||
    "Cing Hu Tang";

  const appTagline =
    app.tagline ||
    "Luxury Milk Tea";

  /**
   * =======================================================
   * SOCKET STATUS UI
   * =======================================================
   */

  const socketStatusClass =
    connected

      ? `
        border-emerald-100
        bg-emerald-50
        text-emerald-500
      `

      : `
        border-red-100
        bg-red-50
        text-red-400
      `;

  return (

    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-white/40
        bg-brand-cream/90
        px-5
        py-4
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        {/* =================================================
            LEFT
        ================================================= */}

        <div>

          <h1
            className="
              text-xl
              font-black
              tracking-tight
              text-brand-dark
            "
          >
            {appName}
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-brand-gray
            "
          >
            {appTagline}
          </p>

        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {/* ===============================================
              SOCKET STATUS
          =============================================== */}

          <div
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              transition-all
              ${socketStatusClass}
            `}
          >

            {
              connected

                ? (
                  <FaWifi />
                )

                : (
                  <FaTriangleExclamation />
                )
            }

          </div>

          {/* ===============================================
              NOTIFICATION BUTTON
          =============================================== */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-brand-orange
              text-white
              shadow-premium
              transition-all
              duration-300
              active:scale-95
            "
          >

            <FaBell />

            {/* ===========================================
                BADGE
            =========================================== */}

            <span
              className="
                absolute
                right-0
                top-0
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                bg-red-500
                px-1
                text-[10px]
                font-bold
                text-white
              "
            >
              3
            </span>

          </button>

        </div>

      </div>

    </header>

  );

}

export default AppHeader;