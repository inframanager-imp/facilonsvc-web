import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { superAdminService, SuperAdminRoleDto, TenantDto } from '../../services/super-admin.service';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './RoleManagement.scss';

interface Authority {
  id: number;
  authorityName: string;
  description: string;
}

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<SuperAdminRoleDto[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<SuperAdminRoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Available data
  const [availableTenants, setAvailableTenants] = useState<TenantDto[]>([]);
  const [availableAuthorities, setAvailableAuthorities] = useState<Authority[]>([]);
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<number[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SuperAdminRoleDto | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Partial<SuperAdminRoleDto>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesResponse, tenantsResponse, authoritiesResponse] = await Promise.all([
        superAdminService.getRoles(),
        superAdminService.getTenants(0, 1000),
        superAdminService.getAllAuthorities(),
      ]);

      setRoles(rolesResponse.data || []);
      setFilteredRoles(rolesResponse.data || []);
      setAvailableTenants(tenantsResponse.data.content || []);
      setAvailableAuthorities(authoritiesResponse.data || []);
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
      setFilteredRoles([...roles]);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRoles(
        roles.filter(
          (role) =>
            role.label?.toLowerCase().includes(term) ||
            role.tenantName?.toLowerCase().includes(term) ||
            role.authorities?.some((auth) => auth.toLowerCase().includes(term))
        )
      );
    }
  };

  useEffect(() => {
    onSearch();
  }, [searchTerm, roles]);

  const openCreateModal = () => {
    reset();
    setSelectedAuthorityIds([]);
    setShowCreateModal(true);
  };

  const openEditModal = (role: SuperAdminRoleDto) => {
    setValue('id', role.id);
    setValue('label', role.label);
    setValue('tenantId', role.tenantId);
    setValue('active', role.active);
    setSelectedAuthorityIds(
      availableAuthorities
        .filter((auth) => role.authorities?.includes(auth.authorityName))
        .map((auth) => auth.id)
    );
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const openDeleteModal = (role: SuperAdminRoleDto) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedRole(null);
    reset();
    setSelectedAuthorityIds([]);
  };

  const toggleAuthoritySelection = (authorityId: number) => {
    setSelectedAuthorityIds((prev) =>
      prev.includes(authorityId) ? prev.filter((id) => id !== authorityId) : [...prev, authorityId]
    );
  };

  const onCreateRole = async (data: Partial<SuperAdminRoleDto>) => {
    try {
      const roleData = {
        ...data,
        authorities: availableAuthorities
          .filter((auth) => selectedAuthorityIds.includes(auth.id))
          .map((auth) => auth.authorityName),
      };
      await superAdminService.createRole(roleData);
      toast.success('Role created successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create role';
      toast.error(errorMessage);
    }
  };

  const onUpdateRole = async (data: Partial<SuperAdminRoleDto>) => {
    if (!selectedRole?.id) return;
    try {
      const roleData = {
        ...data,
        authorities: availableAuthorities
          .filter((auth) => selectedAuthorityIds.includes(auth.id))
          .map((auth) => auth.authorityName),
      };
      await superAdminService.updateRole(selectedRole.id, roleData);
      toast.success('Role updated successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update role';
      toast.error(errorMessage);
    }
  };

  const onDeleteRole = async () => {
    if (!selectedRole?.id) return;
    try {
      await superAdminService.deleteRole(selectedRole.id);
      toast.success('Role deleted successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete role');
    }
  };

  return (
    <div className="role-management-layout">
      <Header />
      <div className="role-management-main-content">
        <div className="role-management">
          <header className="page-header">
            <div className="header-content">
              <div className="header-left">
                <button className="btn btn-outline-secondary back-btn" onClick={() => navigate('/super-admin/dashboard')}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Dashboard
                </button>
                <div className="page-title">
                  <h1>
                    <i className="fas fa-user-shield"></i>
                    Role Management
                  </h1>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <i className="fas fa-plus"></i>
                  Add Role
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
                  placeholder="Search roles..."
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
                <p>Loading roles...</p>
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
                      <th>Label</th>
                      <th>Tenant</th>
                      <th>Authorities</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <tr key={role.id}>
                          <td>{role.label}</td>
                          <td>{role.tenantName || 'N/A'}</td>
                          <td>
                            {role.authorities && role.authorities.length > 0 ? (
                              <span className="authorities-badge">
                                {role.authorities.slice(0, 3).join(', ')}
                                {role.authorities.length > 3 && ` +${role.authorities.length - 3} more`}
                              </span>
                            ) : (
                              <span className="text-muted">No authorities</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${role.active ? 'bg-success' : 'bg-danger'}`}>
                              {role.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(role)}
                                title="Edit Role"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openDeleteModal(role)}
                                title="Delete Role"
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
                          No roles found
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

      {/* Create Role Modal */}
      <Modal show={showCreateModal} onHide={closeModals} title="Create Role" size="lg">
        <form onSubmit={handleSubmit(onCreateRole)}>
          <div className="mb-3">
            <label className="form-label">Label *</label>
            <input
              type="text"
              className={`form-control ${errors.label ? 'is-invalid' : ''}`}
              {...register('label', { required: 'Label is required' })}
            />
            {errors.label && <div className="invalid-feedback">{errors.label.message}</div>}
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
            <label className="form-label">Authorities</label>
            <div className="authorities-selection">
              {availableAuthorities.map((authority) => (
                <div key={authority.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedAuthorityIds.includes(authority.id)}
                    onChange={() => toggleAuthoritySelection(authority.id)}
                  />
                  <label className="form-check-label">
                    {authority.authorityName}
                    {authority.description && ` - ${authority.description}`}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" {...register('active')} defaultChecked />
              <label className="form-check-label">Active</label>
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Role
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal show={showEditModal} onHide={closeModals} title="Edit Role" size="lg">
        <form onSubmit={handleSubmit(onUpdateRole)}>
          <div className="mb-3">
            <label className="form-label">Label *</label>
            <input
              type="text"
              className={`form-control ${errors.label ? 'is-invalid' : ''}`}
              {...register('label', { required: 'Label is required' })}
            />
            {errors.label && <div className="invalid-feedback">{errors.label.message}</div>}
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
            <label className="form-label">Authorities</label>
            <div className="authorities-selection">
              {availableAuthorities.map((authority) => (
                <div key={authority.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedAuthorityIds.includes(authority.id)}
                    onChange={() => toggleAuthoritySelection(authority.id)}
                  />
                  <label className="form-check-label">
                    {authority.authorityName}
                    {authority.description && ` - ${authority.description}`}
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
              Update Role
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeModals} title="Delete Role">
        <p>Are you sure you want to delete role: {selectedRole?.label}?</p>
        <div className="modal-footer-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModals}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onDeleteRole}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
