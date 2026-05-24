export const createCustomerSlice =
  (set) => ({

    customer: null,

    setCustomer(customer) {

      set({

        customer,

      });

    },

  });