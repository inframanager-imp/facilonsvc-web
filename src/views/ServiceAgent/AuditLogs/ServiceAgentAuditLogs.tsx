import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import { serviceAgentAuditService } from '../../../services/serviceAgentAudit.service';
import { AuditLogDto, PageResponse } from '../../../models/AuditLogDto';
import { getPermissionErrorMessage } from '../../../utils/apiClient';
import './ServiceAgentAuditLogs.scss';

const PAGE_SIZE = 20;

export function ServiceAgentAuditLogs() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<AuditLogDto> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    serviceAgentAuditService.getMyAuditLogs(page, PAGE_SIZE)
      .then(setResult)
      .catch((err: any) => {
        const permissionError = getPermissionErrorMessage(err);
        if (permissionError) {
          toast.error(permissionError);
        } else {
          toast.error('Failed to load audit logs.');
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  const logs = result?.content ?? [];

  return (
    <div className="sa-audit-logs">
      <PostLoginHeader />
      <div className="sa-audit-logs__body">
        <div className="sa-audit-logs__header">
          <h2>My Audit Trail</h2>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/service-agent/dashboard')}>
            ← Dashboard
          </Button>
        </div>

        {loading ? (
          <div className="sa-audit-logs__empty"><Spinner animation="border" variant="primary" /></div>
        ) : logs.length === 0 ? (
          <div className="sa-audit-logs__empty">No audit log entries found.</div>
        ) : (
          <>
            <div className="sa-audit-logs__table">
              <table>
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Investor</th>
                    <th>Action</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>{log.investorId}</td>
                      <td>{log.actionType.replace(/_/g, ' ')}</td>
                      <td>
                        <span style={{
                          background: '#f0f4ff', color: '#4f46e5',
                          borderRadius: 8, padding: '2px 8px', fontSize: '0.78rem',
                        }}>
                          {log.actionCategory}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.78rem' }}>{log.httpMethod} {log.endpoint}</code>
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

            {result && result.totalPages > 1 && (
              <div className="sa-audit-logs__pagination">
                <Button size="sm" variant="outline-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </Button>
                <span>Page {page + 1} of {result.totalPages}</span>
                <Button size="sm" variant="outline-secondary" disabled={page >= result.totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ServiceAgentAuditLogs;
