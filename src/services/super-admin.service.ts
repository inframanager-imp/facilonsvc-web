import { apiClient } from '../utils/apiClient';
import { AuthorizedUserDto } from '../models/AuthorizedUserDto';
import { RoleListDto } from '../models/RoleListDto';

export interface TenantDto {
  tenantId: number;
  tenantName: string;
  emailDomain: string;
  address: string;
  state: string;
  postalCode: string;
  active: boolean;
  country: string;
  createdAt: string;
  updatedAt: string;
  totalUsers: number;
}

export interface UserGroupDto {
  groupId: number;
  groupName: string;
  description: string;
  tenantId: number;
  isActive: boolean;
}

export interface SuperAdminDashboardDto {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalUserGroups: number;
  recentTenants: TenantDto[];
  recentUsers: SuperAdminUserDto[];
  availableRoles: RoleListDto[];
}

export interface SuperAdminUserDto {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
  mobilePhone: string;
  loginId: string;
  active: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  tenantId: number | null;
  tenantName: string;
  roles: string[];
  userGroups: string[];
}

export interface SuperAdminRoleDto {
  id: number;
  label: string;
  parentListId: number;
  sequenceNo: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: number;
  tenantName: string;
  authorities: string[];
}

export interface SuperAdminUserGroupDto {
  id: number;
  groupName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  tenantId: number;
  tenantName: string;
  roles: string[];
}

class SuperAdminService {
  private apiUrl = '/api/super-admin';

  // Dashboard
  getDashboard() {
    return apiClient.get<SuperAdminDashboardDto>(`${this.apiUrl}/dashboard`);
  }

  // Tenant Management
  getTenants(page: number = 0, size: number = 10) {
    return apiClient.get<{
      content: TenantDto[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`${this.apiUrl}/tenants`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  getTenantById(tenantId: number) {
    return apiClient.get<TenantDto>(`${this.apiUrl}/tenants/${tenantId}`);
  }

  createTenant(tenant: Partial<TenantDto>) {
    return apiClient.post<TenantDto>(`${this.apiUrl}/tenants`, tenant);
  }

  updateTenant(tenantId: number, tenant: Partial<TenantDto>) {
    return apiClient.put<TenantDto>(`${this.apiUrl}/tenants/${tenantId}`, tenant);
  }

  deleteTenant(tenantId: number) {
    return apiClient.delete(`${this.apiUrl}/tenants/${tenantId}`);
  }

  // User Management
  getUsers(page: number = 0, size: number = 10) {
    return apiClient.get<{
      content: SuperAdminUserDto[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`${this.apiUrl}/users`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  getUserById(userId: number) {
    return apiClient.get<SuperAdminUserDto>(`${this.apiUrl}/users/${userId}`);
  }

  createUser(user: Partial<SuperAdminUserDto>) {
    return apiClient.post<SuperAdminUserDto>(`${this.apiUrl}/users`, user);
  }

  updateUser(userId: number, user: Partial<SuperAdminUserDto>) {
    return apiClient.put<SuperAdminUserDto>(`${this.apiUrl}/users/${userId}`, user);
  }

  deleteUser(userId: number) {
    return apiClient.delete(`${this.apiUrl}/users/${userId}`, { responseType: 'text' });
  }

  assignRolesToUser(userId: number, roleNames: string[]) {
    // Backend uses user groups instead of direct role assignment
    // Convert role names to group names (assuming role name matches group name pattern)
    // If roles need to be mapped to groups, that logic should be handled here
    return apiClient.post(`${this.apiUrl}/users/${userId}/groups`, roleNames, { responseType: 'text' });
  }

  // Role Management
  getRoles() {
    return apiClient.get<SuperAdminRoleDto[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(roleId: number) {
    return apiClient.get<SuperAdminRoleDto>(`${this.apiUrl}/roles/${roleId}`);
  }

  createRole(role: Partial<SuperAdminRoleDto>) {
    return apiClient.post<SuperAdminRoleDto>(`${this.apiUrl}/roles`, role);
  }

  updateRole(roleId: number, role: Partial<SuperAdminRoleDto>) {
    return apiClient.put<SuperAdminRoleDto>(`${this.apiUrl}/roles/${roleId}`, role);
  }

  deleteRole(roleId: number) {
    return apiClient.delete(`${this.apiUrl}/roles/${roleId}`, { responseType: 'text' });
  }

  // Authority Management
  getAllAuthorities() {
    return apiClient.get<Array<{ id: number; authorityName: string; description: string }>>(`${this.apiUrl}/authorities`);
  }

  // User Group Management
  getUserGroups() {
    return apiClient.get<SuperAdminUserGroupDto[]>(`${this.apiUrl}/groups/all`);
  }

  getUserGroupById(groupId: number) {
    return apiClient.get<SuperAdminUserGroupDto>(`${this.apiUrl}/groups/${groupId}`);
  }

  createUserGroup(group: Partial<SuperAdminUserGroupDto>) {
    return apiClient.post<SuperAdminUserGroupDto>(`${this.apiUrl}/groups/create`, group);
  }

  updateUserGroup(groupId: number, group: Partial<SuperAdminUserGroupDto>) {
    return apiClient.put<SuperAdminUserGroupDto>(`${this.apiUrl}/groups/${groupId}`, group);
  }

  deleteUserGroup(groupId: number) {
    return apiClient.delete(`${this.apiUrl}/groups/${groupId}`, { responseType: 'text' });
  }

  assignRolesToGroup(groupId: number, roleIds: number[]) {
    return apiClient.post<SuperAdminUserGroupDto>(`${this.apiUrl}/groups/${groupId}/assign-roles`, roleIds);
  }

  addUserToGroup(groupId: number, userId: number) {
    return apiClient.post(`${this.apiUrl}/groups/${groupId}/add-user/${userId}`, {}, { responseType: 'text' });
  }

  removeUserFromGroup(groupId: number, userId: number) {
    return apiClient.post(`${this.apiUrl}/groups/${groupId}/remove-user/${userId}`, {}, { responseType: 'text' });
  }

  searchUserGroups(groupName?: string, role?: string) {
    const params: any = {};
    if (groupName) params.groupName = groupName;
    if (role) params.role = role;
    return apiClient.get<SuperAdminUserGroupDto[]>(`${this.apiUrl}/groups/search`, { params });
  }

  // Health Check
  healthCheck() {
    return apiClient.get<string>(`${this.apiUrl}/health`, { responseType: 'text' });
  }
}

export const superAdminService = new SuperAdminService();
