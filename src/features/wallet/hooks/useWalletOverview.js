import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  fetchWalletOverview,
} from "../api/walletOverviewApi";

const CACHE_TTL_MS =
  10_000;

let cachedSnapshot = null;
let cachedAt = 0;
let inFlight = null;

async function loadSharedWallet({
  force = false,
} = {}) {
  const fresh =
    cachedSnapshot &&
    Date.now() - cachedAt <
      CACHE_TTL_MS;

  if (
    !force &&
    fresh
  ) {
    return cachedSnapshot;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight =
    fetchWalletOverview()
      .then(
        snapshot => {
          cachedSnapshot =
            snapshot;

          cachedAt =
            Date.now();

          return snapshot;
        }
      )
      .finally(
        () => {
          inFlight =
            null;
        }
      );

  return inFlight;
}

export function invalidateWalletOverviewCache() {
  cachedAt = 0;
}

export default function useWalletOverview({
  enabled = true,
} = {}) {
  const [
    state,
    setState,
  ] =
    useState(() => ({
      data:
        cachedSnapshot,
      loading:
        enabled &&
        !cachedSnapshot,
      refreshing:
        false,
      error:
        "",
    }));

  const mounted =
    useRef(true);

  const refresh =
    useCallback(
      async ({
        silent = false,
        force = true,
      } = {}) => {
        if (!enabled) {
          return null;
        }

        if (
          !silent
        ) {
          setState(
            current => ({
              ...current,
              loading:
                !current.data,
              refreshing:
                Boolean(
                  current.data
                ),
              error:
                "",
            })
          );
        }

        try {
          const data =
            await loadSharedWallet({
              force,
            });

          if (
            mounted.current
          ) {
            setState({
              data,
              loading:
                false,
              refreshing:
                false,
              error:
                "",
            });
          }

          return data;
        } catch (error) {
          if (
            mounted.current
          ) {
            setState(
              current => ({
                ...current,
                loading:
                  false,
                refreshing:
                  false,
                error:
                  error?.response
                    ?.data
                    ?.message ||
                  error?.message ||
                  "Không thể tải Cing Wallet.",
              })
            );
          }

          throw error;
        }
      },
      [
        enabled,
      ]
    );

  useEffect(
    () => {
      mounted.current =
        true;

      if (enabled) {
        refresh({
          force:
            false,
        }).catch(
          () => {}
        );
      }

      const onWalletUpdated =
        () => {
          invalidateWalletOverviewCache();

          refresh({
            silent:
              true,
            force:
              true,
          }).catch(
            () => {}
          );
        };

      window.addEventListener(
        "cing_wallet_balance_updated",
        onWalletUpdated
      );

      window.addEventListener(
        "focus",
        onWalletUpdated
      );

      const onVisibility =
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            onWalletUpdated();
          }
        };

      document.addEventListener(
        "visibilitychange",
        onVisibility
      );

      return () => {
        mounted.current =
          false;

        window.removeEventListener(
          "cing_wallet_balance_updated",
          onWalletUpdated
        );

        window.removeEventListener(
          "focus",
          onWalletUpdated
        );

        document.removeEventListener(
          "visibilitychange",
          onVisibility
        );
      };
    },
    [
      enabled,
      refresh,
    ]
  );

  return {
    ...state,

    balance:
      state.data
        ?.balance,

    transactions:
      state.data
        ?.transactions ||
      [],

    refresh,
  };
}
