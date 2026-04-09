import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  adminClientService,
  type InvestorDto,
  type PageResponse,
} from '../../../services/adminClient.service';
import { toast } from 'react-toastify';
import './AdminInvestorList.scss';

export const AdminInvestorList: React.FC = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<InvestorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const loadInvestors = async () => {
    setLoading(true);
    try {
      let result: PageResponse<InvestorDto>;
      if (searchTerm.trim()) {
        result = await adminClientService.searchClients(searchTerm.trim(), page, pageSize);
      } else {
        result = await adminClientService.listClients(page, pageSize);
      }
      setInvestors(result.content || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load investors');
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestors();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadInvestors();
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
    <div className="admin-investor-list-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="admin-investor-list">
          <div className="admin-investor-list__header">
            <h1>
              <i className="fas fa-users"></i> Investor Management
            </h1>
            <p className="admin-investor-list__subtitle">
              List and search investors in your organization
            </p>
          </div>

          <form onSubmit={handleSearch} className="admin-investor-list__search">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or unique code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search"></i> Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="admin-investor-list__loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading investors...</p>
            </div>
          ) : (
            <>
              <div className="admin-investor-list__table-wrapper">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Unique Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No investors found
                        </td>
                      </tr>
                    ) : (
                      investors.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            {inv.firstName} {inv.lastName}
                          </td>
                          <td>{inv.emailId || '-'}</td>
                          <td>{inv.mobilePhone || '-'}</td>
                          <td>{inv.uniqueCode || '-'}</td>
                          <td>{getStatusBadge(inv.verifyStatus)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/admin/clients/${inv.id}`)}
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav className="admin-investor-list__pagination">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">
                      Showing {page * pageSize + 1} to{' '}
                      {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
                    </span>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                        >
                          Previous
                        </button>
                      </li>
                      <li className="page-item disabled">
                        <span className="page-link">
                          Page {page + 1} of {totalPages}
                        </span>
                      </li>
                      <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={page >= totalPages - 1}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
