class RolePermissionService {

  canAccess({
    permissions = [],
    requiredPermission,
  }) {

    return permissions.includes(
      requiredPermission
    );

  }

}

const rolePermissionService =
  new RolePermissionService();

export default
  rolePermissionService;