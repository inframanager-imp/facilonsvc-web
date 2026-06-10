import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService, InvestorBasicInfo } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { FiChevronLeft } from 'react-icons/fi';
import '../InvestorProfile/InvestorProfile.scss';

const ChevronLeftIcon = FiChevronLeft as any;

// The API sends investorType as the raw enum constant.
// Format it to a readable label for display only.
const INVESTOR_TYPE_LABELS: Record<string, string> = {
  RESIDENT_INDIVIDUAL: 'Resident - Individual',
  RESIDENT_NON_INDIVIDUAL: 'Resident Non-Individual',
  NRI: 'NRI',
  OCI: 'OCI',
  FOREIGN_NATIONAL: 'Foreign National',
  FOREIGN_NON_INDIVIDUAL: 'Foreign Non-Individual',
};

const formatInvestorType = (type?: string | null): string | null | undefined => {
  if (!type) return type;
  return INVESTOR_TYPE_LABELS[type.toUpperCase()] ?? type;
};

export const MyProfile: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="facilon-dashboard-wrapper">
        <main className="container-fluid dashboard-container-main">
          <div className="alert alert-warning mt-4">Unable to load profile. Please refresh.</div>
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
                <h2 className="m-0 text-base font-bold text-white tracking-tight">My Profile Details</h2>
                <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">View your personal registration profile details.</p>
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
                <div className="investor-profile__grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.firstName || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.middleName || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.lastName || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email ID</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.email || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.mobileNumber || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nationality</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.nationality || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country of Residence</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={investor.countryOfResidence || '-'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Investor Type</label>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      value={formatInvestorType(investor.investorType) || '-'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;
