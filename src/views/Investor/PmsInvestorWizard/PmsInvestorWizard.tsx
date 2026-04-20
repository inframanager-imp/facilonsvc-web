import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pmsInvestorService } from '../../../services/pmsInvestor.service';
import { contentService } from '../../../services/content.service';
import type {
  MasterCountryDto,
  IsdCodeValuesDto,
  MasterLookupDto,
} from '../../../services/content.service';
import PrivacyPolicyModal from '../IntroducedRegistration/PrivacyPolicyModal';
import TermsModal from '../IntroducedRegistration/TermsModal';
import { toast } from 'react-toastify';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import './PmsInvestorWizard.scss';

/**
 * PMS Investor Registration Wizard — Laravel parity.
 *
 * Mirrors the 4-step flow defined by:
 *   - introduce-register-pms-main-step.blade.php  → Step 1: Self / Legal Entity
 *   - introduce-register-pms-step1.blade.php      → Step 2: Personal details
 *   - introduce-pms-register-step2.blade.php      → Step 3: OTP verification
 *   - introduce-pms-register-step4.blade.php      → Step 4: KYC + consent
 *
 * Notes:
 * - Laravel auto-fetches PMS Manager / Plan / Bank from the introducer's
 *   Dataverse record (via the InnerPageController.introduce_investor_register_pms_main_step_show
 *   method) and never asks the user to pick them. The React wizard accepts an
 *   `?introduce_id=...` query param so the same lookup can be wired from a
 *   future Spring Boot endpoint; until then the wizard registers the investor
 *   without a PMS Manager/Plan/Bank link (the API now allows null pmsBankId).
 * - Privacy & Terms checkboxes start DISABLED. The user must open each modal
 *   and click Accept to enable + tick the corresponding checkbox — exact match
 *   for the Laravel openModal/acceptTerms behaviour.
 */
