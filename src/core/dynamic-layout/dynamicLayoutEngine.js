class DynamicLayoutEngine {

  resolve({
    layout,
    screen,
  }) {

    if (
      screen ===
      "mobile"
    ) {

      return layout.mobile;

    }

    if (
      screen ===
      "tablet"
    ) {

      return layout.tablet;

    }

    return layout.desktop;

  }

}

const dynamicLayoutEngine =
  new DynamicLayoutEngine();

export default
  dynamicLayoutEngine;