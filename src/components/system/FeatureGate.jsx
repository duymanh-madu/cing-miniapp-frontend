import useFeatureAccess from "../../shared/hooks/useFeatureAccess";

/**
 * ============================================
 * FEATURE GATE
 * ============================================
 */

function FeatureGate({
  feature,

  fallback = null,

  children,
}) {
  const enabled =
    useFeatureAccess(
      feature
    );

  if (!enabled) {
    return fallback;
  }

  return children;
}

export default FeatureGate;