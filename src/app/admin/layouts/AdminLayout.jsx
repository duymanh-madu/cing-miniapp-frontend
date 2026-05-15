import AdminSidebar from "../components/AdminSidebar";

function AdminLayout({
  children,
}) {

  return (

    <div
      className="
        flex
        min-h-screen
        bg-[#f5f7fb]
      "
    >

      <AdminSidebar />

      <main
        className="
          flex-1
          overflow-x-hidden
          p-6
        "
      >

        {children}

      </main>

    </div>

  );

}

export default
  AdminLayout;