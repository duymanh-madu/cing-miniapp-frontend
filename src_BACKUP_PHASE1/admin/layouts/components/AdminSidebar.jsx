import {
  NavLink,
} from "react-router-dom";

const items = [

  {
  label:
    "Automation",

  path:
    "/admin/automation",
},

{
  label:
    "AI Platform",
    
  path:
    "/admin/ai",
},

  {
  label:
    "Voucher Center",
  path:
    "/admin/vouchers",
},
  {
    label: "Dashboard",
    path: "/admin",
  },
  {
    label: "Campaigns",
    path: "/admin/campaigns",
  },
  {
    label: "CMS",
    path: "/admin/cms",
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
  },
  {
    label: "Members",
    path: "/admin/members",
  },
  {
    label: "Vouchers",
    path: "/admin/vouchers",
  },
  {
    label: "Loyalty",
    path: "/admin/loyalty",
  },
  {
    label: "Games",
    path: "/admin/games",
  },
];

function AdminSidebar() {

  return (
    <aside className="w-72 border-r border-white/10 bg-zinc-950 p-4">

      <div className="text-2xl font-bold mb-8">
        Cing Control Center
      </div>

      <nav className="space-y-2">

        {
          items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="block px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              {item.label}
            </NavLink>
          ))
        }

      </nav>

    </aside>
  );

}

export default AdminSidebar;