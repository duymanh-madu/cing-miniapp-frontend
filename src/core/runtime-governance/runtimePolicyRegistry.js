import runtimeGovernanceEngine from "./runtimeGovernanceEngine";

class RuntimePolicyRegistry {

  register({
    policy,
  }) {

    runtimeGovernanceEngine
      .registerPolicy(
        policy
      );

  }

}

const runtimePolicyRegistry =
  new RuntimePolicyRegistry();

export default
  runtimePolicyRegistry;