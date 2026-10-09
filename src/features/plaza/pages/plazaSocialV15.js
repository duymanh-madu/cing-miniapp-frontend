export function roomNameV15(value) {
  return typeof value === 'string' ? value.normalize('NFC').trim() : '';
}
export function validRoomNameV15(value) {
  const name = roomNameV15(value);
  return Boolean(name) && [...name].length <= 30 && !/[\u0000-\u001f\u007f]/u.test(value);
}
export function findRoomNumberV15(rooms, value) {
  const input = String(value).trim();
  if (!/^\d{1,12}$/.test(input)) return {error: 'Nhập số phòng, ví dụ 02.'};
  const number = Number(input);
  if (!Number.isSafeInteger(number) || number < 1) return {error: 'Số phòng phải lớn hơn 0.'};
  const room = rooms.find(r => r.roomNumber === number && r.memberCount > 0);
  if (!room) return {error: 'Phòng này hiện không có người hoặc đã đóng.'};
  if (room.memberCount >= room.capacity) return {error: 'Phòng đã đủ người. Hãy chọn phòng khác.'};
  return {room};
}
export function latestRegionalMessageV15(roomId, messages) {
  if (!roomId) return null;
  return messages.filter(m => m.roomId === roomId && typeof m.body === 'string')
    .reduce((latest, m) => !latest || m.createdAt > latest.createdAt ? m : latest, null);
}
export function selectRosterV15(room, roster) {
  if (!room || !Array.isArray(roster)) return [];
  const seen = new Set();
  return roster.filter(m => typeof m.memberId === 'string' && !seen.has(m.memberId) && seen.add(m.memberId))
    .slice(0, room.capacity || 30);
}