export const PmsInvestorWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const introduceId = searchParams.get('introduce_id') || undefined;

  // ----------------------------------------------------------------------
  // Master data + UI state
  // ----------------------------------------------------------------------
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<MasterCountryDto[]>([]);
  const [isdCodes, setIsdCodes] = useState<IsdCodeValuesDto[]>([]);
  const [nationalities, setNationalities] = useState<MasterLookupDto[]>([]);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // ----------------------------------------------------------------------
  // Step 1 — Self / Legal Entity selection (Laravel: introduce-register-pms-main-step.blade.php)
  // ----------------------------------------------------------------------
  const [step1Form, setStep1Form] = useState({
    self: 'Self' as 'Self' | 'Legal Entity',
    fullName: '',
    countryOfIncorporation: '' as string | number,
    legalEntityWebsite: '',
  });

  // ----------------------------------------------------------------------
  // Step 2 — Personal details (Laravel: introduce-register-pms-step1.blade.php)
  // ----------------------------------------------------------------------
  const [step2Form, setStep2Form] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    userDob: '', // dd-mm-yyyy
    gender: '' as '' | 'Male' | 'Female' | 'Transgender',
    email: '',
    countryCode: undefined as number | undefined,
    mobileNumber: '',
    agreeForOtp: false,
  });

  // ----------------------------------------------------------------------
  // Step 3 — OTP verification (Laravel: introduce-pms-register-step2.blade.php)
  // ----------------------------------------------------------------------
  const [emailOtp, setEmailOtp] = useState<string[]>(['', '', '', '']);
  const [smsOtp, setSmsOtp] = useState<string[]>(['', '', '', '']);

  // ----------------------------------------------------------------------
  // Step 4 — KYC + WhatsApp + Terms (Laravel: introduce-pms-register-step4.blade.php)
  // ----------------------------------------------------------------------
  const [step4Form, setStep4Form] = useState({
    // Self branch
    nationalityId: undefined as number | undefined,
    nationalityName: '',
    legalCountryId: undefined as number | undefined,        // legal_country (Indian path)
    legalCountry2Id: undefined as number | undefined,       // legal_country2 (non-Indian path)
    pancard: '' as '' | 'Yes' | 'No',
    ociCard: '' as '' | 'Yes' | 'No',
    indianOrigin: '' as '' | 'Yes' | 'No',
    // Legal Entity branch
    legalPanCard: 'Yes' as 'Yes' | 'No',
    repCapacity: 'Director' as 'Director' | 'Employee' | 'POA Holder',
    regulation: 'Yes' as 'Yes' | 'No',
    // Common
    agreeToWhatsapp: false,
    sameWhatsapp: '' as '' | 'Yes' | 'No',
    diffMobWhatsapp: '',
    confirmation2: false,
    agreePrivacy: false,
    agreeTerms: false,
    // Account
    password: '',
  });

  // ----------------------------------------------------------------------
  // Derived
  // ----------------------------------------------------------------------
  const isLegalEntity = step1Form.self === 'Legal Entity';
  const isIndianNationality = step4Form.nationalityName?.toLowerCase() === 'indian';

  // ----------------------------------------------------------------------
  // Master data loading — runs once on mount; the country-code seeding only
  // happens when the field is empty so omitting step2Form.countryCode from
  // the dep array is intentional.
  // ----------------------------------------------------------------------
  useEffect(() => {
    contentService.getCountries().then(setCountries).catch(() => {});
    contentService.getIsdCodes().then((codes) => {
      setIsdCodes(codes);
      const india = codes.find((c) => c.countryCode === 'IN' || c.codeValue === 91);
      if (india?.id && !step2Form.countryCode) {
        setStep2Form((p) => ({ ...p, countryCode: india.id }));
      }
    }).catch(() => {});
    contentService.getNationalities().then(setNationalities).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------
  // OTP — auto-advance focus (matches Laravel moveFocus())
  // ----------------------------------------------------------------------
  const handleOtpChange = (
    which: 'email' | 'sms',
    idx: number,
    value: string,
  ) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const setter = which === 'email' ? setEmailOtp : setSmsOtp;
    setter((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < 3) {
      const nextEl = document.getElementById(
        `${which === 'email' ? 'otp' : 'otp'}${which === 'email' ? idx + 2 : idx + 6}`,
      ) as HTMLInputElement | null;
      nextEl?.focus();
    }
  };

  const handleOtpKeyDown = (
    which: 'email' | 'sms',
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      const arr = which === 'email' ? emailOtp : smsOtp;
      if (!arr[idx] && idx > 0) {
        const prevEl = document.getElementById(
          `${which === 'email' ? 'otp' : 'otp'}${which === 'email' ? idx : idx + 4}`,
        ) as HTMLInputElement | null;
        prevEl?.focus();
      }
    }
  };

  // ----------------------------------------------------------------------
  // Step 1 submit
  // ----------------------------------------------------------------------
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLegalEntity) {
      if (!step1Form.fullName.trim()) {
        toast.error('Please enter the full legal entity name');
        return;
      }
      if (!step1Form.countryOfIncorporation || step1Form.countryOfIncorporation === 'XX') {
        toast.error('Please select country of incorporation');
        return;
      }
      if (!step1Form.legalEntityWebsite.trim()) {
        toast.error('Please enter the legal entity website');
        return;
      }
      const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w-]{2,}(\/.*)?$/;
      if (!urlPattern.test(step1Form.legalEntityWebsite)) {
        toast.error('Please enter a valid website URL');
        return;
      }
    }
    setStep(2);
  };

  // ----------------------------------------------------------------------
  // Step 2 submit (sends OTP)
  // ----------------------------------------------------------------------
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step2Form.firstName || !step2Form.lastName) {
      toast.error('First and Last name are required');
      return;
    }
    if (!step2Form.userDob) {
      toast.error('Date of Birth is required');
      return;
    }
    // 18+ check (matches Laravel flatpickr handler)
    const [d, m, y] = step2Form.userDob.split('-').map(Number);
    if (d && m && y) {
      const dob = new Date(y, m - 1, d);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) {
        toast.error('You must be at least 18 years old');
        return;
      }
    }
    if (!step2Form.gender) {
      toast.error('Please select gender');
      return;
    }
    if (!step2Form.email || !step2Form.mobileNumber) {
      toast.error('Email and Mobile number are required');
      return;
    }
    if (!step2Form.agreeForOtp) {
      toast.error('Please agree to receive OTP on email and mobile');
      return;
    }

    setLoading(true);
    try {
      const result = await pmsInvestorService.step2('TEMP', {
        firstName: step2Form.firstName,
        middleName: step2Form.middleName,
        lastName: step2Form.lastName,
        userDob: step2Form.userDob,
        gender: step2Form.gender,
        email: step2Form.email,
        mobileNumber: step2Form.mobileNumber,
        countryCode: step2Form.countryCode,
        agreeForOtp: step2Form.agreeForOtp,
      });
      if (!result.success) {
        toast.error(result.message || 'Failed to send OTP');
        return;
      }
      const channels: string[] = [];
      if (result.emailSent) channels.push('email');
      if (result.smsSent) channels.push('mobile');
      toast.success(channels.length > 0
        ? `OTP sent to your ${channels.join(' and ')}`
        : 'OTP generated — please contact support if not received');
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Step 3 submit (verifies OTP)
  // ----------------------------------------------------------------------
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCode = emailOtp.join('');
    const smsCode = smsOtp.join('');
    if (emailCode.length !== 4 || smsCode.length !== 4) {
      toast.error('Please enter both 4-digit OTPs');
      return;
    }
    setLoading(true);
    try {
      const result = await pmsInvestorService.step3({
        uniqueCode: 'TEMP',
        emailOtp: emailCode,
        smsOtp: smsCode,
        email: step2Form.email,
        mobileNumber: step2Form.mobileNumber,
      });
      if (!result.success) {
        toast.error(result.message || 'Invalid OTP');
        return;
      }
      toast.success('OTP verified');
      setStep(4);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Step 4 submit (final registration)
  // ----------------------------------------------------------------------
  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!step4Form.password || step4Form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!isLegalEntity) {
      // Self branch validations (Laravel parity)
      if (!step4Form.nationalityId) {
        toast.error('Please select Nationality');
        return;
      }
      if (isIndianNationality) {
        if (!step4Form.legalCountryId) {
          toast.error('Please select Country of Residence');
          return;
        }
        if (!step4Form.pancard) {
          toast.error('Please indicate if you have a PAN card');
          return;
        }
      } else {
        if (!step4Form.legalCountry2Id) {
          toast.error('Please select Country of Residence');
          return;
        }
        if (!step4Form.indianOrigin) {
          toast.error('Please indicate if you are of Indian origin');
          return;
        }
        if (step4Form.indianOrigin === 'Yes' && !step4Form.ociCard) {
          toast.error('Please indicate if you hold an OCI card');
          return;
        }
      }
    }

    if (step4Form.agreeToWhatsapp) {
      if (!step4Form.sameWhatsapp) {
        toast.error('Please answer the WhatsApp number question');
        return;
      }
      if (step4Form.sameWhatsapp === 'No') {
        if (!step4Form.diffMobWhatsapp) {
          toast.error('Please enter your WhatsApp number');
          return;
        }
        if (step4Form.diffMobWhatsapp === step2Form.mobileNumber) {
          toast.error('WhatsApp number must differ from mobile number');
          return;
        }
      }
    }

    if (!step4Form.agreePrivacy) {
      toast.error('Please read and accept the Privacy Policy');
      return;
    }
    if (!step4Form.agreeTerms) {
      toast.error('Please read and accept the Terms and Conditions');
      return;
    }

    setLoading(true);
    try {
      // Convert dd-mm-yyyy → yyyy-mm-dd
      let isoDob: string | undefined;
      const [dd, mm, yyyy] = step2Form.userDob.split('-');
      if (dd && mm && yyyy) isoDob = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;

      const fullName = [step2Form.firstName, step2Form.middleName, step2Form.lastName]
        .filter((s) => !!s && s.trim() !== '')
        .join(' ');

      // PMS context (manager/plan/bank) is intentionally NOT collected from
      // the user — Laravel inherits it from the introducer's Dataverse record.
      // The Java DTO now allows null pmsBankId; managers/plans default to 0
      // when no introducer pre-fetch has populated them yet.
      await pmsInvestorService.register({
        firstName: step2Form.firstName,
        middleName: step2Form.middleName,
        lastName: step2Form.lastName,
        email: step2Form.email,
        mobilePhone: step2Form.mobileNumber,
        password: step4Form.password,

        userDob: isoDob,
        gender: step2Form.gender,
        countryCodeId: step2Form.countryCode,
        nationalityId: step4Form.nationalityId,
        nationalityName: step4Form.nationalityName,
        legalCountryId: step4Form.legalCountryId ?? step4Form.legalCountry2Id,
        registerAs: step1Form.self,
        legalEntityFullName: isLegalEntity ? step1Form.fullName : undefined,
        fullName,

        pancard: !isLegalEntity && isIndianNationality ? step4Form.pancard || undefined : undefined,
        ociCard: !isLegalEntity && !isIndianNationality ? step4Form.ociCard || undefined : undefined,
        indianOrigin: !isLegalEntity && !isIndianNationality ? step4Form.indianOrigin || undefined : undefined,

        sameWhatsapp: step4Form.sameWhatsapp || undefined,
        diffMobWhatsapp: step4Form.sameWhatsapp === 'No' ? step4Form.diffMobWhatsapp : step2Form.mobileNumber,
        agreeToWhatsapp: step4Form.agreeToWhatsapp,
        agreeForOtp: step2Form.agreeForOtp,
        confirmation: step4Form.confirmation2,
        agreePrivacy: step4Form.agreePrivacy,
        agreeTerms: step4Form.agreeTerms,

        // PMS link — Laravel inherits manager/plan/bank from the introducer's
        // Dataverse record (we don't show selectors). Backend now accepts all
        // three as null/undefined and skips the InvestorPmsDetails write when
        // no manager id is supplied.
        pmsManagerId: undefined as unknown as number,
        pmsPlanId: undefined as unknown as number,
        pmsBankId: undefined,
        accountNumber: 'PENDING-' + Date.now(),
        agreementDate: new Date().toISOString().split('T')[0],
        comments: isLegalEntity ? 'Legal Entity Registration' : 'Self Registration',
      });
      toast.success('Registration complete! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Render helpers — laravel-style left intro column varies per step
  // ----------------------------------------------------------------------
  const renderIntro = () => {
    switch (step) {
      case 1:
        return (
          <div className="pms-investor-wizard__intro">
            <h3>Welcome to <span>Facilon Services</span> Registration Process</h3>
          </div>
        );
      case 2:
        return (
          <div className="pms-investor-wizard__intro">
            <h3>Investor <span>Registration</span></h3>
            <p>
              Before we start the registration process we would like to verify
              your email address and mobile number.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="pms-investor-wizard__intro">
            <h3>Investor <span>Registration</span></h3>
            <div className="list-type1">
              <ul>
                <li>An email with a One Time Password has been sent to your email address and mobile number. These OTPs are valid for 10 minutes.</li>
                <li>Check your spam or junk folder for the email in case you are unable to locate the email.</li>
                <li>If you have not received OTP on email and/or mobile, kindly recheck and re-enter your email and phone number in the previous step.</li>
              </ul>
            </div>
          </div>
        );
      case 4:
      default:
        return (
          <div className="pms-investor-wizard__intro">
            <h3>Investor <span>Registration</span></h3>
            <p>Please confirm your details and accept the terms to complete your PMS registration.</p>
          </div>
        );
    }
  };

  return (
    <div className="pms-investor-wizard">
      <div className="pms-investor-wizard__container">
        <div className="pms-investor-wizard__row">
          {renderIntro()}

          <div className="pms-investor-wizard__col-form">
            <div className="pms-investor-wizard__card">
              <h2>Investor Registration</h2>

              {/* Laravel does not show a step indicator anywhere — each step is its own
                  routed page. Step state is tracked internally but not displayed. */}

              {/* ============================== Step 1 ============================== */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit}>
                  {introduceId && (
                    <div className="pms-investor-wizard__note">
                      Introducer reference: <strong>{introduceId}</strong>
                    </div>
                  )}

                  <div className="single-field">
                    <label>
                      Are you registering for Self or Legal Entity:
                      <span className="star-color">*</span>
                    </label>
                    <div className="radio-box">
                      <label className="radio">
                        <input
                          type="radio"
                          name="self"
                          value="Self"
                          checked={step1Form.self === 'Self'}
                          onChange={() => setStep1Form((p) => ({ ...p, self: 'Self' }))}
                        />
                        <span>Self</span>
                      </label>
                      <label className="radio">
                        <input
                          type="radio"
                          name="self"
                          value="Legal Entity"
                          checked={step1Form.self === 'Legal Entity'}
                          onChange={() => setStep1Form((p) => ({ ...p, self: 'Legal Entity' }))}
                        />
                        <span>Legal Entity</span>
                      </label>
                    </div>
                  </div>

                  {isLegalEntity && (
                    <>
                      <div className="single-field">
                        <label>
                          Full Name of Legal Entity
                          <span className="star-color">*</span>
                        </label>
                        <input
                          type="text"
                          value={step1Form.fullName}
                          onChange={(e) => setStep1Form((p) => ({
                            ...p,
                            fullName: e.target.value.replace(/[^a-zA-Z\s]/g, ''),
                          }))}
                          placeholder="Ensure the name mirrors document evidencing incorporation"
                        />
                      </div>

                      <div className="single-field">
                        <label>
                          Country of Incorporation/Formation/Establishment
                          <span className="star-color">*</span>
                        </label>
                        <PremiumSelect
                          value={step1Form.countryOfIncorporation?.toString() ?? ''}
                          onChange={(val) => setStep1Form((p) => ({
                            ...p,
                            countryOfIncorporation: val,
                          }))}
                          options={countries.map((c) => ({
                            value: String(c.id),
                            label: c.ssName || ''
                          }))}
                          placeholder="Select Country"
                        />
                      </div>

                      <div className="single-field">
                        <label>
                          Legal Entity Website:
                          <span className="star-color">*</span>
                        </label>
                        <input
                          type="url"
                          value={step1Form.legalEntityWebsite}
                          onChange={(e) => setStep1Form((p) => ({
                            ...p,
                            legalEntityWebsite: e.target.value,
                          }))}
                          placeholder="https://example.com"
                        />
                      </div>
                    </>
                  )}

                  <div className="single-field mb-0">
                    <button type="submit" className="button-1">Next</button>
                  </div>
                </form>
              )}

              {/* ============================== Step 2 ============================== */}
              {step === 2 && (
                <form onSubmit={handleStep2Submit}>
                  <div className="single-field">
                    <label>First Name: <span className="star-color">*</span></label>
                    <input
                      type="text"
                      style={{ textTransform: 'uppercase' }}
                      value={step2Form.firstName}
                      onChange={(e) => setStep2Form((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>

                  <div className="single-field">
                    <label>Middle Name:</label>
                    <input
                      type="text"
                      style={{ textTransform: 'uppercase' }}
                      value={step2Form.middleName}
                      onChange={(e) => setStep2Form((p) => ({ ...p, middleName: e.target.value }))}
                    />
                  </div>

                  <div className="single-field">
                    <label>Last Name: <span className="star-color">*</span></label>
                    <input
                      type="text"
                      style={{ textTransform: 'uppercase' }}
                      value={step2Form.lastName}
                      onChange={(e) => setStep2Form((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>

                  <div className="single-field">
                    <label>DOB: <span className="star-color">*</span></label>
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={step2Form.userDob}
                      onChange={(e) => setStep2Form((p) => ({
                        ...p,
                        userDob: e.target.value.replace(/[^0-9-]/g, ''),
                      }))}
                    />
                  </div>

                   <div className="single-field">
                    <label>Gender: <span className="star-color">*</span></label>
                    <PremiumSelect
                      value={step2Form.gender}
                      onChange={(val) => setStep2Form((p) => ({ ...p, gender: val as any }))}
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Transgender', label: 'Transgender' },
                      ]}
                      placeholder="Select Gender"
                    />
                  </div>

                  <div className="single-field">
                    <label>Please enter your Email: <span className="star-color">*</span></label>
                    <input
                      type="email"
                      value={step2Form.email}
                      onChange={(e) => setStep2Form((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  <div className="single-field mobile-no">
                    <label style={{ width: '100%' }}>
                      Please enter your Mobile No: <span className="star-color">*</span>
                    </label>
                    <PremiumSelect
                      value={step2Form.countryCode?.toString() ?? ''}
                      onChange={(val) => setStep2Form((p) => ({
                        ...p,
                        countryCode: val ? Number(val) : undefined,
                      }))}
                      options={isdCodes.map((i) => ({
                        value: String(i.id),
                        label: `+${i.codeValue} (${i.countryName})`
                      }))}
                      placeholder="Select Code"
                      style={{ marginBottom: '10px' }}
                    />
                    <input
                      type="tel"
                      value={step2Form.mobileNumber}
                      onChange={(e) => setStep2Form((p) => ({
                        ...p,
                        mobileNumber: e.target.value.replace(/[^0-9]/g, ''),
                      }))}
                      minLength={10}
                      maxLength={16}
                    />
                  </div>

                  <div className="single-field">
                    <div className="checkbox-wrapper-33">
                      <label className="checkbox">
                        <input
                          className="checkbox__trigger visuallyhidden"
                          type="checkbox"
                          checked={step2Form.agreeForOtp}
                          onChange={(e) => setStep2Form((p) => ({ ...p, agreeForOtp: e.target.checked }))}
                        />
                        <span className="checkbox__symbol">
                          <svg aria-hidden="true" className="icon-checkbox" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 14l8 7L24 7" />
                          </svg>
                        </span>
                        <p className="checkbox__textwrapper">
                          I agree to receive OTP on email and mobile SMS message
                          <span className="star-color">*</span>
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="single-field mb-0">
                    <button type="submit" className="button-1" disabled={loading}>
                      {loading ? 'Sending...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}

              {/* ============================== Step 3 ============================== */}
              {step === 3 && (
                <form onSubmit={handleStep3Submit}>
                  <div className="single-field">
                    <label>Please enter your Email OTP: <span className="star-color">*</span></label>
                    <div className="otp-sec">
                      {[0, 1, 2, 3].map((i) => (
                        <div className="col" key={`eotp-${i}`}>
                          <input
                            type="text"
                            id={`otp${i + 1}`}
                            maxLength={1}
                            value={emailOtp[i]}
                            onChange={(e) => handleOtpChange('email', i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown('email', i, e)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="single-field">
                    <label>Please enter your Mobile OTP: <span className="star-color">*</span></label>
                    <div className="otp-sec">
                      {[0, 1, 2, 3].map((i) => (
                        <div className="col" key={`sotp-${i}`}>
                          <input
                            type="text"
                            id={`otp${i + 5}`}
                            maxLength={1}
                            value={smsOtp[i]}
                            onChange={(e) => handleOtpChange('sms', i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown('sms', i, e)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="single-field mb-0">
                    <button type="submit" className="button-1" disabled={loading}>
                      {loading ? 'Verifying...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}

              {/* ============================== Step 4 ============================== */}
              {step === 4 && (
                <form onSubmit={handleStep4Submit}>
                  <div className="single-field">
                    <label>Password <span className="star-color">*</span></label>
                    <input
                      type="password"
                      value={step4Form.password}
                      onChange={(e) => setStep4Form((p) => ({ ...p, password: e.target.value }))}
                      placeholder="At least 8 characters"
                    />
                  </div>

                  {/* ----- Self branch ----- */}
                  {!isLegalEntity && (
                    <>
                      <div className="single-field">
                        <label>Nationality <span className="star-color">*</span></label>
                        <PremiumSelect
                          value={step4Form.nationalityId?.toString() ?? ''}
                          onChange={(val) => {
                            const id = val ? Number(val) : undefined;
                            const nat = nationalities.find((n) => n.id === id);
                            setStep4Form((p) => ({
                              ...p,
                              nationalityId: id,
                              nationalityName: nat?.name ?? '',
                              pancard: '',
                              ociCard: '',
                              indianOrigin: '',
                            }));
                          }}
                          options={nationalities.map((n) => ({
                            value: String(n.id),
                            label: n.name || ''
                          }))}
                          placeholder="Select Nationality"
                        />
                      </div>

                      {/* Indian path: Country of Residence + PAN */}
                      {step4Form.nationalityId && isIndianNationality && (
                        <>
                          <div className="single-field">
                            <label>Country of Residency: <span className="star-color">*</span></label>
                            <PremiumSelect
                              value={step4Form.legalCountryId?.toString() ?? ''}
                              onChange={(val) => setStep4Form((p) => ({
                                ...p,
                                legalCountryId: val ? Number(val) : undefined,
                              }))}
                              options={countries.map((c) => ({
                                value: String(c.id),
                                label: c.ssName || ''
                              }))}
                              placeholder="Select Country"
                            />
                          </div>

                          <div className="single-field self-sec1">
                            <label>Do you have PAN card? <span className="star-color">*</span></label>
                            <div className="radio-box">
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="pancard"
                                  value="Yes"
                                  checked={step4Form.pancard === 'Yes'}
                                  onChange={() => setStep4Form((p) => ({ ...p, pancard: 'Yes' }))}
                                />
                                <span>Yes</span>
                              </label>
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="pancard"
                                  value="No"
                                  checked={step4Form.pancard === 'No'}
                                  onChange={() => setStep4Form((p) => ({ ...p, pancard: 'No' }))}
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Non-Indian path: Country of Residence + Indian origin + OCI */}
                      {step4Form.nationalityId && !isIndianNationality && (
                        <>
                          <div className="single-field">
                            <label>Country of Residency: <span className="star-color">*</span></label>
                            <PremiumSelect
                              value={step4Form.legalCountry2Id?.toString() ?? ''}
                              onChange={(val) => setStep4Form((p) => ({
                                ...p,
                                legalCountry2Id: val ? Number(val) : undefined,
                              }))}
                              options={countries.map((c) => ({
                                value: String(c.id),
                                label: c.ssName || ''
                              }))}
                              placeholder="Select Country"
                            />
                          </div>

                          <div className="single-field self-sec1">
                            <label>Are you of Indian origin? <span className="star-color">*</span></label>
                            <div className="radio-box">
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="indianOrigin"
                                  value="Yes"
                                  checked={step4Form.indianOrigin === 'Yes'}
                                  onChange={() => setStep4Form((p) => ({ ...p, indianOrigin: 'Yes' }))}
                                />
                                <span>Yes</span>
                              </label>
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="indianOrigin"
                                  value="No"
                                  checked={step4Form.indianOrigin === 'No'}
                                  onChange={() => setStep4Form((p) => ({ ...p, indianOrigin: 'No', ociCard: '' }))}
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>

                          {step4Form.indianOrigin === 'Yes' && (
                            <div className="single-field self-sec1">
                              <label>Do you have an OCI Card? <span className="star-color">*</span></label>
                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="ociCard"
                                    value="Yes"
                                    checked={step4Form.ociCard === 'Yes'}
                                    onChange={() => setStep4Form((p) => ({ ...p, ociCard: 'Yes' }))}
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="ociCard"
                                    value="No"
                                    checked={step4Form.ociCard === 'No'}
                                    onChange={() => setStep4Form((p) => ({ ...p, ociCard: 'No' }))}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ----- Legal Entity branch ----- */}
                  {isLegalEntity && (
                    <>
                      <div className="single-field self-sec1">
                        <label>Do you have PAN card? <span className="star-color">*</span></label>
                        <div className="radio-box">
                          <label className="radio">
                            <input
                              type="radio"
                              name="legalPanCard"
                              value="Yes"
                              checked={step4Form.legalPanCard === 'Yes'}
                              onChange={() => setStep4Form((p) => ({ ...p, legalPanCard: 'Yes' }))}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio">
                            <input
                              type="radio"
                              name="legalPanCard"
                              value="No"
                              checked={step4Form.legalPanCard === 'No'}
                              onChange={() => setStep4Form((p) => ({ ...p, legalPanCard: 'No' }))}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div className="single-field self-sec1">
                        <label>In what capacity representing the company: <span className="star-color">*</span></label>
                        <div className="radio-box">
                          {(['Director', 'Employee', 'POA Holder'] as const).map((rc) => (
                            <label className="radio" key={rc}>
                              <input
                                type="radio"
                                name="repCapacity"
                                value={rc}
                                checked={step4Form.repCapacity === rc}
                                onChange={() => setStep4Form((p) => ({ ...p, repCapacity: rc }))}
                              />
                              <span>{rc}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="single-field self-sec1">
                        <label>Whether Company is regulated as Securities or Banking Company: <span className="star-color">*</span></label>
                        <div className="radio-box">
                          <label className="radio">
                            <input
                              type="radio"
                              name="regulation"
                              value="Yes"
                              checked={step4Form.regulation === 'Yes'}
                              onChange={() => setStep4Form((p) => ({ ...p, regulation: 'Yes' }))}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio">
                            <input
                              type="radio"
                              name="regulation"
                              value="No"
                              checked={step4Form.regulation === 'No'}
                              onChange={() => setStep4Form((p) => ({ ...p, regulation: 'No' }))}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ----- Common: WhatsApp consent ----- */}
                  <div className="single-field">
                    <div className="checkbox-wrapper-33">
                      <label className="checkbox">
                        <input
                          className="checkbox__trigger visuallyhidden"
                          type="checkbox"
                          checked={step4Form.agreeToWhatsapp}
                          onChange={(e) => setStep4Form((p) => ({
                            ...p,
                            agreeToWhatsapp: e.target.checked,
                            sameWhatsapp: e.target.checked ? p.sameWhatsapp : '',
                            diffMobWhatsapp: e.target.checked ? p.diffMobWhatsapp : '',
                          }))}
                        />
                        <span className="checkbox__symbol">
                          <svg aria-hidden="true" className="icon-checkbox" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 14l8 7L24 7" />
                          </svg>
                        </span>
                        <p className="checkbox__textwrapper">
                          I agree to receive communication on WhatsApp
                        </p>
                      </label>
                    </div>
                  </div>

                  {step4Form.agreeToWhatsapp && (
                    <>
                      <div className="single-field">
                        <label>
                          Is your mobile number the same as your WhatsApp number?
                          <span className="star-color">*</span>
                        </label>
                        <div className="radio-box">
                          <label className="radio">
                            <input
                              type="radio"
                              name="sameWhatsapp"
                              value="Yes"
                              checked={step4Form.sameWhatsapp === 'Yes'}
                              onChange={() => setStep4Form((p) => ({
                                ...p,
                                sameWhatsapp: 'Yes',
                                diffMobWhatsapp: '',
                              }))}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio">
                            <input
                              type="radio"
                              name="sameWhatsapp"
                              value="No"
                              checked={step4Form.sameWhatsapp === 'No'}
                              onChange={() => setStep4Form((p) => ({ ...p, sameWhatsapp: 'No' }))}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      {step4Form.sameWhatsapp === 'No' && (
                        <div className="single-field mobile-no">
                          <label style={{ width: '100%' }}>Please enter WhatsApp Mobile No:</label>
                          <PremiumSelect
                            value={step2Form.countryCode?.toString() ?? ''}
                            disabled
                            options={isdCodes.map((i) => ({
                              value: String(i.id),
                              label: `+${i.codeValue} (${i.countryName})`
                            }))}
                            placeholder="Code"
                            style={{ marginBottom: '10px' }}
                          />
                          <input
                            type="tel"
                            value={step4Form.diffMobWhatsapp}
                            onChange={(e) => setStep4Form((p) => ({
                              ...p,
                              diffMobWhatsapp: e.target.value.replace(/[^0-9]/g, ''),
                            }))}
                            minLength={10}
                            maxLength={16}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* ----- Marketing checkbox (Laravel: confirmation2) ----- */}
                  <div className="single-field">
                    <div className="checkbox-wrapper-33">
                      <label className="checkbox">
                        <input
                          className="checkbox__trigger visuallyhidden"
                          type="checkbox"
                          checked={step4Form.confirmation2}
                          onChange={(e) => setStep4Form((p) => ({ ...p, confirmation2: e.target.checked }))}
                        />
                        <span className="checkbox__symbol">
                          <svg aria-hidden="true" className="icon-checkbox" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 14l8 7L24 7" />
                          </svg>
                        </span>
                        <p className="checkbox__textwrapper">
                          Yes, I would like to receive marketing communications from Facilon Services Private Limited
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* ----- Privacy checkbox (modal-gated) ----- */}
                  <div className="single-field">
                    <div className="checkbox-wrapper-33">
                      <label
                        className="checkbox"
                        onClick={(e) => {
                          if (!step4Form.agreePrivacy) {
                            e.preventDefault();
                            setShowPrivacyModal(true);
                          }
                        }}
                      >
                        <input
                          className="checkbox__trigger visuallyhidden"
                          type="checkbox"
                          checked={step4Form.agreePrivacy}
                          disabled={!step4Form.agreePrivacy}
                          readOnly
                        />
                        <span className="checkbox__symbol">
                          <svg aria-hidden="true" className="icon-checkbox" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 14l8 7L24 7" />
                          </svg>
                        </span>
                        <p className="checkbox__textwrapper">
                          I have read and understood the{' '}
                          <button
                            type="button"
                            className="pms-investor-wizard__inline-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPrivacyModal(true);
                            }}
                          >
                            Privacy Policy
                          </button>
                          <span className="star-color">*</span>
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* ----- Terms checkbox (modal-gated) ----- */}
                  <div className="single-field">
                    <div className="checkbox-wrapper-33">
                      <label
                        className="checkbox"
                        onClick={(e) => {
                          if (!step4Form.agreeTerms) {
                            e.preventDefault();
                            setShowTermsModal(true);
                          }
                        }}
                      >
                        <input
                          className="checkbox__trigger visuallyhidden"
                          type="checkbox"
                          checked={step4Form.agreeTerms}
                          disabled={!step4Form.agreeTerms}
                          readOnly
                        />
                        <span className="checkbox__symbol">
                          <svg aria-hidden="true" className="icon-checkbox" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 14l8 7L24 7" />
                          </svg>
                        </span>
                        <p className="checkbox__textwrapper">
                          I have read, understood and hereby accept the{' '}
                          <button
                            type="button"
                            className="pms-investor-wizard__inline-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTermsModal(true);
                            }}
                          >
                            Terms and Conditions
                          </button>
                          <span className="star-color">*</span>
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="single-field mb-0">
                    <button type="submit" className="button-1" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Terms modals — checkboxes are enabled only after Accept */}
      <PrivacyPolicyModal
        show={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setStep4Form((p) => ({ ...p, agreePrivacy: true }));
          setShowPrivacyModal(false);
        }}
      />
      <TermsModal
        show={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setStep4Form((p) => ({ ...p, agreeTerms: true }));
          setShowTermsModal(false);
        }}
      />
    </div>
  );
};
