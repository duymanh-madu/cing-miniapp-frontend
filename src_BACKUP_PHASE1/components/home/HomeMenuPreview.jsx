import ProductCard from "@/features/menu/components/ProductCard";

import useFeaturedProducts from "@/features/menu/shared/hooks/useFeaturedProducts";

function HomeMenuPreview() {

  const products =
    useFeaturedProducts();

  return (
    <section
      className="
        mt-8
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <h2
          className="
            text-xl
            font-bold
          "
        >
          Best Seller
        </h2>
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-4
        "
      >
        {products.map(
          (product) => (

            <ProductCard
              key={
                product.id
              }
              product={
                product
              }
            />

          )
        )}
      </div>
    </section>
  );

}

export default
  HomeMenuPreview;