import React, { useEffect, useState } from 'react';
import { investorService, InvestorBasicInfo } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import '../InvestorProfile/InvestorProfile.scss';

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
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">
          <div className="investor-profile__card">
            <div className="mb-3">
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--facilon-slate)', margin: 0 }}>My Profile Details</h3>
            </div>
            
            <div className="investor-profile__grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  disabled
                  value={investor.firstName || '-'}
                />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  disabled
                  value={investor.middleName || '-'}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  disabled
                  value={investor.lastName || '-'}
                />
              </div>
              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="text"
                  disabled
                  value={investor.email || '-'}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  disabled
                  value={investor.mobileNumber || '-'}
                />
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input
                  type="text"
                  disabled
                  value={investor.nationality || '-'}
                />
              </div>
              <div className="form-group">
                <label>Country of Residence</label>
                <input
                  type="text"
                  disabled
                  value={investor.countryOfResidence || '-'}
                />
              </div>
              <div className="form-group">
                <label>Investor Type</label>
                <input
                  type="text"
                  disabled
                  value={formatInvestorType(investor.investorType) || '-'}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;
