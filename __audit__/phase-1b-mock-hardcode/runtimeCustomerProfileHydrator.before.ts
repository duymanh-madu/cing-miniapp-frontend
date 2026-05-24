export async function hydrateCustomerProfile() {

  runtimeLogger.info("RUNTIME", 
    "[CUSTOMER] Hydrating customer profile"
  );

  return {

    customerId:
      "crm-demo-001",

    fullName:
      "Cing Customer",

  };

}