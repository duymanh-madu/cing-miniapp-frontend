import {
  NavLink,
}
from "react-router-dom";

function BottomTabbar() {

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        bg-white
      "
    >
      <div
        className="
          mx-auto
          flex
          h-20
          w-full
          max-w-[640px]
        "
      >
        <NavLink
          to="/"
          className="
            flex
            flex-1
            items-center
            justify-center
            font-semibold
          "
        >
          Home
        </NavLink>

        <NavLink
          to="/menu"
          className="
            flex
            flex-1
            items-center
            justify-center
            font-semibold
          "
        >
          Menu
        </NavLink>
      </div>
    </nav>
  );

}

export default
  BottomTabbar;