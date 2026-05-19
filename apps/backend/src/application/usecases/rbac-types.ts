export type UserRoleWithPermissions = {
  role: {
    permissions: Array<{
      permission: {
        name: string;
      };
    }>;
  };
};
