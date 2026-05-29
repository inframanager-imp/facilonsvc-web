import React, { useEffect, useState } from 'react';
import { investorService, VerificationStatusDto, AccountDetailsDto, InvestorDashboardDto } from '../../../services/investor.service';
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
            <div className="document-list__header-row">
              <h2>In-Person Verification (IPV)</h2>
            </div>
            
            <p className="document-list__subtitle">
              As a regulatory requirement, you must complete an in-person verification process. Your current IPV status is shown below.
            </p>

            {isVerified ? (
              <div className="mb-4 p-3 rounded border border-success d-flex align-items-center gap-3" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: '20px', color: '#059669' }} />
                <div>
                  <h4 className="mb-1" style={{ fontSize: '12px', fontWeight: 700 }}>In-Person Verification Completed</h4>
                  <p className="mb-0" style={{ fontSize: '11px', color: '#047857', opacity: 0.9 }}>
                    Your verification was successfully completed by <strong>{verificationStatus?.verifiedBy || 'System Admin'}</strong> on{' '}
                    <strong>
                      {verificationStatus?.verifiedAt
                        ? new Date(verificationStatus.verifiedAt).toLocaleString('en-GB')
                        : ''}
                    </strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 rounded border border-warning d-flex align-items-center gap-3" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px', color: '#d97706' }} />
                <div>
                  <h4 className="mb-1" style={{ fontSize: '12px', fontWeight: 700 }}>In-Person Verification Pending</h4>
                  <p className="mb-0" style={{ fontSize: '11px', color: '#b45309', opacity: 0.9 }}>
                    Your verification is currently pending. Please schedule an online IPV session using the calendar tool below.
                  </p>
                </div>
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
