import {
  useQuery,
} from "@tanstack/react-query";

import apiClient from "@/infra/api/apiClient";

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

        console.log(
          "MENU API RESPONSE:",
          response.data
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