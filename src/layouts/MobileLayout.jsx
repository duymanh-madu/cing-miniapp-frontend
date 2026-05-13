import {
  Outlet,
} from "react-router-dom";

import BottomNavigation
  from "@/components/navigation/BottomNavigation";

import AppHeader
  from "@/components/layout/AppHeader";

import useRuntimeStore
  from "@/stores/runtimeStore";

import {
  useSocket,
} from "@/providers/SocketProvider";

/**
 * =========================================================
 * MOBILE LAYOUT
 * =========================================================
 */

function MobileLayout() {

  /**
   * =======================================================
   * RUNTIME STORE
   * =======================================================
   */

  const loading =
    useRuntimeStore(
      (state) =>
        state.loading
    );

  const error =
    useRuntimeStore(
      (state) =>
        state.error
    );

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

  const status =
    socketContext?.status ||
    "disconnected";

  /**
   * =======================================================
   * MAINTENANCE
   * =======================================================
   */

  const maintenance =
    config?.maintenance;

  /**
   * =======================================================
   * RUNTIME ERROR
   * =======================================================
   */

  if (error) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-brand-cream
          px-6
          text-center
        "
      >

        <div>

          <h2
            className="
              text-xl
              font-bold
              text-red-500
            "
          >
            Runtime Error
          </h2>

          <p
            className="
              mt-3
              text-sm
              text-gray-500
            "
          >
            {error}
          </p>

        </div>

      </div>

    );

  }

  /**
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (loading) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-brand-cream
        "
      >

        <div
          className="
            text-sm
            font-semibold
            text-gray-400
          "
        >
          Đang khởi tạo hệ thống...
        </div>

      </div>

    );

  }

  /**
   * =======================================================
   * MAINTENANCE MODE
   * =======================================================
   */

  if (
    maintenance?.enabled
  ) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-brand-cream
          px-6
          text-center
        "
      >

        <div>

          <h2
            className="
              text-2xl
              font-black
              text-brand-orange
            "
          >
            Đang bảo trì
          </h2>

          <p
            className="
              mt-3
              text-sm
              leading-relaxed
              text-gray-500
            "
          >

            {
              maintenance.message ||

              "Hệ thống đang được nâng cấp."
            }

          </p>

        </div>

      </div>

    );

  }

  /**
   * =======================================================
   * APP SHELL
   * =======================================================
   */

  return (

    <div
      className="
        flex
        min-h-screen
        justify-center
        bg-brand-cream
      "
    >

      <div
        className="
          relative
          min-h-screen
          w-full
          max-w-md
          overflow-hidden
          bg-brand-cream
          pb-[env(safe-area-inset-bottom)]
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <AppHeader />

        {/* =================================================
            SOCKET STATUS
        ================================================= */}

        {
          !connected && (

            <div
              className="
                sticky
                top-0
                z-30
                border-b
                border-yellow-200
                bg-yellow-100
                px-4
                py-2
                text-center
                text-[11px]
                font-semibold
                text-yellow-700
              "
            >

              {
                status ===
                "reconnecting"

                  ? "Đang kết nối lại realtime..."

                  : "Mất kết nối realtime"
              }

            </div>

          )
        }

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className="
            pb-32
            pt-[env(safe-area-inset-top)]
          "
        >

          <Outlet />

        </main>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <BottomNavigation />

      </div>

    </div>

  );

}

export default MobileLayout;