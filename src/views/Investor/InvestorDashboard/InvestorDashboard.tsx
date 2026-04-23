import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tabs, Tab } from 'react-bootstrap';
import Header from '../../../components/Header/Header';
import { investorService, InvestorDashboardDto } from '../../../services/investor.service';
import { delegationService } from '../../../services/delegation.service';
import { DelegationDto } from '../../../models/DelegationDto';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { AcceptDelegationModal, ConsentCustomization } from '../../../components/AcceptDelegationModal/AcceptDelegationModal';
import { ProfileTab } from './components/ProfileTab';
import { ServiceProviderTab } from './components/ServiceProviderTab';
import { ApplicationsTab } from './components/ApplicationsTab';
import { DSRTab } from './components/DSRTab';
import { ConsentCentreTab } from './components/ConsentCentreTab';
import { SmartUploadTab } from './components/SmartUploadTab';
import './InvestorDashboard.scss';

const TAB_KEYS = {
  PROFILE: 'profile',
  SERVICE_PROVIDER: 'service-provider',
  APPLICATIONS: 'applications',
  DSR: 'dsr',
  CONSENT: 'consent',
  SMART_UPLOAD: 'smart-upload',
} as const;

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);
  const [pendingDelegations, setPendingDelegations] = useState<DelegationDto[]>([]);
  const [processingDelegation, setProcessingDelegation] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationDto | null>(null);
  const [activeTab, setActiveTab] = useState<string>(TAB_KEYS.PROFILE);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingDelegations();

    const tabParam = searchParams.get('tab');
    if (tabParam && Object.values(TAB_KEYS).includes(tabParam as any)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  const handleRejectDelegation = async (delegation: DelegationDto) => {
    if (!window.confirm(`Reject access for ${delegation.serviceAgentName}?`)) return;
    setProcessingDelegation(delegation.id);
    try {
      await delegationService.rejectDelegation(delegation.id, 'Rejected by investor');
      toast.info(`Access rejected: ${delegation.serviceAgentName}`);
      fetchPendingDelegations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject delegation');
    } finally {
      setProcessingDelegation(null);
    }
  };

  const handleTabChange = (key: string | null) => {
    if (key) {
      setActiveTab(key);
      setSearchParams({ tab: key });
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

  const pendingCount = pendingDelegations.length;

  return (
    <div className="facilon-dashboard-wrapper">
      <Header />

      <main className="container-fluid dashboard-container-main">
        <div className="dashboard-header-section">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="dashboard-title-modern text-neutral-900">Investor Console</h1>
              <p className="dashboard-subtitle text-neutral-500">Manage your profile, applications, and delegations.</p>
            </div>
            <div className="dashboard-actions">
              {/* Future actions like 'New Application' could go here */}
            </div>
          </div>
        </div>

        <div className="facilon-tabs-wrapper card-premium bg-surface rounded-xl border border-neutral-200 shadow-card">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            id="investor-dashboard-tabs"
            className="modern-tabs mb-2 bg-neutral-50 p-1 rounded-lg"
          >
            <Tab
              eventKey={TAB_KEYS.PROFILE}
              title={
                <span className="tab-title-content">
                  <i className="bi bi-person-fill me-2"></i>
                  Profile
                </span>
              }
            >
              <div className="tab-pane-padding">
                <ProfileTab dashboardData={dashboardData} />
              </div>
            </Tab>

            <Tab
              eventKey={TAB_KEYS.SERVICE_PROVIDER}
              title={
                <span className="tab-title-content">
                  <i className="bi bi-building-fill me-2"></i>
                  Service Provider
                </span>
              }
            >
              <div className="tab-pane-padding">
                <ServiceProviderTab dashboardData={dashboardData} />
              </div>
            </Tab>

            <Tab
              eventKey={TAB_KEYS.APPLICATIONS}
              title={
                <span className="tab-title-content">
                  <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                  Applications
                </span>
              }
            >
              <div className="tab-pane-padding">
                <ApplicationsTab dashboardData={dashboardData} />
              </div>
            </Tab>

            <Tab
              eventKey={TAB_KEYS.DSR}
              title={
                <span className="tab-title-content">
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  DSR
                </span>
              }
            >
              <div className="tab-pane-padding">
                <DSRTab />
              </div>
            </Tab>

            <Tab
              eventKey={TAB_KEYS.CONSENT}
              title={
                <span className="tab-title-content">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Consent Centre
                  {pendingCount > 0 && (
                    <span className="badge-notification ms-2 bg-primary-500 text-white ring-2 ring-white">
                      {pendingCount}
                    </span>
                  )}
                </span>
              }
            >
              <div className="tab-pane-padding">
                <ConsentCentreTab
                  dashboardData={dashboardData}
                  pendingDelegations={pendingDelegations}
                  onAcceptDelegation={handleOpenAcceptModal}
                  onRejectDelegation={handleRejectDelegation}
                  processingDelegation={processingDelegation}
                />
              </div>
            </Tab>

            <Tab
              eventKey={TAB_KEYS.SMART_UPLOAD}
              title={
                <span className="tab-title-content">
                  <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                  Smart Upload
                  <span className="badge-coming-soon ms-2 bg-neutral-200 text-neutral-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    Soon
                  </span>
                </span>
              }
            >
              <div className="tab-pane-padding">
                <SmartUploadTab />
              </div>
            </Tab>
          </Tabs>
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
