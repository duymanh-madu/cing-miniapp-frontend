import {
  create,
} from "zustand";

/**
 * ============================================
 * UI STORE
 * ============================================
 */

const useUIStore =
  create((set) => ({
    /**
     * DRAWERS
     */

    activeDrawer:
      null,

    /**
     * MODALS
     */

    activeModal:
      null,

    modalPayload:
      null,

    /**
     * LOADING
     */

    globalLoading: false,

    /**
     * TOASTS
     */

    blockingToast:
      null,

    /**
     * SEARCH
     */

    globalSearchOpen: false,

    /**
     * ACTIONS
     */

    openDrawer:
      (drawer) =>
        set({
          activeDrawer:
            drawer,
        }),

    closeDrawer:
      () =>
        set({
          activeDrawer:
            null,
        }),

    openModal: (
      modal,
      payload = null
    ) =>
      set({
        activeModal:
          modal,

        modalPayload:
          payload,
      }),

    closeModal:
      () =>
        set({
          activeModal:
            null,

          modalPayload:
            null,
        }),

    setGlobalLoading:
      (value) =>
        set({
          globalLoading:
            value,
        }),

    openGlobalSearch:
      () =>
        set({
          globalSearchOpen: true,
        }),

    closeGlobalSearch:
      () =>
        set({
          globalSearchOpen:
            false,
        }),
  }));

export default useUIStore;