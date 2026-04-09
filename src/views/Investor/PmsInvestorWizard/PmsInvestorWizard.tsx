import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pmsInvestorService } from '../../../services/pmsInvestor.service';
import { contentService } from '../../../services/content.service';
import type {
  PmsNextholderInitDto,
  PmsNextholderPersonalDto,
  PmsNextholderCompleteDto,
  PmsRegistrationDto,
  PmsComplianceDto,
  PmsPortfolioPreferencesDto,
} from '../../../services/pmsInvestor.service';
import type {
  MasterCountryDto,
  IsdCodeValuesDto,
  MasterPortfolioManagersDto,
  MasterPmsPlansDto,
  MasterPmsBanksDto,
} from '../../../services/content.service';
import { toast } from 'react-toastify';
import './PmsInvestorWizard.scss';

/**
 * PMS Investor Nextholder Wizard - aligned with docs/Investor.
 * Step 1: Self or Legal Entity + PMS context (manager, plan, bank)
 * Step 2: Personal details (incl. DOB) + OTP agreement
 * Step 3: OTP verification
 * Step 4: Password (User Account Creation) -> Sends all data to register
 * Step 5: Investment Details -> Updates Registration
 * Step 6: Portfolio Preferences -> Sets Preferences
 * Step 7: Compliance -> Submits Compliance
 */
