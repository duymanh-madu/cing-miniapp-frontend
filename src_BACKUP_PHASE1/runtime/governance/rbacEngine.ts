import { RuntimeModulePermission, RuntimeRole } from "./governanceTypes";

class RBACEngine {

  private permissions = new Map<string, RuntimeModulePermission>();

  register(permission: RuntimeModulePermission) {
    this.permissions.set(permission.module, permission);
  }

  canAccess(module: string, role: RuntimeRole) {
    const perm = this.permissions.get(module);

    if (!perm) return false;

    return perm.enabled && perm.allowedRoles.includes(role);
  }

  disable(module: string) {
    const perm = this.permissions.get(module);

    if (!perm) return;

    perm.enabled = false;

    this.permissions.set(module, perm);
  }

  getAll() {
    return Array.from(this.permissions.values());
  }
}

export const rbacEngine = new RBACEngine();
