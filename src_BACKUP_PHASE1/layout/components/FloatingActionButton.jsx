import {
  memo,
} from "react";

function FloatingActionButton({

  onClick,

  children,

}) {

  return (

    <button
      onClick={onClick}
      className="

        fixed
        bottom-24
        right-4

        z-40

        flex
        items-center
        justify-center

        rounded-full

        bg-black
        text-white

        p-4

        shadow-lg

        active:scale-95

      "
    >

      {children}

    </button>

  );

}

export default memo(
  FloatingActionButton
);