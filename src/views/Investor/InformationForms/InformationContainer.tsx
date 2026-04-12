import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, InvestorConsentsDto, InvestorExperienceDto, UserPersonalInformationDto, UserPassportDetailsDto, UserResidentialStatusDto, UserTaxInfoDto, UserBankDetailsDto, UserContactDetailsDto, UserNominationDto, UserRiskProfileDto } from '../../../services/profile.service';
import { investorService, InvestorDashboardDto } from '../../../services/investor.service';
import { contentService, type MasterCountryDto, type IsdCodeValuesDto } from '../../../services/content.service';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import { useDelegationPermissions } from '../../../contexts/DelegationPermissionsContext';
import { toast } from 'react-toastify';
import { normalizeDateForInput, normalizeCountryOfResidenceForForm } from '../../../utils/formHelpers';
import { SharedFormContext, TabType } from './shared/types';
import { PersonalInformationForm } from './PersonalInformation/PersonalInformationForm';
import { BankDetailsForm } from './BankDetails/BankDetailsForm';
import { TaxInformationForm } from './TaxInformation/TaxInformationForm';
import { ContactDetailsForm } from './ContactDetails/ContactDetailsForm';
import { NominationForm } from './Nomination/NominationForm';
import { PassportDetailsForm } from './PassportDetails/PassportDetailsForm';
import { ResidentialStatusForm } from './ResidentialStatus/ResidentialStatusForm';
import { RiskProfileForm } from './RiskProfile/RiskProfileForm';
import { FinalSubmissionForm } from './FinalSubmission/FinalSubmissionForm';
import '../InvestorProfile/InvestorProfile.scss';

/**
 * Container component for investor information forms
 * Coordinates tab navigation, shared state, and data loading
 * Replaces the monolithic InvestorProfile.tsx
 */
