import axios from "axios";

class DynamicMenuRuntime {

  async getMenu() {

    try {

      const response =
        await axios.get(

          `${import.meta.env.VITE_API_BASE_URL}/menu`

        );

      return response.data;

    } catch (error) {

      console.error(
        "load menu failed",
        error
      );

      return [];

    }

  }

}

const dynamicMenuRuntime =
  new DynamicMenuRuntime();

export default
  dynamicMenuRuntime;