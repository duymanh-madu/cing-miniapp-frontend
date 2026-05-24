/**
 * =====================================================
 * RUNTIME LIFECYCLE TYPES
 * =====================================================
 * Central runtime governance contracts.
 * =====================================================
 */

export type RuntimeModuleStatus =
  | "inactive"
  | "bootstrapping"
  | "active"
  | "destroying"
  | "destroyed"
  | "dormant"
  | "deprecated";

export interface RuntimeModuleDefinition {

  key: string;

  domain?: string;

  priority?: number;

  dependencies?: string[];

  status?: RuntimeModuleStatus;

  initialize?: () =>
    Promise<void> | void;

  destroy?: () =>
    Promise<void> | void;

  metadata?: Record<
    string,
    unknown
  >;

}

export interface RuntimeActivationContext {

  source?: string;

  lazy?: boolean;

  route?: string;

  timestamp?: number;

}

export interface RuntimeModuleState {

  key: string;

  status: RuntimeModuleStatus;

  initializedAt?: number;

  destroyedAt?: number;

  activationCount: number;

  lastError?: unknown;

}
