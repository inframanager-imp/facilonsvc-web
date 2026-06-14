import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import { investorService, InvestorDashboardDto, JourneyListItem, DsrCaseResponseDto } from '../../../services/investor.service';
import { delegationService } from '../../../services/delegation.service';
import { kycDocumentsService, KycRequirementsResponseDto, KycRequirementState } from '../../../services/kycDocuments.service';
import { DelegationDto } from '../../../models/DelegationDto';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { AcceptDelegationModal, ConsentCustomization } from '../../../components/AcceptDelegationModal/AcceptDelegationModal';
// import './InvestorDashboard.scss';

/**
 * Module-level cache so returning to the dashboard renders instantly from the last
 * load (stale-while-revalidate) instead of showing a spinner and cold-fetching again.
 * Lives for the app session; cleared on a full page reload / logout.
 */
let dashboardCache: {
  dashboardData: InvestorDashboardDto | null;
  journeys: JourneyListItem[];
  dsrCases: DsrCaseResponseDto[];
  pendingDelegations: DelegationDto[];
  kycRequirements: KycRequirementsResponseDto | null;
} | null = null;

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Show the spinner only on the very first load; on return, render cached data immediately.
  const [loading, setLoading] = useState(!dashboardCache);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(dashboardCache?.dashboardData ?? null);
  const [journeys, setJourneys] = useState<JourneyListItem[]>(dashboardCache?.journeys ?? []);
  const [dsrCases, setDsrCases] = useState<DsrCaseResponseDto[]>(dashboardCache?.dsrCases ?? []);
  const [pendingDelegations, setPendingDelegations] = useState<DelegationDto[]>(dashboardCache?.pendingDelegations ?? []);
  const [kycRequirements, setKycRequirements] = useState<KycRequirementsResponseDto | null>(dashboardCache?.kycRequirements ?? null);
  const [processingDelegation, setProcessingDelegation] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationDto | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDsrModal, setShowDsrModal] = useState(false);
  const [showMakeRequestModal, setShowMakeRequestModal] = useState(false);

  // Form states for Make a Request modal
  const [requestType, setRequestType] = useState('Right to Access');
  const [requestComments, setRequestComments] = useState('');
  const [requestFile, setRequestFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingDelegations();
    fetchJourneys();
    fetchDsrCases();
    fetchKycRequirements();
  }, []);

  // Keep the session cache in sync so the next return paints instantly.
  useEffect(() => {
    dashboardCache = { dashboardData, journeys, dsrCases, pendingDelegations, kycRequirements };
  }, [dashboardData, journeys, dsrCases, pendingDelegations, kycRequirements]);

  const fetchJourneys = async () => {
    try {
      const data = await investorService.getJourneys();
      setJourneys(data || []);
    } catch (error) {
      console.error('[InvestorDashboard] Error fetching journeys:', error);
    }
  };

  const fetchDsrCases = async () => {
    try {
      const data = await investorService.getDsrCases();
      setDsrCases(data || []);
    } catch (error) {
      console.error('[InvestorDashboard] Error fetching DSR cases:', error);
    }
  };

  const fetchKycRequirements = async () => {
    try {
      const data = await kycDocumentsService.getRequirements();
      setKycRequirements(data);
    } catch (error) {
      console.error('[InvestorDashboard] Error fetching KYC requirements:', error);
    }
  };

  const prettyRequestType = (t: string) =>
    (t || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const dsrStatusColor = (status?: string): string => {
    switch (status) {
      case 'Response Available':
        return 'bg-[#ecfdf5] text-[#10b981]'; // green
      case 'Verification Required':
      case 'More Information Required':
      case 'Partially Completed':
        return 'bg-[#fff8f0] text-[#f59e0b]'; // amber
      case 'Unable to Fulfil':
        return 'bg-[#fef2f2] text-[#ef4444]'; // red
      case 'Closed':
        return 'bg-[#f1f5f9] text-[#64748b]'; // slate
      default:
        return 'bg-[#eff6ff] text-[#3b82f6]'; // blue (Submitted/Received/Under Review/…)
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await investorService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('[InvestorDashboard] Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDelegations = async () => {
    try {
      const pending = await delegationService.getPendingDelegations();
      setPendingDelegations(pending);
    } catch (error) {
      console.error('[InvestorDashboard] Error fetching pending delegations:', error);
    }
  };

  const handleOpenAcceptModal = (delegation: DelegationDto) => {
    setSelectedDelegation(delegation);
    setShowAcceptModal(true);
  };

  const handleAcceptDelegation = async (delegationId: number, customizations: ConsentCustomization) => {
    setProcessingDelegation(delegationId);
    try {
      await delegationService.acceptDelegation(delegationId, customizations);
      toast.success('Service Agent access accepted');
      setShowAcceptModal(false);
      fetchPendingDelegations();
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to accept delegation');
    } finally {
      setProcessingDelegation(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!dashboardData) {
    return (
      <div className="facilon-dashboard-wrapper">
        <Header />
        <div className="container-fluid dashboard-container-main">
          <div className="alert alert-warning mt-4">
            Unable to load dashboard data. Please refresh.
          </div>
        </div>
      </div>
    );
  }

  // MOCK DATA for the new layout
  const pendingActions = [
    { activity: 'KYC Document Verification', centra: 'Compliance', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/30' },
    { activity: 'Risk Profile Assessment', centra: 'Onboarding', status: 'REVIEW', statusColor: 'bg-[#eff6ff] text-[#3b82f6] border border-[#3b82f6]/30' },
    { activity: 'Fatca Declaration', centra: 'Tax Centre', status: 'REQUIRED', statusColor: 'bg-[#fef2f2] text-[#ef4444] border border-[#ef4444]/30' },
  ];

  // My Appointment card hidden for now — mock data kept for when it's re-enabled
  // const appointments = [
  //   { product: 'HYSA Consultation', provider: 'Global Wealth', date: 'May 15, 2026', status: 'CONFIRMED', statusColor: 'bg-[#ecfdf5] text-[#10b981] border-none' },
  //   { product: 'Equity Review', provider: 'Northern Trust', date: 'May 22, 2026', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b] border-none' },
  //   { product: 'Tax Strategy', provider: 'Facilon Prime', date: 'June 02, 2026', status: 'CONFIRMED', statusColor: 'bg-[#ecfdf5] text-[#10b981] border-none' },
  // ];

  // My Documents card — derived from real KYC requirements (Smart Upload / OCR).
  // Falls back to placeholder rows until /kyc/requirements has loaded.
  const KYC_STATE_LABEL: Record<KycRequirementState, string> = {
    NOT_UPLOADED: 'Not Uploaded',
    PENDING: 'Pending',
    PENDING_REVIEW: 'In Review',
    VALID: 'Approved',
    DISCREPANCY: 'Needs Attention',
    EXPIRED: 'Expired',
    EXPIRES_SOON: 'Expiring Soon',
    OCR_FAILED: 'Upload Failed',
  };
  const KYC_STATE_COLOR: Record<KycRequirementState, string> = {
    NOT_UPLOADED: 'text-slate-400',
    PENDING: 'text-[#3b82f6]',
    PENDING_REVIEW: 'text-[#f59e0b]',
    VALID: 'text-[#10b981]',
    DISCREPANCY: 'text-[#ef4444]',
    EXPIRED: 'text-[#ef4444]',
    EXPIRES_SOON: 'text-[#f59e0b]',
    OCR_FAILED: 'text-[#ef4444]',
  };

  const kycSlots = kycRequirements?.slots ?? [];
  const kycUploadedCount = kycSlots.filter((s) => s.state !== 'NOT_UPLOADED').length;
  const kycTotalCount = kycSlots.length;
  const kycApprovedCount = kycSlots.filter((s) => s.state === 'VALID').length;
  const kycRejectedCount = kycSlots.filter(
    (s) => s.state === 'DISCREPANCY' || s.state === 'OCR_FAILED' || s.state === 'EXPIRED'
  ).length;
  const kycCompletePct =
    kycRequirements && kycRequirements.mandatoryTotal > 0
      ? Math.round((kycRequirements.mandatoryComplete / kycRequirements.mandatoryTotal) * 100)
      : 0;

  const documents = kycSlots.length > 0
    ? kycSlots.map((s) => ({
        type: s.label,
        name: KYC_STATE_LABEL[s.state] ?? s.state,
        nameColor: KYC_STATE_COLOR[s.state] ?? 'text-slate-400',
      }))
    : [
        { type: 'PAN Card', name: 'Not Uploaded', nameColor: 'text-slate-400' },
        { type: 'Passport', name: 'Not Uploaded', nameColor: 'text-slate-400' },
        { type: 'Aadhaar Card', name: 'Not Uploaded', nameColor: 'text-slate-400' },
        { type: 'Address Proof', name: 'Not Uploaded', nameColor: 'text-slate-400' },
      ];

  const permissions = [
    { permission: 'Account View', assignee: 'Advisor', status: 'ACTIVE', statusColor: 'bg-[#ecfdf5] text-[#10b981]' },
    { permission: 'Trade Execution', assignee: 'Broker', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b]' },
    { permission: 'Doc Upload', assignee: 'Tax Pro', status: 'INACTIVE', statusColor: 'bg-[#f1f5f9] text-[#64748b]' },
  ];

  const permissionsCenterList = [
    { permission: 'Account View', assignee: 'Advisor Team', accessLevel: 'Read-Only', status: 'ACTIVE', statusColor: 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20' },
    { permission: 'Trade Execution', assignee: 'Primary Broker', accessLevel: 'Full Access', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/20' },
    { permission: 'Document Upload', assignee: 'Tax Consultant', accessLevel: 'Write-Only', status: 'INACTIVE', statusColor: 'bg-slate-100 text-slate-500 border border-slate-200' },
  ];


  const dsrRequestsList = [
    { id: 'REQ-8302', type: 'Right to Access', status: 'COMPLETED', statusColor: 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20', response: '2 files available' },
    { id: 'REQ-8419', type: 'Right to Rectification', status: 'IN REVIEW', statusColor: 'bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/20', response: 'Awaiting support' },
    { id: 'REQ-8542', type: 'Right to Erasure', status: 'PENDING', statusColor: 'bg-slate-100 text-slate-500 border border-[#e2e8f0]', response: 'Under evaluation' }
  ];

  // Consent rows come from the API (dashboardData.consentCenter) so the Consent Centre, SOW row
  // and statuses stay in sync. Read-only here — actions live on the My Consents page.
  const consents = (dashboardData?.consentCenter || []).map((c) => ({
    name: c.consent || '-',
    desc: c.scope || '-',
    status: (c.status || '').toUpperCase(),
    statusColor: c.status === 'Active'
      ? 'bg-[#ecfdf5] text-[#10b981]'
      : 'bg-[#f1f5f9] text-[#64748b]',
  }));

  return (
    <div className="facilon-dashboard-wrapper font-sans text-gray-800 min-h-screen pb-0">
      <main className="container-fluid px-0 pt-0 pb-0 dashboard-container-main">
        {!showPermissionsModal && !showConsentModal && !showDsrModal && (
          <>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] text-white rounded shadow-sm mb-3 px-4 py-3 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col justify-between items-start mb-0">
                  <h1 className="text-[16px] font-bold text-white flex items-center tracking-tight mb-0">
                    Welcome {dashboardData?.investor?.firstName || 'Pankaj'} {dashboardData?.investor?.lastName || ''}
                    <i className="bi bi-pencil-square ml-2 text-[12px] opacity-70 cursor-pointer hover:opacity-100"></i>
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-[12px] opacity-90 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Email:</span>
                      <span className="font-semibold">{dashboardData?.investor?.email || 'investor@example.com'}</span>
                    </div>
                    |
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Investor ID:</span>
                      <span className="font-semibold">{dashboardData?.investor?.uniqueCode || '202604096545'}</span>
                    </div>
                    |
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Country of Residence:</span>
                      <span className="font-semibold">{dashboardData?.investor?.countryOfResidence || 'United States'}</span>
                    </div>
                    |
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Nationality:</span>
                      <span className="font-semibold">{dashboardData?.investor?.nationality || 'American'}</span>
                    </div>
                    |
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Mobile:</span>
                      <span className="font-semibold">{dashboardData?.investor?.mobileNumber || '+1 (555) 123-4567'}</span>
                    </div>
                  </div>
                </div>


                <div>
                  <div className="bg-white/10 border border-white/25 rounded px-2.5 py-1 flex items-center text-[11px] cursor-pointer hover:bg-white/20 transition-colors">
                    <span>{dashboardData?.investor?.firstName || 'Pankaj'} (Primary)</span>
                    <i className="bi bi-chevron-down ml-2 text-[9px]"></i>
                  </div>
                </div>
              </div>

            </div>

            {/* TOP ROW: 2 Column Layout (My Appointment hidden) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3 items-start">

              {/* Column 1: My Pending Action */}
              <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
                <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                  <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                    <i className="bi bi-list-task mr-2 text-slate-500"></i> My Pending Action
                  </h2>
                  <span className="bg-[#e0ecf0] text-[#1f4851] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    3 PENDING
                  </span>
                </div>

                <div className="px-4 pt-2 pb-2 flex flex-col justify-start">
                  <div>
                    <div className="grid grid-cols-12 text-[8px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-[#e2e8f0] mb-1">
                      <div className="col-span-6">PENDING ACTIVITY</div>
                      <div className="col-span-3">CENTRA</div>
                      <div className="col-span-2">STATUS</div>
                      <div className="col-span-1 text-right">ACTION</div>
                    </div>

                    <div className="flex flex-col">
                      {pendingActions.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-6 text-[11px] font-semibold text-slate-700 pr-1">{item.activity}</div>
                          <div className="col-span-3 text-[11px] text-slate-500">{item.centra}</div>
                          <div className="col-span-2 flex items-center">
                            <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="col-span-1 text-right flex justify-end">
                            <button className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 border border-slate-200 rounded bg-slate-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button className="w-full py-1.5 text-[10px] font-semibold text-[#1f4851] border border-[#1f4851] rounded hover:bg-[#1f4851]/5 transition-colors">
                      View All Pending Actions
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: My Onboarding Status */}
              <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
                <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                  <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                    <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    My Onboarding Status
                  </h2>
                  <button
                    onClick={() => navigate('/investor/journeys')}
                    className="text-[11px] font-semibold text-[#3e6f7c] hover:underline hover:text-[#1f4851] transition-colors flex items-center bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Facilon Status &rarr;
                  </button>
                </div>

                <div className="px-4 pt-2 pb-2 flex flex-col justify-start">
                  <div>
                    <div className="grid grid-cols-12 text-[8px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-[#e2e8f0] mb-1">
                      <div className="col-span-4">SERVICE PROVIDER</div>
                      <div className="col-span-4">PRODUCT</div>
                      <div className="col-span-3">STATUS</div>
                      <div className="col-span-1 text-right">ACTION</div>
                    </div>

                    <div className="flex flex-col">
                      {journeys.length === 0 ? (
                        <div className="py-4 text-center text-[11px] text-slate-400">
                          No onboarding journeys assigned yet.
                        </div>
                      ) : (
                        journeys.map((item, idx) => {
                          const status = (item.status || 'IN PROGRESS').toUpperCase();
                          const completed = status === 'COMPLETED';
                          const statusColor = completed
                            ? 'text-[#10b981] bg-[#ecfdf5]'
                            : status === 'ABANDONED'
                              ? 'text-[#ef4444] bg-[#fef2f2]'
                              : status === 'IN REVIEW'
                                ? 'text-[#f59e0b] bg-[#fff8f0]'
                                : 'text-[#3b82f6] bg-[#eff6ff]';
                          const barColor = completed ? 'bg-[#10b981]' : status === 'IN PROGRESS' ? 'bg-[#3b82f6]' : status === 'ABANDONED' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]';
                          const progress = typeof item.progress === 'number' ? item.progress : (completed ? 100 : status === 'ABANDONED' ? 100 : 0);
                          const goToJourney = () => navigate(item.actionRoute || '/investor/journeys');
                          return (
                            <div key={item.journeyId || idx} className="grid grid-cols-12 items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors">
                              <div className="col-span-4 pr-1">
                                <div className="text-[11px] font-bold text-slate-800 leading-tight">{item.serviceProviderName || '-'}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{item.productCode ? `Code: ${item.productCode}` : '-'}</div>
                              </div>
                              <div className="col-span-4 text-[11px] text-slate-600 pr-1 leading-tight">{item.product || '-'}</div>
                              <div className="col-span-3 pr-1 flex flex-col items-start justify-center">
                                <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${statusColor}`}>
                                  {status}
                                </span>
                                <div className="w-12 h-[3px] bg-[#e2e8f0] rounded-full mt-1.5 overflow-hidden">
                                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }}></div>
                                </div>
                              </div>
                              <div className="col-span-1 text-right flex justify-end">
                                <button
                                  onClick={goToJourney}
                                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  {completed ? (
                                    <i className="bi bi-eye text-[12px]"></i>
                                  ) : (
                                    <i className="bi bi-play-fill text-[13px] ml-0.5"></i>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => navigate('/investor/journeys')}
                      className="w-full py-1.5 text-[10px] font-semibold text-[#1f4851] border border-[#1f4851] rounded hover:bg-[#1f4851]/5 transition-colors flex justify-center items-center cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      View Detailed Journey
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 3: My Appointment — hidden for now (Coming Soon)
              <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
                <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                  <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                    <i className="bi bi-calendar3 mr-2 text-slate-500"></i> My Appointment
                  </h2>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/30">
                    Coming Soon
                  </span>
                </div>

                <div className="px-4 pt-2 pb-2 flex flex-col justify-start">
                  <div>
                    <div className="grid grid-cols-12 text-[8px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-[#e2e8f0] mb-1">
                      <div className="col-span-5">PRODUCT</div>
                      <div className="col-span-3">SERVICE PROVIDER</div>
                      <div className="col-span-2">DATE</div>
                      <div className="col-span-2 text-right">STATUS</div>
                    </div>

                    <div className="flex flex-col">
                      {appointments.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-5 text-[11px] font-bold text-slate-800 pr-1 leading-tight">
                            {item.product}
                          </div>
                          <div className="col-span-3 text-[11px] text-slate-500 pr-1 leading-tight">{item.provider}</div>
                          <div className="col-span-2 text-[11px] pr-1 leading-tight">
                            <div className="font-semibold text-slate-700">{item.date.split(',')[0]},</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{item.date.split(',')[1]?.trim()}</div>
                          </div>
                          <div className="col-span-2 text-right flex justify-end">
                            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button className="w-full py-1.5 text-[10px] font-semibold text-slate-400 border border-slate-200 rounded bg-slate-50 cursor-not-allowed flex justify-center items-center" disabled>
                      <i className="bi bi-calendar3 mr-1.5"></i> View All Appointments
                    </button>
                  </div>
                </div>
              </div>
              */}

            </div>

            {/* BOTTOM ROW: 3 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">

              {/* Column 1: My Documents */}
              <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
                <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                  <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                    <i className="bi bi-cloud-arrow-up mr-2 text-slate-500"></i> My Documents
                  </h2>
                  <button
                    onClick={() => navigate('/investor/documents-center')}
                    className="text-[11px] font-semibold text-[#3e6f7c] hover:underline hover:text-[#1f4851] transition-colors flex items-center bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Documents Center &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-4 divide-x divide-[#e2e8f0] border-b border-[#e2e8f0]">
                  <div className="py-2.5 text-center flex flex-col items-center">
                    <span className="text-[16px] font-bold text-slate-800">{kycUploadedCount}</span>
                    <span className="text-[8px] text-slate-500">of {kycTotalCount || '—'} Uploaded</span>
                  </div>
                  <div className="py-2.5 text-center flex flex-col items-center">
                    <span className="text-[16px] font-bold text-slate-800">{kycCompletePct}%</span>
                    <span className="text-[8px] text-slate-500">Complete</span>
                  </div>
                  <div className="py-2.5 text-center flex flex-col items-center">
                    <span className="text-[16px] font-bold text-[#10b981]">{kycApprovedCount}</span>
                    <span className="text-[8px] text-slate-500">Approved</span>
                  </div>
                  <div className="py-2.5 text-center flex flex-col items-center">
                    <span className="text-[16px] font-bold text-[#ef4444]">{kycRejectedCount}</span>
                    <span className="text-[8px] text-slate-500">Rejected</span>
                  </div>
                </div>

                <div className="px-4 pb-2 pt-3 flex flex-col overflow-hidden">
                  <div>
                    <div className="grid grid-cols-12 text-[8px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-[#e2e8f0] mb-1">
                      <div className="col-span-5">DOCUMENT TYPE</div>
                      <div className="col-span-5">DOCUMENT NAME</div>
                      <div className="col-span-2 text-right">ACTION</div>
                    </div>

                    <div className="flex flex-col">
                      {documents.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-5 text-[11px] font-semibold text-slate-700 pr-1">{item.type}</div>
                          <div className={`col-span-5 text-[11px] ${item.nameColor}`}>{item.name}</div>
                          <div className="col-span-2 text-right flex justify-end">
                            <button
                              onClick={() => navigate('/investor/documents-center')}
                              className="text-slate-400 hover:text-[#1f4851] transition-colors p-1 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer"
                              title="Upload / manage in Documents Center"
                            >
                              <i className="bi bi-cloud-arrow-up text-[10px]"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: My Permissions & My Request stacked */}
              <div className="flex flex-col gap-3">

                {/* My Permissions */}
                <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
                  <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                    <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                      <i className="bi bi-shield-lock mr-2 text-slate-500"></i> My Permissions
                    </h2>
                    <button
                      onClick={() => setShowPermissionsModal(true)}
                      className="text-[12px] font-semibold text-[#3e6f7c] hover:underline hover:text-[#1f4851] transition-colors flex items-center bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Permissions Center &rarr;
                    </button>
                  </div>

                  <div className="px-4 pt-2 pb-2 flex flex-col justify-start">
                    <div>
                      <div className="grid grid-cols-12 text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-[#e2e8f0] mb-1">
                        <div className="col-span-5">PERMISSION</div>
                        <div className="col-span-4">ASSIGNEE</div>
                        <div className="col-span-3 text-right">STATUS</div>
                      </div>

                      <div className="flex flex-col">
                        {permissions.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors">
                            <div className="col-span-5 text-[11px] font-bold text-slate-800 pr-1">{item.permission}</div>
                            <div className="col-span-4 text-[11px] text-slate-500">{item.assignee}</div>
                            <div className="col-span-3 text-right flex justify-end">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <button className="w-full py-1.5 text-[11px] font-semibold text-[#1f4851] border border-[#1f4851] rounded hover:bg-[#1f4851]/5 transition-colors">
                        Manage Permissions
                      </button>
                    </div>
                  </div>
                </div>

                {/* My Request */}
                <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
                  <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                    <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                      <i className="bi bi-journal-text mr-2 text-slate-500"></i> Data Subject Right Request Center
                    </h2>
                  </div>

                  <div className="px-4 pt-2 pb-2 flex flex-col justify-start">
                    <div>
                      <div className="grid grid-cols-12 text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-[#e2e8f0] mb-1">
                        <div className="col-span-8">TYPE OF REQUEST</div>
                        <div className="col-span-4 text-right">STATUS</div>
                      </div>

                      <div className="flex flex-col">
                        {dsrCases.length === 0 && (
                          <div className="text-[11px] text-slate-400 py-3 text-center">
                            No DSR requests yet.
                          </div>
                        )}
                        {dsrCases.slice(0, 4).map((item) => (
                          <div
                            key={item.caseId}
                            onClick={() => navigate(`/investor/dsr-center/requests?case=${item.caseId}`)}
                            className="grid grid-cols-12 items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
                          >
                            <div className="col-span-8 text-[11px] font-bold text-slate-800 pr-1">
                              {prettyRequestType(item.requestType)}
                              <span className="block text-[9px] font-normal text-slate-400">{item.caseId}</span>
                            </div>
                            <div className="col-span-4 text-right flex justify-end">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${dsrStatusColor(item.investorStatus)}`}>
                                {item.investorStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate('/investor/dsr-center/requests')}
                        className="flex-1 py-1.5 text-[11px] font-semibold text-[#1f4851] border border-[#1f4851] rounded hover:bg-[#1f4851]/5 transition-colors"
                      >
                        View All Requests
                      </button>
                      <button
                        onClick={() => navigate('/investor/dsr-center')}
                        className="flex-1 py-1.5 text-[11px] font-semibold text-white bg-[#1f4851] border border-[#1f4851] rounded hover:bg-[#163a42] transition-colors"
                      >
                        New Request &rarr;
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Column 3: My Consents */}
              <div className="bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col relative">
                <div className="p-2 flex justify-between items-center border-b border-[#e2e8f0]">
                  <h2 className="text-[14px] font-bold text-slate-800 flex items-center tracking-tight mb-0">
                    <i className="bi bi-check2-all mr-2 text-slate-500"></i> My Consents
                  </h2>
                  <button
                    onClick={() => navigate('/investor/consents')}
                    className="text-[12px] font-semibold text-[#3e6f7c] hover:underline hover:text-[#1f4851] transition-colors flex items-center bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Consent Center &rarr;
                  </button>
                </div>

                <div className="px-4 pt-2 pb-2 flex flex-col justify-start">
                  <div className="overflow-y-auto max-h-[300px]">
                    <div className="flex flex-col">
                      {consents.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-1 border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50/50 transition-colors">
                          <div>
                            <div className="text-[11px] font-bold text-slate-800 leading-tight">{item.name}</div>
                            <div className="text-[10px] text-[#1f4851]">{item.desc}</div>
                          </div>
                          <div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="bg-[#f0f7f9] rounded py-2 px-3 text-[10px] text-slate-600 font-medium">
                      Service Agent: <span className="text-slate-400">None assigned - Status: NOT ASSIGNED</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
        {showPermissionsModal && (
          <div className="bg-white rounded-lg w-full max-w-6xl overflow-hidden border border-slate-200 mt-0 mx-0 mb-0">
            {/* Header Banner */}
            <div className="bg-[#2c525d] text-white px-3 py-3 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-bold text-white mb-0.5 tracking-tight">
                  Permissions Center
                </h3>
                <p className="text-[10px] text-white/80 m-0 font-medium">
                  Manage your account permissions and access levels.
                </p>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="bg-transparent border border-white/25 hover:bg-white/10 text-white rounded px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg text-[9px]"></i> Close
              </button>
            </div>

            {/* Modal Body Container with custom grey background padding */}
            <div className="bg-[#e1e4e7] p-0">
              {/* White rounded card inside */}
              <div className="bg-white border border-slate-200/60 p-0">

                {/* Action Row */}
                <div className="flex justify-end mb-1 px-2 pt-1">
                  <button className="bg-[#2c525d] hover:bg-[#1f4851] text-white rounded px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-0">
                    <i className="bi bi-pencil-square text-[10px]"></i> Grant New Permission
                  </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto w-full px-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0]">
                        <th className="pb-3.5 px-2">PERMISSION</th>
                        <th className="pb-3.5 px-2">ASSIGNEE</th>
                        <th className="pb-3.5 px-2">ACCESS LEVEL</th>
                        <th className="pb-3.5 px-2">STATUS</th>
                        <th className="pb-3.5 px-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {permissionsCenterList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-2 text-[12px] font-bold text-slate-800">{item.permission}</td>
                          <td className="py-2 px-2 text-[12px] font-medium text-[#3e6f7c]">{item.assignee}</td>
                          <td className="py-2 px-2 text-[12px] text-slate-500">{item.accessLevel}</td>
                          <td className="py-2 px-2">
                            <span className={`${item.statusColor} text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[10px] font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer ml-auto">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}
        {showConsentModal && (
          <div className="bg-white rounded-lg w-full overflow-hidden border border-slate-200 mt-0 mb-0">
            {/* Header Banner */}
            <div className="bg-[#2c525d] text-white px-3 py-3 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-bold text-white mb-0.5 tracking-tight">
                  Consent Center
                </h3>
                <p className="text-[10px] text-white/80 m-0 font-medium">
                  Manage your active consents and data sharing preferences.
                </p>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="bg-transparent border border-white/25 hover:bg-white/10 text-white rounded px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg text-[9px]"></i> Close
              </button>
            </div>

            {/* Modal Body Container with custom grey background padding */}
            <div className="bg-[#e1e4e7] p-0">
              {/* White rounded card inside */}
              <div className="bg-white border border-slate-200/60 p-3 shadow-sm">

                {/* Data Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0]">
                        <th className="pb-3.5 px-2">CONSENT</th>
                        <th className="pb-3.5 px-2">SCOPE</th>
                        <th className="pb-3.5 px-2">STATUS</th>
                        <th className="pb-3.5 px-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {consents.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-2 text-[12px] font-bold text-slate-800">{item.name}</td>
                          <td className="py-2 px-2 text-[12px] font-medium text-[#3e6f7c]">{item.desc}</td>
                          <td className="py-2 px-2">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block ${item.status === 'ACTIVE'
                              ? 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button className="bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#10b981] border border-[#10b981]/25 text-[8px] font-extrabold px-3 py-1.5 rounded inline-flex items-center gap-2 tracking-wider transition-colors cursor-pointer ml-auto">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Action Row */}
                <div className="flex gap-3 mt-4 px-2 pb-1">
                  <button className="bg-[#2c525d] hover:bg-[#1f4851] text-white rounded px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-0">
                    <i className="bi bi-gear text-[10px]"></i> Manage All Consent
                  </button>
                  <button className="bg-white border border-[#2c525d] text-[#2c525d] hover:bg-[#2c525d]/5 rounded px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <i className="bi bi-cloud-arrow-down text-[11px]"></i> Download Documents
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
        {showDsrModal && (
          <div className="bg-white rounded-lg w-full overflow-hidden border border-slate-200 mt-0 mb-0">
            {/* Header Banner */}
            <div className="bg-[#2c525d] text-white px-3 py-3 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-bold text-white mb-0.5 tracking-tight">
                  Data Subject Rights Center
                </h3>
                <p className="text-[10px] text-white/80 m-0 font-medium">
                  Manage your data requests and privacy preferences.
                </p>
              </div>
              <button
                onClick={() => setShowDsrModal(false)}
                className="bg-transparent border border-white/25 hover:bg-white/10 text-white rounded px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg text-[9px]"></i> Close
              </button>
            </div>

            {/* Modal Body Container with custom grey background padding */}
            <div className="bg-[#e1e4e7] p-0">
              {/* White rounded card inside */}
              <div className="bg-white border border-slate-200/60 p-3 shadow-sm">

                {/* Subheader action buttons */}
                <div className="flex justify-between items-center mb-4 px-2 pt-2">
                  <button className="bg-transparent border border-slate-300 hover:border-slate-400 text-slate-700 rounded px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <i className="bi bi-clock-history"></i> Request Status
                  </button>
                  <button
                    onClick={() => setShowMakeRequestModal(true)}
                    className="bg-[#2c525d] hover:bg-[#1f4851] text-white rounded px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-0"
                  >
                    <i className="bi bi-pencil-square text-[10px]"></i> Make a Request
                  </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0]">
                        <th className="pb-3.5 px-2">REQUEST ID</th>
                        <th className="pb-3.5 px-2">REQUEST TYPE</th>
                        <th className="pb-3.5 px-2">STATUS</th>
                        <th className="pb-3.5 px-2 text-right">RESPONSES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {dsrRequestsList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-2 text-[12px] font-bold text-slate-800">{item.id}</td>
                          <td className="py-2 px-2 text-[12px] font-medium text-[#3e6f7c]">{item.type}</td>
                          <td className="py-2 px-2">
                            <span className={`${item.statusColor} text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-[12px] font-medium text-slate-400 text-right">
                            {item.response}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {selectedDelegation && (
        <AcceptDelegationModal
          delegation={selectedDelegation}
          show={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          onAccept={handleAcceptDelegation}
          processing={processingDelegation === selectedDelegation.id}
        />
      )}





      {/* Modals moved inline above */}

      {showMakeRequestModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2.5">
                <i className="bi bi-pencil-square text-[#2c525d] text-[18px]"></i>
                <h3 className="text-[16px] font-bold text-slate-800 mb-0">
                  Make a Request
                </h3>
              </div>
              <button
                onClick={() => setShowMakeRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 p-1 cursor-pointer"
              >
                <i className="bi bi-x-lg text-[16px]"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 bg-white">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  Type of Request
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2c525d] focus:ring-1 focus:ring-[#2c525d] rounded px-3 py-2 text-[12px] font-medium text-slate-800 transition-colors outline-none cursor-pointer"
                >
                  <option value="Right to Access">Right to Access</option>
                  <option value="Right to Rectification">Right to Rectification</option>
                  <option value="Right to Erasure">Right to Erasure</option>
                  <option value="Right to Portability">Right to Portability</option>
                  <option value="Right to Restrict Processing">Right to Restrict Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  Supporting Documents (Optional)
                </label>
                <div className="border border-dashed border-slate-300 rounded bg-[#f8fafc]/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f8fafc] hover:border-slate-400 transition-all duration-200">
                  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-[12px] text-slate-500 font-medium">Click to upload file or drag and drop</span>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  Comments
                </label>
                <textarea
                  placeholder="Provide any additional details..."
                  value={requestComments}
                  onChange={(e) => setRequestComments(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2c525d] focus:ring-1 focus:ring-[#2c525d] rounded px-3 py-2 text-[12px] font-medium text-slate-800 transition-colors outline-none resize-y"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowMakeRequestModal(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('DSR Request submitted successfully');
                  setShowMakeRequestModal(false);
                }}
                className="bg-[#2c525d] hover:bg-[#1f4851] text-white px-4 py-2 rounded text-[12px] font-semibold border-0 transition-colors cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
