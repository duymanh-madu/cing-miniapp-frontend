/**
 * =====================================================
 * ROUTE PREFETCH SERVICE
 * =====================================================
 * WebView optimized:
 * - hover prefetch
 * - touch prefetch
 * - instant navigation
 * =====================================================
 */

const prefetchedRoutes =
  new Set();

export async function prefetchRoute(
  routeKey,
  importer
) {

  if (
    prefetchedRoutes.has(
      routeKey
    )
  ) {

    return;

  }

  prefetchedRoutes.add(
    routeKey
  );

  await importer();

}
