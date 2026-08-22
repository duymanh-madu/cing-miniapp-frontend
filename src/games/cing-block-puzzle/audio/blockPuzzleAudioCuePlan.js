function finitePositiveInteger(
  value
) {
  return (
    Number.isSafeInteger(value) &&
    value > 0
  );
}

/*
 * Presentation-only cue planning.
 *
 * This module never derives gameplay state,
 * score or combo authority.
 *
 * It consumes the immutable engine
 * presentation event only.
 */
export function
createBlockPuzzleAudioCuePlan(
  event
) {
  if (
    !event ||
    event.type !==
      "piece_placed"
  ) {
    return Object.freeze([]);
  }

  const cues = [
    Object.freeze({
      type:
        "placement",
    }),
  ];

  if (
    finitePositiveInteger(
      event.lineCount
    )
  ) {
    cues.push(
      Object.freeze({
        type:
          "line_clear",

        lineCount:
          event.lineCount,
      })
    );
  }

  if (
    event.comboAdvanced ===
      true &&
    finitePositiveInteger(
      event.combo
    )
  ) {
    cues.push(
      Object.freeze({
        type:
          "combo",

        combo:
          event.combo,
      })
    );
  }

  return Object.freeze(
    cues
  );
}
