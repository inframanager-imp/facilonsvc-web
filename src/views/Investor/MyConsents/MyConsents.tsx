import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { investorService, ConsentItem } from '../../../services/investor.service';
import { profileService } from '../../../services/profile.service';
import { sowService } from '../../../services/sow.service';
import { SowAgreementModal } from './SowAgreementModal';
import { FiChevronLeft } from 'react-icons/fi';
import { BsCheckCircleFill, BsXCircleFill, BsEyeFill, BsTrash3Fill } from 'react-icons/bs';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import '../InvestorProfile/InvestorProfile.scss';
import './MyConsents.scss';

const ChevronLeftIcon = FiChevronLeft as any;
const CheckCircleIcon = BsCheckCircleFill as any;
const XCircleIcon = BsXCircleFill as any;
const EyeIcon = BsEyeFill as any;
const TrashIcon = BsTrash3Fill as any;

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
        <main className="container-fluid dashboard-container-main p-0">
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
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile dsr-page">

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
            {/* Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex justify-between items-center text-white">
              <div>
                <h2 className="m-0 text-base font-bold text-white tracking-tight">Consent Centre</h2>
                <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">Manage your consents and Statement of Work agreements.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center bg-white/10 border border-white/20 text-white text-[11px] font-semibold h-[30px] px-3 rounded-md transition-colors hover:bg-white/20 hover:border-white/30 cursor-pointer text-decoration-none"
                  onClick={() => navigate('/investor/dashboard')}
                >
                  <ChevronLeftIcon size={12} className="me-1 flex-shrink-0" />
                  Back
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 bg-white">
              <div className="bg-transparent border-0 rounded-none mb-0 pt-2.5 p-0 bg-white" style={{ padding: '15px' }}>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0]">
                        <th className="pb-3.5 px-2">Consent</th>
                        <th className="pb-3.5 px-2">Scope</th>
                        <th className="pb-3.5 px-2">Status</th>
                        <th className="pb-3.5 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 px-2 text-center text-[12px] text-slate-400">
                            No consent records available.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => {
                          const isStatusActive = (item.status || '').toLowerCase() === 'active';

                          return (
                            <tr
                              key={item.key || item.consent}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="p-2 text-[12px]">
                                <span className="font-bold text-slate-800">{item.consent || '-'}</span>
                              </td>
                              <td className="p-2 text-[12px] text-slate-600">{item.scope || '-'}</td>
                              <td className="p-2 text-[12px]">
                                {isStatusActive ? (
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#355f69] text-white border border-[#355f69]/20">
                                    <CheckCircleIcon size={9.5} className="flex-shrink-0" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                    <XCircleIcon size={9.5} className="flex-shrink-0" />
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-[12px] text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end w-full">
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-view-${item.key || item.consent}`} className="text-[10px]">View/Accept Consent</Tooltip>}
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-[28px] h-[28px] bg-transparent border border-gray-200 hover:border-[#3e6f7c] hover:bg-[#3e6f7c]/5 text-[#3e6f7c] disabled:opacity-35 disabled:cursor-not-allowed rounded-md transition-all cursor-pointer"
                                      disabled={busyKey === item.key}
                                      onClick={() => handleView(item)}
                                    >
                                      <EyeIcon size={12} className="flex-shrink-0" />
                                    </button>
                                  </OverlayTrigger>

                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-revoke-${item.key || item.consent}`} className="text-[10px]">Revoke Consent</Tooltip>}
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-[28px] h-[28px] bg-transparent border border-gray-200 hover:border-red-500 hover:bg-red-50 text-red-500 disabled:opacity-35 disabled:cursor-not-allowed rounded-md transition-all cursor-pointer"
                                      disabled={busyKey === item.key || !isStatusActive}
                                      onClick={() => triggerRevoke(item)}
                                    >
                                      <TrashIcon size={12} className="flex-shrink-0" />
                                    </button>
                                  </OverlayTrigger>
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
