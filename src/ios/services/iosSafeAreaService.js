export function applyIosSafeArea() {

  document.documentElement
    .style
    .setProperty(

      "--safe-top",

      "env(safe-area-inset-top)"

    );

  document.documentElement
    .style
    .setProperty(

      "--safe-bottom",

      "env(safe-area-inset-bottom)"

    );

}