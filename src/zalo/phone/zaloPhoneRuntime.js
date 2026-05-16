import {
  getPhoneNumber,
} from "zmp-sdk/apis";

class ZaloPhoneRuntime {

  async requestPhoneNumber() {

    try {

  const phone =

    await getPhoneNumber({});

  return {

    success: true,

    phone,

  };

} catch (error) {

  console.warn(

    "phone request failed",

    error

  );

  return {

    success: false,

  };

}

  

    }

  }

const zaloPhoneRuntime =
  new ZaloPhoneRuntime();

export default zaloPhoneRuntime;