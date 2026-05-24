class SelfHealing {

  private disabledModules = new Set<string>();

  disable(module: string) {
    this.disabledModules.add(module);
  }

  isDisabled(module: string) {
    return this.disabledModules.has(module);
  }

  recover(module: string) {
    this.disabledModules.delete(module);
  }

}

export const selfHealing = new SelfHealing();
