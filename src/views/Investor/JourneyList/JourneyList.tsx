import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService, JourneyListItem } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';

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

  const openJourney = (item: JourneyListItem) => {
    if (item.actionRoute) {
      navigate(item.actionRoute);
    } else if (item.journeyId) {
      navigate(`/investor/journey/${item.journeyId}`);
    } else {
      navigate('/investor/journey');
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
    </div>
  );
};
