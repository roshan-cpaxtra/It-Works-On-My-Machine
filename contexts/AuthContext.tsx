'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'MANAGER' | 'WORKER' | 'VIEWER';

// API Response Types
export interface ApiPermission {
  id: string;
  resource: string;
  permission: 'read' | 'write' | 'view';
  description: string;
}

export interface ApiRole {
  id: string;
  name: UserRole;
  permissions: ApiPermission[];
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    username: string;
    issuedAt: string;
    expiresAt: string;
    role: ApiRole;
  };
  correlationId: string;
  timestamp: string;
}

// Simplified permission system: view and write for each module
export interface ModulePermissions {
  view: boolean;
  write: boolean;
}

export interface Permissions {
  users: ModulePermissions;
  products: ModulePermissions;
  warehouse: ModulePermissions;
  reports: ModulePermissions;
  settings: ModulePermissions;
}

export interface RoleConfig {
  role: UserRole;
  permissions: Permissions;
  color: string;
  icon: string;
  description: string;
}

// Map API resource names to our module names
const resourceToModuleMap: Record<string, keyof Permissions> = {
  user: 'users',
  users: 'users',
  product: 'products',
  products: 'products',
  warehouse: 'warehouse',
  report: 'reports',
  reports: 'reports',
  setting: 'settings',
  settings: 'settings',
};

// Convert API permissions array to our ModulePermissions structure
const mapApiPermissionsToModulePermissions = (apiPermissions: ApiPermission[]): Permissions => {
  const permissions: Permissions = {
    users: { view: false, write: false },
    products: { view: false, write: false },
    warehouse: { view: false, write: false },
    reports: { view: false, write: false },
    settings: { view: false, write: false },
  };

  apiPermissions.forEach((apiPerm) => {
    const moduleName = resourceToModuleMap[apiPerm.resource.toLowerCase()];
    if (moduleName) {
      // Set view permission for 'read' or 'view'
      if (apiPerm.permission === 'read' || apiPerm.permission === 'view') {
        permissions[moduleName].view = true;
      }
      // Set write permission for 'write'
      if (apiPerm.permission === 'write') {
        permissions[moduleName].write = true;
        // Write permission implies view permission
        permissions[moduleName].view = true;
      }
    }
  });

  return permissions;
};

// Admin gets full access (view + write), all other roles get view only
// This is used for mock login, real login will use mapApiPermissionsToModulePermissions
const getPermissionsForRole = (role: UserRole): Permissions => {
  if (role === 'ADMIN') {
    // ADMIN: Full access to everything
    return {
      users: { view: true, write: true },
      products: { view: true, write: true },
      warehouse: { view: true, write: true },
      reports: { view: true, write: true },
      settings: { view: true, write: true },
    };
  } else {
    // ELSE: All other roles get view-only access
    return {
      users: { view: true, write: false },
      products: { view: true, write: false },
      warehouse: { view: true, write: false },
      reports: { view: true, write: false },
      settings: { view: true, write: false },
    };
  }
};

// Generate role configs dynamically - ADMIN gets full access, all others get view-only
const roles: UserRole[] = ['ADMIN', 'MANAGER', 'WORKER', 'VIEWER'];

export const ROLE_PERMISSIONS: RoleConfig[] = roles.map((role) => {
  const isAdmin = role === 'ADMIN';
  return {
    role,
    permissions: getPermissionsForRole(role), // Uses ADMIN vs ELSE logic
    color: isAdmin ? '#dc004e' : '#1976d2',
    icon: isAdmin ? '👑' : '👁️',
    description: isAdmin ? 'Full access - Read & Write' : 'View only access',
  };
});

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  loginWithApiResponse: (apiResponse: LoginApiResponse) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  canView: (module: keyof Permissions) => boolean;
  canWrite: (module: keyof Permissions) => boolean;
  getUserPermissions: () => Permissions | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserStr = localStorage.getItem('user');

    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        // Check if it's the new API format
        if (savedUser.token || savedUser.permission) {
          setUser({
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            token: savedUser.token,
          });
          setIsAuthenticated(true);
        } else {
          // Old format
          setUser(savedUser);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (email: string, password: string, role: UserRole) => {
    // Mock login - in real app, this would call an API
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
    };

    setUser(newUser);
    setIsAuthenticated(true);

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const loginWithApiResponse = (apiResponse: LoginApiResponse) => {
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Login failed');
    }

    const { data } = apiResponse;

    // Create user object from API response
    const newUser: User = {
      id: data.sessionId,
      name: data.username,
      email: data.username,
      role: data.role.name,
      token: data.accessToken,
    };

    setUser(newUser);
    setIsAuthenticated(true);

    // Save comprehensive user data to localStorage
    const userDataToStore = {
      id: data.sessionId,
      name: data.username,
      email: data.username,
      role: data.role.name,
      token: data.accessToken,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sessionId: data.sessionId,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      permissions: data.role.permissions,
    };

    console.log('🔐 Storing user data in localStorage:', userDataToStore);
    localStorage.setItem('user', JSON.stringify(userDataToStore));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('user');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);

      // Update localStorage
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          savedUser.role = role;
          localStorage.setItem('user', JSON.stringify(savedUser));
        } catch (e) {
          console.error('Error updating role:', e);
        }
      }
    }
  };

  const getUserPermissions = (): Permissions | null => {
    if (!user) return null;

    // Try to get permissions from API response stored in localStorage
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.permission && Array.isArray(savedUser.permission)) {
          return mapApiPermissionsToModulePermissions(savedUser.permission);
        }
      } catch (e) {
        console.error('Error parsing user permissions:', e);
      }
    }

    // Fallback to role-based permissions for mock login
    const roleData = ROLE_PERMISSIONS.find(rp => rp.role === user.role);
    return roleData?.permissions || null;
  };

  const canView = (module: keyof Permissions): boolean => {
    const permissions = getUserPermissions();
    return permissions?.[module]?.view || false;
  };

  const canWrite = (module: keyof Permissions): boolean => {
    const permissions = getUserPermissions();
    return permissions?.[module]?.write || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole: user?.role || null,
        isAuthenticated,
        login,
        loginWithApiResponse,
        logout,
        switchRole,
        canView,
        canWrite,
        getUserPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
