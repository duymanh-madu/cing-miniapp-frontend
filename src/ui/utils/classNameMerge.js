export function classNameMerge(
  ...classes
) {

  return classes
    .filter(Boolean)
    .join(" ");

}