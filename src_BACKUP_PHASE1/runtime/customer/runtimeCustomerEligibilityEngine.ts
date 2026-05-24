interface EligibilityInput {

  phoneGranted:
    boolean;

  oaFollowed:
    boolean;

}

export function isEligibleForMembership(
  input:
    EligibilityInput,
) {

  return (
    input.phoneGranted &&
    input.oaFollowed
  );

}