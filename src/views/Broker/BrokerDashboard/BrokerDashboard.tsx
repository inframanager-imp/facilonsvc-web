import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  brokerService,
  type IntroInvestorTempDto,
  type InvestorDto,
  type PageResponse,
} from '../../../services/broker.service';
import { toast } from 'react-toastify';
import './BrokerDashboard.scss';

export const BrokerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [introduced, setIntroduced] = useState<IntroInvestorTempDto[]>([]);
  const [investors, setInvestors] = useState<InvestorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'introduced' | 'registered'>('introduced');
  const [statusCode, setStatusCode] = useState('');
  const [statusResult, setStatusResult] = useState<Record<string, unknown> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const loadIntroduced = async () => {
    try {
      const data = await brokerService.listIntroducedInvestors();
      setIntroduced(data);
    } catch {
      setIntroduced([]);
    }
  };

  const loadInvestors = async () => {
    try {
      let result: PageResponse<InvestorDto>;
      if (searchTerm.trim()) {
        result = await brokerService.searchInvestors(searchTerm.trim(), page, pageSize);
      } else {
        result = await brokerService.listInvestors(page, pageSize);
      }
      setInvestors(result.content || []);
      setTotalPages(result.totalPages || 0);
    } catch {
      setInvestors([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadIntroduced(), loadInvestors()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'registered') loadInvestors();
  }, [activeTab, page, searchTerm]);

  const handleStatusLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusCode.trim()) return;
    try {
      const result = await brokerService.getIntroducedInvestorStatus(statusCode.trim());
      setStatusResult(result);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to lookup status');
      setStatusResult(null);
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <span className="badge bg-success">Verified</span>;
      case 2:
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 3:
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="broker-dashboard-layout">
      <Header />
      <div className="dashboard-main-content">
        <div className="broker-dashboard">
          <h1>
            <i className="fas fa-briefcase"></i> Broker Dashboard
          </h1>
          <p className="broker-dashboard__subtitle">
            Manage and view status of introduced investors
          </p>

          <div className="broker-dashboard__status-lookup card mb-4">
            <div className="card-body">
              <h5>Check Introduced Investor Status</h5>
              <form onSubmit={handleStatusLookup} className="d-flex gap-2 align-items-end">
                <div className="flex-grow-1">
                  <label className="form-label">Unique Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter unique code from registration"
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search"></i> Lookup
                </button>
              </form>
              {statusResult && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong>Result:</strong>
                  <pre className="mb-0 mt-2">{JSON.stringify(statusResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          <nav className="broker-dashboard__tabs mb-3">
            <button
              className={`btn ${activeTab === 'introduced' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('introduced')}
            >
              In-Progress ({introduced.length})
            </button>
            <button
              className={`btn ${activeTab === 'registered' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('registered')}
            >
              Registered Investors
            </button>
          </nav>

          {loading ? (
            <div className="broker-dashboard__loading">
              <div className="spinner-border text-primary"></div>
              <p>Loading...</p>
            </div>
          ) : activeTab === 'introduced' ? (
            <div className="card">
              <div className="card-body">
                <h5>Introduced Investors (In-Progress)</h5>
                {introduced.length === 0 ? (
                  <p className="text-muted">No in-progress introduced investors.</p>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Unique Code</th>
                        <th>Step</th>
                      </tr>
                    </thead>
                    <tbody>
                      {introduced.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            {inv.introFirstName} {inv.introLastName}
                          </td>
                          <td>{inv.introEmail || '-'}</td>
                          <td><code>{inv.uniqueCodeDb || '-'}</code></td>
                          <td>Step {inv.status || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPage(0);
                    loadInvestors();
                  }}
                  className="mb-3"
                >
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search investors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      Search
                    </button>
                  </div>
                </form>
                <h5>Registered Investors</h5>
                {investors.length === 0 ? (
                  <p className="text-muted">No registered investors found.</p>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Unique Code</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investors.map((inv) => (
                        <tr key={inv.id}>
                          <td>{inv.firstName} {inv.lastName}</td>
                          <td>{inv.emailId || '-'}</td>
                          <td><code>{inv.uniqueCode || '-'}</code></td>
                          <td>{getStatusBadge(inv.verifyStatus)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/admin/clients/${inv.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
