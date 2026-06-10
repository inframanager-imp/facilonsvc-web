import React, { useEffect, useState } from 'react';
import { investorService, AccountDetailsDto, InvestorDashboardDto } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import '../DocumentUpload/DocumentUpload.scss';

export const AccountDetails: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState<AccountDetailsDto | null>(null);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);

  useEffect(() => {
    loadAccountDetails();
  }, []);

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      const [data, dashboard] = await Promise.all([
        investorService.getAccountDetails(),
        investorService.getDashboard().catch(e => { console.error('Failed to load dashboard:', e); return null; })
      ]);
      setAccountDetails(data);
      setDashboardData(dashboard);
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
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile px-3 px-md-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2 shadow-sm">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex flex-col md:flex-row justify-between items-center text-white gap-3 md:gap-6">
              <div className="flex-shrink-0">
                <h2 className="m-0 text-base font-bold text-white tracking-tight">Account Details</h2>
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
              <h2 className="text-[14px] font-bold text-slate-800 tracking-tight mb-0">Investor Account Details</h2>
              <p className="text-[12px] font-medium text-slate-500 mb-4 mt-1">
                Your registered bank account, DP, and trading account details are shown below.
              </p>

              <div className="row g-3">
                {/* Group 1: Bank Account Details */}
                <div className="col-12 mt-3">
                  <h3 className="text-[12px] font-bold text-slate-700 border-b border-gray-100 pb-2 mb-3">Bank Account Details</h3>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="bank-name" className="text-[11px] font-medium text-slate-500 mb-1">Bank Name</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="bank-name"
                      disabled
                      value={accountDetails.bankAccount?.bankName || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label className="text-[11px] font-medium text-slate-500 mb-1">Bank Address (Branch)</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      disabled
                      value={accountDetails.bankAccount?.branchAddress || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="account-number" className="text-[11px] font-medium text-slate-500 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="account-number"
                      disabled
                      value={accountDetails.bankAccount?.accountNumber || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4 mt-3">
                  <div className="form-group flex flex-col">
                    <label htmlFor="swift-code" className="text-[11px] font-medium text-slate-500 mb-1">SWIFT Code</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="swift-code"
                      disabled
                      value={accountDetails.bankAccount?.swiftCode || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4 mt-3">
                  <div className="form-group flex flex-col">
                    <label htmlFor="ifsc-code" className="text-[11px] font-medium text-slate-500 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="ifsc-code"
                      disabled
                      value={accountDetails.bankAccount?.ifscCode || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4 mt-3">
                  <div className="form-group flex flex-col">
                    <label htmlFor="safe-keeping" className="text-[11px] font-medium text-slate-500 mb-1">Safe Keeping/Custody Account No</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="safe-keeping"
                      disabled
                      value={accountDetails.bankAccount?.safeKeepingAccountNo || '-'}
                    />
                  </div>
                </div>

                {/* Group 2: Depository Participant Details */}
                <div className="col-12 mt-4">
                  <h3 className="text-[12px] font-bold text-slate-700 border-b border-gray-100 pb-2 mb-3">Depository Participant (DP) Details</h3>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="nsdl-dp-id" className="text-[11px] font-medium text-slate-500 mb-1">NSDL DP ID</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="nsdl-dp-id"
                      disabled
                      value={accountDetails.bankAccount?.nsdlDpId || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="nsdl-account-no" className="text-[11px] font-medium text-slate-500 mb-1">NSDL Account No</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="nsdl-account-no"
                      disabled
                      value={accountDetails.bankAccount?.nsdlAccountNo || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="cdsl-account-no" className="text-[11px] font-medium text-slate-500 mb-1">CDSL Account No</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="cdsl-account-no"
                      disabled
                      value={accountDetails.bankAccount?.cdslAccountNo || '-'}
                    />
                  </div>
                </div>

                {/* Group 3: Trading & Account Status */}
                <div className="col-12 mt-4">
                  <h3 className="text-[12px] font-bold text-slate-700 border-b border-gray-100 pb-2 mb-3">Trading & Account Status</h3>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="trading-account" className="text-[11px] font-medium text-slate-500 mb-1">Trading Account No</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="trading-account"
                      disabled
                      value={accountDetails.bankAccount?.tradingAccountNo || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label htmlFor="pms-account" className="text-[11px] font-medium text-slate-500 mb-1">PMS Account/Folio No</label>
                    <input
                      type="text"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-gray-200 rounded text-[11px] text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                      id="pms-account"
                      disabled
                      value={accountDetails.bankAccount?.pmsAccountFolioNo || '-'}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group flex flex-col">
                    <label className="text-[11px] font-medium text-slate-500 mb-1">Account Opening Status</label>
                    <div className="flex items-center mt-0.5">
                      {accountDetails.accountOpeningStatus ? (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20">
                          <i className="bi bi-check-circle-fill" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/20">
                          <i className="bi bi-clock-fill" /> Pending
                        </span>
                      )}
                    </div>
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
