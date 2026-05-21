/**
 * =====================================================
 * PERSONALIZATION STATE
 * =====================================================
 */

const personalizationState =
  {

    member_tier:
      null,

    segments: [],

    homepage_variant:
      null,

  };

/**
 * =====================================================
 * UPDATE PERSONALIZATION
 * =====================================================
 */

export function updatePersonalizationState(

  payload: Partial<
    typeof personalizationState
  >

) {

  Object.assign(

    personalizationState,

    payload

  );

}

/**
 * =====================================================
 * GET PERSONALIZATION
 * =====================================================
 */

export function getPersonalizationState() {

  return personalizationState;

}