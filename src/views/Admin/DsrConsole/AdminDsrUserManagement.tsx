import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/Modal/Modal';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  adminDsrService,
  DsrAdminUserDto,
  DsrAdminRegisterRequest
} from '../../../services/admin-dsr.service';
import './DsrConsole.scss';

export const AdminDsrUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DsrAdminUserDto | null>(null);
  const [admins, setAdmins] = useState<DsrAdminUserDto[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<DsrAdminUserDto | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DsrAdminRegisterRequest>();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [me, list] = await Promise.all([
        adminDsrService.getMyAdminProfile().catch(() => null),
        adminDsrService.listDsrAdmins()
      ]);
      setProfile(me);
      setAdmins(list);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const filtered = admins.filter((a) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return a.firstName?.toLowerCase().includes(q)
      || a.lastName?.toLowerCase().includes(q)
      || a.emailId?.toLowerCase().includes(q)
      || a.loginId?.toLowerCase().includes(q);
  });

  const activeCount = admins.filter((a) => a.active).length;

  const openCreateModal = () => {
    reset();
    setShowCreateModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDeactivateModal(false);
    setSelectedAdmin(null);
    reset();
  };

  const onRegister = async (data: DsrAdminRegisterRequest) => {
    setSaving(true);
    try {
      await adminDsrService.registerDsrAdmin({ ...data, active: true });
      toast.success('DSR Admin registered successfully');
      closeModals();
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to register DSR admin');
    } finally {
      setSaving(false);
    }
  };

  const onDeactivate = async () => {
    if (!selectedAdmin) return;
    setSaving(true);
    try {
      await adminDsrService.deactivateDsrAdmin(selectedAdmin.id);
      toast.success('DSR Admin deactivated');
      closeModals();
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate DSR admin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="font-sans text-gray-800">
      <div>
        {/* Welcome Banner - same style as the investor dashboard */}
        <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] text-white rounded shadow-sm mb-3 px-4 py-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col justify-between items-start mb-0">
              <h1 className="text-[16px] font-bold text-white flex items-center tracking-tight mb-0">
                Welcome {profile ? `${profile.firstName} ${profile.lastName}` : 'Admin'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[12px] opacity-90 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="opacity-70">Email:</span>
                  <span className="font-semibold">{profile?.emailId || '—'}</span>
                </div>
                |
                <div className="flex items-center gap-1.5">
                  <span className="opacity-70">Login ID:</span>
                  <span className="font-semibold">{profile?.loginId || '—'}</span>
                </div>
                |
                <div className="flex items-center gap-1.5">
                  <span className="opacity-70">Role:</span>
                  <span className="font-semibold">{profile?.roles?.join(', ') || 'ADMIN'}</span>
                </div>
                |
                <div className="flex items-center gap-1.5">
                  <span className="opacity-70">Mobile:</span>
                  <span className="font-semibold">{profile?.mobilePhone || '—'}</span>
                </div>
                |
                <div className="flex items-center gap-1.5">
                  <span className="opacity-70">Last Login:</span>
                  <span className="font-semibold">{profile?.lastLogin?.replace('T', ' ') || '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white/10 border border-white/25 rounded px-2.5 py-1 flex items-center text-[11px]">
                <span>{profile?.firstName || 'Admin'} (Platform Admin)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP ROW: summary cards + quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 items-start">
          <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] p-3">
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">DSR Admins</div>
            <div className="text-[24px] font-bold text-[#175cd3] leading-none">{admins.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total registered</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] p-3">
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active</div>
            <div className="text-[24px] font-bold text-[#067647] leading-none">{activeCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">{admins.length - activeCount} inactive</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] p-3 flex flex-col justify-between">
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm btn-primary" onClick={openCreateModal}>
                <i className="bi bi-person-plus me-1"></i>Register DSR Admin
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/admin/dsr-admins')}>
                DSR Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* DSR Admin Users card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col mb-3">
          <div className="p-2 px-3 flex justify-between items-center border-b border-[#e2e8f0]">
            <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
              <i className="bi bi-people mr-2 text-slate-500"></i> DSR Admin Users
            </h2>
            <div className="d-flex align-items-center gap-2">
              <input className="form-control form-control-sm" style={{ width: 220 }}
                placeholder="Search name / email / login ID"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="px-3 pt-2 pb-3">
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr className="text-[10px] text-uppercase text-slate-400">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Login ID</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-muted">
                      {admins.length === 0 ? 'No DSR admins registered yet.' : 'No matching admins.'}
                    </td></tr>
                  )}
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>{a.firstName} {a.lastName}</td>
                      <td>{a.emailId}</td>
                      <td>{a.mobilePhone || '—'}</td>
                      <td>{a.loginId}</td>
                      <td>{a.roles?.join(', ')}</td>
                      <td>
                        <span className={`badge ${a.active ? 'bg-success' : 'bg-danger'}`}>
                          {a.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{a.lastLogin?.replace('T', ' ') || '—'}</td>
                      <td>
                        {a.active && (
                          <button className="btn btn-sm btn-outline-danger"
                            onClick={() => { setSelectedAdmin(a); setShowDeactivateModal(true); }}>
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Register DSR Admin Modal */}
      <Modal show={showCreateModal} onHide={closeModals} title="Register DSR Admin" size="lg">
        <form onSubmit={handleSubmit(onRegister)}>
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
              <label className="form-label">Mobile Phone</label>
              <input
                type="text"
                className="form-control"
                {...register('mobilePhone')}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Login ID *</label>
              <input
                type="text"
                className={`form-control ${errors.loginId ? 'is-invalid' : ''}`}
                {...register('loginId', { required: 'Login ID is required' })}
              />
              {errors.loginId && <div className="invalid-feedback">{errors.loginId.message}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              <small className="text-muted">The user must change this on first login.</small>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value="DSR_ADMIN (assigned automatically)" disabled />
          </div>
          <div className="modal-footer-actions d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={closeModals}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal show={showDeactivateModal} onHide={closeModals} title="Deactivate DSR Admin">
        <p>
          Are you sure you want to deactivate{' '}
          <strong>{selectedAdmin?.firstName} {selectedAdmin?.lastName}</strong> ({selectedAdmin?.loginId})?
          They will no longer be able to sign in.
        </p>
        <div className="modal-footer-actions d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={closeModals}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" disabled={saving} onClick={onDeactivate}>
            {saving ? 'Deactivating…' : 'Deactivate'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
