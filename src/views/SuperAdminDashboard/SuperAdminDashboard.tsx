import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService, SuperAdminDashboardDto } from '../../services/super-admin.service';
import { toast } from 'react-toastify';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './SuperAdminDashboard.scss';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.getDashboard();
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadDashboardData();
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getStatusClass = (active: boolean): string => {
    return active ? 'status-active' : 'status-inactive';
  };

  const getStatusText = (active: boolean): string => {
    return active ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <div className="super-admin-dashboard-layout">
        <Header />
        <div className="dashboard-main-content">
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="super-admin-dashboard-layout">
        <Header />
        <div className="dashboard-main-content">
          <div className="error-container">
            <p className="text-danger">{error || 'No data available'}</p>
            <button className="btn btn-primary" onClick={refreshDashboard}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard-layout">
      <Header />
      <div className="super-admin-dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-section">
                <i className="fas fa-crown"></i>
                <h1>Super Admin Panel</h1>
              </div>
              <div className="breadcrumb">
                <span className="breadcrumb-item active">Dashboard</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-outline-light" onClick={refreshDashboard} disabled={loading}>
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <nav className="tab-navigation">
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-pie"></i>
              <span>Overview</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
              onClick={() => setActiveTab('management')}
            >
              <i className="fas fa-cogs"></i>
              <span>Management</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              <i className="fas fa-server"></i>
              <span>System</span>
            </button>
          </div>
        </nav>

        <main className="dashboard-main">
          <div className="main-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{formatNumber(dashboardData.totalTenants)}</h3>
                      <p>Total Tenants</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{formatNumber(dashboardData.activeTenants)}</h3>
                      <p>Active Tenants</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{formatNumber(dashboardData.totalUsers)}</h3>
                      <p>Total Users</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-user-check"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{formatNumber(dashboardData.activeUsers)}</h3>
                      <p>Active Users</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-user-shield"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{formatNumber(dashboardData.totalRoles)}</h3>
                      <p>Total Roles</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-layer-group"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{formatNumber(dashboardData.totalUserGroups)}</h3>
                      <p>User Groups</p>
                    </div>
                  </div>
                </div>

                <div className="recent-data-section">
                  <div className="recent-tenants">
                    <h3>Recent Tenants</h3>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Domain</th>
                            <th>Status</th>
                            <th>Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentTenants && dashboardData.recentTenants.length > 0 ? (
                            dashboardData.recentTenants.slice(0, 5).map((tenant) => (
                              <tr key={tenant.tenantId}>
                                <td>{tenant.tenantName}</td>
                                <td>{tenant.emailDomain}</td>
                                <td>
                                  <span className={`badge ${getStatusClass(tenant.active)}`}>
                                    {getStatusText(tenant.active)}
                                  </span>
                                </td>
                                <td>{tenant.totalUsers || 0}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center">No tenants found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="recent-users">
                    <h3>Recent Users</h3>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Tenant</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentUsers && dashboardData.recentUsers.length > 0 ? (
                            dashboardData.recentUsers.slice(0, 5).map((user) => (
                              <tr key={user.id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.emailId}</td>
                                <td>{user.tenantName || 'N/A'}</td>
                                <td>
                                  <span className={`badge ${getStatusClass(user.active)}`}>
                                    {getStatusText(user.active)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center">No users found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'management' && (
              <div className="management-tab">
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => navigate('/super-admin/tenants')}>
                      <i className="fas fa-building"></i>
                      Manage Tenants
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/super-admin/users')}>
                      <i className="fas fa-users"></i>
                      Manage Users
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/super-admin/roles')}>
                      <i className="fas fa-user-shield"></i>
                      Manage Roles
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/super-admin/user-groups')}>
                      <i className="fas fa-layer-group"></i>
                      Manage User Groups
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="system-tab">
                <h3>System Information</h3>
                <div className="system-info">
                  <p>System status and configuration information will be displayed here.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
