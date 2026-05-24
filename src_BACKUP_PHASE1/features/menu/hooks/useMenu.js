import {
  useQuery,
} from "@tanstack/react-query";

import apiClient from "@/infra/api/apiClient";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * USE MENU
 * =====================================================
 */

function useMenu() {

  return useQuery({

    queryKey: [
      "menu",
    ],

    queryFn:
      async () => {

        const response =
          await apiClient.get(
            "/menu"
          );

        runtimeLogger.info(
          "MENU",
          "API RESPONSE",
          {
            itemCount:
              response.data
                ?.items
                ?.length || 0,
          }
        );

        return (
          response.data
            ?.items || []
        );

      },

  });

}

export default
  useMenu;
