import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { serviceAgentService, AuditLogDto } from '../../../services/serviceAgent.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import './ServiceAgentActivity.scss';

export const ServiceAgentActivity: React.FC = () => {
  const [logs, setLogs]       = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (p: number) => {
    setLoading(true);
    try {
      const result = await serviceAgentService.getServiceAgentActivity(p, PAGE_SIZE);
      setLogs(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      toast.error('Failed to load service agent activity');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="layout-wrapper">
      <PostLoginHeader />
      <div className="main-content">
        <div className="sa-activity">
          <div className="sa-activity__header">
            <h2>Service Agent Activity</h2>
            <p>All actions performed by Service Agents on your account.</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : logs.length === 0 ? (
            <div className="text-center text-muted py-5">
              No service agent activity recorded yet.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Action</th>
                      <th>Category</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className={`activity-row ${log.success ? '' : 'activity-row--failed'}`}>
                        <td>
                          <small>{formatDate(log.createdAt)}</small>
                        </td>
                        <td>
                          <span className="action-badge">{log.actionType}</span>
                        </td>
                        <td>
                          <small className="text-muted">{log.actionCategory || '—'}</small>
                        </td>
                        <td>
                          <code className="small">{log.httpMethod || '—'}</code>
                        </td>
                        <td>
                          {log.success
                            ? <span className="badge bg-success">Success</span>
                            : <span className="badge bg-danger" title={log.errorMessage ?? undefined}>Failed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination-bar">
                <span>Showing {logs.length} of {totalElements} actions</span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentActivity;
