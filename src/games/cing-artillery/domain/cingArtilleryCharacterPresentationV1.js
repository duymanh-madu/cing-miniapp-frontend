const CHARACTER_PRESENTATION_VERSION_V1 =
  "cing-artillery-character-presentation-v1";

const PARTICIPANT_SLOTS_V1 =
  Object.freeze([
    "player_one",
    "player_two",
  ]);

function fail(
  field
) {
  throw new Error(
    `CHARACTER_PRESENTATION_INVALID_V1:${field}`
  );
}

function normalizeRequiredText(
  value,
  field
) {
  if (
    typeof value !==
      "string" ||
    value.trim() !==
      value ||
    value.length ===
      0
  ) {
    fail(field);
  }

  return value;
}

function normalizeParticipantSlot(
  value
) {
  if (
    !PARTICIPANT_SLOTS_V1.includes(
      value
    )
  ) {
    fail(
      "participant_slot"
    );
  }

  return value;
}

function projectCharacterPresentationV1({
  slot,
  player,
} = {}) {
  const participantSlot =
    normalizeParticipantSlot(
      slot
    );

  if (
    !player ||
    typeof player !==
      "object" ||
    Array.isArray(player)
  ) {
    fail(
      "player"
    );
  }

  const character =
    player.character;

  if (
    !character ||
    typeof character !==
      "object" ||
    Array.isArray(character)
  ) {
    fail(
      "character"
    );
  }

  const characterKey =
    normalizeRequiredText(
      character.character_key,
      "character_key"
    );

  const characterName =
    normalizeRequiredText(
      character.character_name,
      "character_name"
    );

  const gender =
    normalizeRequiredText(
      character.gender,
      "gender"
    );

  return Object.freeze({
    version:
      CHARACTER_PRESENTATION_VERSION_V1,

    participant_slot:
      participantSlot,

    character_key:
      characterKey,

    character_name:
      characterName,

    gender,
  });
}

export {
  CHARACTER_PRESENTATION_VERSION_V1,
  PARTICIPANT_SLOTS_V1,
  projectCharacterPresentationV1,
};
