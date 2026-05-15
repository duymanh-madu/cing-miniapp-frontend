import useAdminRealtime from "@/admin/realtime/hooks/useAdminRealtime";

function AdminRealtimeStatus() {

  const realtime = useAdminRealtime();

  return (
    <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between text-xs bg-black">

      <div>
        Socket: {
          realtime.connected
            ? "CONNECTED"
            : "DISCONNECTED"
        }
      </div>

      <div>
        Latency: {realtime.latency}ms
      </div>

    </div>
  );

}

export default AdminRealtimeStatus;