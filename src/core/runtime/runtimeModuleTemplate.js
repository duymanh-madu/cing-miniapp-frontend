const runtimeModuleTemplate = {

  name:
    "runtime.module",

  async boot() {

    return true;

  },

  async execute(
    payload
  ) {

    return payload;

  },

  async shutdown() {

    return true;

  },

};

export default
  runtimeModuleTemplate;