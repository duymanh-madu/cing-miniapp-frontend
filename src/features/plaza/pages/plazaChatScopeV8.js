// World loudspeakers and private messages have no transport yet. Never treat
// the lobby as a global room, and never reuse history from a previous room.
export function selectPlazaRoomChatV8(room,messages){
 if(!room?.roomId)return [];
 return (messages||[]).filter(message=>message.roomId===room.roomId);
}
