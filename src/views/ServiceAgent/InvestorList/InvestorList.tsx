import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import { serviceAgentService } from '../../../services/serviceAgent.service';
import { ServiceAgentInvestorDto } from '../../../models/ServiceAgentDto';
import { getPermissionErrorMessage } from '../../../utils/apiClient';
import './InvestorList.scss';

const SCOPE_CLASS: Record<string, string> = {
  FULL_ONBOARDING:  'sa-investor-list__scope-badge--full',
  CKYC_ONLY:        'sa-investor-list__scope-badge--ckyc',
  ONBOARDING_ONLY:  'sa-investor-list__scope-badge--onboarding',
  VIEW_ONLY:        'sa-investor-list__scope-badge--view',
};

const SCOPE_LABEL: Record<string, string> = {
  FULL_ONBOARDING:  'Full',
  CKYC_ONLY:        'CKYC',
  ONBOARDING_ONLY:  'Onboarding',
  VIEW_ONLY:        'View Only',
};

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function SAInvestorList() {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<ServiceAgentInvestorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    serviceAgentService.getMyInvestors()
      .then(setInvestors)
      .catch((err: any) => {
        const permissionError = getPermissionErrorMessage(err);
        if (permissionError) {
          toast.error(permissionError);
        } else {
          toast.error('Failed to load investors.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = investors.filter(inv =>
    !search ||
    inv.investorName.toLowerCase().includes(search.toLowerCase()) ||
    inv.investorEmail.toLowerCase().includes(search.toLowerCase()) ||
    (inv.investorUniqueCode ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sa-investor-list">
      <PostLoginHeader />
      <div className="sa-investor-list__body">
        <div className="sa-investor-list__header">
          <h2>My Investors ({investors.length})</h2>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/service-agent/dashboard')}>
            ← Dashboard
          </Button>
        </div>

        <Form.Control
          className="sa-investor-list__search"
          placeholder="Search by name, email or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="sa-investor-list__empty">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="sa-investor-list__empty">No investors found.</div>
        ) : (
          <div className="sa-investor-list__table">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Code</th>
                  <th>Scope</th>
                  <th>Permissions</th>
                  <th>Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const days = daysUntil(inv.validTo);
                  const perms = [
                    inv.canViewProfile && 'View',
                    inv.canEditKyc && 'Edit',
                    inv.canUploadDocuments && 'Upload',
                    inv.canSubmitForms && 'Submit',
                  ].filter(Boolean) as string[];

                  return (
                    <tr key={inv.investorId}>
                      <td>
                        <strong>{inv.investorName}</strong>
                        <br />
                        <small style={{ color: '#9ca3af' }}>{inv.investorEmail}</small>
                      </td>
                      <td>{inv.investorUniqueCode}</td>
                      <td>
                        <span className={`sa-investor-list__scope-badge ${SCOPE_CLASS[inv.delegationScope] ?? ''}`}>
                          {SCOPE_LABEL[inv.delegationScope] ?? inv.delegationScope}
                        </span>
                      </td>
                      <td>
                        <div className="sa-investor-list__perm-chips">
                          {perms.map(p => <span key={p}>{p}</span>)}
                        </div>
                      </td>
                      <td>
                        {days === null ? (
                          <span className="sa-investor-list__expiry--none">No expiry</span>
                        ) : days < 7 ? (
                          <span className="sa-investor-list__expiry--soon">Expires in {days}d</span>
                        ) : (
                          <span className="sa-investor-list__expiry--ok">{inv.validTo}</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/service-agent/investors/${inv.investorId}/profile`)}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SAInvestorList;
