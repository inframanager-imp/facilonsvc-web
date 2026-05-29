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
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">
          {/* Progress Bar */}
          {renderProgressBar()}

          <div className="investor-profile__card document-upload">
            {isVerified ? (
              <div className="mb-3 py-1.5 px-2.5 rounded border border-success d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontSize: '10px' }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: '14px', color: '#059669', flexShrink: 0 }} />
                <span>
                  <strong>In-Person Verification Completed:</strong> Your verification was successfully completed by <strong>{verificationStatus?.verifiedBy || 'System Admin'}</strong> on <strong>{verificationStatus?.verifiedAt ? new Date(verificationStatus.verifiedAt).toLocaleString('en-GB') : ''}</strong>.
                </span>
              </div>
            ) : (
              <div className="mb-3 py-1.5 px-2.5 rounded border border-warning d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#fffbeb', color: '#b45309', fontSize: '10px' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '14px', color: '#d97706', flexShrink: 0 }} />
                <span>
                  <strong>In-Person Verification Pending:</strong> Please schedule an online IPV session using the calendar tool below.
                </span>
              </div>
            )}

            {/* Booking Calendar (shown if not verified) */}
            {isPending && (
              <div className="mt-4 border border-neutral-200 rounded" style={{ overflow: 'hidden' }}>
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
      </main>
    </div>
  );
};
