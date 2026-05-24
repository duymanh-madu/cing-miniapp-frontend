import axios from "axios";

const API_BASE_URL =
  import.meta.env
    .VITE_API_BASE_URL;

class CustomerProfileApi {

  async getMyProfile() {

    try {

      const token =
        localStorage.getItem(
          "miniapp_jwt"
        );

      const response =
        await axios.get(

          `${API_BASE_URL}/customer/me`,

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
        "get profile failed",
        error
      );

      return null;

    }

  }

}

const customerProfileApi =
  new CustomerProfileApi();

export default
  customerProfileApi;