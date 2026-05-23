import React, { useEffect, useState } from 'react';
import { investorService, InvestorBasicInfo } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';

interface FieldProps {
  label: string;
  value?: string | null;
}

const Field: React.FC<FieldProps> = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded px-3 py-2 text-[13px] font-medium text-slate-800 min-h-[38px] flex items-center">
      {value && value.trim() ? value : <span className="text-slate-300">—</span>}
    </div>
  </div>
);

export const MyProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [investor, setInvestor] = useState<InvestorBasicInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await investorService.getDashboard();
        setInvestor(data?.investor || null);
      } catch (error) {
        console.error('[MyProfile] Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!investor) {
    return (
      <div className="alert alert-warning mt-4">Unable to load profile. Please refresh.</div>
    );
  }

  const fullName = [investor.firstName, investor.middleName, investor.lastName]
    .filter((p) => p && p.trim())
    .join(' ');
  const initial = (investor.firstName || investor.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg w-full overflow-hidden border border-slate-200">
      {/* Header banner */}
      <div className="bg-[#466a74] text-white px-4 py-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[18px] font-bold">
          {initial}
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-white mb-0.5 tracking-tight">{fullName || 'My Profile'}</h3>
          <p className="text-[11px] text-white/80 m-0 font-medium">
            Investor ID: {investor.uniqueCode || '—'}
          </p>
        </div>
      </div>

      {/* Read-only fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="First Name" value={investor.firstName} />
          <Field label="Middle Name" value={investor.middleName} />
          <Field label="Last Name" value={investor.lastName} />
          <Field label="Email ID" value={investor.email} />
          <Field label="Mobile Number" value={investor.mobileNumber} />
          <Field label="Nationality" value={investor.nationality} />
          <Field label="Country of Residence" value={investor.countryOfResidence} />
          <Field label="Investor Type" value={investor.investorType} />
        </div>
      </div>
    </div>
  );
};
