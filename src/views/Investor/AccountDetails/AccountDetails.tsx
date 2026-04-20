import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, AccountDetailsDto } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import './AccountDetails.scss';

import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import './AccountDetails.scss';

export const AccountDetails: React.FC = () => {
    const regularNavigate = useNavigate();
    const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
    const [loading, setLoading] = useState(true);
    const [accountDetails, setAccountDetails] = useState<AccountDetailsDto | null>(null);

    useEffect(() => {
        loadAccountDetails();
    }, []);

    const loadAccountDetails = async () => {
        try {
            setLoading(true);
            const data = await investorService.getAccountDetails();
            setAccountDetails(data);
        } catch (err: any) {
            console.error('Failed to load account details:', err);
            toast.error(err.response?.data?.message || 'Failed to load account details');
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = () => {
        // Map AccountDetails.progress to the expected InvestorDashboardDto.progress structure if needed
        // or just pass accountDetails directly if we adjust the component to be flexible.
        // Actually, AccountDetailsDto contains progress in a slightly different shape.
        // I should probably ensure the component can handle both or adapt it here.
        
        // For simplicity, let's cast or map it. 
        // Component expects { progress, accountSummary }
        const mockDashboardData: any = {
            progress: accountDetails?.progress,
            accountSummary: {
                kycDocumentsUploaded: accountDetails?.progress.kycDocumentsUploaded,
                kycDocumentsRequired: accountDetails?.progress.kycDocumentsRequired,
                onboardingDocumentsUploaded: accountDetails?.progress.onboardingDocumentsUploaded,
                onboardingDocumentsRequired: accountDetails?.progress.onboardingDocumentsRequired,
                verificationDone: accountDetails?.progress.verificationDone,
                physicalSubmissionDone: accountDetails?.progress.physicalSubmissionDone,
                accountOpeningStatus: accountDetails?.accountOpeningStatus
            }
        };

        return <PremiumJourneyStepper dashboardData={mockDashboardData} />;
    };

  if (loading) {
    return (
      <div className="facilon-dashboard-wrapper">
        <Header />
        <main className="container-fluid dashboard-container-main">
          <div className="account-details">
            <div className="loading">Loading account details...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="facilon-dashboard-wrapper">
        <Header />
        <main className="container-fluid dashboard-container-main">
          <div className="account-details">
            <div className="error">Failed to load account details.</div>
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
        <div className="account-details">
          {/* Progress Bar - same as My Profile */}
          {renderProgressBar()}

          {/* Laravel-style form layout */}
          <div id="section0" className="section derivatives-wrap trading-sec-1">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12">
                  <div className="tab" role="tabpanel">
                    {/* Nav tabs */}
                    <ul className="nav nav-tabs" role="tablist">
                      <li role="presentation" className="active">
                        <a href="#Section2" aria-controls="profile" role="tab" data-toggle="tab">
                          Investor Account Details
                        </a>
                      </li>
                    </ul>

                    {/* Tab panes */}
                    <div className="tab-content tabs">
                      <div role="tabpanel" className="tab-pane fade show active" id="Section2">
                        <h2 className="p-detail">Investor Account Details</h2>
                        <form action="#" method="post">
                          {/* Row 1: Bank Name, Bank Address, Account Number */}
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group first">
                                <label htmlFor="bank-name">Bank Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="bank-name"
                                  disabled
                                  value={accountDetails.bankAccount?.bankName || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group first">
                                <label>Bank Address (Branch address)</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  disabled
                                  value={accountDetails.bankAccount?.branchAddress || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group first">
                                <label htmlFor="account-number">Bank Account Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="account-number"
                                  disabled
                                  value={accountDetails.bankAccount?.accountNumber || '-'}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Row 2: SWIFT, IFSC, Safe Keeping */}
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group last mb-3" style={{ marginTop: '20px' }}>
                                <label htmlFor="swift-code">SWIFT Code</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="swift-code"
                                  disabled
                                  value={accountDetails.bankAccount?.swiftCode || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="ifsc-code">IFSC Code</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="ifsc-code"
                                  disabled
                                  value={accountDetails.bankAccount?.ifscCode || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="safe-keeping">Safe Keeping/Custody Account No</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="safe-keeping"
                                  disabled
                                  value={accountDetails.bankAccount?.safeKeepingAccountNo || '-'}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Row 3: NSDL DP ID, NSDL Account No, CDSL Account No (matches Laravel line 348-367) */}
                          <div className="row">
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="nsdl-dp-id">NSDL DP ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="nsdl-dp-id"
                                  disabled
                                  value={accountDetails.bankAccount?.nsdlDpId || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="nsdl-account-no">NSDL Account No</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="nsdl-account-no"
                                  disabled
                                  value={accountDetails.bankAccount?.nsdlAccountNo || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="cdsl-account-no">CDSL Account No</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="cdsl-account-no"
                                  disabled
                                  value={accountDetails.bankAccount?.cdslAccountNo || '-'}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Row 4: Trading, PMS, Account Opening (matches Laravel line 370-396) */}
                          <div className="row">
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="trading-account">Trading Account No</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="trading-account"
                                  disabled
                                  value={accountDetails.bankAccount?.tradingAccountNo || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4" style={{ marginTop: '20px' }}>
                              <div className="form-group last mb-3">
                                <label htmlFor="pms-account">PMS Account/Folio No</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="pms-account"
                                  disabled
                                  value={accountDetails.bankAccount?.pmsAccountFolioNo || '-'}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group first" style={{ marginTop: '20px' }}>
                                <p>Account Opening</p>
                                <label className="radio-inline">
                                  <input
                                    type="radio"
                                    name="verification_done"
                                    value="Pending"
                                    checked={!accountDetails.accountOpeningStatus}
                                    disabled
                                  />{' '}
                                  Pending
                                </label>
                                <label className="radio-inline">
                                  <input
                                    type="radio"
                                    name="verification_done"
                                    value="Completed"
                                    checked={accountDetails.accountOpeningStatus}
                                    disabled
                                  />{' '}
                                  Completed
                                </label>
                              </div>
                            </div>
                          </div>
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
