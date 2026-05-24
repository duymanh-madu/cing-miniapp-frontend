export type RuntimeRole =
  | "ADMIN"
  | "STAFF"
  | "SYSTEM"
  | "GUEST";

export type RuntimeFeatureFlagStatus =
  | "ENABLED"
  | "DISABLED";

export interface RuntimeFeatureFlag {
  key: string;
  status: RuntimeFeatureFlagStatus;
  roles?: RuntimeRole[];
}

export interface RuntimeModulePermission {
  module: string;
  allowedRoles: RuntimeRole[];
  enabled: boolean;
}
