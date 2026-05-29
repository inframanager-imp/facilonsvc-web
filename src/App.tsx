import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './guards/ProtectedRoute';
import './i18n/config';
import Login from './views/Login/Login';
import LoginCallback from './views/Login/LoginCallback';
import Signup from './views/Signup/Signup';
import ForgotPassword from './views/ForgotPassword/ForgotPassword';
import ResetPassword from './views/ResetPassword/ResetPassword';
import ChangePassword from './views/ChangePassword/ChangePassword';
import Dashboard from './views/Dashboard/Dashboard';
import SuperAdminDashboard from './views/SuperAdminDashboard/SuperAdminDashboard';
import TenantManagement from './views/TenantManagement/TenantManagement';
import UserManagement from './views/UserManagement/UserManagement';
import RoleManagement from './views/RoleManagement/RoleManagement';
import UserGroupManagement from './views/UserGroupManagement/UserGroupManagement';
import Unauthorized from './views/Unauthorized/Unauthorized';
import {
  InvestorRegistration,
  MarketInterestCheck,
  ThankYouMessage,
  SelfRegistrationStep1,
  SelfRegistrationConsent,
  SelfRegistrationStep2,
  SelfRegistrationStep3,
  SelfRegistrationSuccess,
  InvestorSetPassword
} from './views/Investor/InvestorRegistration';
import { IntroducedInvestorWizard } from './views/Investor/IntroducedInvestorWizard/IntroducedInvestorWizard';
import { 
  IntroduceInvestor1Redirect,
  IntroducedInvestorStart,
  IntroducedInvestorConsent,
  IntroducedInvestorStep1,
  IntroducedInvestorStep2,
  IntroducedInvestorStep4,
  IntroducedInvestorSuccess
} from './views/Investor/IntroducedRegistration';
import { PmsInvestorWizard } from './views/Investor/PmsInvestorWizard/PmsInvestorWizard';
import { BatchRegistrationForm } from './views/BatchRegistration/BatchRegistrationForm';
import { AdminInvestorList } from './views/Admin/AdminInvestorList/AdminInvestorList';
import { AdminInvestorDetails } from './views/Admin/AdminInvestorDetails/AdminInvestorDetails';
import { BrokerDashboard } from './views/Broker/BrokerDashboard/BrokerDashboard';
import { MyAgents } from './views/Broker/MyAgents/MyAgents';
import { InvestorDashboard } from './views/Investor/InvestorDashboard/InvestorDashboard';
import { InvestorProgress } from './views/Investor/InvestorProgress/InvestorProgress';
import { InformationContainer } from './views/Investor/InformationForms/InformationContainer';
import { JourneyList } from './views/Investor/JourneyList/JourneyList';
import { MyProfile } from './views/Investor/MyProfile/MyProfile';
import { MyConsents } from './views/Investor/MyConsents/MyConsents';
import { DsrCenter } from './views/Investor/DsrCenter/DsrCenter';
import { DocumentUpload } from './views/Investor/DocumentUpload/DocumentUpload';
import { OnboardingDocuments } from './views/Investor/OnboardingDocuments/OnboardingDocuments';
import { PublicDocumentSubmission } from './views/Investor/PublicDocumentSubmission/PublicDocumentSubmission';
import { InvestorProfilePdf } from './views/Investor/InvestorProfilePdf/InvestorProfilePdf';
import { KycPdfPreview } from './views/Investor/KycPdfPreview/KycPdfPreview';
import { UserProfile } from './views/User/UserProfile/UserProfile';
import { InvestorTypeCategoryManagement } from './views/Admin/InvestorTypeCategory/InvestorTypeCategory';
import { MarketTypeManagement } from './views/Admin/MarketType/MarketType';
import { NationalityManagement } from './views/Admin/Nationality/Nationality';
import { ServiceAgreement } from './views/Public/ServiceAgreement/ServiceAgreement';
import { PrivacyPolicy } from './views/Public/PrivacyPolicy/PrivacyPolicy';
import { ContactUs } from './views/Public/ContactUs/ContactUs';
import { AccountDetails } from './views/Investor/AccountDetails/AccountDetails';
import { PhysicalSubmission } from './views/Investor/PhysicalSubmission/PhysicalSubmission';
import { InPersonVerification } from './views/Investor/InPersonVerification/InPersonVerification';
import { Appointments } from './views/Investor/Appointments/Appointments';
import { DocumentVerification } from './views/Admin/DocumentVerification/DocumentVerification';
import { AppointmentManagement } from './views/Admin/AppointmentManagement/AppointmentManagement';
import { NextholderManagement } from './views/Investor/NextholderManagement/NextholderManagement';
import { ServiceAgentDashboard } from './views/ServiceAgent/ServiceAgentDashboard/ServiceAgentDashboard';
import { SAInvestorList } from './views/ServiceAgent/InvestorList/InvestorList';
import { ServiceAgentAuditLogs } from './views/ServiceAgent/AuditLogs/ServiceAgentAuditLogs';
import { ServiceAgentProfile } from './views/ServiceAgent/Profile/ServiceAgentProfile';
import { DelegationManagement } from './views/Investor/DelegationManagement/DelegationManagement';
import { ServiceAgentActivity } from './views/Investor/ServiceAgentActivity/ServiceAgentActivity';
import ServiceAgentProxyWrapper from './components/ServiceAgentProxyWrapper/ServiceAgentProxyWrapper';
import { SAInvestorRedirect } from './views/ServiceAgent/InvestorRedirect';
import SpLanding from './views/ServiceProvider/SpLanding';
import SpUserConsent from './views/ServiceProvider/SpUserConsent';
import SpUserRegister from './views/ServiceProvider/SpUserRegister';
import SpThankYou from './views/ServiceProvider/SpThankYou';

