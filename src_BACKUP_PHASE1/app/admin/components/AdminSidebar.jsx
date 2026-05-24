import {
  NavLink,
} from "react-router-dom";

const items = [

  {
    label:
      "Dashboard",

    path:
      "/admin",
  },

  {
    label:
      "Campaigns",

    path:
      "/admin/campaigns",
  },

  {
    label:
      "Loyalty",

    path:
      "/admin/loyalty",
  },

  {
    label:
      "Analytics",

    path:
      "/admin/analytics",
  },

  {
    label:
      "CMS",

    path:
      "/admin/cms",
  },

];

function AdminSidebar() {

  return (

    <aside
      className="
        w-[240px]
        border-r
        border-[#e5e7eb]
        bg-white
        p-5
      "
    >

      <div
        className="
          mb-8
          text-xl
          font-black
        "
      >
        Cing Admin
      </div>

      <div
        className="
          flex
          flex-col
          gap-2
        "
      >

        {

          items.map(
            (
              item
            ) => (

              <NavLink
                key={
                  item.path
                }

                to={
                  item.path
                }

                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-[#374151]
                  transition-all
                  hover:bg-[#f3f4f6]
                "
              >
                {item.label}
              </NavLink>

            )
          )

        }

      </div>

    </aside>

  );

}

export default
  AdminSidebar;