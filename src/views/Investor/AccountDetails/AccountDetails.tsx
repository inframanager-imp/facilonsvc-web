import React, { useEffect, useState } from 'react';
import { investorService, AccountDetailsDto } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import '../DocumentUpload/DocumentUpload.scss';

export const AccountDetails: React.FC = () => {
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
        <main className="container-fluid dashboard-container-main">
          <div className="account-details">
            <div className="loading">Loading account details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="facilon-dashboard-wrapper">
        <main className="container-fluid dashboard-container-main">
          <div className="account-details">
            <div className="error">Failed to load account details.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">
          {/* Progress Bar - same as My Profile */}
          {renderProgressBar()}

          <div className="investor-profile__card document-upload">
            <div className="document-list__header-row">
              <h2>Investor Account Details</h2>
            </div>
            
            <p className="document-list__subtitle">
              Your registered bank account, DP, and trading account details are shown below.
            </p>

            <div className="row g-3">
              {/* Group 1: Bank Account Details */}
              <div className="col-12 mt-3">
                <h3 className="mb-3" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--facilon-slate)', borderBottom: '1.5px solid var(--facilon-grey-200)', paddingBottom: '6px' }}>Bank Account Details</h3>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="bank-name" style={{ fontSize: '11px', fontWeight: 600 }}>Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="bank-name"
                    disabled
                    value={accountDetails.bankAccount?.bankName || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 600 }}>Bank Address (Branch)</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled
                    value={accountDetails.bankAccount?.branchAddress || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="account-number" style={{ fontSize: '11px', fontWeight: 600 }}>Bank Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="account-number"
                    disabled
                    value={accountDetails.bankAccount?.accountNumber || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4 mt-3">
                <div className="form-group">
                  <label htmlFor="swift-code" style={{ fontSize: '11px', fontWeight: 600 }}>SWIFT Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="swift-code"
                    disabled
                    value={accountDetails.bankAccount?.swiftCode || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4 mt-3">
                <div className="form-group">
                  <label htmlFor="ifsc-code" style={{ fontSize: '11px', fontWeight: 600 }}>IFSC Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ifsc-code"
                    disabled
                    value={accountDetails.bankAccount?.ifscCode || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4 mt-3">
                <div className="form-group">
                  <label htmlFor="safe-keeping" style={{ fontSize: '11px', fontWeight: 600 }}>Safe Keeping/Custody Account No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="safe-keeping"
                    disabled
                    value={accountDetails.bankAccount?.safeKeepingAccountNo || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>

              {/* Group 2: Depository Participant Details */}
              <div className="col-12 mt-4">
                <h3 className="mb-3" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--facilon-slate)', borderBottom: '1.5px solid var(--facilon-grey-200)', paddingBottom: '6px' }}>Depository Participant (DP) Details</h3>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="nsdl-dp-id" style={{ fontSize: '11px', fontWeight: 600 }}>NSDL DP ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nsdl-dp-id"
                    disabled
                    value={accountDetails.bankAccount?.nsdlDpId || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="nsdl-account-no" style={{ fontSize: '11px', fontWeight: 600 }}>NSDL Account No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nsdl-account-no"
                    disabled
                    value={accountDetails.bankAccount?.nsdlAccountNo || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="cdsl-account-no" style={{ fontSize: '11px', fontWeight: 600 }}>CDSL Account No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="cdsl-account-no"
                    disabled
                    value={accountDetails.bankAccount?.cdslAccountNo || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>

              {/* Group 3: Trading & Account Status */}
              <div className="col-12 mt-4">
                <h3 className="mb-3" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--facilon-slate)', borderBottom: '1.5px solid var(--facilon-grey-200)', paddingBottom: '6px' }}>Trading & Account Status</h3>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="trading-account" style={{ fontSize: '11px', fontWeight: 600 }}>Trading Account No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="trading-account"
                    disabled
                    value={accountDetails.bankAccount?.tradingAccountNo || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="pms-account" style={{ fontSize: '11px', fontWeight: 600 }}>PMS Account/Folio No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="pms-account"
                    disabled
                    value={accountDetails.bankAccount?.pmsAccountFolioNo || '-'}
                    style={{ height: '32px', fontSize: '11px', backgroundColor: '#fcfcfc' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Account Opening Status</label>
                  <div className="d-flex align-items-center gap-2">
                    {accountDetails.accountOpeningStatus ? (
                      <span className="status-badge status-approved" style={{ fontSize: '11px', padding: '0.4rem 0.8rem' }}>
                        <i className="bi bi-check-circle-fill" /> Completed
                      </span>
                    ) : (
                      <span className="status-badge status-pending" style={{ fontSize: '11px', padding: '0.4rem 0.8rem' }}>
                        <i className="bi bi-clock-fill" /> Pending
                      </span>
                    )}
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
