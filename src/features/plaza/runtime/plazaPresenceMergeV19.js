// Keep immutable membership snapshots stable for unchanged presence packets.
// Socket.IO may repeat unchanged idle/seat state; these repeats must not wake
// React subscribers or re-feed identical samples into the 3D scene.
function sameFields(left, right) {
  if (!left || !right) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every(key => Object.is(left[key], right[key]));
}

export function mergePlazaPresenceV19(snapshot, payload) {
  if (!payload || !Array.isArray(payload.members)) return null;
  const previous = snapshot.members || [];
  const previousById = new Map(previous.map(member => [member.memberId, member]));
  const next = new Map(payload.full ? [] : previousById);

  for (const id of Array.isArray(payload.removed) ? payload.removed : []) next.delete(id);

  for (const value of payload.members) {
    if (typeof value?.memberId !== 'string' || !Number.isSafeInteger(value.seq)) continue;
    const old = next.get(value.memberId);
    if (old && !(
      (value.presenceId && old.presenceId !== value.presenceId) ||
      value.seq > old.seq ||
      (value.seq === old.seq &&
        (value.motion === 'idle' || value.motion === 'sit' ||
          value.seatId !== old.seatId ||
          value.identityRevision !== old.identityRevision))
    )) continue;

    const merged = { ...old, ...value };
    const before = old || (payload.full ? previousById.get(value.memberId) : null);
    next.set(value.memberId, sameFields(before, merged) ? before : merged);
  }

  const members = [...next.values()];
  if (payload.selfId === snapshot.selfId &&
      members.length === previous.length &&
      members.every((member, index) => member === previous[index])) return null;

  return { selfId: payload.selfId, members: Object.freeze(members) };
}
