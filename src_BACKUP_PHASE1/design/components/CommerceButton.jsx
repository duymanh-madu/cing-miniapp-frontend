import {
  memo,
} from "react";

function CommerceButton({

  children,

  onClick,

  variant = "primary",

}) {

  const variants = {

    primary:

      "bg-black text-white",

    secondary:

      "bg-neutral-100 text-black",

    danger:

      "bg-red-600 text-white",

  };

  return (

    <button
      onClick={onClick}
      className={`

        h-11

        rounded-2xl

        px-5

        text-sm
        font-medium

        transition-all

        active:scale-[0.98]

        ${variants[variant]}

      `}
    >

      {children}

    </button>

  );

}

export default memo(
  CommerceButton
);