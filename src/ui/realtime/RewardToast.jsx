export default function RewardToast({

  toast,

}) {

  return (

    <div
      className="

        px-5
        py-4

        rounded-3xl

        bg-gradient-to-r
        from-purple-500
        to-pink-500

        text-white

        shadow-2xl

      "
    >

      <div
        className="

          text-xs
          uppercase
          font-bold

          opacity-80

        "
      >

        Reward Unlocked

      </div>

      <div
        className="

          text-lg
          font-black

          mt-1

        "
      >

        🎁 {toast.message}

      </div>

    </div>

  );

}