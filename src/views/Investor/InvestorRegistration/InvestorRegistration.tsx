import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { contentService } from '../../../services/content.service';
import type {
  EmailRegistrationResponseDto,
  IndividualRegistrationDto,
  LegalEntityRegistrationDto,
} from '../../../services/investor.service';
import type { MasterCountryDto, MasterLookupDto } from '../../../services/content.service';
import { toast } from 'react-toastify';
import './InvestorRegistration.scss';

export const InvestorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Email/OTP, 2=Individual/Legal Entity Details, 3=Completed
  const [registerAs, setRegisterAs] = useState<number>(1); // 1=Individual, 2=Legal Entity
  const [uniqueCode, setUniqueCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [countries, setCountries] = useState<MasterCountryDto[]>([]);
  const [nationalities, setNationalities] = useState<MasterLookupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // Individual form data
  const [individualData, setIndividualData] = useState<Partial<IndividualRegistrationDto>>({
    interestedInIndianMarket: undefined,
    title: undefined,
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 0,
    countryOfResidence: 0,
    hasPanCard: undefined,
    residencyType: '',
    isPersonOfIndianOrigin: undefined,
    hasOciCard: undefined,
    termsAccepted: false,
  });

  // Legal Entity form data
  const [legalEntityData, setLegalEntityData] = useState<Partial<LegalEntityRegistrationDto>>({
    entityName: '',
    countryOfIncorporation: 0,
    hasPanCard: undefined,
    entityRepresentativeName: '',
    representativeCapacity: '',
    isSecuritiesRegulated: undefined,
    termsAccepted: false,
  });

  React.useEffect(() => {
    contentService.getCountries().then(setCountries).catch(() => {});
    contentService.getNationalities().then(setNationalities).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!email || !email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!registerAs) {
      setErrors({ registerAs: 'Please select registration type' });
      return;
    }

    setLoading(true);
    try {
      const response: EmailRegistrationResponseDto = await investorService.submitEmail({
        email: email.trim(),
        registerAs,
      });

      if (!response.success) {
        if (response.emailAlreadyExists) {
          toast.error(response.message);
        } else {
          toast.error(response.message || 'Failed to send OTP');
        }
        return;
      }

      setUniqueCode(response.uniqueCode || '');
      setOtpTimer(15 * 60); // 15 minutes
      toast.success(response.message);
      // Stay on step 1 for OTP entry - don't move to step 2 yet
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp || otp.length !== 4) {
      setErrors({ otp: 'Please enter 4-digit OTP' });
      return;
    }

    if (!consentGiven) {
      setErrors({ consent: 'Please provide your consent to continue' });
      return;
    }

    setLoading(true);
    try {
      const response = await investorService.verifyOtpWithConsent({
        uniqueCode,
        emailOtp: otp,
        consentGiven,
      });

      if (!response.success) {
        toast.error(response.message || 'OTP verification failed');
        return;
      }

      toast.success(response.message);
      setStep(2); // Move to details step
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await investorService.resendOtp(uniqueCode);
      toast.success(response.message || 'OTP has been resent');
      setOtpTimer(15 * 60); // Reset timer
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

      const validationErrors: Record<string, string | undefined> = {};

    if (individualData.interestedInIndianMarket === undefined) {
      validationErrors.interestedInIndianMarket = 'Please select an option';
    }

    // Only validate other fields if interested in Indian market
    if (individualData.interestedInIndianMarket) {
      if (!individualData.firstName?.trim()) {
        validationErrors.firstName = 'First name is required';
      }
      if (!individualData.lastName?.trim()) {
        validationErrors.lastName = 'Last name is required';
      }
      if (!individualData.dateOfBirth) {
        validationErrors.dateOfBirth = 'Date of birth is required';
      }
      if (!individualData.gender?.trim()) {
        validationErrors.gender = 'Gender is required';
      }
      if (!individualData.nationality || individualData.nationality === 0) {
        validationErrors.nationality = 'Nationality is required';
      }
      if (!individualData.countryOfResidence || individualData.countryOfResidence === 0) {
        validationErrors.countryOfResidence = 'Country of residence is required';
      }
      if (individualData.hasPanCard === undefined) {
        validationErrors.hasPanCard = 'Please indicate if you have a PAN card';
      }
      if (!individualData.termsAccepted) {
        validationErrors.termsAccepted = 'You must accept the terms and conditions';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await investorService.completeIndividualRegistration(uniqueCode, {
        interestedInIndianMarket: individualData.interestedInIndianMarket!,
        title: individualData.title,
        firstName: individualData.firstName!,
        middleName: individualData.middleName,
        lastName: individualData.lastName!,
        dateOfBirth: individualData.dateOfBirth!,
        gender: individualData.gender!,
        nationality: individualData.nationality!,
        countryOfResidence: individualData.countryOfResidence!,
        hasPanCard: individualData.hasPanCard!,
        residencyType: individualData.residencyType,
        isPersonOfIndianOrigin: individualData.isPersonOfIndianOrigin,
        hasOciCard: individualData.hasOciCard,
        termsAccepted: individualData.termsAccepted!,
      });

      if (!response.success) {
        toast.error(response.message || 'Registration failed');
        return;
      }

      toast.success(response.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLegalEntitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

      const validationErrors: Record<string, string | undefined> = {};

    if (!legalEntityData.entityName?.trim()) {
      validationErrors.entityName = 'Entity name is required';
    }
    if (!legalEntityData.countryOfIncorporation || legalEntityData.countryOfIncorporation === 0) {
      validationErrors.countryOfIncorporation = 'Country of incorporation is required';
    }
    if (!legalEntityData.entityRepresentativeName?.trim()) {
      validationErrors.entityRepresentativeName = 'Representative name is required';
    }
    if (!legalEntityData.representativeCapacity?.trim()) {
      validationErrors.representativeCapacity = 'Representative capacity is required';
    }
    if (legalEntityData.isSecuritiesRegulated === undefined) {
      validationErrors.isSecuritiesRegulated = 'Please indicate if entity is regulated';
    }
    if (!legalEntityData.termsAccepted) {
      validationErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    // Check if India and PAN required
    const indiaCountryId = countries.find(c => c.ssName === 'India')?.id || 1;
    if (legalEntityData.countryOfIncorporation === indiaCountryId && 
        legalEntityData.hasPanCard === undefined) {
      validationErrors.hasPanCard = 'PAN card status is required for India incorporation';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await investorService.completeLegalEntityRegistration(uniqueCode, {
        entityName: legalEntityData.entityName!,
        countryOfIncorporation: legalEntityData.countryOfIncorporation!,
        hasPanCard: legalEntityData.hasPanCard,
        entityRepresentativeName: legalEntityData.entityRepresentativeName!,
        representativeCapacity: legalEntityData.representativeCapacity!,
        isSecuritiesRegulated: legalEntityData.isSecuritiesRegulated!,
        termsAccepted: legalEntityData.termsAccepted!,
      });

      if (!response.success) {
        toast.error(response.message || 'Registration failed');
        return;
      }

      toast.success(response.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isIndianNationality = () => {
    const indianNat = nationalities.find(n => n.name === 'Indian');
    return individualData.nationality === indianNat?.id;
  };

  const isForeignNationality = () => {
    return individualData.nationality && individualData.nationality > 0 && !isIndianNationality();
  };

  return (
    <div className="investor-registration">
      <div className="investor-registration__container">
        <h2>Welcome to Facilon Services ('Facilon') Registration Process</h2>
        
        {step === 1 && !uniqueCode && (
          <form onSubmit={handleEmailSubmit} className="investor-registration__form" noValidate>
            <p className="info-text">Before we start the registration process, we would like to verify your email address</p>
            
            <div className="form-group">
              <label>Are you registering for an individual or a legal entity? *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="registerAs"
                    value={1}
                    checked={registerAs === 1}
                    onChange={() => setRegisterAs(1)}
                  />
                  <span>Individual</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="registerAs"
                    value={2}
                    checked={registerAs === 2}
                    onChange={() => setRegisterAs(2)}
                  />
                  <span>Legal Entity</span>
                </label>
              </div>
              {errors.registerAs && <span className="field-error">{errors.registerAs}</span>}
            </div>

            <div className="form-group">
              <label>Please enter email address here *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                required
                placeholder="Enter your email address"
                className={errors.email ? 'has-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : 'Submit'}
            </button>
          </form>
        )}

        {step === 1 && uniqueCode && (
          <form onSubmit={handleOtpSubmit} className="investor-registration__form" noValidate>
            <h3>Email Verification</h3>
            <p className="info-text">
              An email with a One-Time Password has been sent to <strong>{email}</strong>. 
              (Check your spam or junk folder for the email in case you are unable to locate the email)
            </p>

            <div className="form-group">
              <label>Please enter OTP here *</label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                  if (errors.otp) setErrors((p) => ({ ...p, otp: undefined }));
                }}
                placeholder="Enter 4-digit OTP"
                required
                className={errors.otp ? 'has-error' : ''}
              />
              {errors.otp && <span className="field-error">{errors.otp}</span>}
            </div>

            {otpTimer > 0 && (
              <p className="timer-text">Time remaining: {formatTime(otpTimer)}</p>
            )}
            
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResendOtp}
              disabled={loading || otpTimer > 0}
            >
              Resend OTP
            </button>

            <div className="consent-section">
              <h4>Consent to Record Your Details</h4>
              <div className="consent-box">
                {registerAs === 1 ? (
                  <div className="consent-content">
                    <p><strong>Individual Investor Consent</strong></p>
                    <p>By proceeding, you consent to:</p>
                    <ul>
                      <li>Facilon collecting and processing your personal information</li>
                      <li>Facilon sharing your information with authorized service providers</li>
                      <li>Receiving communications regarding your registration and services</li>
                      <li>The terms and conditions outlined in our Privacy Policy</li>
                    </ul>
                  </div>
                ) : (
                  <div className="consent-content">
                    <p><strong>Legal Entity Investor Consent</strong></p>
                    <p>By proceeding, the legal entity consents to:</p>
                    <ul>
                      <li>Facilon collecting and processing the entity's information</li>
                      <li>Facilon sharing entity information with authorized service providers</li>
                      <li>The authorized representative providing information on behalf of the entity</li>
                      <li>Receiving communications regarding registration and services</li>
                      <li>The terms and conditions outlined in our Privacy Policy</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => {
                      setConsentGiven(e.target.checked);
                      if (errors.consent) setErrors((p) => ({ ...p, consent: undefined }));
                    }}
                    required
                  />
                  <span>I have read and understood the above consent, and I agree to proceed *</span>
                </label>
                {errors.consent && <span className="field-error">{errors.consent}</span>}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {step === 2 && registerAs === 1 && (
          <form onSubmit={handleIndividualSubmit} className="investor-registration__form" noValidate>
            <h3>Individual Investor Registration</h3>
            <p className="info-text">Currently we are only registering expression of Interest in the India securities market</p>

            <div className="form-group">
              <label>Are you looking to appoint a Broker, Portfolio Manager or a Custodian in the Indian Securities Market? *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="interestedInMarket"
                    value="yes"
                    checked={individualData.interestedInIndianMarket === true}
                    onChange={() => {
                      setIndividualData((p) => ({ ...p, interestedInIndianMarket: true }));
                      if (errors.interestedInIndianMarket) setErrors((p) => ({ ...p, interestedInIndianMarket: undefined }));
                    }}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="interestedInMarket"
                    value="no"
                    checked={individualData.interestedInIndianMarket === false}
                    onChange={() => {
                      setIndividualData((p) => ({ ...p, interestedInIndianMarket: false }));
                      if (errors.interestedInIndianMarket) setErrors((p) => ({ ...p, interestedInIndianMarket: undefined }));
                    }}
                  />
                  <span>No</span>
                </label>
              </div>
              {errors.interestedInIndianMarket && <span className="field-error">{errors.interestedInIndianMarket}</span>}
            </div>

            {individualData.interestedInIndianMarket === false && (
              <div className="info-message">
                <p><strong>Thank you for your interest in Facilon. We will notify you when we add other markets.</strong></p>
              </div>
            )}

            {individualData.interestedInIndianMarket === true && (
              <>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={individualData.firstName}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, firstName: e.target.value.toUpperCase() }));
                      if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
                    }}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'has-error' : ''}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    value={individualData.middleName}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, middleName: e.target.value.toUpperCase() }));
                    }}
                    placeholder="Enter your middle name (optional)"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={individualData.lastName}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, lastName: e.target.value.toUpperCase() }));
                      if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined }));
                    }}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'has-error' : ''}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={individualData.dateOfBirth}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, dateOfBirth: e.target.value }));
                      if (errors.dateOfBirth) setErrors((p) => ({ ...p, dateOfBirth: undefined }));
                    }}
                    className={errors.dateOfBirth ? 'has-error' : ''}
                  />
                  {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    value={individualData.gender}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, gender: e.target.value }));
                      if (errors.gender) setErrors((p) => ({ ...p, gender: undefined }));
                    }}
                    className={errors.gender ? 'has-error' : ''}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                  {errors.gender && <span className="field-error">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label>Nationality *</label>
                  <select
                    value={individualData.nationality}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, nationality: +e.target.value }));
                      if (errors.nationality) setErrors((p) => ({ ...p, nationality: undefined }));
                    }}
                    className={errors.nationality ? 'has-error' : ''}
                  >
                    <option value={0}>Select Nationality</option>
                    {nationalities.map((n) => (
                      <option key={n.myRowId} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                  {errors.nationality && <span className="field-error">{errors.nationality}</span>}
                </div>

                <div className="form-group">
                  <label>Country of Residence *</label>
                  <select
                    value={individualData.countryOfResidence}
                    onChange={(e) => {
                      setIndividualData((p) => ({ ...p, countryOfResidence: +e.target.value }));
                      if (errors.countryOfResidence) setErrors((p) => ({ ...p, countryOfResidence: undefined }));
                    }}
                    className={errors.countryOfResidence ? 'has-error' : ''}
                  >
                    <option value={0}>Select Country</option>
                    {countries.map((c) => (
                      <option key={c.myRowId} value={c.id}>{c.ssName}</option>
                    ))}
                  </select>
                  {errors.countryOfResidence && <span className="field-error">{errors.countryOfResidence}</span>}
                </div>

                <div className="form-group">
                  <label>Do you have a PAN card? *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="hasPanCard"
                        value="yes"
                        checked={individualData.hasPanCard === true}
                        onChange={() => {
                          setIndividualData((p) => ({ ...p, hasPanCard: true }));
                          if (errors.hasPanCard) setErrors((p) => ({ ...p, hasPanCard: undefined }));
                        }}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="hasPanCard"
                        value="no"
                        checked={individualData.hasPanCard === false}
                        onChange={() => {
                          setIndividualData((p) => ({ ...p, hasPanCard: false }));
                          if (errors.hasPanCard) setErrors((p) => ({ ...p, hasPanCard: undefined }));
                        }}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.hasPanCard && <span className="field-error">{errors.hasPanCard}</span>}
                </div>

                {isIndianNationality() && (
                  <div className="form-group">
                    <label>Are you *</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="residencyType"
                          value="resident_indian"
                          checked={individualData.residencyType === 'resident_indian'}
                          onChange={(e) => setIndividualData((p) => ({ ...p, residencyType: e.target.value }))}
                        />
                        <span>Resident Indian</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="residencyType"
                          value="non_resident_indian"
                          checked={individualData.residencyType === 'non_resident_indian'}
                          onChange={(e) => setIndividualData((p) => ({ ...p, residencyType: e.target.value }))}
                        />
                        <span>Non-Resident Indian</span>
                      </label>
                    </div>
                  </div>
                )}

                {isForeignNationality() && (
                  <>
                    <div className="form-group">
                      <label>Are you a Person of Indian Origin? *</label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="isPersonOfIndianOrigin"
                            value="yes"
                            checked={individualData.isPersonOfIndianOrigin === true}
                            onChange={() => setIndividualData((p) => ({ ...p, isPersonOfIndianOrigin: true }))}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="isPersonOfIndianOrigin"
                            value="no"
                            checked={individualData.isPersonOfIndianOrigin === false}
                            onChange={() => setIndividualData((p) => ({ ...p, isPersonOfIndianOrigin: false }))}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    {individualData.isPersonOfIndianOrigin === true && (
                      <div className="form-group">
                        <label>Do you have an OCI card? *</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="hasOciCard"
                              value="yes"
                              checked={individualData.hasOciCard === true}
                              onChange={() => setIndividualData((p) => ({ ...p, hasOciCard: true }))}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="hasOciCard"
                              value="no"
                              checked={individualData.hasOciCard === false}
                              onChange={() => setIndividualData((p) => ({ ...p, hasOciCard: false }))}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {individualData.hasPanCard === false && (
                  <div className="warning-message">
                    <p>It is important for you to have a PAN card before appointing any service provider. We will contact you by email and provide you the process for applying for PAN card.</p>
                  </div>
                )}

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={individualData.termsAccepted}
                      onChange={(e) => {
                        setIndividualData((p) => ({ ...p, termsAccepted: e.target.checked }));
                        if (errors.termsAccepted) setErrors((p) => ({ ...p, termsAccepted: undefined }));
                      }}
                      required
                    />
                    <span>I have read the Terms & Conditions and provide my consent by submitting the information *</span>
                  </label>
                  {errors.termsAccepted && <span className="field-error">{errors.termsAccepted}</span>}
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </>
            )}

            {individualData.interestedInIndianMarket === false && (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </form>
        )}

        {step === 2 && registerAs === 2 && (
          <form onSubmit={handleLegalEntitySubmit} className="investor-registration__form" noValidate>
            <h3>Legal Entity Registration</h3>

            <div className="form-group">
              <label>Name of the Entity *</label>
              <input
                type="text"
                value={legalEntityData.entityName}
                onChange={(e) => {
                  setLegalEntityData((p) => ({ ...p, entityName: e.target.value }));
                  if (errors.entityName) setErrors((p) => ({ ...p, entityName: undefined }));
                }}
                placeholder="Should be same as in the incorporation/formation documents"
                className={errors.entityName ? 'has-error' : ''}
              />
              {errors.entityName && <span className="field-error">{errors.entityName}</span>}
            </div>

            <div className="form-group">
              <label>Country of Incorporation/Formation *</label>
              <select
                value={legalEntityData.countryOfIncorporation}
                onChange={(e) => {
                  setLegalEntityData((p) => ({ ...p, countryOfIncorporation: +e.target.value }));
                  if (errors.countryOfIncorporation) setErrors((p) => ({ ...p, countryOfIncorporation: undefined }));
                }}
                className={errors.countryOfIncorporation ? 'has-error' : ''}
              >
                <option value={0}>Select Country</option>
                {countries.map((c) => (
                  <option key={c.myRowId} value={c.id}>{c.ssName}</option>
                ))}
              </select>
              {errors.countryOfIncorporation && <span className="field-error">{errors.countryOfIncorporation}</span>}
            </div>

            {legalEntityData.countryOfIncorporation === countries.find(c => c.ssName === 'India')?.id && (
              <div className="form-group">
                <label>Does the entity have a PAN card? *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasPanCard"
                      value="yes"
                      checked={legalEntityData.hasPanCard === true}
                      onChange={() => {
                        setLegalEntityData((p) => ({ ...p, hasPanCard: true }));
                        if (errors.hasPanCard) setErrors((p) => ({ ...p, hasPanCard: undefined }));
                      }}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasPanCard"
                      value="no"
                      checked={legalEntityData.hasPanCard === false}
                      onChange={() => {
                        setLegalEntityData((p) => ({ ...p, hasPanCard: false }));
                        if (errors.hasPanCard) setErrors((p) => ({ ...p, hasPanCard: undefined }));
                      }}
                    />
                    <span>No</span>
                  </label>
                </div>
                {errors.hasPanCard && <span className="field-error">{errors.hasPanCard}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Name of the Entity Representative *</label>
              <input
                type="text"
                value={legalEntityData.entityRepresentativeName}
                onChange={(e) => {
                  setLegalEntityData((p) => ({ ...p, entityRepresentativeName: e.target.value }));
                  if (errors.entityRepresentativeName) setErrors((p) => ({ ...p, entityRepresentativeName: undefined }));
                }}
                placeholder="Name should be same as in the identity document"
                className={errors.entityRepresentativeName ? 'has-error' : ''}
              />
              {errors.entityRepresentativeName && <span className="field-error">{errors.entityRepresentativeName}</span>}
            </div>

            <div className="form-group">
              <label>In what capacity representing company *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="representativeCapacity"
                    value="Director"
                    checked={legalEntityData.representativeCapacity === 'Director'}
                    onChange={(e) => {
                      setLegalEntityData((p) => ({ ...p, representativeCapacity: e.target.value }));
                      if (errors.representativeCapacity) setErrors((p) => ({ ...p, representativeCapacity: undefined }));
                    }}
                  />
                  <span>Director</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="representativeCapacity"
                    value="Employee"
                    checked={legalEntityData.representativeCapacity === 'Employee'}
                    onChange={(e) => {
                      setLegalEntityData((p) => ({ ...p, representativeCapacity: e.target.value }));
                      if (errors.representativeCapacity) setErrors((p) => ({ ...p, representativeCapacity: undefined }));
                    }}
                  />
                  <span>Employee</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="representativeCapacity"
                    value="POA Holder"
                    checked={legalEntityData.representativeCapacity === 'POA Holder'}
                    onChange={(e) => {
                      setLegalEntityData((p) => ({ ...p, representativeCapacity: e.target.value }));
                      if (errors.representativeCapacity) setErrors((p) => ({ ...p, representativeCapacity: undefined }));
                    }}
                  />
                  <span>POA Holder</span>
                </label>
              </div>
              {errors.representativeCapacity && <span className="field-error">{errors.representativeCapacity}</span>}
            </div>

            <div className="form-group">
              <label>Whether Entity is regulated as a Securities or Banking Company *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isSecuritiesRegulated"
                    value="yes"
                    checked={legalEntityData.isSecuritiesRegulated === true}
                    onChange={() => {
                      setLegalEntityData((p) => ({ ...p, isSecuritiesRegulated: true }));
                      if (errors.isSecuritiesRegulated) setErrors((p) => ({ ...p, isSecuritiesRegulated: undefined }));
                    }}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isSecuritiesRegulated"
                    value="no"
                    checked={legalEntityData.isSecuritiesRegulated === false}
                    onChange={() => {
                      setLegalEntityData((p) => ({ ...p, isSecuritiesRegulated: false }));
                      if (errors.isSecuritiesRegulated) setErrors((p) => ({ ...p, isSecuritiesRegulated: undefined }));
                    }}
                  />
                  <span>No</span>
                </label>
              </div>
              {errors.isSecuritiesRegulated && <span className="field-error">{errors.isSecuritiesRegulated}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={legalEntityData.termsAccepted}
                  onChange={(e) => {
                    setLegalEntityData((p) => ({ ...p, termsAccepted: e.target.checked }));
                    if (errors.termsAccepted) setErrors((p) => ({ ...p, termsAccepted: undefined }));
                  }}
                  required
                />
                <span>I have read the Terms & Conditions and provide my consent by submitting the information *</span>
              </label>
              {errors.termsAccepted && <span className="field-error">{errors.termsAccepted}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
