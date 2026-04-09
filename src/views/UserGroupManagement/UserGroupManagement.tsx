import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { superAdminService, SuperAdminUserGroupDto, TenantDto, SuperAdminUserDto, SuperAdminRoleDto } from '../../services/super-admin.service';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './UserGroupManagement.scss';

const UserGroupManagement: React.FC = () => {
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState<SuperAdminUserGroupDto[]>([]);
  const [filteredUserGroups, setFilteredUserGroups] = useState<SuperAdminUserGroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Available data
  const [availableTenants, setAvailableTenants] = useState<TenantDto[]>([]);
  const [availableRoles, setAvailableRoles] = useState<SuperAdminRoleDto[]>([]);
  const [availableUsers, setAvailableUsers] = useState<SuperAdminUserDto[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignRolesModal, setShowAssignRolesModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserGroup, setSelectedUserGroup] = useState<SuperAdminUserGroupDto | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Partial<SuperAdminUserGroupDto>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userGroupsResponse, tenantsResponse, rolesResponse, usersResponse] = await Promise.all([
        superAdminService.getUserGroups(),
        superAdminService.getTenants(0, 1000),
        superAdminService.getRoles(),
        superAdminService.getUsers(0, 1000),
      ]);

      setUserGroups(userGroupsResponse.data || []);
      setFilteredUserGroups(userGroupsResponse.data || []);
      setAvailableTenants(tenantsResponse.data.content || []);
      setAvailableRoles(rolesResponse.data || []);
      setAvailableUsers(usersResponse.data.content || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUserGroups([...userGroups]);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUserGroups(
        userGroups.filter(
          (group) =>
            group.groupName?.toLowerCase().includes(term) ||
            group.description?.toLowerCase().includes(term) ||
            group.roles?.some((role) => role.toLowerCase().includes(term))
        )
      );
    }
  };

  useEffect(() => {
    onSearch();
  }, [searchTerm, userGroups]);

  const openCreateModal = () => {
    reset();
    setSelectedRoleIds([]);
    setShowCreateModal(true);
  };

  const openEditModal = (group: SuperAdminUserGroupDto) => {
    setValue('id', group.id);
    setValue('groupName', group.groupName);
    setValue('description', group.description);
    setValue('tenantId', group.tenantId);
    setSelectedRoleIds(
      availableRoles
        .filter((role) => group.roles?.includes(role.label!))
        .map((role) => role.id!)
    );
    setSelectedUserGroup(group);
    setShowEditModal(true);
  };

  const openDeleteModal = (group: SuperAdminUserGroupDto) => {
    setSelectedUserGroup(group);
    setShowDeleteModal(true);
  };

  const openAssignRolesModal = (group: SuperAdminUserGroupDto) => {
    setSelectedUserGroup(group);
    setSelectedRoleIds(
      availableRoles
        .filter((role) => group.roles?.includes(role.label!))
        .map((role) => role.id!)
    );
    setShowAssignRolesModal(true);
  };

  const openAddUserModal = (group: SuperAdminUserGroupDto) => {
    setSelectedUserGroup(group);
    setSelectedUserIds([]);
    setShowAddUserModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAssignRolesModal(false);
    setShowAddUserModal(false);
    setSelectedUserGroup(null);
    reset();
    setSelectedRoleIds([]);
    setSelectedUserIds([]);
  };

  const toggleRoleSelection = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const onCreateUserGroup = async (data: Partial<SuperAdminUserGroupDto>) => {
    try {
      const groupData = {
        ...data,
        roles: availableRoles
          .filter((role) => selectedRoleIds.includes(role.id!))
          .map((role) => role.label!),
      };
      await superAdminService.createUserGroup(groupData);
      toast.success('User group created successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create user group';
      toast.error(errorMessage);
    }
  };

  const onUpdateUserGroup = async (data: Partial<SuperAdminUserGroupDto>) => {
    if (!selectedUserGroup?.id) return;
    try {
      const groupData = {
        ...data,
        roles: availableRoles
          .filter((role) => selectedRoleIds.includes(role.id!))
          .map((role) => role.label!),
      };
      await superAdminService.updateUserGroup(selectedUserGroup.id, groupData);
      toast.success('User group updated successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user group';
      toast.error(errorMessage);
    }
  };

  const onDeleteUserGroup = async () => {
    if (!selectedUserGroup?.id) return;
    try {
      await superAdminService.deleteUserGroup(selectedUserGroup.id);
      toast.success('User group deleted successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete user group');
    }
  };

  const onAssignRoles = async () => {
    if (!selectedUserGroup?.id) return;
    try {
      await superAdminService.assignRolesToGroup(selectedUserGroup.id, selectedRoleIds);
      toast.success('Roles assigned successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      toast.error('Failed to assign roles');
    }
  };

  const onAddUsers = async () => {
    if (!selectedUserGroup?.id) return;
    try {
      for (const userId of selectedUserIds) {
        await superAdminService.addUserToGroup(selectedUserGroup.id, userId);
      }
      toast.success('Users added successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      toast.error('Failed to add users');
    }
  };

  return (
    <div className="user-group-management-layout">
      <Header />
      <div className="user-group-management-main-content">
        <div className="user-group-management">
          <header className="page-header">
            <div className="header-content">
              <div className="header-left">
                <button className="btn btn-outline-secondary back-btn" onClick={() => navigate('/super-admin/dashboard')}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Dashboard
                </button>
                <div className="page-title">
                  <h1>
                    <i className="fas fa-layer-group"></i>
                    User Group Management
                  </h1>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <i className="fas fa-plus"></i>
                  Add User Group
                </button>
              </div>
            </div>
          </header>

          <div className="search-section">
            <div className="search-container">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search user groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <main className="main-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading user groups...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="text-danger">{error}</p>
                <button className="btn btn-primary" onClick={loadData}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Description</th>
                      <th>Tenant</th>
                      <th>Roles</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserGroups.length > 0 ? (
                      filteredUserGroups.map((group) => (
                        <tr key={group.id}>
                          <td>{group.groupName}</td>
                          <td>{group.description || 'N/A'}</td>
                          <td>{group.tenantName || 'N/A'}</td>
                          <td>
                            {group.roles && group.roles.length > 0 ? (
                              <span className="roles-badge">
                                {group.roles.slice(0, 2).join(', ')}
                                {group.roles.length > 2 && ` +${group.roles.length - 2} more`}
                              </span>
                            ) : (
                              'No roles'
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => openEditModal(group)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info me-2"
                                onClick={() => openAssignRolesModal(group)}
                                title="Assign Roles"
                              >
                                <i className="fas fa-user-shield"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success me-2"
                                onClick={() => openAddUserModal(group)}
                                title="Add User"
                              >
                                <i className="fas fa-user-plus"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openDeleteModal(group)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">
                          No user groups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
        <Footer />
      </div>

      {/* Create User Group Modal */}
      <Modal show={showCreateModal} onHide={closeModals} title="Create User Group" size="lg">
        <form onSubmit={handleSubmit(onCreateUserGroup)}>
          <div className="mb-3">
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              className={`form-control ${errors.groupName ? 'is-invalid' : ''}`}
              {...register('groupName', { required: 'Group name is required' })}
            />
            {errors.groupName && <div className="invalid-feedback">{errors.groupName.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              {...register('description')}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tenant *</label>
            <select className={`form-control ${errors.tenantId ? 'is-invalid' : ''}`} {...register('tenantId', { required: 'Tenant is required' })}>
              <option value="">Select Tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </select>
            {errors.tenantId && <div className="invalid-feedback">{errors.tenantId.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Roles</label>
            <div className="roles-selection">
              {availableRoles.map((role) => (
                <div key={role.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id!)}
                    onChange={() => toggleRoleSelection(role.id!)}
                  />
                  <label className="form-check-label">{role.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User Group
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Group Modal */}
      <Modal show={showEditModal} onHide={closeModals} title="Edit User Group" size="lg">
        <form onSubmit={handleSubmit(onUpdateUserGroup)}>
          <div className="mb-3">
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              className={`form-control ${errors.groupName ? 'is-invalid' : ''}`}
              {...register('groupName', { required: 'Group name is required' })}
            />
            {errors.groupName && <div className="invalid-feedback">{errors.groupName.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              {...register('description')}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tenant *</label>
            <select className={`form-control ${errors.tenantId ? 'is-invalid' : ''}`} {...register('tenantId', { required: 'Tenant is required' })}>
              <option value="">Select Tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </select>
            {errors.tenantId && <div className="invalid-feedback">{errors.tenantId.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Roles</label>
            <div className="roles-selection">
              {availableRoles.map((role) => (
                <div key={role.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id!)}
                    onChange={() => toggleRoleSelection(role.id!)}
                  />
                  <label className="form-check-label">{role.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update User Group
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Roles Modal */}
      <Modal show={showAssignRolesModal} onHide={closeModals} title="Assign Roles" size="lg">
        <div>
          <p>Select roles to assign to group: <strong>{selectedUserGroup?.groupName}</strong></p>
          <div className="roles-selection">
            {availableRoles.map((role) => (
              <div key={role.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id!)}
                  onChange={() => toggleRoleSelection(role.id!)}
                />
                <label className="form-check-label">{role.label}</label>
              </div>
            ))}
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onAssignRoles}>
              Assign Roles
            </button>
          </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAddUserModal} onHide={closeModals} title="Add Users" size="lg">
        <div>
          <p>Select users to add to group: <strong>{selectedUserGroup?.groupName}</strong></p>
          <div className="users-selection">
            {availableUsers.map((user) => (
              <div key={user.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                />
                <label className="form-check-label">
                  {user.firstName} {user.lastName} ({user.emailId})
                </label>
              </div>
            ))}
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onAddUsers}>
              Add Users
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeModals} title="Delete User Group">
        <p>Are you sure you want to delete user group: {selectedUserGroup?.groupName}?</p>
        <div className="modal-footer-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModals}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onDeleteUserGroup}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserGroupManagement;
