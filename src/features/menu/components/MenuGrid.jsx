import useMenu from "../hooks/useMenu";

import SurfaceCard from "@/components/ui/SurfaceCard";

/**
 * =========================================================
 * MENU GRID
 * =========================================================
 */

function MenuGrid() {

  const {
    data = [],
    isLoading,
  } = useMenu();

  if (
    isLoading
  ) {

    return (
      <div>
        Đang tải menu...
      </div>
    );

  }

  return (

    <div
      className="
        mt-6
        grid
        grid-cols-2
        gap-4
      "
    >

      {

        data.map(
          (
            item
          ) => (

            <SurfaceCard
              key={item.id}
            >

              <div
                className="
                  overflow-hidden
                  rounded-t-[28px]
                "
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="
                    h-[180px]
                    w-full
                    object-cover
                  "
                />

              </div>

              <div
                className="
                  p-4
                "
              >

                <h3
                  className="
                    line-clamp-2
                    text-sm
                    font-bold
                  "
                >
                  {item.name}
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    font-semibold
                    text-[#ff7a00]
                  "
                >
                  {item.price?.toLocaleString()}đ
                </p>

              </div>

            </SurfaceCard>

          )
        )

      }

    </div>

  );

}

export default
  MenuGrid;