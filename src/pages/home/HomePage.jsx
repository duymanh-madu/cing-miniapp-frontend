import {
  Link,
} from "react-router-dom";

function HomePage() {

  return (

    <div
      className="
        min-h-screen
        bg-black
        p-6
        text-white
      "
    >

      <div
        className="
          mb-8
          text-4xl
          font-black
        "
      >
        Cing Hu Tang
      </div>

      <div
        className="
          mb-10
          text-zinc-400
        "
      >
        Ultra Fast Zalo Mini App
      </div>

      <div
        className="
          grid
          gap-4
        "
      >

        <Link
          to="/menu"
          className="
            rounded-2xl
            bg-zinc-900
            p-5
          "
        >
          Menu
        </Link>

        <Link
          to="/game"
          className="
            rounded-2xl
            bg-zinc-900
            p-5
          "
        >
          Mini Game
        </Link>

        <Link
          to="/voucher"
          className="
            rounded-2xl
            bg-zinc-900
            p-5
          "
        >
          Voucher
        </Link>

      </div>

    </div>

  );

}

export default
  HomePage;