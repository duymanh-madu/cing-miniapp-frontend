import { routeManifest } from "@/app/routeManifest";

export function validateRoutes() {
  const errors = [];

  routeManifest.forEach(route => {
    if (!route.path || !route.loader) {
      errors.push(route.key);
    }
  });

  if (errors.length > 0) {
    console.error("[ROUTE INVALID]", errors);
  }

  return errors.length === 0;
}