import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, VerificationStatusDto, AccountDetailsDto, InvestorDashboardDto } from '../../../services/investor.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import './InPersonVerification.scss';

export const InPersonVerification: React.FC = () => {
    const regularNavigate = useNavigate();
    const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
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
            toast.error(error.response?.data?.message || 'Failed to load verification status');
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
        <Header />
        <main className="container-fluid dashboard-container-main">
          <div className="in-person-verification">
            <div className="loading">Loading verification status...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="facilon-dashboard-wrapper">
      <Header />
      <main className="container-fluid dashboard-container-main">
        <div className="in-person-verification">
          {/* Progress Bar */}
          {renderProgressBar()}

          <div className="derivatives-wrap trading-sec-1">
            <div className="container-fluid">
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
                                    value={verificationStatus?.verifiedBy || ''}
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
                                      verificationStatus?.verifiedAt
                                        ? new Date(verificationStatus.verifiedAt!).toLocaleString('en-GB')
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
      </main>
      <Footer />
    </div>
  );
};
