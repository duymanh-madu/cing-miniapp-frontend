import {
  useEffect,
  useState,
} from "react";

import apiClient from "@/infra/api/apiClient";

function MenuPage() {

  const [
    items,
    setItems,
  ] = useState([]);

  useEffect(() => {

    async function load() {

      try {

        const response =
          await apiClient.get(
            "/menu"
          );

        console.log(
          response.data
        );

        setItems(
          response.data
            ?.items || []
        );

      } catch (error) {

        console.error(
          error
        );

      }

    }

    load();

  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-5">

      <h1 className="text-6xl font-bold mb-10">
        Menu
      </h1>

      <div className="grid grid-cols-2 gap-5">

        {items.map(
          (item) => (

            <div
              key={item.id}
              className="
                bg-zinc-900
                rounded-3xl
                overflow-hidden
              "
            >

              <img
                src={item.image}
                alt={item.name}
                className="
                  w-full
                  h-52
                  object-cover
                "
              />

              <div className="p-4">

                <h2 className="text-2xl font-bold">
                  {item.name}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {item.description}
                </p>

                <div className="mt-4 text-yellow-400 text-xl font-bold">
                  {item.price.toLocaleString()}đ
                </div>

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );

}

export default
  MenuPage;