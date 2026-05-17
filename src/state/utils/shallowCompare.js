export function shallowCompare(

  objA,

  objB

) {

  if (
    Object.is(objA, objB)
  ) {

    return true;

  }

  if (
    typeof objA !== "object" ||

    typeof objB !== "object"
  ) {

    return false;

  }

  const keysA =
    Object.keys(objA);

  const keysB =
    Object.keys(objB);

  if (
    keysA.length !==
    keysB.length
  ) {

    return false;

  }

  for (const key of keysA) {

    if (

      !Object.prototype.hasOwnProperty.call(
        objB,
        key
      ) ||

      !Object.is(
        objA[key],
        objB[key]
      )

    ) {

      return false;

    }

  }

  return true;

}