export const PmsInvestorWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pmsManagerIdParam = searchParams.get('pms_manager_id');
  const pmsPlanIdParam = searchParams.get('pms_plan_id');
  const pmsBankIdParam = searchParams.get('pms_bank_id');

  const [step, setStep] = useState(1);
  const [uniqueCode, setUniqueCode] = useState<string>('');
  const [countries, setCountries] = useState<MasterCountryDto[]>([]);
  const [isdCodes, setIsdCodes] = useState<IsdCodeValuesDto[]>([]);
  const [pmsManagers, setPmsManagers] = useState<MasterPortfolioManagersDto[]>([]);
  const [pmsPlans, setPmsPlans] = useState<MasterPmsPlansDto[]>([]);
  const [pmsBanks, setPmsBanks] = useState<MasterPmsBanksDto[]>([]);

  const [step1Form, setStep1Form] = useState<PmsNextholderInitDto>({
    registerAs: 1,
    legalEntityFullName: '',
    countryOfIncorporation: undefined,
    pmsManagerId: pmsManagerIdParam ? Number(pmsManagerIdParam) : 0,
    pmsPlanId: pmsPlanIdParam ? Number(pmsPlanIdParam) : 0,
    pmsBankId: pmsBankIdParam ? Number(pmsBankIdParam) : 0,
  });

  const [step2Form, setStep2Form] = useState<PmsNextholderPersonalDto>({
    firstName: '',
    middleName: '',
    lastName: '',
    userDob: '',
    gender: 'Male',
    email: '',
    mobileNumber: '',
    countryCode: undefined,
    sameWhatsapp: 'Yes',
    diffMobWhatsapp: '',
    agreeForOtp: false,
  });

  const [emailOtp, setEmailOtp] = useState('');
  const [smsOtp, setSmsOtp] = useState('');

  const [step4Form, setStep4Form] = useState<PmsNextholderCompleteDto>({
    password: '',
    agreeTerms: false,
    agreeToWhatsapp: false,
    agreeToMarketing: false,
    agreePrivacy: false,
  });

  const [step5Form, setStep5Form] = useState<PmsRegistrationDto>({
    investmentAmount: 5000000,
    portfolioType: 'Discretionary',
    riskProfile: 'Balanced',
    investmentObjective: 'Wealth Creation',
    investmentHorizon: '3-5 Years',
  });

  const [step6Form, setStep6Form] = useState<PmsPortfolioPreferencesDto>({
    assetAllocation: { Equity: 60, Debt: 30, Gold: 5, Cash: 5 },
    rebalancingFrequency: 'Quarterly',
    taxOptimization: 'Standard',
  });

  const [step7Form, setStep7Form] = useState<PmsComplianceDto>({
    riskDisclosureAcknowledged: false,
    feeStructureAccepted: false,
    termsAccepted: false,
    regulatoryDisclosureAcknowledged: false,
    conflictOfInterestDisclosed: false,
    performanceDisclosureAcknowledged: false,
    digitalSignature: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    contentService.getCountries().then(setCountries).catch(() => { });
    contentService.getIsdCodes().then((codes) => {
      setIsdCodes(codes);
      const india = codes.find((c) => c.countryCode === 'IN' || c.codeValue === 91);
      if (india?.id && !step2Form.countryCode) {
        setStep2Form((p) => ({ ...p, countryCode: india.id }));
      }
    }).catch(() => { });
    contentService.getPmsManagers().then(setPmsManagers).catch(() => { });
    contentService.getPmsPlans().then(setPmsPlans).catch(() => { });
    contentService.getPmsBanks().then(setPmsBanks).catch(() => { });
  }, []);

  useEffect(() => {
    if (pmsManagerIdParam) setStep1Form((p) => ({ ...p, pmsManagerId: Number(pmsManagerIdParam) }));
    if (pmsPlanIdParam) setStep1Form((p) => ({ ...p, pmsPlanId: Number(pmsPlanIdParam) }));
    if (pmsBankIdParam) setStep1Form((p) => ({ ...p, pmsBankId: Number(pmsBankIdParam) }));
  }, [pmsManagerIdParam, pmsPlanIdParam, pmsBankIdParam]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step1Form.registerAs === 2 && (!step1Form.legalEntityFullName || !step1Form.countryOfIncorporation)) {
      toast.error('Please fill all Legal Entity fields');
      return;
    }
    if (!step1Form.pmsManagerId || !step1Form.pmsPlanId || !step1Form.pmsBankId) {
      toast.error('Please select PMS Manager, Plan and Bank');
      return;
    }
    setStep(2);
    toast.success('PMS Selection Confirmed');
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step2Form.firstName || !step2Form.lastName || !step2Form.email || !step2Form.mobileNumber || !step2Form.userDob) {
      toast.error('Please fill all required fields including DOB');
      return;
    }
    if (!step2Form.agreeForOtp) {
      toast.error('Please agree to receive OTP on email and mobile');
      return;
    }
    setLoading(true);
    try {
      await pmsInvestorService.step2('TEMP', step2Form);
      setStep(3);
      toast.success('OTP sent to your email and mobile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp || !smsOtp || emailOtp.length !== 4 || smsOtp.length !== 4) {
      toast.error('Please enter valid 4-digit OTPs');
      return;
    }
    setLoading(true);
    try {
      await pmsInvestorService.step3({ uniqueCode: 'TEMP', emailOtp, smsOtp, ...step2Form } as any);
      setStep(4);
      toast.success('OTP verified');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step4Form.password || step4Form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!step4Form.agreeTerms || !step4Form.agreePrivacy) {
      toast.error('Please accept Terms and Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        firstName: step2Form.firstName,
        lastName: step2Form.lastName,
        email: step2Form.email,
        mobilePhone: step2Form.mobileNumber,
        password: step4Form.password,
        pmsManagerId: step1Form.pmsManagerId,
        pmsPlanId: step1Form.pmsPlanId,
        pmsBankId: step1Form.pmsBankId,
        accountNumber: "PENDING-" + Date.now(),
        agreementDate: new Date().toISOString().split('T')[0],
        comments: "Self Registration",
      };

      const res = await pmsInvestorService.register(payload);
      setUniqueCode(res.uniqueCode);
      setStep(5);
      toast.success('Account Created! Proceeding to Investment Details.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pmsInvestorService.submitRegistrationDetails(uniqueCode, step5Form);
      setStep(6);
      toast.success('Investment Details Saved');
    } catch (err: any) {
      toast.error('Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  const handleStep6Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pmsInvestorService.setPortfolioPreferences(uniqueCode, step6Form);
      setStep(7);
      toast.success('Portfolio Preferences Saved');
    } catch (err: any) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleStep7Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step7Form.riskDisclosureAcknowledged || !step7Form.termsAccepted || !step7Form.digitalSignature) {
      toast.error('Please acknowledge all disclosures and sign.');
      return;
    }
    setLoading(true);
    try {
      await pmsInvestorService.submitCompliance(uniqueCode, step7Form);
      toast.success('Registration Complete! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error('Failed to submit compliance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pms-investor-wizard">
      <div className="pms-investor-wizard__container">
        <h2>PMS Investor Registration</h2>
        <p className="pms-investor-wizard__subtitle">Complete your investment profile</p>
        <div className="pms-investor-wizard__steps">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className={`pms-investor-wizard__step ${step >= s ? 'active' : ''}`}>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="pms-investor-wizard__form">
            <h3>PMS Selection</h3>
            <div className="form-group form-group--radio">
              <label><input type="radio" name="registerAs" value={1} checked={step1Form.registerAs === 1} onChange={() => setStep1Form((p) => ({ ...p, registerAs: 1 }))} /> Self</label>
              <label><input type="radio" name="registerAs" value={2} checked={step1Form.registerAs === 2} onChange={() => setStep1Form((p) => ({ ...p, registerAs: 2 }))} /> Legal Entity</label>
            </div>
            {step1Form.registerAs === 2 && (
              <div className="form-group--legal">
                <div className="form-group"><label>First Name</label><input value={step1Form.legalEntityFullName || ''} onChange={(e) => setStep1Form((p) => ({ ...p, legalEntityFullName: e.target.value }))} placeholder="Legal Entity Name" required /></div>
                <div className="form-group"><label>Country</label><select value={step1Form.countryOfIncorporation || ''} onChange={(e) => setStep1Form((p) => ({ ...p, countryOfIncorporation: Number(e.target.value) }))} required><option value="">Select</option>{countries.map((c) => <option key={c.myRowId} value={c.id}>{c.ssName}</option>)}</select></div>
              </div>
            )}
            <div className="form-group"><label>PMS Manager</label><select value={step1Form.pmsManagerId} onChange={(e) => setStep1Form((p) => ({ ...p, pmsManagerId: Number(e.target.value) }))} required><option value="">Select</option>{pmsManagers.map((m) => <option key={m.id} value={m.id}>{m.ssName}</option>)}</select></div>
            <div className="form-group"><label>PMS Plan</label><select value={step1Form.pmsPlanId} onChange={(e) => setStep1Form((p) => ({ ...p, pmsPlanId: Number(e.target.value) }))} required><option value="">Select</option>{pmsPlans.map((m) => <option key={m.id} value={m.id}>{m.ssName}</option>)}</select></div>
            <div className="form-group"><label>PMS Bank</label><select value={step1Form.pmsBankId} onChange={(e) => setStep1Form((p) => ({ ...p, pmsBankId: Number(e.target.value) }))} required><option value="">Select</option>{pmsBanks.map((m) => <option key={m.id} value={m.id}>{m.ssName}</option>)}</select></div>
            <button type="submit" className="btn-primary" disabled={loading}>Next</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="pms-investor-wizard__form">
            <h3>Personal Details</h3>
            <div className="form-row">
              <div className="form-group"><label>First Name</label><input value={step2Form.firstName} onChange={(e) => setStep2Form((p) => ({ ...p, firstName: e.target.value }))} required /></div>
              <div className="form-group"><label>Last Name</label><input value={step2Form.lastName} onChange={(e) => setStep2Form((p) => ({ ...p, lastName: e.target.value }))} required /></div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" value={step2Form.email} onChange={(e) => setStep2Form((p) => ({ ...p, email: e.target.value }))} required /></div>
            <div className="form-group"><label>Mobile</label><input value={step2Form.mobileNumber} onChange={(e) => setStep2Form((p) => ({ ...p, mobileNumber: e.target.value }))} required /></div>
            <div className="form-group"><label>DOB</label><input type="date" value={step2Form.userDob} onChange={(e) => setStep2Form((p) => ({ ...p, userDob: e.target.value }))} required /></div>
            <div className="form-group"><label><input type="checkbox" checked={step2Form.agreeForOtp} onChange={(e) => setStep2Form((p) => ({ ...p, agreeForOtp: e.target.checked }))} /> Agree to OTP</label></div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Next'}</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit} className="pms-investor-wizard__form">
            <h3>Verify OTP</h3>
            <div className="form-group"><label>Email OTP</label><input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} maxLength={4} required placeholder="1234" /></div>
            <div className="form-group"><label>Mobile OTP</label><input value={smsOtp} onChange={(e) => setSmsOtp(e.target.value)} maxLength={4} required placeholder="1234" /></div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleStep4Submit} className="pms-investor-wizard__form">
            <h3>Create Account</h3>
            <div className="form-group"><label>Password</label><input type="password" value={step4Form.password} onChange={(e) => setStep4Form((p) => ({ ...p, password: e.target.value }))} required minLength={8} /></div>
            <div className="form-group"><label><input type="checkbox" checked={step4Form.agreeTerms} onChange={(e) => setStep4Form((p) => ({ ...p, agreeTerms: e.target.checked }))} /> Terms</label></div>
            <div className="form-group"><label><input type="checkbox" checked={step4Form.agreePrivacy} onChange={(e) => setStep4Form((p) => ({ ...p, agreePrivacy: e.target.checked }))} /> Privacy</label></div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
        )}

        {step === 5 && (
          <form onSubmit={handleStep5Submit} className="pms-investor-wizard__form">
            <h3>Investment Profile</h3>
            <div className="form-group"><label>Investment Amount</label><input type="number" value={step5Form.investmentAmount} onChange={(e) => setStep5Form(p => ({ ...p, investmentAmount: Number(e.target.value) }))} required /></div>
            <div className="form-group"><label>Type</label><select value={step5Form.portfolioType} onChange={(e) => setStep5Form(p => ({ ...p, portfolioType: e.target.value }))}><option>Discretionary</option><option>Non-Discretionary</option></select></div>
            <button type="submit" className="btn-primary" disabled={loading}>Next</button>
          </form>
        )}

        {step === 6 && (
          <form onSubmit={handleStep6Submit} className="pms-investor-wizard__form">
            <h3>Portfolio Preferences</h3>
            <div className="form-group"><label>Equity %</label><input type="number" value={step6Form.assetAllocation?.['Equity']} onChange={(e) => setStep6Form(p => ({ ...p, assetAllocation: { ...p.assetAllocation, Equity: Number(e.target.value) } }))} /></div>
            <div className="form-group"><label>Debt %</label><input type="number" value={step6Form.assetAllocation?.['Debt']} onChange={(e) => setStep6Form(p => ({ ...p, assetAllocation: { ...p.assetAllocation, Debt: Number(e.target.value) } }))} /></div>
            <button type="submit" className="btn-primary" disabled={loading}>Next</button>
          </form>
        )}

        {step === 7 && (
          <form onSubmit={handleStep7Submit} className="pms-investor-wizard__form">
            <h3>Compliance</h3>
            <div className="form-group"><label><input type="checkbox" checked={step7Form.riskDisclosureAcknowledged} onChange={(e) => setStep7Form(p => ({ ...p, riskDisclosureAcknowledged: e.target.checked }))} /> Risk Disclosure</label></div>
            <div className="form-group"><label><input type="checkbox" checked={step7Form.feeStructureAccepted} onChange={(e) => setStep7Form(p => ({ ...p, feeStructureAccepted: e.target.checked }))} /> Fee Structure</label></div>
            <div className="form-group"><label><input type="checkbox" checked={step7Form.termsAccepted} onChange={(e) => setStep7Form(p => ({ ...p, termsAccepted: e.target.checked }))} /> Terms</label></div>
            <div className="form-group"><label>Digital Signature</label><input value={step7Form.digitalSignature} onChange={(e) => setStep7Form(p => ({ ...p, digitalSignature: e.target.value }))} required /></div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Finalizing...' : 'Complete'}</button>
          </form>
        )}
      </div>
    </div>
  );
};
