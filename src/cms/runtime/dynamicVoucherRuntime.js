import axios from "axios";

class DynamicVoucherRuntime {

  async getMyVouchers() {

    try {

      const token =
        localStorage.getItem(
          "miniapp_jwt"
        );

      const response =
        await axios.get(

          `${import.meta.env.VITE_API_BASE_URL}/vouchers/my`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        );

      return response.data;

    } catch (error) {

      console.error(
        "load vouchers failed",
        error
      );

      return [];

    }

  }

}

const dynamicVoucherRuntime =
  new DynamicVoucherRuntime();

export default
  dynamicVoucherRuntime;