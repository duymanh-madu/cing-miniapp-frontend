import {useLiveEffect} from "@/runtime/live/useLiveEffect";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  fetchWalletOverview,
} from "../api/walletOverviewApi";

import useAuthStore
  from "@/stores/auth/authStore";

import useAppBootstrapAuthState
  from "@/bootstrap/state/appBootstrapAuthState";

const CACHE_TTL_MS =
  10_000;

let cachedSnapshot = null;
let cachedAt = 0;
let cachedOwner = "";
let inFlight = null;
let inFlightOwner = "";

async function loadSharedWallet({force=false, owner=""} = {}) {
  if(!force && cachedSnapshot && cachedOwner===owner && Date.now()-cachedAt<CACHE_TTL_MS)return cachedSnapshot;
  if(inFlight && inFlightOwner===owner)return inFlight;
  const flight=fetchWalletOverview().then(snapshot=>{
    if(inFlight===flight){cachedSnapshot=snapshot;cachedOwner=owner;cachedAt=Date.now();}
    return snapshot;
  }).finally(()=>{if(inFlight===flight){inFlight=null;inFlightOwner="";}});
  inFlight=flight;inFlightOwner=owner;
  return flight;
}

export function invalidateWalletOverviewCache() {
  cachedAt = 0;
}

export default function useWalletOverview({
  enabled = true,
} = {}) {
  const authenticated =
    useAuthStore(
      current =>
        current.authenticated
    );

  const initialAuthResolved =
    useAppBootstrapAuthState(
      current =>
        current.initialAuthResolved
    );

  const owner=useAuthStore(state=>String(state.profile?.phone || state.profile?.id || state.profile?.customerId || state.accessToken || ""));
  const ownerRef=useRef(owner);ownerRef.current=owner;

  const walletReady =
    enabled &&
    initialAuthResolved &&
    authenticated;

  const [
    state,
    setState,
  ] =
    useState(() => ({
      owner,
      data:
        cachedOwner===owner ? cachedSnapshot : null,
      loading:
        walletReady &&
        !(cachedOwner===owner && cachedSnapshot),
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
        if (!walletReady) {
          return null;
        }

        if (
          !silent
        ) {
          setState(
            current => ({
              ...current,
              owner,
              data: current.owner===owner ? current.data : null,
              loading:
                !(current.owner===owner && current.data),
              refreshing:
                Boolean(
                  current.owner===owner && current.data
                ),
              error:
                "",
            })
          );
        }

        try {
          const data =
            await loadSharedWallet({
              force, owner,
            });

          if (
            mounted.current && ownerRef.current===owner
          ) {
            setState({
              owner,
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
            mounted.current && ownerRef.current===owner
          ) {
            setState(
              current => ({
                ...current,
                owner,
                data: current.owner===owner ? current.data : null,
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
        walletReady, owner,
      ]
    );

  useEffect(
    () => {
      mounted.current =
        true;

      if (walletReady) {
        refresh({
          force:
            false,
        }).catch(
          () => {}
        );
      }

      const onWalletUpdated =
        () => {
          if (!walletReady) {
            return;
          }

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
      walletReady,
      refresh,
    ]
  );

  useLiveEffect(({background})=>{if(background && walletReady){invalidateWalletOverviewCache();void refresh({silent:true,force:true}).catch(()=>{});}}, [walletReady,refresh], ["wallet"]);

  const safeData=state.owner===owner ? state.data : null;
  return {
    ...state,
    data: safeData,
    loading: walletReady && state.owner!==owner ? true : state.loading,

    balance:
      safeData
        ?.balance,

    transactions:
      safeData
        ?.transactions ||
      [],

    refresh,
  };
}
