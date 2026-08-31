const DECIMAL_INTEGER_RE =
  /^-?(0|[1-9][0-9]*)$/u;

const POSITIVE_DECIMAL_RE =
  /^[1-9][0-9]*$/u;

const OUTCOMES =
  new Set([
    "player_hit",
    "terrain_hit",
    "out_of_bounds",
  ]);

function fail(field) {
  throw new Error(
    `CING_ARTILLERY_CANONICAL_RESULT_INVALID_V1:${field}`
  );
}

function objectValue(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    fail("row");
  }

  return value;
}

function requiredString(
  value,
  field
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    fail(field);
  }

  return value;
}

function requiredInteger(
  value,
  field
) {
  if (
    !Number.isSafeInteger(value)
  ) {
    fail(field);
  }

  return value;
}

function integerText(
  value,
  field
) {
  if (
    typeof value !== "string" ||
    !DECIMAL_INTEGER_RE.test(value)
  ) {
    fail(field);
  }

  return value;
}

function positiveIntegerText(
  value,
  field
) {
  if (
    typeof value !== "string" ||
    !POSITIVE_DECIMAL_RE.test(value)
  ) {
    fail(field);
  }

  return value;
}

function nullableIntegerText(
  value,
  field
) {
  if (
    value === null
  ) {
    return null;
  }

  return integerText(
    value,
    field
  );
}

function nullableIdentity(
  value,
  field
) {
  if (
    value === null
  ) {
    return null;
  }

  return requiredString(
    value,
    field
  );
}

function toPresentationNumber(
  text,
  field
) {
  const value =
    Number(text);

  if (
    !Number.isFinite(value)
  ) {
    fail(field);
  }

  return value;
}

function projectCanonicalResultV1(
  input
) {
  const row =
    objectValue(input);

  const resultSequence =
    positiveIntegerText(
      row.result_sequence,
      "result_sequence"
    );

  const outcome =
    requiredString(
      row.outcome,
      "outcome"
    );

  if (
    !OUTCOMES.has(outcome)
  ) {
    fail("outcome");
  }

  const fixedScaleText =
    positiveIntegerText(
      row.impact_physics_fixed_scale,
      "impact_physics_fixed_scale"
    );

  const startXText =
    integerText(
      row.impact_start_x_scaled,
      "impact_start_x_scaled"
    );

  const startYText =
    integerText(
      row.impact_start_y_scaled,
      "impact_start_y_scaled"
    );

  const deltaXText =
    integerText(
      row.impact_delta_x_scaled,
      "impact_delta_x_scaled"
    );

  const deltaYText =
    integerText(
      row.impact_delta_y_scaled,
      "impact_delta_y_scaled"
    );

  const impactXText =
    integerText(
      row.impact_x,
      "impact_x"
    );

  const impactYText =
    integerText(
      row.impact_y,
      "impact_y"
    );

  const numeratorText =
    nullableIntegerText(
      row.impact_contact_numerator,
      "impact_contact_numerator"
    );

  const denominatorText =
    nullableIntegerText(
      row.impact_contact_denominator,
      "impact_contact_denominator"
    );

  if (
    (numeratorText === null) !==
    (denominatorText === null)
  ) {
    fail("impact_contact_parameter");
  }

  if (
    denominatorText !== null &&
    BigInt(denominatorText) <= 0n
  ) {
    fail("impact_contact_denominator");
  }

  const fixedScale =
    toPresentationNumber(
      fixedScaleText,
      "impact_physics_fixed_scale"
    );

  if (
    fixedScale <= 0
  ) {
    fail("impact_physics_fixed_scale");
  }

  const startX =
    toPresentationNumber(
      startXText,
      "impact_start_x_scaled"
    ) / fixedScale;

  const startY =
    toPresentationNumber(
      startYText,
      "impact_start_y_scaled"
    ) / fixedScale;

  const deltaX =
    toPresentationNumber(
      deltaXText,
      "impact_delta_x_scaled"
    ) / fixedScale;

  const deltaY =
    toPresentationNumber(
      deltaYText,
      "impact_delta_y_scaled"
    ) / fixedScale;

  const impactX =
    toPresentationNumber(
      impactXText,
      "impact_x"
    );

  const impactY =
    toPresentationNumber(
      impactYText,
      "impact_y"
    );

  const contactT =
    numeratorText === null
      ? null
      : (
          toPresentationNumber(
            numeratorText,
            "impact_contact_numerator"
          ) /
          toPresentationNumber(
            denominatorText,
            "impact_contact_denominator"
          )
        );

  if (
    contactT !== null &&
    (
      !Number.isFinite(contactT) ||
      contactT < 0 ||
      contactT > 1
    )
  ) {
    fail("impact_contact_parameter");
  }

  return Object.freeze({
    result_sequence:
      resultSequence,

    resolution_id:
      requiredString(
        row.resolution_id,
        "resolution_id"
      ),

    execution_id:
      requiredString(
        row.execution_id,
        "execution_id"
      ),

    shot_command_id:
      requiredString(
        row.shot_command_id,
        "shot_command_id"
      ),

    combat_state_id:
      requiredString(
        row.combat_state_id,
        "combat_state_id"
      ),

    turn_state_id:
      requiredString(
        row.turn_state_id,
        "turn_state_id"
      ),

    match_runtime_id:
      requiredString(
        row.match_runtime_id,
        "match_runtime_id"
      ),

    match_id:
      requiredString(
        row.match_id,
        "match_id"
      ),

    turn_number:
      requiredInteger(
        row.turn_number,
        "turn_number"
      ),

    physics_version:
      requiredInteger(
        row.physics_version,
        "physics_version"
      ),

    outcome,

    impact_exact_version:
      requiredInteger(
        row.impact_exact_version,
        "impact_exact_version"
      ),

    impact_projection_version:
      requiredInteger(
        row.impact_projection_version,
        "impact_projection_version"
      ),

    impact_contact_kind:
      requiredString(
        row.impact_contact_kind,
        "impact_contact_kind"
      ),

    target_account_id:
      nullableIdentity(
        row.target_account_id,
        "target_account_id"
      ),

    damage:
      integerText(
        row.damage,
        "damage"
      ),

    canonical: Object.freeze({
      physics_fixed_scale:
        fixedScaleText,

      start_x_scaled:
        startXText,

      start_y_scaled:
        startYText,

      delta_x_scaled:
        deltaXText,

      delta_y_scaled:
        deltaYText,

      contact_numerator:
        numeratorText,

      contact_denominator:
        denominatorText,

      impact_x:
        impactXText,

      impact_y:
        impactYText,
    }),

    presentation: Object.freeze({
      start_x:
        startX,

      start_y:
        startY,

      delta_x:
        deltaX,

      delta_y:
        deltaY,

      contact_t:
        contactT,

      impact_x:
        impactX,

      impact_y:
        impactY,
    }),
  });
}

export {
  projectCanonicalResultV1,
};
