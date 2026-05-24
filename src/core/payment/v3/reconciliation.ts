class Reconciliation {

  async verify(local: any, gateway: any) {

    if (local.amount !== gateway.amount) {
      return {
        status: "MISMATCH",
        local,
        gateway,
      };
    }

    return {
      status: "OK",
    };

  }

}

export const reconciliation = new Reconciliation();
