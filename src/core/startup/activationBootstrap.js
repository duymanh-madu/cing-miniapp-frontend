import startupOrchestrator from "@/core/startup/startupOrchestrator";

class ActivationBootstrap {

  booted = false;

  async bootstrap() {

    if (this.booted) {
      return;
    }

    this.booted = true;

    await startupOrchestrator.start();

  }

}

const activationBootstrap =
  new ActivationBootstrap();

export default activationBootstrap;