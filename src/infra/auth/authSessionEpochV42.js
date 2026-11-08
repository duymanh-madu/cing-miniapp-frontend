let epoch=0;
export const authSessionEpochV42=()=>epoch;
export const advanceAuthSessionEpochV42=()=>++epoch;
export function requireAuthSessionEpochV42(expected){if(expected!==epoch)throw Object.assign(new Error('AUTH_SESSION_SUPERSEDED'),{code:'AUTH_SESSION_SUPERSEDED'});}