export const InformationContainer: React.FC = () => {
  const navigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
  const delegationPerms = useDelegationPermissions();
  
  const canEdit = !delegationPerms.isProxyMode || delegationPerms.canEditKyc;
  const canSubmit = !delegationPerms.isProxyMode || delegationPerms.canSubmitForms;
  
  // Loaded data states
  const [personalInfo, setPersonalInfo] = useState<UserPersonalInformationDto | null>(null);
  const [passport, setPassport] = useState<UserPassportDetailsDto | null>(null);
  const [experience, setExperience] = useState<InvestorExperienceDto | null>(null);
  const [_consents, setConsents] = useState<InvestorConsentsDto | null>(null);
  const [residential, setResidential] = useState<UserResidentialStatusDto | null>(null);
  const [taxInfo, setTaxInfo] = useState<UserTaxInfoDto | null>(null);
  const [bankDetails, setBankDetails] = useState<UserBankDetailsDto | null>(null);
  const [contactDetails, setContactDetails] = useState<UserContactDetailsDto | null>(null);
  const [nomination, setNomination] = useState<UserNominationDto | null>(null);
  const [_riskProfile, setRiskProfile] = useState<UserRiskProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);

  // Master data
  const [taxResidencyCountries, setTaxResidencyCountries] = useState<MasterCountryDto[]>([]);
  const [isdCodes, setIsdCodes] = useState<IsdCodeValuesDto[]>([]);

  // Load master data
  useEffect(() => {
    contentService
      .getCountries()
      .then((list) =>
        setTaxResidencyCountries(
          [...list].sort((a, b) =>
            (a.ssName || '').localeCompare(b.ssName || '', undefined, { sensitivity: 'base' })
          )
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    contentService
      .getIsdCodes()
      .then((list) =>
        setIsdCodes(
          [...list].sort((a, b) =>
            (a.countryName || '').localeCompare(b.countryName || '', undefined, { sensitivity: 'base' })
          )
        )
      )
      .catch(() => {});
  }, []);

  // Load all form data
  const loadData = useCallback(async () => {
    try {
      const [info, pass, exp, cons, res, tax, bank, contact, nom, risk, dashboard] = await Promise.all([
        profileService.getPersonalInfo().catch(e => { console.error('Failed to load personal info:', e); return null; }),
        profileService.getPassport().catch(e => { console.error('Failed to load passport:', e); return null; }),
        profileService.getExperience().catch(e => { console.error('Failed to load experience:', e); return null; }),
        profileService.getConsents().catch(e => { console.error('Failed to load consents:', e); return null; }),
        profileService.getResidentialStatus().catch(e => { console.error('Failed to load residential:', e); return null; }),
        profileService.getTaxInfo().catch(e => { console.error('Failed to load tax info:', e); return null; }),
        profileService.getBankDetails().catch(e => { console.error('Failed to load bank details:', e); return null; }),
        profileService.getContactDetails().catch(e => { console.error('Failed to load contact details:', e); return null; }),
        profileService.getNomination().catch(e => { console.error('Failed to load nomination:', e); return null; }),
        profileService.getRiskProfile().catch(e => { console.error('Failed to load risk profile:', e); return null; }),
        investorService.getDashboard().catch(e => { console.error('Failed to load dashboard:', e); return null; }),
      ]);

      setPersonalInfo(info ?? null);
      setPassport(pass ?? null);
      setExperience(exp ?? null);
      setConsents(cons ?? null);
      setResidential(res ?? null);
      setTaxInfo(tax ?? null);
      setBankDetails(bank ?? null);
      setContactDetails(contact ?? null);
      setNomination(nom ?? null);
      setRiskProfile(risk ?? null);
      setDashboardData(dashboard);
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Failed to load investor information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Shared context for all form sections
  const sharedContext: SharedFormContext = {
    taxResidencyCountries,
    isdCodes,
    dashboardData,
    reloadData: loadData,
  };

  // Progress bar - Your Journey section
  const renderProgressBar = () => {
    const progress = dashboardData?.progress;
    const accountSummary = dashboardData?.accountSummary;

    // `personalInfo` completion comes from progress.sections (backend-computed flag).
    // Everything downstream comes from accountSummary counts/flags — same source the
    // working pages (OnboardingDocuments, DocumentUpload, etc.) use. This keeps the
    // "Your Journey" widget consistent across routes.
    const isDoneFor = (key: string) => {
      if (key === 'information') {
        return progress?.sections?.personalInfo?.completed || false;
      }
      if (key === 'documents') {
        return accountSummary
          ? accountSummary.kycDocumentsUploaded >= accountSummary.kycDocumentsRequired
          : false;
      }
      if (key === 'onboarding') {
        return accountSummary
          ? accountSummary.onboardingDocumentsUploaded >= accountSummary.onboardingDocumentsRequired
          : false;
      }
      if (key === 'verification') return accountSummary?.verificationDone || false;
      if (key === 'physical') return accountSummary?.physicalSubmissionDone || false;
      if (key === 'account') return accountSummary?.accountOpeningStatus || false;
      return false;
    };

    const stepKeys = ['information', 'documents', 'onboarding', 'verification', 'physical', 'account'] as const;
    const currentStepKey = stepKeys.find((k) => !isDoneFor(k)) ?? 'information';
    const isCurrent = (key: string) => currentStepKey === key;

    const renderStep = (label: string, route: string, stepKey: string, percent: string = "20%") => {
      const isDone = isDoneFor(stepKey);

      const handleStepClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isProxyMode) {
          saNavigate(route);
        } else {
          navigate(route);
        }
      };

      return (
        <div key={stepKey} className="step">
          {isDone ? (
            <div className="circle-chart active-one">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <button type="button" onClick={handleStepClick} style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <div className={`circle-chart ${isCurrent(stepKey) ? 'active-three' : ''}`}>
                {isCurrent(stepKey) ? percent : 'Start'}
              </div>
            </button>
          )}
          <p>
            <button type="button" onClick={handleStepClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              {label}
            </button>
          </p>
        </div>
      );
    };

    return (
      <div className="investor-profile__progress-section">
        <div className="container-fluid">
          <center>
            <strong>
              <h2 style={{ fontSize: '36px', color: '#be1717', fontWeight: 500, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                Your Journey
              </h2>
            </strong>
          </center>
          <div className="step-progress">
            {renderStep('Submit Information', '/investor/profile', 'information', '90%')}
            {renderStep('KYC Documents', '/investor/documents', 'documents', '50%')}
            {renderStep('Onboarding Forms', '/investor/documents', 'onboarding', '20%')}
            {renderStep('In-person Verification', '/investor/verification', 'verification', '0%')}
            {renderStep('Physical Submission', '/investor/physical-submission', 'physical', '0%')}
            {renderStep('Account Details', '/investor/account-details', 'account', '0%')}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading investor information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="investor-profile">
          <div className="profile-header">
            <h1>Investor Information</h1>
          </div>

          {delegationPerms.isProxyMode && !delegationPerms.canViewProfile && (
            <div className="alert alert-danger" role="alert" style={{ margin: '1rem 0' }}>
              <strong>Access Restricted:</strong> You don't have permission to view this investor's profile. 
              Please ask the investor to update your delegation permissions to include "View Profile" access.
            </div>
          )}
          
          {delegationPerms.isProxyMode && delegationPerms.canViewProfile && !delegationPerms.canEditKyc && (
            <div className="alert alert-warning" role="alert" style={{ margin: '1rem 0' }}>
              <strong>Read-Only Mode:</strong> You can view information but cannot make changes. 
              Ask the investor to enable "Edit KYC" permission if updates are needed.
            </div>
          )}

          {/* Your Journey Progress Section */}
          {renderProgressBar()}

          <div className="investor-profile__tabs">
            <button
              type="button"
              className={activeTab === 'personal' ? 'active' : ''}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button
              type="button"
              className={activeTab === 'bank' ? 'active' : ''}
              onClick={() => setActiveTab('bank')}
            >
              Bank Details
            </button>
            <button
              type="button"
              className={activeTab === 'passport' ? 'active' : ''}
              onClick={() => setActiveTab('passport')}
            >
              Passport Details
            </button>
            <button
              type="button"
              className={activeTab === 'residential' ? 'active' : ''}
              onClick={() => setActiveTab('residential')}
            >
              Residential Status
            </button>
            <button
              type="button"
              className={activeTab === 'tax' ? 'active' : ''}
              onClick={() => setActiveTab('tax')}
            >
              Tax Information
            </button>
            <button
              type="button"
              className={activeTab === 'contact' ? 'active' : ''}
              onClick={() => setActiveTab('contact')}
            >
              Contact Details
            </button>
            <button
              type="button"
              className={activeTab === 'nomination' ? 'active' : ''}
              onClick={() => setActiveTab('nomination')}
            >
              Nomination
            </button>
            <button
              type="button"
              className={activeTab === 'other' ? 'active' : ''}
              onClick={() => setActiveTab('other')}
            >
              Risk Profile
            </button>
            <button
              type="button"
              className={activeTab === 'finalSubmit' ? 'active' : ''}
              onClick={() => setActiveTab('finalSubmit')}
            >
              Final Submit
            </button>
          </div>

          {activeTab === 'personal' && (
            <PersonalInformationForm
              initialData={personalInfo}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'bank' && (
            <BankDetailsForm
              initialData={bankDetails}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'passport' && (
            <PassportDetailsForm
              initialData={passport}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'residential' && (
            <ResidentialStatusForm
              initialData={residential}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'tax' && (
            <TaxInformationForm
              initialData={taxInfo}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'contact' && (
            <ContactDetailsForm
              initialData={contactDetails}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'nomination' && (
            <NominationForm
              initialData={nomination}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'other' && (
            <RiskProfileForm
              initialData={experience}
              onSave={loadData}
              canEdit={canEdit}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}

          {activeTab === 'finalSubmit' && (
            <FinalSubmissionForm
              onSave={loadData}
              canSubmit={canSubmit}
              isProxyMode={isProxyMode}
              sharedContext={sharedContext}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
