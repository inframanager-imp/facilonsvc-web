import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { superAdminService, TenantDto } from '../../services/super-admin.service';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './TenantManagement.scss';

const TenantManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<TenantDto[]>([]);
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
  const [selectedTenant, setSelectedTenant] = useState<TenantDto | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Partial<TenantDto>>();

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.getTenants(currentPage, pageSize);
      setTenants(response.data.content || []);
      setFilteredTenants(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      setTotalPages(response.data.totalPages || 0);
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
      setFilteredTenants([...tenants]);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredTenants(
        tenants.filter(
          (tenant) =>
            tenant.tenantName?.toLowerCase().includes(term) ||
            tenant.emailDomain?.toLowerCase().includes(term) ||
            tenant.state?.toLowerCase().includes(term) ||
            tenant.country?.toLowerCase().includes(term)
        )
      );
    }
  };

  useEffect(() => {
    onSearch();
  }, [searchTerm, tenants]);

  const openCreateModal = () => {
    reset();
    setShowCreateModal(true);
  };

  const openEditModal = (tenant: TenantDto) => {
    setValue('tenantId', tenant.tenantId);
    setValue('tenantName', tenant.tenantName);
    setValue('emailDomain', tenant.emailDomain);
    setValue('address', tenant.address);
    setValue('state', tenant.state);
    setValue('postalCode', tenant.postalCode);
    setValue('country', tenant.country);
    setValue('active', tenant.active);
    setSelectedTenant(tenant);
    setShowEditModal(true);
  };

  const openDeleteModal = (tenant: TenantDto) => {
    setSelectedTenant(tenant);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedTenant(null);
    reset();
  };

  const onCreateTenant = async (data: Partial<TenantDto>) => {
    try {
      await superAdminService.createTenant(data);
      toast.success('Tenant created successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create tenant';
      toast.error(errorMessage);
    }
  };

  const onUpdateTenant = async (data: Partial<TenantDto>) => {
    if (!selectedTenant?.tenantId) return;
    try {
      await superAdminService.updateTenant(selectedTenant.tenantId, data);
      toast.success('Tenant updated successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update tenant';
      toast.error(errorMessage);
    }
  };

  const onDeleteTenant = async () => {
    if (!selectedTenant?.tenantId) return;
    try {
      await superAdminService.deleteTenant(selectedTenant.tenantId);
      toast.success('Tenant deleted successfully');
      closeModals();
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete tenant');
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
    <div className="tenant-management-layout">
      <Header />
      <div className="tenant-management-main-content">
        <div className="tenant-management">
          <header className="page-header">
            <div className="header-content">
              <div className="header-left">
                <button className="btn btn-outline-secondary back-btn" onClick={() => navigate('/super-admin/dashboard')}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Dashboard
                </button>
                <div className="page-title">
                  <h1>
                    <i className="fas fa-building"></i>
                    Tenant Management
                  </h1>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <i className="fas fa-plus"></i>
                  Add Tenant
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
                  placeholder="Search tenants..."
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
                <p>Loading tenants...</p>
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
                        <th>Email Domain</th>
                        <th>Address</th>
                        <th>State</th>
                        <th>Country</th>
                        <th>Status</th>
                        <th>Users</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.length > 0 ? (
                        filteredTenants.map((tenant) => (
                          <tr key={tenant.tenantId}>
                            <td>{tenant.tenantName}</td>
                            <td>{tenant.emailDomain}</td>
                            <td>{tenant.address}</td>
                            <td>{tenant.state}</td>
                            <td>{tenant.country}</td>
                            <td>
                              <span className={`badge ${tenant.active ? 'bg-success' : 'bg-danger'}`}>
                                {tenant.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>{tenant.totalUsers || 0}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => openEditModal(tenant)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openDeleteModal(tenant)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center">
                            No tenants found
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

      {/* Create Tenant Modal */}
      <Modal show={showCreateModal} onHide={closeModals} title="Create Tenant" size="lg">
        <form onSubmit={handleSubmit(onCreateTenant)}>
          <div className="mb-3">
            <label className="form-label">Tenant Name *</label>
            <input
              type="text"
              className={`form-control ${errors.tenantName ? 'is-invalid' : ''}`}
              {...register('tenantName', { required: 'Tenant name is required' })}
            />
            {errors.tenantName && <div className="invalid-feedback">{errors.tenantName.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Email Domain *</label>
            <input
              type="text"
              className={`form-control ${errors.emailDomain ? 'is-invalid' : ''}`}
              {...register('emailDomain', { required: 'Email domain is required' })}
            />
            {errors.emailDomain && <div className="invalid-feedback">{errors.emailDomain.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Address *</label>
            <textarea
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              rows={3}
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">State *</label>
              <input
                type="text"
                className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                {...register('state', { required: 'State is required' })}
              />
              {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Postal Code *</label>
              <input
                type="text"
                className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                {...register('postalCode', { required: 'Postal code is required' })}
              />
              {errors.postalCode && <div className="invalid-feedback">{errors.postalCode.message}</div>}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Country *</label>
            <input
              type="text"
              className={`form-control ${errors.country ? 'is-invalid' : ''}`}
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <div className="invalid-feedback">{errors.country.message}</div>}
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
              Create Tenant
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal show={showEditModal} onHide={closeModals} title="Edit Tenant" size="lg">
        <form onSubmit={handleSubmit(onUpdateTenant)}>
          <div className="mb-3">
            <label className="form-label">Tenant Name *</label>
            <input
              type="text"
              className={`form-control ${errors.tenantName ? 'is-invalid' : ''}`}
              {...register('tenantName', { required: 'Tenant name is required' })}
            />
            {errors.tenantName && <div className="invalid-feedback">{errors.tenantName.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Email Domain *</label>
            <input
              type="text"
              className={`form-control ${errors.emailDomain ? 'is-invalid' : ''}`}
              {...register('emailDomain', { required: 'Email domain is required' })}
            />
            {errors.emailDomain && <div className="invalid-feedback">{errors.emailDomain.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Address *</label>
            <textarea
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              rows={3}
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">State *</label>
              <input
                type="text"
                className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                {...register('state', { required: 'State is required' })}
              />
              {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Postal Code *</label>
              <input
                type="text"
                className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                {...register('postalCode', { required: 'Postal code is required' })}
              />
              {errors.postalCode && <div className="invalid-feedback">{errors.postalCode.message}</div>}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Country *</label>
            <input
              type="text"
              className={`form-control ${errors.country ? 'is-invalid' : ''}`}
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <div className="invalid-feedback">{errors.country.message}</div>}
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
              Update Tenant
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeModals} title="Delete Tenant">
        <p>Are you sure you want to delete tenant: {selectedTenant?.tenantName}?</p>
        <div className="modal-footer-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModals}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onDeleteTenant}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TenantManagement;
