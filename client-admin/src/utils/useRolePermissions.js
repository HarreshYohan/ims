import roleAccess from '../config/roleAccessConfig.json';
import {jwtDecode} from 'jwt-decode';

export const useRolePermissions = (pageKey) => {
  const token = localStorage.getItem("authToken");
  let role = 'guest';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role || 'guest';
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const permissions = roleAccess[pageKey]?.[role] || {
    can_edit: false,
    can_delete: false,
    can_create: false,
  };

  return permissions;
};