import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from './components/ToastContainer';
import MainLayout from './components/MainLayout/MainLayout';
import './App.scss';

// When Azure B2C redirects to http://localhost:3000?code=xxx we must send to /login/callback
function RootRedirect() {
  const location = useLocation();
  const fullUrl = location.pathname + location.search + location.hash;
  const hasCode = location.search && location.search.includes('code=');
  const hasHashCode = location.hash && location.hash.includes('code=');
  
  console.log('[RootRedirect] FULL URL:', fullUrl);
  console.log('[RootRedirect] hasCode in search:', hasCode, 'hasCode in hash:', hasHashCode);
  
  if (hasCode) {
    console.log('[RootRedirect] Code detected in query, redirecting to /login/callback');
    return <Navigate to={`/login/callback${location.search}`} replace />;
  }
  
  if (hasHashCode) {
    console.log('[RootRedirect] Code detected in hash fragment, redirecting to /login/callback with hash');
    return <Navigate to={`/login/callback${location.hash}`} replace />;
  }
  
  console.log('[RootRedirect] No code, redirecting to /login');
  return <Navigate to="/login" replace />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - root with ?code= goes to callback so we don't lose auth code */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Self Registration Flow (Multi-step with Laravel theme) */}
          <Route path="/investor/register" element={<MarketInterestCheck />} />
          <Route path="/investor/register/thank-you" element={<ThankYouMessage />} />
          <Route path="/investor/register/email" element={<SelfRegistrationStep1 />} />
          <Route path="/investor/register/consent" element={<SelfRegistrationConsent />} />
          <Route path="/investor/register/otp" element={<SelfRegistrationStep2 />} />
          <Route path="/investor/register/step3" element={<SelfRegistrationStep3 />} />
          <Route path="/investor/register/success" element={<SelfRegistrationSuccess />} />
          {/* FISP-style first-login: email link lands here; component redirects to B2C reset/signin policy.
              The reset policy issues sign-in tokens, so its redirect goes through the standard
              /login/callback → backend JWT exchange → dashboard. No separate /done landing page. */}
          <Route path="/investor/setpassword/:azureUserId" element={<InvestorSetPassword />} />
          {/* Legacy single-page registration (keep for backward compatibility) */}
          <Route path="/investor/register/legacy" element={<InvestorRegistration />} />
          
          <Route path="/investor/introduced/register" element={<IntroducedInvestorWizard />} />
          {/* New Introduced Investor Registration Flow (Laravel Parity) */}
          {/* Laravel: introduce-investor1/{Crypt::encrypt(introduce_id)} — same token supported here */}
          <Route path="/introduce-investor1/*" element={<IntroduceInvestor1Redirect />} />
          {/* Alias: Laravel emailed links use the full /account/investor/ prefix */}
          <Route path="/account/investor/introduce-investor1/*" element={<IntroduceInvestor1Redirect />} />
          {/* Single route: * captures plain ss_name or Laravel token (including slashes in base64) */}
          <Route path="/investor/introduced/start/*" element={<IntroducedInvestorStart />} />
          <Route path="/investor/introduced/consent/:investorId" element={<IntroducedInvestorConsent />} />
          <Route path="/investor/introduced/step1/:uniqueCode" element={<IntroducedInvestorStep1 />} />
          <Route path="/investor/introduced/step2/:uniqueCode" element={<IntroducedInvestorStep2 />} />
          <Route path="/investor/introduced/step4/:uniqueCode" element={<IntroducedInvestorStep4 />} />
          <Route path="/investor/introduced/success" element={<IntroducedInvestorSuccess />} />
          <Route path="/investor/pms/register" element={<PmsInvestorWizard />} />
          <Route path="/investor/document-submission/:token" element={<PublicDocumentSubmission />} />
          <Route
            path="/investor/profile-pdf"
            element={
              <ProtectedRoute>
                <InvestorProfilePdf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/kyc-pdf"
            element={
              <ProtectedRoute>
                <KycPdfPreview />
              </ProtectedRoute>
            }
          />
          {/* Service Provider Onboarding (Laravel parity — entry email links to /account/investor/step?status=) */}
          <Route path="/account/investor/step" element={<SpLanding />} />
          <Route path="/service-provider/user-consent" element={<SpUserConsent />} />
          <Route path="/service-provider/user-register" element={<SpUserRegister />} />
          <Route path="/service-provider/thank-you" element={<SpThankYou />} />

          <Route path="/service-agreement" element={<ServiceAgreement />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout title="Investor Console" subtitle="Overview of your profile, consents, journey, and services">
                  <InvestorDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/progress"
            element={
              <ProtectedRoute>
                <MainLayout title="My Progress" subtitle="Track your onboarding and application journey">
                  <InvestorProgress />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Journeys list — one row per assigned product; click-through to a specific journey */}
          <Route
            path="/investor/journeys"
            element={
              <ProtectedRoute>
                <MainLayout title="My Onboarding Status" subtitle="Your product journeys — select one to continue">
                  <JourneyList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/journey"
            element={
              <ProtectedRoute>
                <MainLayout title="My Journey" subtitle="Track and complete your onboarding journey">
                  <InformationContainer />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Specific journey by id */}
          <Route
            path="/investor/journey/:journeyId"
            element={
              <ProtectedRoute>
                <MainLayout title="My Journey" subtitle="Track and complete your onboarding journey">
                  <InformationContainer />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* My Profile — read-only personal profile summary (Laravel investor-details parity) */}
          <Route
            path="/investor/profile"
            element={
              <ProtectedRoute>
                <MainLayout title="My Profile" subtitle="Your personal profile details">
                  <MyProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* My Consents — Consent Centre detail (Privacy, Platform Terms, SOW, Marketing, WhatsApp) */}
          <Route
            path="/investor/consents"
            element={
              <ProtectedRoute>
                <MainLayout title="Consent Centre" subtitle="Manage your consents and Statement of Work">
                  <MyConsents />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/dsr-center"
            element={
              <ProtectedRoute>
                <DsrCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/documents"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/account-details"
            element={
              <ProtectedRoute>
                <AccountDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/physical-submission"
            element={
              <ProtectedRoute>
                <PhysicalSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/verification"
            element={
              <ProtectedRoute>
                <InPersonVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/nextholders"
            element={
              <ProtectedRoute>
                <NextholderManagement />
              </ProtectedRoute>
            }
          />

          {/* Investor delegation management */}
          <Route
            path="/investor/delegations"
            element={
              <ProtectedRoute>
                <MainLayout title="Service Agent Access" subtitle="Manage your delegated service agents and permissions">
                  <DelegationManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Grant delegation route removed - only SP can assign Service Agents */}
          {/* <Route
            path="/investor/delegations/grant"
            element={
              <ProtectedRoute>
                <GrantDelegation />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/investor/service-agent-activity"
            element={
              <ProtectedRoute>
                <ServiceAgentActivity />
              </ProtectedRoute>
            }
          />

          {/* Service Agent Routes */}
          <Route
            path="/service-agent/dashboard"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/investors"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <SAInvestorList />
              </ProtectedRoute>
            }
          />
          
          {/* SA Investor Proxy Routes - reuse investor components with delegation banner */}
          <Route
            path="/service-agent/investors/:investorId/profile"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProxyWrapper>
                  <InformationContainer />
                </ServiceAgentProxyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/investors/:investorId/documents"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProxyWrapper>
                  <DocumentUpload />
                </ServiceAgentProxyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/investors/:investorId/onboarding"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProxyWrapper>
                  <InformationContainer />
                </ServiceAgentProxyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/investors/:investorId/physical-submission"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProxyWrapper>
                  <PhysicalSubmission />
                </ServiceAgentProxyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/investors/:investorId/account-details"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProxyWrapper>
                  <AccountDetails />
                </ServiceAgentProxyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/investors/:investorId/verification"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProxyWrapper>
                  <InPersonVerification />
                </ServiceAgentProxyWrapper>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect old URL to new page-based flow */}
          <Route
            path="/service-agent/investors/:investorId"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <SAInvestorRedirect />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/service-agent/audit-logs"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentAuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-agent/profile"
            element={
              <ProtectedRoute requiredRoles={['SERVICE_AGENT']}>
                <ServiceAgentProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/clients/batch-register"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <BatchRegistrationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <AdminInvestorList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients/:clientId"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <AdminInvestorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investor-type-categories"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <InvestorTypeCategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/market-types"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <MarketTypeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/nationalities"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <NationalityManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/document-verification"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <DocumentVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN']}>
                <AppointmentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/broker/dashboard"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN', 'BROKER']}>
                <BrokerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/broker/my-agents"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'PLATFORM_SUPER_ADMIN', 'BROKER']}>
                <MyAgents />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['PLATFORM_SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/tenants"
            element={
              <ProtectedRoute requiredRoles={['PLATFORM_SUPER_ADMIN']}>
                <TenantManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/users"
            element={
              <ProtectedRoute requiredRoles={['PLATFORM_SUPER_ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/roles"
            element={
              <ProtectedRoute requiredRoles={['PLATFORM_SUPER_ADMIN']}>
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/user-groups"
            element={
              <ProtectedRoute requiredRoles={['PLATFORM_SUPER_ADMIN']}>
                <UserGroupManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;
