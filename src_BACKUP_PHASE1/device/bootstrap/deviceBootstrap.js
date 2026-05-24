import {
  applySafeViewportHeight,
} from "../services/mobileViewportService";

export function bootstrapDeviceLayer() {

  applySafeViewportHeight();

  console.log(
    "📱 Device layer booted"
  );

}