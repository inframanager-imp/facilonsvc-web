import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, VerificationStatusDto, AccountDetailsDto } from '../../../services/investor.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import './InPersonVerification.scss';

export const InPersonVerification: React.FC = () => {
  const regularNavigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusDto | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

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
      toast.error(error.response?.data?.message || 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    if (!dashboardData) return null;

    const progress = dashboardData.progress;
    const accountSummary = dashboardData.accountSummary;

    const isCompleted = (key: string) => {
      return progress?.sections?.[key]?.completed || false;
    };

    const steps = [
      {
        label: 'Submit Information',
        route: '/investor/profile',
        key: 'information',
        percent: isCompleted('personalInfo') ? '100%' : '50%',
        isComplete: isCompleted('personalInfo')
      },
      {
        label: 'KYC Documents',
        route: '/investor/documents',
        key: 'documents',
        percent: accountSummary ? `${Math.min(100, (accountSummary.kycDocumentsUploaded / accountSummary.kycDocumentsRequired) * 100)}%` : '0%',
        isComplete: accountSummary ? accountSummary.kycDocumentsUploaded >= accountSummary.kycDocumentsRequired : false
      },
      {
        label: 'Onboarding Forms',
        route: '/investor/onboarding',
        key: 'onboarding',
        percent: accountSummary ? `${Math.min(100, (accountSummary.onboardingDocumentsUploaded / accountSummary.onboardingDocumentsRequired) * 100)}%` : '0%',
        isComplete: accountSummary ? accountSummary.onboardingDocumentsUploaded >= accountSummary.onboardingDocumentsRequired : false
      },
      {
        label: 'In-person Verification',
        route: '/investor/verification',
        key: 'verification',
        percent: verificationStatus?.currentStatus === 'completed' ? '100%' : '0%',
        isComplete: verificationStatus?.currentStatus === 'completed'
      },
      {
        label: 'Physical Submission',
        route: '/investor/physical-submission',
        key: 'physical',
        percent: verificationStatus?.physicalSubmission?.submitted ? '100%' : '0%',
        isComplete: verificationStatus?.physicalSubmission?.submitted || false
      },
      {
        label: 'Account Details',
        route: '/investor/account-details',
        key: 'account',
        percent: accountSummary?.accountOpeningStatus ? '100%' : '0%',
        isComplete: accountSummary?.accountOpeningStatus || false
      }
    ];

    return (
      <div className="verification__progress-section">
        <div className="container-fluid">
          <center>
            <strong>
              <h2 style={{ fontSize: '36px', color: '#be1717', fontWeight: 500, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                Your Journey
              </h2>
            </strong>
          </center>
          <div className="step-progress">
            {steps.map((step) => (
              <div
                key={step.key}
                className="step"
                onClick={() => isProxyMode ? saNavigate(step.route) : regularNavigate(step.route)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`circle-chart ${step.isComplete ? 'active-one' : ''}`}>
                  {step.isComplete ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    'Start'
                  )}
                </div>
                <p>{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const isVerified = verificationStatus?.currentStatus === 'completed';
  const isPending = !isVerified;

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="in-person-verification">
            <div className="loading">Loading verification status...</div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="in-person-verification">
          {/* Progress Bar */}
          {renderProgressBar()}

          <div className="derivatives-wrap trading-sec-1">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="tab" role="tabpanel">
                    {/* Nav tabs */}
                    <ul className="nav nav-tabs" role="tablist">
                      <li role="presentation" className="active">
                        <a href="#Section1" aria-controls="home" role="tab" data-toggle="tab">
                          In Person Verification
                        </a>
                      </li>
                    </ul>

                    {/* Tab panes */}
                    <div className="tab-content tabs">
                      <div role="tabpanel" className="tab-pane active" id="Section1">
                        <form>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group first">
                                <p style={{ marginBottom: '10px', fontWeight: 500 }}>Verification Done?</p>
                                <label className="radio-inline" style={{ marginRight: '20px' }}>
                                  <input
                                    type="radio"
                                    name="verification_done"
                                    value="yes"
                                    checked={isVerified}
                                    disabled
                                    style={{ marginRight: '5px' }}
                                  />
                                  Yes
                                </label>
                                <label className="radio-inline">
                                  <input
                                    type="radio"
                                    name="verification_done"
                                    value="no"
                                    checked={isPending}
                                    disabled
                                    style={{ marginRight: '5px' }}
                                  />
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Verification Details (shown if verified) */}
                          {isVerified && (
                            <div className="row" id="verification_done_div">
                              <div className="col-md-6">
                                <div className="form-group first">
                                  <label htmlFor="verification-by">Verification Done By</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="verification-by"
                                    value={verificationStatus.verifiedBy || ''}
                                    disabled
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group first">
                                  <label htmlFor="verification-date-time">Verification Date and Time</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="verification-date-time"
                                    value={
                                      verificationStatus.verifiedAt
                                        ? new Date(verificationStatus.verifiedAt).toLocaleString('en-GB')
                                        : ''
                                    }
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Booking Calendar (shown if not verified) */}
                          {isPending && (
                            <div className="row" id="verification_not_done_div">
                              <div className="col-md-12">
                                <div className="form-group first">
                                  <iframe
                                    src="https://outlook.office.com/book/MeetingwithVentura@facilonservices.com/?ismsaljsauthenabled"
                                    width="100%"
                                    height="800"
                                    frameBorder="0"
                                    title="Book Verification Appointment"
                                    style={{ border: 'none', borderRadius: '8px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
