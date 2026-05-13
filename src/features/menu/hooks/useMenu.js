import {
  useEffect,
} from "react";

import useMenuStore from "../store/menuStore";

import {
  fetchMenuData,
} from "../services/menuService";

/**
 * ============================================
 * MENU DATA
 * ============================================
 */

function useMenuData() {
  const {
    setMenuData,
    setLoading,
  } = useMenuStore();

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      try {
        setLoading(true);

        const response =
          await fetchMenuData();

        if (
          mounted &&
          response.success
        ) {
          setMenuData({
            categories:
              response.categories,

            products:
              response.products,
          });
        }
      } catch (error) {
        console.error(
          "menu load error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, []);
}

export default useMenuData;