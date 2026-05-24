import {
  applyIosSafeArea,
} from "../services/iosSafeAreaService";

import {
  applyIosViewportFix,
} from "../services/iosViewportService";

export function bootstrapIosLayer() {

  applyIosSafeArea();

  applyIosViewportFix();

  console.log(
    "🍎 iOS safe-area layer booted"
  );

}