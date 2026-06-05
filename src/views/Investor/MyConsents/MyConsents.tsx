import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { investorService, ConsentItem } from '../../../services/investor.service';
import { profileService } from '../../../services/profile.service';
import { sowService } from '../../../services/sow.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { SowAgreementModal } from './SowAgreementModal';

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

  const runAction = async (item: ConsentItem) => {
    const key = item.key;
    const action = (item.action || '').toUpperCase();
    if (!key) return;

    // SOW agreement shows the full Statement of Work first (Laravel-style), then records on "I Agree".
    if (key === 'sow' && action === 'ACTIVATE') {
      setShowSowModal(true);
      return;
    }

    if (action === 'REVOKE') {
      const msg =
        key === 'sow'
          ? 'Revoking your Statement of Work will block you from continuing the onboarding journey. Continue?'
          : 'Revoke this consent?';
      if (!window.confirm(msg)) return;
    }

    setBusyKey(key);
    try {
      if (key === 'sow') {
        if (action === 'ACTIVATE') {
          await sowService.agreeMe();
          toast.success('Statement of Work agreed — you can now continue your journey.');
        } else if (action === 'REVOKE') {
          await sowService.revokeMe();
          toast.success('Statement of Work revoked.');
        }
      } else {
        // marketing / whatsapp
        await profileService.updateConsent(key, action === 'ACTIVATE' ? 'activate' : 'revoke');
        toast.success('Consent updated.');
      }
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.response?.data?.message || 'Action failed');
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

  const actionLabel = (item: ConsentItem): string => {
    switch ((item.action || '').toUpperCase()) {
      case 'ACTIVATE':
        return item.key === 'sow' ? 'Agree' : 'Activate';
      case 'REVOKE':
        return 'Revoke';
      case 'UPDATE':
        return 'Update';
      default:
        return '';
    }
  };

  const actionVariant = (item: ConsentItem): string => {
    switch ((item.action || '').toUpperCase()) {
      case 'ACTIVATE':
        return 'btn-success';
      case 'REVOKE':
        return 'btn-outline-danger';
      default:
        return 'btn-outline-secondary';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg w-full border border-slate-200 p-4">
      <div className="mb-3">
        <h3 className="text-[16px] font-bold text-slate-800 mb-1">Consent Centre</h3>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Consent</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Action Required</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted">No consent records available.</td>
              </tr>
            ) : (
              items.map((item) => {
                const label = actionLabel(item);
                return (
                  <tr key={item.key || item.consent}>
                    <td>{item.consent || '-'}</td>
                    <td>{item.scope || '-'}</td>
                    <td>
                      <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {item.status || '-'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${actionVariant(item)}`}
                        disabled={busyKey === item.key}
                        onClick={() => runAction(item)}
                      >
                        {busyKey === item.key ? 'Working…' : label}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
