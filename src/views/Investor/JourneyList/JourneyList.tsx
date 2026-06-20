import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService, JourneyListItem } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';

const statusBadgeClass = (status?: string): string => {
  switch ((status || '').toUpperCase()) {
    case 'COMPLETED':
      return 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20';
    case 'IN REVIEW':
      return 'bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/20';
    case 'ABANDONED':
      return 'bg-[#fef2f2] text-[#ef4444] border border-[#ef4444]/20';
    default:
      return 'bg-[#eff6ff] text-[#3b82f6] border border-[#3b82f6]/20';
  }
};

export const JourneyList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<JourneyListItem[]>([]);
  // The journey awaiting KYC-reuse consent (Phase 3 gate). Non-null shows the modal.
  const [consentItem, setConsentItem] = useState<JourneyListItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await investorService.getJourneys();
        setJourneys(data || []);
      } catch (error) {
        console.error('[JourneyList] Error fetching journeys:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const navigateToJourney = (item: JourneyListItem) => {
    if (item.actionRoute) {
      navigate(item.actionRoute);
    } else if (item.journeyId) {
      navigate(`/investor/journey/${item.journeyId}`);
    } else {
      navigate('/investor/journey');
    }
  };

  // Phase 3: gate the first open of a journey. If KYC isn't complete, send the
  // investor to finish it; if complete but not yet consented for this journey,
  // ask consent before opening; otherwise open straight through.
  const openJourney = async (item: JourneyListItem) => {
    if (!item.journeyId) {
      navigateToJourney(item);
      return;
    }
    try {
      const gate = await investorService.getJourneyKycGate(item.journeyId);
      if (!gate.kycComplete) {
        navigate('/investor/documents-center');
        return;
      }
      if (gate.consentGiven) {
        navigateToJourney(item);
        return;
      }
      setConsentItem(item); // need consent — open modal
    } catch (error) {
      // Gate failure shouldn't trap the user — fall back to opening the journey.
      console.error('[JourneyList] KYC gate check failed:', error);
      navigateToJourney(item);
    }
  };

  // Tracks whether the user chose "I Agree" so onClose doesn't also record a Skip.
  const agreedRef = useRef(false);

  // Close the consent prompt and open the journey regardless of the choice —
  // consent is optional, so it never blocks entry. On Skip/X (no agree), record
  // the decision so the prompt is asked only ONCE.
  const closeConsentAndOpen = () => {
    const item = consentItem;
    if (item?.journeyId && !agreedRef.current) {
      investorService
        .skipJourneyKycConsent(item.journeyId)
        .catch((error) => console.error('[JourneyList] Failed to record KYC skip:', error));
    }
    agreedRef.current = false;
    setConsentItem(null);
    if (item) navigateToJourney(item);
  };

  // "I Agree": record consent in the background (server then archives the docs).
  const handleConsentAgree = () => {
    agreedRef.current = true; // set before onClose runs so it won't also record a Skip
    if (consentItem?.journeyId) {
      investorService
        .giveJourneyKycConsent(consentItem.journeyId)
        .catch((error) => console.error('[JourneyList] Failed to record KYC consent:', error));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg w-full overflow-hidden border border-slate-200">
      <div className="bg-[#2c525d] text-white px-3 py-3">
        <h3 className="text-[15px] font-bold text-white mb-0.5 tracking-tight">My Onboarding Journey</h3>
        <p className="text-[10px] text-white/80 m-0 font-medium">
          Track your product applications, schemes, and plans. Select a journey to continue.
        </p>
      </div>

      <div className="bg-[#e1e4e7] p-0">
        <div className="bg-white border border-slate-200/60 p-3 shadow-sm">
          {journeys.length === 0 ? (
            <div className="py-10 text-center">
              <i className="bi bi-signpost-2 text-[28px] text-slate-300"></i>
              <p className="text-[12px] text-slate-500 mt-2 mb-0">No onboarding journeys assigned yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0]">
                    <th className="pb-3.5 px-2">PRODUCT</th>
                    <th className="pb-3.5 px-2">SCHEME</th>
                    <th className="pb-3.5 px-2">PLAN</th>
                    <th className="pb-3.5 px-2">SERVICE PROVIDER</th>
                    <th className="pb-3.5 px-2">STATUS</th>
                    <th className="pb-3.5 px-2 text-right">OPTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {journeys.map((item, idx) => (
                    <tr
                      key={item.journeyId || idx}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => openJourney(item)}
                    >
                      <td className="py-2 px-2 text-[12px] font-bold text-slate-800">{item.product || '-'}</td>
                      <td className="py-2 px-2 text-[12px] text-slate-500">{item.scheme || '-'}</td>
                      <td className="py-2 px-2 text-[12px] text-slate-500">{item.plan || '-'}</td>
                      <td className="py-2 px-2 text-[12px] text-slate-500">{item.serviceProviderName || '-'}</td>
                      <td className="py-2 px-2">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block ${statusBadgeClass(item.status)}`}>
                          {item.status || 'IN PROGRESS'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); openJourney(item); }}
                          className="bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#10b981] border border-[#10b981]/25 text-[8px] font-extrabold px-3 py-1.5 rounded inline-flex items-center gap-2 tracking-wider transition-colors cursor-pointer ml-auto"
                        >
                          {(item.status || '').toUpperCase() === 'COMPLETED' ? 'VIEW' : 'CONTINUE'}
                          <i className="bi bi-chevron-right text-[7px]"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        show={!!consentItem}
        title="Use your KYC documents for this application?"
        message={`To continue${consentItem?.product ? ` "${consentItem.product}"` : ' this journey'}, do you consent to Facilon using the KYC documents you uploaded in your Document Center — and the details extracted from them — for this application? Your documents will be submitted as part of this journey and used to auto-fill your details. Your consent is recorded with the date and time.`}
        confirmText="I Agree"
        cancelText="Skip for now"
        onConfirm={handleConsentAgree}
        onClose={closeConsentAndOpen}
      />
    </div>
  );
};
