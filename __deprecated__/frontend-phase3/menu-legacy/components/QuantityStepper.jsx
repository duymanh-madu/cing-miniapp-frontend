function QuantityStepper({

  quantity,

  onDecrease,

  onIncrease,

}) {

  return (

    <div
      className="
        flex
        items-center
        gap-3
      "
    >

      <button

        onClick={
          onDecrease
        }

        className="
          flex
          h-9
          w-9

          items-center
          justify-center

          rounded-full

          bg-zinc-800

          text-lg
          font-black
          text-white
        "
      >

        -

      </button>

      <span
        className="
          min-w-[24px]

          text-center

          text-lg
          font-black
          text-white
        "
      >

        {quantity}

      </span>

      <button

        onClick={
          onIncrease
        }

        className="
          flex
          h-9
          w-9

          items-center
          justify-center

          rounded-full

          bg-yellow-500

          text-lg
          font-black
          text-black
        "
      >

        +

      </button>

    </div>

  );

}

export default
  QuantityStepper;