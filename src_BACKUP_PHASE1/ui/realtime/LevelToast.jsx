export default function LevelToast({

  toast,

}) {

  return (

    <div
      className="

        px-6
        py-5

        rounded-3xl

        bg-gradient-to-r
        from-yellow-400
        to-orange-500

        text-black

        shadow-2xl

        border-4
        border-white

      "
    >

      <div
        className="

          text-xs
          uppercase
          font-black

        "
      >

        LEVEL UP

      </div>

      <div
        className="

          text-4xl
          font-black

          mt-2

        "
      >

        Lv.{toast.level}

      </div>

    </div>

  );

}