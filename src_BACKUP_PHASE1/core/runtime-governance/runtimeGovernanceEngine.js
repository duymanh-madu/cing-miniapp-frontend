class RuntimeGovernanceEngine {

  policies =
    [];

  registerPolicy(
    policy
  ) {

    this.policies.push(
      policy
    );

  }

  evaluate({
    runtime,
    payload,
  }) {

    return this.policies.every(
      (
        policy
      ) =>

        policy({

          runtime,

          payload,

        })

    );

  }

}

const runtimeGovernanceEngine =
  new RuntimeGovernanceEngine();

export default
  runtimeGovernanceEngine;