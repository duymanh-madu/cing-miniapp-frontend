import {
  useEffect,
  useState,
} from "react";

import dynamicMenuRuntime from "@/cms/runtime/dynamicMenuRuntime";

function MenuPage() {

  const [
    menu,
    setMenu,
  ] = useState([]);

  useEffect(() => {

    async function load() {

      const response =
        await dynamicMenuRuntime
          .getMenu();

      setMenu(
        response
      );

    }

    load();

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-black
        p-5
        text-white
      "
    >

      <div
        className="
          mb-6
          text-4xl
          font-black
        "
      >
        Menu
      </div>

      <div
        className="
          grid
          gap-4
        "
      >

        {
          menu.map(
            (
              item
            ) => (

              <div
                key={
                  item.id
                }
                className="
                  rounded-3xl
                  bg-zinc-900
                  p-5
                "
              >

                <div
                  className="
                    text-xl
                    font-bold
                  "
                >
                  {
                    item.name
                  }
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    opacity-70
                  "
                >
                  {
                    item.price
                      ?.toLocaleString?.()
                  }
                  đ
                </div>

              </div>

            )
          )
        }

      </div>

    </div>

  );

}

export default
  MenuPage;