import { create }
  from "zustand";

export const useAuthStore =
  create((set) => ({

    authenticated:
      false,

    customer:
      null,

    setAuthenticated(
      value
    ) {

      set({

        authenticated:
          value,

      });

    },

    setCustomer(customer) {

      set({

        customer,

      });

    },

  }));