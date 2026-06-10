import React, { useEffect, useState } from 'react';
import { investorService, VerificationStatusDto, InvestorDashboardDto } from '../../../services/investor.service';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import '../DocumentUpload/DocumentUpload.scss';

export const InPersonVerification: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusDto | null>(null);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [status, dashboard] = await Promise.all([
        investorService.getVerificationStatus(),
        investorService.getDashboard()
      ]);
      setVerificationStatus(status);
      setDashboardData(dashboard);
    } catch (error: any) {
      console.error('Error loading verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    return <PremiumJourneyStepper dashboardData={dashboardData} />;
  };

  const isVerified = verificationStatus?.currentStatus === 'completed';
  const isPending = !isVerified;

  if (loading) {
    return (
      <div className="facilon-dashboard-wrapper">
        <main className="container-fluid dashboard-container-main">
          <div className="in-person-verification">
            <div className="loading">Loading verification status...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile px-3 px-md-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2 shadow-sm">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex flex-col md:flex-row justify-between items-center text-white gap-3 md:gap-6">
              <div className="flex-shrink-0">
                <h2 className="m-0 text-base font-bold text-white tracking-tight">In-Person Verification</h2>
                {dashboardData?.productAssignment?.serviceProviderName && (
                  <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">
                    Service Provider: <strong>{dashboardData.productAssignment.serviceProviderName}</strong>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <PremiumJourneyStepper dashboardData={dashboardData} compact={true} />
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 bg-white">
            {isVerified ? (
              <div className="mb-3 py-2 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-[14px] text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>In-Person Verification Completed:</strong> Your verification was successfully completed by <strong>{verificationStatus?.verifiedBy || 'System Admin'}</strong> on <strong>{verificationStatus?.verifiedAt ? new Date(verificationStatus.verifiedAt).toLocaleString('en-GB') : ''}</strong>.
                </span>
              </div>
            ) : (
              <div className="mb-3 py-2 px-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-[11px] flex items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill text-[14px] text-amber-600 flex-shrink-0" />
                <span>
                  <strong>In-Person Verification Pending:</strong> Please schedule an online IPV session using the calendar tool below.
                </span>
              </div>
            )}

            {/* Booking Calendar (shown if not verified) */}
            {isPending && (
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <iframe
                  src="https://outlook.office.com/book/MeetingwithVentura@facilonservices.com/?ismsaljsauthenabled"
                  width="100%"
                  height="750"
                  frameBorder="0"
                  title="Book Verification Appointment"
                  style={{ border: 'none', backgroundColor: '#ffffff' }}
                />
              </div>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};
