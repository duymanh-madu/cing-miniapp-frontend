import {
  useEffect,
} from "react";

import customerIdentityRuntime from "@/customer/runtime/customerIdentityRuntime";

import customerRealtimeRuntime from "@/customer/runtime/customerRealtimeRuntime";

import customerHydrationRuntime from "@/customer/runtime/customerHydrationRuntime";

function CustomerIdentityBootstrap() {

  useEffect(() => {

    customerHydrationRuntime
      .hydrate();

    customerIdentityRuntime
      .initialize();

    customerRealtimeRuntime
      .initialize();

  }, []);

  return null;

}

export default
  CustomerIdentityBootstrap;