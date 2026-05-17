export default function ComboToast({

  toast,

}) {

  return (

    <div
      className="

        px-5
        py-4

        rounded-3xl

        bg-red-500
        text-white

        shadow-2xl

        border-4
        border-yellow-300

        animate-pulse

      "
    >

      <div
        className="

          text-xs
          font-bold
          uppercase

          opacity-80

        "
      >

        COMBO

      </div>

      <div
        className="

          text-3xl
          font-black

        "
      >

        x{toast.combo}

      </div>

    </div>

  );

}