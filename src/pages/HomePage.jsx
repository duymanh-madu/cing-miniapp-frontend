function HomePage() {

  return (

    <div
      className="
        space-y-6
      "
    >

      {/* HERO */}

      <section
        className="
          rounded-4xl
          bg-orange-400
          p-6
          text-white
          shadow-xl
        "
      >

        <h1
          className="
            text-3xl
            font-bold
          "
        >
          Cing Hu Tang
        </h1>

        <p
          className="
            mt-2
            text-white/90
          "
        >
          Mini App đang hoạt động
        </p>

      </section>

      {/* CARD */}

      <section
        className="
          rounded-4xl
          bg-white
          p-5
          shadow-lg
        "
      >

        <h2
          className="
            text-xl
            font-bold
            text-gray-800
          "
        >
          Menu Hot
        </h2>

        <p
          className="
            mt-2
            text-gray-500
          "
        >
          Trà sữa premium thế hệ mới
        </p>

      </section>

    </div>

  );

}

export default HomePage;