class ActivationConfigRuntime {

  config = {

    requirePhone:
      true,

    requireFollow:
      true,

    enableSilentRestore:
      true,

  };

  get(key) {

    return this.config[key];

  }

}

const activationConfigRuntime =
  new ActivationConfigRuntime();

export default activationConfigRuntime;