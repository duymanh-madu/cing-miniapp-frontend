import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "@/admin/layout/components/AdminSidebar";
import AdminHeader from "@/admin/layout/components/AdminHeader";
import AdminRealtimeStatus from "@/admin/layout/components/AdminRealtimeStatus";

function AdminLayout() {

  return (
    <div className="min-h-screen bg-black text-white flex">

      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <AdminHeader />

        <AdminRealtimeStatus />

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>

      </div>

    </div>
  );

}

export default AdminLayout;