export default function MenuCard({

  item,

}) {

  return (

    <div
      className="
        rounded-[28px]
        bg-white
        overflow-hidden
        shadow-sm
        border
        border-orange-100
      "
    >

      <div
        className="
          aspect-square
          bg-orange-100
        "
      />

      <div
        className="p-4"
      >

        <h3
          className="
            font-semibold
            text-[#2B2B2B]
          "
        >
          {item.name}
        </h3>

        <p
          className="
            text-sm
            text-neutral-500
            mt-1
          "
        >
          {item.description}
        </p>

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              font-bold
              text-orange-500
            "
          >
            {item.price}đ
          </span>

          <button
            className="
              h-10
              px-4
              rounded-full
              bg-orange-500
              text-white
              text-sm
              font-medium
            "
          >
            Thêm
          </button>

        </div>

      </div>

    </div>

  );

}