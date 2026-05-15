import { getPhoneNumber } from "zmp-sdk/apis";

class PhonePermissionRuntime {
  async requestPhoneNumber() {
    try {
      const response =
        await getPhoneNumber({});

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error(
        "phone permission failed",
        error
      );

      return {
        success: false,
        error,
      };
    }
  }
}

const phonePermissionRuntime =
  new PhonePermissionRuntime();

export default phonePermissionRuntime;