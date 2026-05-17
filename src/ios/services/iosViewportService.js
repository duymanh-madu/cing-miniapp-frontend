export function applyIosViewportFix() {

  const appHeight =
    window.innerHeight;

  document.documentElement
    .style
    .setProperty(

      "--app-height",

      `${appHeight}px`

    );

}