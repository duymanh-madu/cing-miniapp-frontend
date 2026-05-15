import {
  getPhoneNumber,
} from "zmp-sdk/apis";

class ZaloPhoneRuntime {

  async requestPhoneNumber() {

    try {

      const response =
        await getPhoneNumber({});

      return response;

    } catch (error) {

      console.error(
        "phone request failed",
        error
      );

      return null;

    }

  }

}

const zaloPhoneRuntime =
  new ZaloPhoneRuntime();

export default zaloPhoneRuntime;