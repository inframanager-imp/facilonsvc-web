import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { superAdminService, SuperAdminUserDto, TenantDto, SuperAdminUserGroupDto } from '../../services/super-admin.service';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './UserManagement.scss';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<SuperAdminUserDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SuperAdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuperAdminUserDto | null>(null);

  // Available data
  const [availableUserGroups, setAvailableUserGroups] = useState<SuperAdminUserGroupDto[]>([]);
  const [availableTenants, setAvailableTenants] = useState<TenantDto[]>([]);
  const [selectedUserGroupIds, setSelectedUserGroupIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<Partial<SuperAdminUserDto>>();

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, userGroupsResponse, tenantsResponse] = await Promise.all([
        superAdminService.getUsers(currentPage, pageSize),
        superAdminService.getUserGroups(),
        superAdminService.getTenants(0, 1000),
      ]);

      setUsers(usersResponse.data.content || []);
      setFilteredUsers(usersResponse.data.content || []);
      setTotalElements(usersResponse.data.totalElements || 0);
      setTotalPages(usersResponse.data.totalPages || 0);
      setAvailableUserGroups(userGroupsResponse.data || []);
      setAvailableTenants(tenantsResponse.data.content || []);
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
      setFilteredUsers([...users]);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName?.toLowerCase().includes(term) ||
            user.lastName?.toLowerCase().includes(term) ||
            user.emailId?.toLowerCase().includes(term) ||
            user.tenantName?.toLowerCase().includes(term)
        )
      );
    }
  };

  useEffect(() => {
    onSearch();
  }, [searchTerm, users]);

  const openCreateModal = () => {
    reset();
    setSelectedUserGroupIds([]);
    setShowCreateModal(true);
  };

  const openEditModal = (user: SuperAdminUserDto) => {
    setValue('id', user.id);
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('emailId', user.emailId);
    setValue('mobilePhone', user.mobilePhone);
    setValue('loginId', user.loginId);
    setValue('active', user.active);
    setValue('tenantId', user.tenantId);
    setSelectedUserGroupIds(
      availableUserGroups
        .filter((g) => user.userGroups?.includes(g.groupName))
        .map((g) => g.id!)
    );
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: SuperAdminUserDto) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    reset();
    setSelectedUserGroupIds([]);
  };

  const toggleUserGroupSelection = (groupId: number) => {
    setSelectedUserGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const onCreateUser = async (data: Partial<SuperAdminUserDto>) => {
    try {
      const userData = {
        ...data,
        userGroups: availableUserGroups
          .filter((g) => selectedUserGroupIds.includes(g.id!))
          .map((g) => g.groupName),
      };
      await superAdminService.createUser(userData);
      toast.success('User created successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    }
  };

  const onUpdateUser = async (data: Partial<SuperAdminUserDto>) => {
    if (!selectedUser?.id) return;
    try {
      const userData = {
        ...data,
        userGroups: availableUserGroups
          .filter((g) => selectedUserGroupIds.includes(g.id!))
          .map((g) => g.groupName),
      };
      await superAdminService.updateUser(selectedUser.id, userData);
      toast.success('User updated successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
    }
  };

  const onDeleteUser = async () => {
    if (!selectedUser?.id) return;
    try {
      await superAdminService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="user-management-layout">
      <Header />
      <div className="user-management-main-content">
        <div className="user-management">
          <header className="page-header">
            <div className="header-content">
              <div className="header-left">
                <button className="btn btn-outline-secondary back-btn" onClick={() => navigate('/super-admin/dashboard')}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Dashboard
                </button>
                <div className="page-title">
                  <h1>
                    <i className="fas fa-users"></i>
                    User Management
                  </h1>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <i className="fas fa-plus"></i>
                  Add User
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
                  placeholder="Search users..."
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
                <p>Loading users...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="text-danger">{error}</p>
                <button className="btn btn-primary" onClick={loadData}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Login ID</th>
                        <th>Tenant</th>
                        <th>Roles</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              {user.firstName} {user.lastName}
                            </td>
                            <td>{user.emailId}</td>
                            <td>{user.mobilePhone}</td>
                            <td>{user.loginId}</td>
                            <td>{user.tenantName || 'N/A'}</td>
                            <td>{user.roles?.join(', ') || 'No roles'}</td>
                            <td>
                              <span className={`badge ${user.active ? 'bg-success' : 'bg-danger'}`}>
                                {user.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>{formatDate(user.lastLogin)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => openEditModal(user)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openDeleteModal(user)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      className="btn btn-outline-primary"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage + 1} of {totalPages} (Total: {totalElements})
                    </span>
                    <button
                      className="btn btn-outline-primary"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
        <Footer />
      </div>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={closeModals} title="Create User" size="lg">
        <form onSubmit={handleSubmit(onCreateUser)}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control ${errors.emailId ? 'is-invalid' : ''}`}
                {...register('emailId', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.emailId && <div className="invalid-feedback">{errors.emailId.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Mobile Phone *</label>
              <input
                type="text"
                className={`form-control ${errors.mobilePhone ? 'is-invalid' : ''}`}
                {...register('mobilePhone', { required: 'Mobile phone is required' })}
              />
              {errors.mobilePhone && <div className="invalid-feedback">{errors.mobilePhone.message}</div>}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Login ID *</label>
            <input
              type="text"
              className={`form-control ${errors.loginId ? 'is-invalid' : ''}`}
              {...register('loginId', { required: 'Login ID is required' })}
            />
            {errors.loginId && <div className="invalid-feedback">{errors.loginId.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Tenant</label>
            <select className="form-control" {...register('tenantId')}>
              <option value="">Select Tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">User Groups</label>
            <div className="user-groups-selection">
              {availableUserGroups.map((group) => (
                <div key={group.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedUserGroupIds.includes(group.id!)}
                    onChange={() => toggleUserGroupSelection(group.id!)}
                  />
                  <label className="form-check-label">
                    {group.groupName} {group.description && `- ${group.description}`}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                {...register('active')}
                defaultChecked
              />
              <label className="form-check-label">Active</label>
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={closeModals} title="Edit User" size="lg">
        <form onSubmit={handleSubmit(onUpdateUser)}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control ${errors.emailId ? 'is-invalid' : ''}`}
                {...register('emailId', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.emailId && <div className="invalid-feedback">{errors.emailId.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Mobile Phone *</label>
              <input
                type="text"
                className={`form-control ${errors.mobilePhone ? 'is-invalid' : ''}`}
                {...register('mobilePhone', { required: 'Mobile phone is required' })}
              />
              {errors.mobilePhone && <div className="invalid-feedback">{errors.mobilePhone.message}</div>}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Login ID *</label>
            <input
              type="text"
              className={`form-control ${errors.loginId ? 'is-invalid' : ''}`}
              {...register('loginId', { required: 'Login ID is required' })}
            />
            {errors.loginId && <div className="invalid-feedback">{errors.loginId.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Tenant</label>
            <select className="form-control" {...register('tenantId')}>
              <option value="">Select Tenant</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">User Groups</label>
            <div className="user-groups-selection">
              {availableUserGroups.map((group) => (
                <div key={group.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedUserGroupIds.includes(group.id!)}
                    onChange={() => toggleUserGroupSelection(group.id!)}
                  />
                  <label className="form-check-label">
                    {group.groupName} {group.description && `- ${group.description}`}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" {...register('active')} />
              <label className="form-check-label">Active</label>
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update User
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeModals} title="Delete User">
        <p>Are you sure you want to delete user: {selectedUser?.firstName} {selectedUser?.lastName}?</p>
        <div className="modal-footer-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModals}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onDeleteUser}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
