import {
  memo,
} from "react";

function RemoteBannerBlock({

  banner,

}) {

  return (

    <div
      className="

        overflow-hidden

        rounded-3xl

        bg-white

        shadow-sm

      "
    >

      <img
        src={banner.image}
        alt={banner.title}
        className="

          h-44
          w-full

          object-cover

        "
      />

      <div
        className="p-4"
      >

        <h3
          className="

            text-sm
            font-semibold

          "
        >

          {banner.title}

        </h3>

      </div>

    </div>

  );

}

export default memo(
  RemoteBannerBlock
);