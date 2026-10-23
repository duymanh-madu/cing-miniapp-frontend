import queryRealtimeSync from "@/services/query/queryRealtimeSync";
export function connectMembershipRealtime({socket}) {
  const points = payload => queryRealtimeSync.applyMembershipPoints(payload);
  const tier = payload => queryRealtimeSync.applyMembershipUpdated(payload);
  socket.on("membership.points", points);
  socket.on("membership.tier", tier);
  return () => { socket.off("membership.points", points); socket.off("membership.tier", tier); };
}
