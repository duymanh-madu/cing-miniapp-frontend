function ProductCard({
  product,
}) {

  if (
    !product
  ) {

    return null;

  }

  return (
    <article
      className="
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
      "
    >
      <img
        src={
          product.image
        }
        alt={
          product.name
        }
        className="
          aspect-square
          w-full
          object-cover
        "
      />

      <div
        className="
          p-4
        "
      >
        <h3
          className="
            line-clamp-2
            font-bold
          "
        >
          {product.name}
        </h3>

        <p
          className="
            mt-2
            text-lg
            font-black
          "
        >
          {product.price}
        </p>
      </div>
    </article>
  );

}

export default
  ProductCard;