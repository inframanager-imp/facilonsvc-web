import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { investorService, ConsentItem } from '../../../services/investor.service';
import { profileService } from '../../../services/profile.service';
import { sowService } from '../../../services/sow.service';
import { SowAgreementModal } from './SowAgreementModal';
import '../InvestorProfile/InvestorProfile.scss';
import './MyConsents.scss';

/**
 * My Consents (Consent Centre detail).
 *
 * Read-only summary lives on the dashboard; clicking it lands here. Shows every consent
 * (Consent / Scope / Status / Action). Each row's action runs its own flow:
 *  - Statement of Work: Agree (records agreement → unlocks the onboarding journey) / Revoke
 *    (re-blocks the journey).
 *  - Marketing / WhatsApp / Privacy / Platform Terms: Activate / Revoke toggles.
 */
/**
 * Module-level cache so returning to Consents renders instantly from the last load
 * (stale-while-revalidate) instead of a spinner + cold fetch. Lives for the app session.
 */
let consentsCache: ConsentItem[] | null = null;

export const MyConsents: React.FC = () => {
  const navigate = useNavigate();

  // Spinner only on the very first load; on return, show cached items immediately.
  const [loading, setLoading] = useState(!consentsCache);
  const [items, setItems] = useState<ConsentItem[]>(consentsCache ?? []);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [showSowModal, setShowSowModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await investorService.getDashboard();
      const list = data?.consentCenter || [];
      setItems(list);
      consentsCache = list;
    } catch (e) {
      console.error('[MyConsents] load failed', e);
      toast.error('Failed to load consents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleView = async (item: ConsentItem) => {
    const key = item.key;
    if (!key) return;

    if (key === 'sow') {
      setShowSowModal(true);
      return;
    }

    if (key === 'privacy' || key === 'privacyPolicy') {
      window.open('/privacy-policy', '_blank');
      if ((item.action || '').toUpperCase() === 'ACTIVATE') {
        await triggerActivate(item);
      }
      return;
    }

    if (key === 'platformTerms' || key === 'terms') {
      window.open('/service-agreement', '_blank');
      if ((item.action || '').toUpperCase() === 'ACTIVATE') {
        await triggerActivate(item);
      }
      return;
    }

    // For other consents (marketing, whatsapp, etc.)
    if ((item.action || '').toUpperCase() === 'ACTIVATE') {
      await triggerActivate(item);
    } else {
      toast.info(`${item.consent || 'Consent'} is already active.`);
    }
  };

  const triggerActivate = async (item: ConsentItem) => {
    const key = item.key;
    if (!key) return;

    setBusyKey(key);
    try {
      await profileService.updateConsent(key, 'activate');
      toast.success('Consent updated.');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.response?.data?.message || 'Activation failed');
    } finally {
      setBusyKey(null);
    }
  };

  const triggerRevoke = async (item: ConsentItem) => {
    const key = item.key;
    if (!key) return;

    const msg =
      key === 'sow'
        ? 'Revoking your Statement of Work will block you from continuing the onboarding journey. Continue?'
        : 'Revoke this consent?';
    if (!window.confirm(msg)) return;

    setBusyKey(key);
    try {
      if (key === 'sow') {
        await sowService.revokeMe();
        toast.success('Statement of Work revoked.');
      } else {
        await profileService.updateConsent(key, 'revoke');
        toast.success('Consent updated.');
      }
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.response?.data?.message || 'Revocation failed');
    } finally {
      setBusyKey(null);
    }
  };

  const handleSowAgree = async () => {
    setBusyKey('sow');
    try {
      await sowService.agreeMe();
      toast.success('Statement of Work agreed — you can now continue your journey.');
      setShowSowModal(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.response?.data?.message || 'Failed to record agreement');
    } finally {
      setBusyKey(null);
    }
  };

  if (loading) {
    return (
      <div className="facilon-dashboard-wrapper">
        <main className="container-fluid dashboard-container-main">
          <div className="loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Loading consents...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">

          <div className="investor-profile__card consent-upload">
            <div className="document-list">
              <div className="document-list__header-row">
                <h2>Consent Centre</h2>
              </div>
              <p className="document-list__subtitle">
                Manage your consents and Statement of Work agreements.
              </p>

              <div className="document-table-container">
                <table className="document-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Consent</th>
                      <th style={{ width: '45%' }}>Scope</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '13%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-muted text-center py-4" style={{ fontSize: '11px' }}>
                          No consent records available.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const isStatusActive = (item.status || '').toLowerCase() === 'active';

                        return (
                          <tr key={item.key || item.consent}>
                            <td>
                              <div className="table-document-info">
                                <div className="table-document-name">{item.consent || '-'}</div>
                              </div>
                            </td>
                            <td>{item.scope || '-'}</td>
                            <td>
                              {isStatusActive ? (
                                <span className="status-badge status-approved">
                                  <i className="bi bi-check-circle-fill" />
                                  Active
                                </span>
                              ) : (
                                <span className="status-badge status-rejected">
                                  <i className="bi bi-x-circle-fill" />
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button
                                  type="button"
                                  className="btn-action-icon text-primary"
                                  disabled={busyKey === item.key}
                                  onClick={() => handleView(item)}
                                  title="View/Accept Consent"
                                >
                                  <i className="bi bi-eye-fill" />
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-icon text-danger"
                                  disabled={busyKey === item.key || !isStatusActive}
                                  onClick={() => triggerRevoke(item)}
                                  title="Revoke Consent"
                                >
                                  <i className="bi bi-trash3-fill" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="consent-upload__actions">
              <button
                type="button"
                onClick={() => navigate('/investor/dashboard')}
                className="btn-outline-primary"
              >
                <i className="bi bi-arrow-left-circle me-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>

      <SowAgreementModal
        show={showSowModal}
        busy={busyKey === 'sow'}
        onClose={() => setShowSowModal(false)}
        onAgree={handleSowAgree}
      />
    </div>
  );
};

export default MyConsents;
