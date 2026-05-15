import {
  create,
} from "zustand";

const useCustomer360Store =
  create(
    (
      set
    ) => ({

      profiles:
        [],

      selectedProfile:
        null,

      customerTimeline:
        [],

      customerInsights:
        {},

      initialized:
        false,

      loading:
        false,

      setProfiles:
        (
          profiles
        ) => {

          set({
            profiles,
          });

        },

      setSelectedProfile:
        (
          selectedProfile
        ) => {

          set({
            selectedProfile,
          });

        },

      setCustomerTimeline:
        (
          customerTimeline
        ) => {

          set({
            customerTimeline,
          });

        },

      setCustomerInsights:
        (
          customerInsights
        ) => {

          set({
            customerInsights,
          });

        },

      setLoading:
        (
          loading
        ) => {

          set({
            loading,
          });

        },

    })
  );

export default
  useCustomer360Store;