import { client } from '../../api/client';

export interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  userLevel: UserLevel | null;
  isActive: boolean;
  phone?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLevel {
  id: number;
  name: string;
  code: string;
  description?: string;
  hierarchy: number;
  isActive: boolean;
}

export interface Module {
  id: number;
  code: string;
  name: string;
  description?: string;
  routePrefix?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UserLevelPermission {
  id?: number;
  moduleId: number;
  module?: Module;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canPrint: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const usersApi = {
  getAll: async (page = 0, size = 15, search?: string): Promise<PageResponse<User>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append('search', search);
    const response = await client.get(`/api/v1/users?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await client.get(`/api/v1/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User> & { password: string; userLevelId?: number }): Promise<User> => {
    const response = await client.post('/api/v1/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User> & { password?: string; userLevelId?: number }): Promise<User> => {
    const response = await client.put(`/api/v1/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/v1/users/${id}`);
  },

  activate: async (id: number): Promise<User> => {
    const response = await client.post(`/api/v1/users/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: number): Promise<User> => {
    const response = await client.post(`/api/v1/users/${id}/deactivate`);
    return response.data;
  },

  changePassword: async (id: number, password: string): Promise<void> => {
    await client.put(`/api/v1/users/${id}/password`, { password });
  },
};

export const userLevelsApi = {
  getAll: async (page = 0, size = 15): Promise<PageResponse<UserLevel>> => {
    const response = await client.get(`/api/v1/user-levels?page=${page}&size=${size}`);
    return response.data;
  },

  getActive: async (): Promise<UserLevel[]> => {
    const response = await client.get('/api/v1/user-levels/active');
    return response.data;
  },

  getById: async (id: number): Promise<UserLevel> => {
    const response = await client.get(`/api/v1/user-levels/${id}`);
    return response.data;
  },

  create: async (data: Partial<UserLevel>): Promise<UserLevel> => {
    const response = await client.post('/api/v1/user-levels', data);
    return response.data;
  },

  update: async (id: number, data: Partial<UserLevel>): Promise<UserLevel> => {
    const response = await client.put(`/api/v1/user-levels/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/v1/user-levels/${id}`);
  },

  getPermissions: async (id: number): Promise<UserLevelPermission[]> => {
    const response = await client.get(`/api/v1/user-levels/${id}/permissions`);
    return response.data;
  },

  updatePermissions: async (id: number, permissions: UserLevelPermission[]): Promise<void> => {
    await client.post(`/api/v1/user-levels/${id}/permissions`, { permissions });
  },
};

export const modulesApi = {
  getAll: async (): Promise<Module[]> => {
    const response = await client.get('/api/v1/modules');
    return response.data;
  },

  getActive: async (): Promise<Module[]> => {
    const response = await client.get('/api/v1/modules/active');
    return response.data;
  },

  getById: async (id: number): Promise<Module> => {
    const response = await client.get(`/api/v1/modules/${id}`);
    return response.data;
  },

  create: async (data: Partial<Module>): Promise<Module> => {
    const response = await client.post('/api/v1/modules', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Module>): Promise<Module> => {
    const response = await client.put(`/api/v1/modules/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/api/v1/modules/${id}`);
  },
};
