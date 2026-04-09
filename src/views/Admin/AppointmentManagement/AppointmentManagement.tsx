import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  adminAppointmentService,
  AppointmentStats,
} from '../../../services/admin-appointment.service';
import { AppointmentDto, appointmentService, OFFICE_DETAILS } from '../../../services/appointment.service';
import './AppointmentManagement.scss';

export const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentDto[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, scheduled: 0, completed: 0, cancelled: 0, noShow: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [officeFilter, setOfficeFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('today');

  useEffect(() => {
    loadData();
  }, [statusFilter, officeFilter, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allAppointments, todayAppointments, statistics] = await Promise.all([
        adminAppointmentService.getAllAppointments(
          statusFilter === 'ALL' ? undefined : statusFilter,
          officeFilter === 'ALL' ? undefined : officeFilter
        ),
        adminAppointmentService.getTodaysAppointments(),
        adminAppointmentService.getStats(),
      ]);
      setAppointments(allAppointments);
      setTodaysAppointments(todayAppointments);
      setStats(statistics);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleComplete = async (appointmentId: number) => {
    try {
      await adminAppointmentService.completeAppointment(appointmentId);
      toast.success('Appointment marked as completed');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to update appointment');
    }
  };

  const handleNoShow = async (appointmentId: number) => {
    if (!window.confirm('Mark this appointment as no-show?')) return;

    try {
      await adminAppointmentService.markNoShow(appointmentId);
      toast.success('Appointment marked as no-show');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to update appointment');
    }
  };

  const displayedAppointments = activeTab === 'today' ? todaysAppointments : appointments;

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="admin-appointments">
            <div className="loading">Loading appointments...</div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="admin-appointments">
          <h1>Appointment Management</h1>
          <p className="admin-appointments__subtitle">
            Manage investor office visit appointments
          </p>

          {/* Stats Cards */}
          <div className="admin-appointments__stats">
            <div className="stat-card">
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Appointments</div>
            </div>
            <div className="stat-card stat-card--success">
              <div className="stat-card__value">{stats.scheduled}</div>
              <div className="stat-card__label">Scheduled</div>
            </div>
            <div className="stat-card stat-card--info">
              <div className="stat-card__value">{stats.completed}</div>
              <div className="stat-card__label">Completed</div>
            </div>
            <div className="stat-card stat-card--secondary">
              <div className="stat-card__value">{stats.cancelled}</div>
              <div className="stat-card__label">Cancelled</div>
            </div>
            <div className="stat-card stat-card--danger">
              <div className="stat-card__value">{stats.noShow}</div>
              <div className="stat-card__label">No Show</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="admin-appointments__tabs">
            <button
              className={`tab ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Today's Appointments ({todaysAppointments.length})
            </button>
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Appointments ({appointments.length})
            </button>
          </div>

          {/* Filters */}
          <div className="admin-appointments__card">
            <h2>Filters</h2>
            <div className="filters">
              <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Office Location</label>
                <select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)}>
                  <option value="ALL">All Offices</option>
                  <option value="MUMBAI">Mumbai</option>
                  <option value="DELHI">Delhi</option>
                  <option value="BANGALORE">Bangalore</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="admin-appointments__card">
            <h2>Appointments ({displayedAppointments.length})</h2>
            {displayedAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No appointments found</p>
              </div>
            ) : (
              <div className="appointments-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Investor</th>
                      <th>Office</th>
                      <th>Date & Time</th>
                      <th>Time Slot</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>{apt.id}</td>
                        <td>
                          <div className="investor-info">
                            <div className="investor-name">{apt.investorName}</div>
                            <div className="investor-code">{apt.investorCode}</div>
                          </div>
                        </td>
                        <td>{apt.officeLocation}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>{apt.timeSlot}</td>
                        <td>
                          <span className={appointmentService.getStatusBadgeClass(apt.status)}>
                            {appointmentService.getStatusLabel(apt.status)}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-action btn-action--primary"
                            onClick={() => handleViewDetails(apt)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          {apt.status === 'SCHEDULED' && (
                            <>
                              <button
                                className="btn-action btn-action--success"
                                onClick={() => handleComplete(apt.id)}
                                title="Mark Completed"
                              >
                                ✓
                              </button>
                              <button
                                className="btn-action btn-action--danger"
                                onClick={() => handleNoShow(apt.id)}
                                title="Mark No-Show"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal for Appointment Details */}
          {showModal && selectedAppointment && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Appointment Details</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="appointment-details">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{selectedAppointment.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Investor Name:</span>
                      <span className="detail-value">{selectedAppointment.investorName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Investor Code:</span>
                      <span className="detail-value">{selectedAppointment.investorCode}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedAppointment.investorEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Mobile:</span>
                      <span className="detail-value">{selectedAppointment.investorMobile}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Office Location:</span>
                      <span className="detail-value">
                        {OFFICE_DETAILS[selectedAppointment.officeLocation as keyof typeof OFFICE_DETAILS].name}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-value">
                        {appointmentService.formatAppointmentDate(selectedAppointment.appointmentDate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time Slot:</span>
                      <span className="detail-value">{selectedAppointment.timeSlot}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Purpose:</span>
                      <span className="detail-value">{selectedAppointment.purpose}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={appointmentService.getStatusBadgeClass(selectedAppointment.status)}>
                        {appointmentService.getStatusLabel(selectedAppointment.status)}
                      </span>
                    </div>
                    {selectedAppointment.notes && (
                      <div className="detail-row detail-row--full">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{selectedAppointment.notes}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {new Date(selectedAppointment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedAppointment.status === 'SCHEDULED' && (
                    <>
                      <button
                        className="btn-modal btn-modal--success"
                        onClick={() => handleComplete(selectedAppointment.id)}
                      >
                        ✓ Mark Completed
                      </button>
                      <button
                        className="btn-modal btn-modal--danger"
                        onClick={() => handleNoShow(selectedAppointment.id)}
                      >
                        ✕ Mark No-Show
                      </button>
                    </>
                  )}
                  <button
                    className="btn-modal btn-modal--secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};
