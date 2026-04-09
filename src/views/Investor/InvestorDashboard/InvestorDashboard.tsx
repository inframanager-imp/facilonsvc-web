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

    // Set active tab from URL parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && Object.values(TAB_KEYS).includes(tabParam as any)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchDashboardData = async () => {
    try {
      const data = await investorService.getDashboard();
      console.log('[InvestorDashboard] Full Dashboard Data from API:', data);
      console.log('[InvestorDashboard] Product Assignment from API:', data?.productAssignment);
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
      toast.success('Service Agent access accepted with your custom permissions');
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
      toast.info(`Service Agent access rejected: ${delegation.serviceAgentName}`);
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
      <div className="dashboard-layout investor-dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="container-fluid">
            <div className="alert alert-warning mt-4">
              Unable to load dashboard data. Please try refreshing the page.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = pendingDelegations.length;

  return (
    <div className="dashboard-layout investor-dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-md-12">
              <h2 style={{ color: '#be1717', fontWeight: 500, fontSize: '34px', marginTop: '3%' }}>
                Investor Account Console
              </h2>
            </div>
          </div>

          <div className="investor-dashboard-tabs">
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabChange}
              id="investor-dashboard-tabs"
              className="mb-4"
            >
              <Tab
                eventKey={TAB_KEYS.PROFILE}
                title={
                  <span>
                    <i className="bi bi-person-circle me-2"></i>
                    Profile
                  </span>
                }
              >
                <ProfileTab dashboardData={dashboardData} />
              </Tab>

              <Tab
                eventKey={TAB_KEYS.SERVICE_PROVIDER}
                title={
                  <span>
                    <i className="bi bi-building me-2"></i>
                    Service Provider
                  </span>
                }
              >
                <ServiceProviderTab dashboardData={dashboardData} />
              </Tab>

              <Tab
                eventKey={TAB_KEYS.APPLICATIONS}
                title={
                  <span>
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    Applications
                  </span>
                }
              >
                <ApplicationsTab dashboardData={dashboardData} />
              </Tab>

              <Tab
                eventKey={TAB_KEYS.DSR}
                title={
                  <span>
                    <i className="bi bi-shield-lock me-2"></i>
                    DSR
                  </span>
                }
              >
                <DSRTab />
              </Tab>

              <Tab
                eventKey={TAB_KEYS.CONSENT}
                title={
                  <span>
                    <i className="bi bi-check2-square me-2"></i>
                    Consent Centre
                    {pendingCount > 0 && (
                      <span className="badge bg-danger ms-2 tab-alert-badge">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                }
              >
                <ConsentCentreTab
                  dashboardData={dashboardData}
                  pendingDelegations={pendingDelegations}
                  onAcceptDelegation={handleOpenAcceptModal}
                  onRejectDelegation={handleRejectDelegation}
                  processingDelegation={processingDelegation}
                />
              </Tab>

              <Tab
                eventKey={TAB_KEYS.SMART_UPLOAD}
                title={
                  <span>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Smart Upload
                    <span className="badge bg-gradient-purple ms-2 coming-soon-badge">
                      Coming Soon
                    </span>
                  </span>
                }
              >
                <SmartUploadTab />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>

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
