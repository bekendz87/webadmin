export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['create', 'read', 'update', 'delete', 'manage'],
  [USER_ROLES.MANAGER]: ['create', 'read', 'update', 'delete'],
  [USER_ROLES.USER]: ['read', 'update'],
  [USER_ROLES.GUEST]: ['read'],
} as const;