function selectProducts(
  state
) {

  return state.productIds
    .map(
      (id) =>
        state.productsById[
          id
        ]
    )
    .filter(Boolean);

}

function selectFeaturedProducts(
  state
) {

  return state.featuredIds
    .map(
      (id) =>
        state.productsById[
          id
        ]
    )
    .filter(Boolean);

}

export {

  selectProducts,

  selectFeaturedProducts,

};