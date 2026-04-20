import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { introducedInvestorService } from '../../../services/introducedInvestor.service';
import { contentService } from '../../../services/content.service';
import type {
  IntroNextholderInitDto,
  IntroNextholderPersonalDto,
  IntroNextholderCompleteDto,
} from '../../../services/introducedInvestor.service';
import type { MasterCountryDto, IsdCodeValuesDto } from '../../../services/content.service';
import { toast } from 'react-toastify';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import './IntroducedInvestorWizard.scss';

/**
 * Introduced Investor Nextholder Wizard - aligned with docs/Investor.
 * Step 1: Self or Legal Entity
 * Step 2: Personal details + OTP agreement
 * Step 3: OTP verification
 * Step 4: Password + terms
 */
export const IntroducedInvestorWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const introduceId = searchParams.get('introduce_id') || undefined;

  const [step, setStep] = useState(1);
  const [uniqueCode, setUniqueCode] = useState<string>('');
  const [countries, setCountries] = useState<MasterCountryDto[]>([]);
  const [isdCodes, setIsdCodes] = useState<IsdCodeValuesDto[]>([]);

  const [step1Form, setStep1Form] = useState<IntroNextholderInitDto>({
    introduceId,
    registerAs: 1,
    legalEntityFullName: '',
    countryOfIncorporation: undefined,
    legalEntityWebsite: '',
  });

  const [step2Form, setStep2Form] = useState<IntroNextholderPersonalDto>({
    firstName: '',
    middleName: '',
    lastName: '',
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
  const [step4Form, setStep4Form] = useState<IntroNextholderCompleteDto>({
    password: '',
    agreeToTerms: false,
    agreeToWhatsapp: false,
    confirmation: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    contentService.getCountries().then(setCountries).catch(() => {});
    contentService.getIsdCodes().then((codes) => {
      setIsdCodes(codes);
      const india = codes.find((c) => c.countryCode === 'IN' || c.codeValue === 91);
      if (india?.id && !step2Form.countryCode) {
        setStep2Form((p) => ({ ...p, countryCode: india.id }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (introduceId) setStep1Form((p) => ({ ...p, introduceId }));
  }, [introduceId]);

  useEffect(() => {
    if (uniqueCode && step === 2) {
      introducedInvestorService.getStep2Prefill(uniqueCode).then((prefill) => {
        setStep2Form((p) => ({
          ...p,
          firstName: prefill?.firstName ?? p.firstName,
          lastName: prefill?.lastName ?? p.lastName,
          email: prefill?.email ?? p.email,
          mobileNumber: prefill?.mobile ?? p.mobileNumber,
        }));
      }).catch(() => {});
    }
  }, [uniqueCode, step]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step1Form.registerAs === 2 && (!step1Form.legalEntityFullName || !step1Form.countryOfIncorporation || !step1Form.legalEntityWebsite)) {
      toast.error('Please fill all Legal Entity fields');
      return;
    }
    setLoading(true);
    try {
      const res = await introducedInvestorService.step1(step1Form);
      setUniqueCode(res.uniqueCode);
      setStep(2);
      toast.success('Step 1 completed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step2Form.firstName || !step2Form.lastName || !step2Form.email || !step2Form.mobileNumber) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!step2Form.agreeForOtp) {
      toast.error('Please agree to receive OTP on email and mobile');
      return;
    }
    setLoading(true);
    try {
      await introducedInvestorService.step2(uniqueCode, step2Form);
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
      await introducedInvestorService.step3({ uniqueCode, emailOtp, smsOtp });
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
    if (!step4Form.agreeToTerms || !step4Form.confirmation) {
      toast.error('Please accept terms and confirm');
      return;
    }
    setLoading(true);
    try {
      await introducedInvestorService.step4(uniqueCode, step4Form);
      toast.success('Registration complete! You can now login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="introduced-investor-wizard">
      <div className="introduced-investor-wizard__container">
        <h2>Investor Registration (Introduced)</h2>
        <p className="introduced-investor-wizard__subtitle">Welcome to Facilon Services Registration Process</p>
        <div className="introduced-investor-wizard__steps">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`introduced-investor-wizard__step ${step >= s ? 'active' : ''}`}>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="introduced-investor-wizard__form">
            <h3>Are you registering for Self or Legal Entity?</h3>
            <div className="form-group form-group--radio">
              <label>
                <input
                  type="radio"
                  name="registerAs"
                  value={1}
                  checked={step1Form.registerAs === 1}
                  onChange={() => setStep1Form((p) => ({ ...p, registerAs: 1 }))}
                />
                Self
              </label>
              <label>
                <input
                  type="radio"
                  name="registerAs"
                  value={2}
                  checked={step1Form.registerAs === 2}
                  onChange={() => setStep1Form((p) => ({ ...p, registerAs: 2 }))}
                />
                Legal Entity
              </label>
            </div>

            {step1Form.registerAs === 2 && (
              <div className="form-group--legal">
                <div className="form-group">
                  <label>Full Name of Legal Entity *</label>
                  <input
                    type="text"
                    value={step1Form.legalEntityFullName || ''}
                    onChange={(e) => setStep1Form((p) => ({ ...p, legalEntityFullName: e.target.value }))}
                    required
                    placeholder="Ensure the name mirrors document evidencing incorporation"
                  />
                </div>
                <div className="form-group">
                  <label>Country of Incorporation/Formation/Establishment *</label>
                  <PremiumSelect
                    value={step1Form.countryOfIncorporation?.toString() ?? ''}
                    onChange={(val) => setStep1Form((p) => ({ ...p, countryOfIncorporation: val ? Number(val) : undefined }))}
                    options={countries.map((c) => ({
                      value: String(c.id),
                      label: c.ssName || ''
                    }))}
                    placeholder="Select Country"
                  />
                </div>
                <div className="form-group">
                  <label>Legal Entity Website *</label>
                  <input
                    type="url"
                    value={step1Form.legalEntityWebsite || ''}
                    onChange={(e) => setStep1Form((p) => ({ ...p, legalEntityWebsite: e.target.value }))}
                    required
                    placeholder="https://"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : 'Next'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="introduced-investor-wizard__form">
            <h3>Personal Details</h3>
            <p className="form-hint">Before we start, we would like to verify your email address & mobile number.</p>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={step2Form.firstName}
                  onChange={(e) => setStep2Form((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  value={step2Form.middleName || ''}
                  onChange={(e) => setStep2Form((p) => ({ ...p, middleName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={step2Form.lastName}
                  onChange={(e) => setStep2Form((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <PremiumSelect
                value={step2Form.gender || ''}
                onChange={(val) => setStep2Form((p) => ({ ...p, gender: val }))}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Transgender', label: 'Transgender' },
                ]}
                placeholder="Select Gender"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={step2Form.email}
                onChange={(e) => setStep2Form((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-row form-row--mobile">
              <div className="form-group">
                <label>Country Code</label>
                <PremiumSelect
                  value={step2Form.countryCode?.toString() ?? ''}
                  onChange={(val) => setStep2Form((p) => ({ ...p, countryCode: val ? Number(val) : undefined }))}
                  options={isdCodes.map((i) => ({
                    value: String(i.id),
                    label: `+${i.codeValue} (${i.countryName})`
                  }))}
                  placeholder="Select Code"
                  style={{ marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  value={step2Form.mobileNumber}
                  onChange={(e) => setStep2Form((p) => ({ ...p, mobileNumber: e.target.value.replaceAll(/\D/g, '') }))}
                  required
                  minLength={10}
                  maxLength={16}
                />
              </div>
            </div>
            <div className="form-group form-group--radio">
              <label>Is your mobile number the same as your WhatsApp number? *</label>
              <div>
                <label><input type="radio" name="sameWhatsapp" value="Yes" checked={step2Form.sameWhatsapp === 'Yes'} onChange={() => setStep2Form((p) => ({ ...p, sameWhatsapp: 'Yes' }))} /> Yes</label>
                <label><input type="radio" name="sameWhatsapp" value="No" checked={step2Form.sameWhatsapp === 'No'} onChange={() => setStep2Form((p) => ({ ...p, sameWhatsapp: 'No' }))} /> No</label>
              </div>
            </div>
            {step2Form.sameWhatsapp === 'No' && (
              <div className="form-group">
                <label>WhatsApp Mobile Number</label>
                <input
                  type="tel"
                  value={step2Form.diffMobWhatsapp || ''}
                  onChange={(e) => setStep2Form((p) => ({ ...p, diffMobWhatsapp: e.target.value.replaceAll(/\D/g, '') }))}
                />
              </div>
            )}
            <div className="form-group form-group--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={step2Form.agreeForOtp || false}
                  onChange={(e) => setStep2Form((p) => ({ ...p, agreeForOtp: e.target.checked }))}
                />
                I agree to receive OTP on email and mobile SMS message *
              </label>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit} className="introduced-investor-wizard__form">
            <h3>Verify OTP</h3>
            <ul className="form-hint-list">
              <li>An email with a One Time Password has been sent to your email and mobile. Valid for 10 mins.</li>
              <li>Check spam or junk folder if you cannot locate the email.</li>
              <li>If you have not received OTP, please re-enter email and phone number in the previous step.</li>
            </ul>
            <div className="form-group">
              <label>Email OTP *</label>
              <div className="otp-inputs">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={emailOtp[i] || ''}
                    onChange={(e) => {
                      const v = e.target.value.replaceAll(/\D/g, '');
                      setEmailOtp((prev) => {
                        const arr = prev.split('');
                        arr[i] = v;
                        const next = arr.join('').slice(0, 4);
                        if (v && i < 3) (document.querySelector(`.otp-email-${i + 1}`) as HTMLInputElement)?.focus();
                        return next;
                      });
                    }}
                    onKeyDown={(e) => e.key === 'Backspace' && !emailOtp[i] && i > 0 && (document.querySelector(`.otp-email-${i - 1}`) as HTMLInputElement)?.focus()}
                    className={`otp-email-${i}`}
                  />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Mobile OTP *</label>
              <div className="otp-inputs">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={smsOtp[i] || ''}
                    onChange={(e) => {
                      const v = e.target.value.replaceAll(/\D/g, '');
                      setSmsOtp((prev) => {
                        const arr = prev.split('');
                        arr[i] = v;
                        const next = arr.join('').slice(0, 4);
                        if (v && i < 3) (document.querySelector(`.otp-sms-${i + 1}`) as HTMLInputElement)?.focus();
                        return next;
                      });
                    }}
                    onKeyDown={(e) => e.key === 'Backspace' && !smsOtp[i] && i > 0 && (document.querySelector(`.otp-sms-${i - 1}`) as HTMLInputElement)?.focus()}
                    className={`otp-sms-${i}`}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleStep4Submit} className="introduced-investor-wizard__form">
            <h3>Set Password & Complete</h3>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={step4Form.password}
                onChange={(e) => setStep4Form((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="form-group form-group--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={step4Form.agreeToWhatsapp || false}
                  onChange={(e) => setStep4Form((p) => ({ ...p, agreeToWhatsapp: e.target.checked }))}
                />
                I agree to receive communication on WhatsApp
              </label>
            </div>
            <div className="form-group form-group--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={step4Form.confirmation || false}
                  onChange={(e) => setStep4Form((p) => ({ ...p, confirmation: e.target.checked }))}
                />
                I hereby confirm that the information provided is accurate, correct and complete *
              </label>
            </div>
            <div className="form-group form-group--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={step4Form.agreeToTerms || false}
                  onChange={(e) => setStep4Form((p) => ({ ...p, agreeToTerms: e.target.checked }))}
                />
                I have read and accept the Terms and Conditions *
              </label>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Completing...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
