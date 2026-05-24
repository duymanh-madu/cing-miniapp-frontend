class PermissionEngine {

  hasPermission({
    permissions,
    required,
  }) {

    if (!required) {
      return true;
    }

    return permissions.includes(required);

  }

}

const permissionEngine =
  new PermissionEngine();

export default permissionEngine;