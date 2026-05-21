import useAdminSession from "@/admin/shared/hooks/useAdminSession";

function AdminHeader() {

  const session = useAdminSession();

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-xl">

      <div>
        Admin Operating Platform
      </div>

      <div className="flex items-center gap-3">

        <div className="text-sm opacity-70">
          {session?.email}
        </div>

      </div>

    </header>
  );

}

export default AdminHeader;