import {
  useEffect,
} from "react";

import {
  useSocket,
}
from "@/providers/SocketProvider";

import useMenuStore from "../store/menuStore";

/**
 * ============================================
 * USE MENU REALTIME
 * ============================================
 */

function useMenuRealtime() {
  const updateProductStock =
    useMenuStore(
      (state) =>
        state.updateProductStock
    );

  const updateProductPrice =
    useMenuStore(
      (state) =>
        state.updateProductPrice
    );

  const markMenuUpdated =
    useMenuStore(
      (state) =>
        state.markMenuUpdated
    );

  useEffect(() => {
    /**
     * STOCK UPDATE
     */

    socket.on(
      "menu_stock_updated",
      (payload) => {
        updateProductStock(
          payload
        );

        markMenuUpdated();
      }
    );

    /**
     * PRICE UPDATE
     */

    socket.on(
      "menu_price_updated",
      (payload) => {
        updateProductPrice(
          payload
        );

        markMenuUpdated();
      }
    );

    return () => {
      socket.off(
        "menu_stock_updated"
      );

      socket.off(
        "menu_price_updated"
      );
    };
  }, [
    updateProductStock,
    updateProductPrice,
    markMenuUpdated,
  ]);
}

export default useMenuRealtime;