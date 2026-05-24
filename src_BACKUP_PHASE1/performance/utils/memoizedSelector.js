export function memoizedSelector(

  selector

) {

  let previous =
    null;

  return (state) => {

    const next =
      selector(state);

    if (

      JSON.stringify(previous) ===
      JSON.stringify(next)

    ) {

      return previous;

    }

    previous =
      next;

    return next;

  };

}