import {
  useMemo,
} from "react";

import useRuntimeStore
  from "../stores/runtimeStore";

/**
 * =========================================================
 * SYSTEM NAVIGATION
 * =========================================================
 */

function useSystemNavigation() {

  /**
   * =======================================================
   * RUNTIME CONFIG
   * =======================================================
   */

  const runtimeConfig =
    useRuntimeStore(
      (state) =>
        state.config
    );

  /**
   * =======================================================
   * RAW NAVIGATION
   * =======================================================
   */

  const rawNavigation =
    Array.isArray(
      runtimeConfig?.navigation
    )

      ? runtimeConfig.navigation

      : [];

  /**
   * =======================================================
   * FEATURES
   * =======================================================
   */

  const features =
    runtimeConfig?.features &&
    typeof runtimeConfig.features ===
      "object"

      ? runtimeConfig.features

      : {};

  /**
   * =======================================================
   * FILTER + NORMALIZE
   * =======================================================
   */

  const navigation =
    useMemo(() => {

      return rawNavigation

        /**
         * =============================================
         * VALIDATE ITEM
         * =============================================
         */

        .filter(
          (item) => {

            return (

              item &&

              typeof item ===
                "object" &&

              typeof item.id ===
                "string" &&

              typeof item.label ===
                "string" &&

              typeof item.path ===
                "string"

            );

          }
        )

        /**
         * =============================================
         * FEATURE FILTER
         * =============================================
         */

        .filter(
          (item) => {

            /**
             * No feature key
             */

            if (
              !item.feature
            ) {

              return true;

            }

            /**
             * Feature disabled
             */

            return Boolean(
              features[
                item.feature
              ]
            );

          }
        )

        /**
         * =============================================
         * SORT
         * =============================================
         */

        .sort(
          (a, b) => {

            const priorityA =
              a.priority || 0;

            const priorityB =
              b.priority || 0;

            return (
              priorityA -
              priorityB
            );

          }
        );

    }, [

      rawNavigation,

      features,

    ]);

  /**
   * =======================================================
   * RETURN
   * =======================================================
   */

  return navigation;

}

export default
  useSystemNavigation;