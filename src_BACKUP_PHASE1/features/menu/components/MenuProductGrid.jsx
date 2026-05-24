import ProductCard from "./ProductCard";

import useFilteredMenuProducts from "../shared/hooks/useFilteredMenuProducts";

function MenuProductGrid() {

  const products =
    useFilteredMenuProducts();

  return (
    <div
      className="
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
  );

}

export default
  MenuProductGrid;