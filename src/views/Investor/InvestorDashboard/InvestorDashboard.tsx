import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import { investorService, InvestorDashboardDto } from '../../../services/investor.service';
import { delegationService } from '../../../services/delegation.service';
import { DelegationDto } from '../../../models/DelegationDto';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { AcceptDelegationModal, ConsentCustomization } from '../../../components/AcceptDelegationModal/AcceptDelegationModal';
import './InvestorDashboard.scss';

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);
  const [pendingDelegations, setPendingDelegations] = useState<DelegationDto[]>([]);
  const [processingDelegation, setProcessingDelegation] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationDto | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingDelegations();
  }, []);

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
        <div className="container dashboard-container-main">
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

  const onboardingStatus = [
    { provider: 'Global Wealth', id: 'NT-001459', product: 'HYSA Account', status: 'IN PROGRESS', progress: 60, statusColor: 'text-[#3b82f6] bg-[#eff6ff]' },
    { provider: 'Northern Trust', id: 'NT-002459', product: 'Private Equity', status: 'IN REVIEW', progress: 80, statusColor: 'text-[#f59e0b] bg-[#fff8f0]' },
    { provider: 'Facilon Prime', id: 'NT-003459', product: 'Treasury Bonds', status: 'COMPLETED', progress: 100, statusColor: 'text-[#10b981] bg-[#ecfdf5]' },
  ];

  const appointments = [
    { product: 'HYSA Consultation', provider: 'Global Wealth', date: 'May 15, 2026', status: 'CONFIRMED', statusColor: 'bg-[#ecfdf5] text-[#10b981] border-none' },
    { product: 'Equity Review', provider: 'Northern Trust', date: 'May 22, 2026', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b] border-none' },
    { product: 'Tax Strategy', provider: 'Facilon Prime', date: 'June 02, 2026', status: 'CONFIRMED', statusColor: 'bg-[#ecfdf5] text-[#10b981] border-none' },
  ];

  const documents = [
    { type: 'Passport', name: 'Not Uploaded' },
    { type: 'PAN Card', name: 'Not Uploaded' },
    { type: 'Address Proof', name: 'Not Uploaded' },
    { type: 'Passport Size Photo', name: 'Not Uploaded' },
    { type: 'Bank Statement (6m)', name: 'Not Uploaded' },
    { type: 'Income Proof (ITR)', name: 'Not Uploaded' },
    { type: 'Tax Return (Last 3 Years)', name: 'Not Uploaded' },
    { type: 'Net Worth Statement', name: 'Not Uploaded' },
  ];

  const permissions = [
    { permission: 'Account View', assignee: 'Advisor', status: 'ACTIVE', statusColor: 'bg-[#ecfdf5] text-[#10b981]' },
    { permission: 'Trade Execution', assignee: 'Broker', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b]' },
    { permission: 'Doc Upload', assignee: 'Tax Pro', status: 'INACTIVE', statusColor: 'bg-[#f1f5f9] text-[#64748b]' },
  ];

  const requests = [
    { type: 'Address Change', status: 'IN REVIEW', statusColor: 'bg-[#eff6ff] text-[#3b82f6]' },
    { type: 'Dividend Reinvestment', status: 'APPROVED', statusColor: 'bg-[#ecfdf5] text-[#10b981]' },
    { type: 'Tax Document Request', status: 'PENDING', statusColor: 'bg-[#fff8f0] text-[#f59e0b]' },
    { type: 'Account Closure', status: 'CANCELLED', statusColor: 'bg-[#f1f5f9] text-[#64748b]' },
  ];

  const consents = [
    { name: 'Platform Terms', desc: 'Facilon Status', status: 'ACTIVE', statusColor: 'bg-[#ecfdf5] text-[#10b981]' },
    { name: 'Data & Documents', desc: 'Facilon Status', status: 'ACTIVE', statusColor: 'bg-[#ecfdf5] text-[#10b981]' },
    { name: 'Contact Details', desc: 'Marketing', status: 'INACTIVE', statusColor: 'bg-[#f1f5f9] text-[#64748b]' },
    { name: 'Mobile number', desc: 'WhatsApp', status: 'ACTIVE', statusColor: 'bg-[#ecfdf5] text-[#10b981]' },
  ];

  return (
    <div className="facilon-dashboard-wrapper font-sans text-gray-800 bg-[#f4f7f9] min-h-screen pb-10">
      <main className="px-0 py-0 dashboard-container-main mx-auto">
        
        {/* Welcome Banner */}
        <div className="bg-[#466a74] text-white rounded shadow-sm mb-3 px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-[15px] font-bold text-white flex items-center mb-0.5 tracking-tight">
              Welcome back, {dashboardData?.investor?.firstName || 'Pankaj'} 
              <i className="bi bi-pencil-square ml-2 text-[11px] opacity-70 cursor-pointer hover:opacity-100"></i>
            </h1>
            <p className="text-[11px] opacity-80 m-0">
              Investor ID: {dashboardData?.investor?.uniqueCode || '202604096545'} &middot; Jurisdiction: {dashboardData?.accountSnapshot?.primaryJurisdiction || 'U.S. Virgin Islands'}
            </p>
          </div>
          <div>
            <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1.5 flex items-center text-[12px] cursor-pointer hover:bg-white/20 transition-colors">
              <span>{dashboardData?.investor?.firstName || 'Pankaj'} (Primary)</span>
              <i className="bi bi-chevron-down ml-2 text-[10px]"></i>
            </div>
          </div>
        </div>

        {/* TOP ROW: 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          
          {/* Column 1: My Pending Action */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                <i className="bi bi-list-task mr-2 text-slate-500"></i> My Pending Action
              </h2>
              <span className="bg-[#e2e8f0] text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                3 PENDING
              </span>
            </div>
            
            <div className="px-3 py-2 flex-grow">
              <div className="grid grid-cols-12 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                <div className="col-span-6">PENDING ACTIVITY</div>
                <div className="col-span-3">CENTRA</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-1 text-right">ACTION</div>
              </div>
              
              <div className="flex flex-col">
                {pendingActions.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-6 text-[11px] font-semibold text-slate-700 pr-1">{item.activity}</div>
                    <div className="col-span-3 text-[11px] text-slate-500">{item.centra}</div>
                    <div className="col-span-2 flex items-center">
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="col-span-1 text-right flex justify-end">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 border border-slate-200 rounded bg-slate-50">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                         </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-3 pb-3 pt-1">
              <button className="w-full py-1.5 text-[11px] font-semibold text-[#147a7f] border border-[#147a7f]/20 rounded-md hover:bg-[#147a7f]/5 transition-colors">
                View All Pending Actions
              </button>
            </div>
          </div>

          {/* Column 2: My Onboarding Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                <svg className="w-3.5 h-3.5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                My Onboarding Status
              </h2>
              <a href="#" className="text-[11px] font-semibold text-[#147a7f] hover:text-[#0f5c60] flex items-center">
                Facilon Status &rarr;
              </a>
            </div>
            
            <div className="px-3 py-2 flex-grow">
              <div className="grid grid-cols-12 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                <div className="col-span-4">SERVICE PROVIDER</div>
                <div className="col-span-4">PRODUCT</div>
                <div className="col-span-3">STATUS</div>
                <div className="col-span-1 text-right">ACTION</div>
              </div>
              
              <div className="flex flex-col">
                {onboardingStatus.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-4 pr-1">
                      <div className="text-[11px] font-bold text-slate-800 leading-tight">{item.provider}</div>
                      <div className="text-[9px] text-slate-400">ID: {item.id}</div>
                    </div>
                    <div className="col-span-4 text-[11px] text-slate-600 pr-1 leading-tight">{item.product}</div>
                    <div className="col-span-3 pr-1">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                        {item.status}
                      </span>
                      <div className="w-10 h-1 bg-slate-100 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${item.status === 'COMPLETED' ? 'bg-[#10b981]' : item.status === 'IN PROGRESS' ? 'bg-[#3b82f6]' : 'bg-[#f59e0b]'}`} 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="col-span-1 text-right flex justify-end">
                       <button className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors">
                          {item.status === 'COMPLETED' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-3 pb-3 pt-1">
              <button className="w-full py-1.5 text-[11px] font-semibold text-[#147a7f] border border-[#147a7f]/20 rounded-md hover:bg-[#147a7f]/5 transition-colors flex justify-center items-center">
                <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                View Detailed Journey
              </button>
            </div>
          </div>

          {/* Column 3: My Appointment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                <i className="bi bi-calendar3 mr-2 text-slate-500"></i> My Appointment
              </h2>
              <a href="#" className="text-[11px] font-semibold text-[#147a7f] hover:text-[#0f5c60] flex items-center">
                Appointment Center &rarr;
              </a>
            </div>
            
            <div className="px-3 py-2 flex-grow">
              <div className="grid grid-cols-12 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                <div className="col-span-5">PRODUCT</div>
                <div className="col-span-3">SERVICE PROVIDER</div>
                <div className="col-span-2">DATE</div>
                <div className="col-span-2 text-right">STATUS</div>
              </div>
              
              <div className="flex flex-col">
                {appointments.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-5 text-[11px] font-bold text-slate-800 pr-1 leading-tight">
                      {item.product.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                          {word}
                          {i === 0 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="col-span-3 text-[10px] text-slate-500 pr-1 leading-tight">{item.provider}</div>
                    <div className="col-span-2 text-[10px] text-slate-600 pr-1 leading-tight">{item.date}</div>
                    <div className="col-span-2 text-right">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-3 pb-3 pt-1 mt-auto">
              <button className="w-full py-1.5 text-[11px] font-semibold text-[#147a7f] border border-[#147a7f]/20 rounded-md hover:bg-[#147a7f]/5 transition-colors flex justify-center items-center">
                <i className="bi bi-calendar3 mr-1.5"></i> View All Appointments
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Column 1: My Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                <i className="bi bi-cloud-arrow-up mr-2 text-slate-500"></i> My Documents
              </h2>
              <a href="#" className="text-[11px] font-semibold text-[#147a7f] hover:text-[#0f5c60] flex items-center">
                Documents Center &rarr;
              </a>
            </div>
            
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
              <div className="py-2.5 text-center flex flex-col items-center">
                <span className="text-[16px] font-bold text-slate-800">0</span>
                <span className="text-[9px] text-slate-500">of 12 Uploaded</span>
              </div>
              <div className="py-2.5 text-center flex flex-col items-center">
                <span className="text-[16px] font-bold text-slate-800">0%</span>
                <span className="text-[9px] text-slate-500">Complete</span>
              </div>
              <div className="py-2.5 text-center flex flex-col items-center">
                <span className="text-[16px] font-bold text-[#10b981]">0</span>
                <span className="text-[9px] text-slate-500">Approved</span>
              </div>
              <div className="py-2.5 text-center flex flex-col items-center">
                <span className="text-[16px] font-bold text-[#ef4444]">0</span>
                <span className="text-[9px] text-slate-500">Rejected</span>
              </div>
            </div>

            <div className="px-3 py-2 flex-grow overflow-hidden">
              <div className="grid grid-cols-12 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                <div className="col-span-5">DOCUMENT TYPE</div>
                <div className="col-span-5">DOCUMENT NAME</div>
                <div className="col-span-2 text-right">ACTION</div>
              </div>
              
              <div className="flex flex-col">
                {documents.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-5 text-[11px] font-semibold text-slate-700 pr-1">{item.type}</div>
                    <div className="col-span-5 text-[11px] text-slate-400">{item.name}</div>
                    <div className="col-span-2 text-right flex justify-end">
                      <button className="text-slate-400 hover:text-[#147a7f] transition-colors p-1 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100">
                        <i className="bi bi-cloud-arrow-up text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: My Permissions & My Request stacked */}
          <div className="flex flex-col gap-4 h-full">
            
            {/* My Permissions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-grow">
              <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                  <i className="bi bi-shield-lock mr-2 text-slate-500"></i> My Permissions
                </h2>
                <a href="#" className="text-[11px] font-semibold text-[#147a7f] hover:text-[#0f5c60] flex items-center">
                  Permissions Center &rarr;
                </a>
              </div>
              
              <div className="px-3 py-2">
                <div className="grid grid-cols-12 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                  <div className="col-span-5">PERMISSION</div>
                  <div className="col-span-4">ASSIGNEE</div>
                  <div className="col-span-3 text-right">STATUS</div>
                </div>
                
                <div className="flex flex-col">
                  {permissions.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-5 text-[11px] font-bold text-slate-800 pr-1">{item.permission}</div>
                      <div className="col-span-4 text-[11px] text-slate-500">{item.assignee}</div>
                      <div className="col-span-3 text-right">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-3 pb-3 pt-1 mt-auto">
                <button className="w-full py-1.5 text-[11px] font-semibold text-[#147a7f] border border-[#147a7f]/20 rounded-md hover:bg-[#147a7f]/5 transition-colors">
                  Manage Permissions
                </button>
              </div>
            </div>

            {/* My Request */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-grow">
              <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                  <i className="bi bi-journal-text mr-2 text-slate-500"></i> My Request
                </h2>
                <a href="#" className="text-[11px] font-semibold text-[#147a7f] hover:text-[#0f5c60] flex items-center">
                  DSR Center &rarr;
                </a>
              </div>
              
              <div className="px-3 py-2">
                <div className="grid grid-cols-12 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                  <div className="col-span-8">TYPE OF REQUEST</div>
                  <div className="col-span-4 text-right">STATUS</div>
                </div>
                
                <div className="flex flex-col">
                  {requests.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-8 text-[11px] font-bold text-slate-800 pr-1">{item.type}</div>
                      <div className="col-span-4 text-right">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-3 pb-3 pt-1 mt-auto">
                <button className="w-full py-1.5 text-[11px] font-semibold text-[#147a7f] border border-[#147a7f]/20 rounded-md hover:bg-[#147a7f]/5 transition-colors">
                  View All Requests
                </button>
              </div>
            </div>

          </div>

          {/* Column 3: My Consents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full relative">
            <div className="px-3 py-2.5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-slate-800 flex items-center tracking-tight">
                <i className="bi bi-check2-all mr-2 text-slate-500"></i> My Consents
              </h2>
              <a href="#" className="text-[11px] font-semibold text-[#147a7f] hover:text-[#0f5c60] flex items-center">
                Consent Center &rarr;
              </a>
            </div>
            
            <div className="px-3 py-2 flex-grow overflow-y-auto max-h-[300px]">
              <div className="flex flex-col">
                {consents.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 leading-tight">{item.name}</div>
                      <div className="text-[10px] text-[#147a7f]">{item.desc}</div>
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
            
            <div className="px-3 pb-3 pt-2 mt-auto">
              <div className="bg-[#f0f7f9] rounded py-2 px-3 text-[10px] text-slate-600 font-medium">
                Service Agent: <span className="text-slate-400">None assigned - Status: NOT ASSIGNED</span>
              </div>
            </div>
          </div>

        </div>
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
    </div>
  );
};
