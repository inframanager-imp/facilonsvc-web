import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { contentService } from '../../../services/content.service';
import type {
  IndividualRegistrationDto,
  LegalEntityRegistrationDto
} from '../../../services/investor.service';
import type {
  MasterCountryDto,
  MasterLookupDto
} from '../../../services/content.service';
import PrivacyPolicyModal from '../IntroducedRegistration/PrivacyPolicyModal';
import TermsModal from '../IntroducedRegistration/TermsModal';
import { toast } from 'react-toastify';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

/**
 * Step 3: Registration Details with 4 Consent Checkboxes
 * Matches Laravel: register-step4.blade.php
 */
export const SelfRegistrationStep3: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uniqueCode, email, registerAs } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<MasterCountryDto[]>([]);
  const [nationalities, setNationalities] = useState<MasterLookupDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyCheckboxEnabled, setPrivacyCheckboxEnabled] = useState(false);
  const [termsCheckboxEnabled, setTermsCheckboxEnabled] = useState(false);

  // Additional checkboxes
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [informationAccuracy, setInformationAccuracy] = useState(false);

  // Individual form data
  const [individualData, setIndividualData] = useState<Partial<IndividualRegistrationDto>>({
    interestedInIndianMarket: true, // Already confirmed in Market Interest Check (Step 1)
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

  useEffect(() => {
    if (!uniqueCode || !email) {
      navigate('/investor/register');
      return;
    }

    contentService.getCountries().then(setCountries).catch(() => {});
    contentService.getNationalities().then(setNationalities).catch(() => {});
  }, [uniqueCode, email, navigate]);

  const openPrivacyModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowPrivacyModal(true);
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  const acceptPrivacy = () => {
    setPrivacyCheckboxEnabled(true);
    setPrivacyAccepted(true);
    setShowPrivacyModal(false);
  };

  const openTermsModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const acceptTerms = () => {
    setTermsCheckboxEnabled(true);
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate checkboxes first
    if (!whatsappConsent) {
      toast.error('Please confirm WhatsApp communication preference');
      return;
    }
    if (!informationAccuracy) {
      toast.error('Please confirm that the information provided is accurate');
      return;
    }
    if (!privacyAccepted) {
      toast.error('Please read and accept the Privacy Policy');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please read and accept the Terms and Conditions');
      return;
    }

    // Validate form fields
    const validationErrors: Record<string, string> = {};
    if (!individualData.firstName?.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    if (!individualData.lastName?.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    if (!individualData.dateOfBirth) {
      validationErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!individualData.gender) {
      validationErrors.gender = 'Gender is required';
    }
    if (!individualData.nationality || individualData.nationality === 0) {
      validationErrors.nationality = 'Nationality is required';
    }
    if (!individualData.countryOfResidence || individualData.countryOfResidence === 0) {
      validationErrors.countryOfResidence = 'Country of residence is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await investorService.completeIndividualRegistration(uniqueCode, {
        ...individualData,
        termsAccepted: true,
      } as IndividualRegistrationDto);

      if (!response.success) {
        toast.error(response.message || 'Registration failed');
        return;
      }

      toast.success(response.message);
      navigate('/investor/register/success');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLegalEntitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate checkboxes first
    if (!whatsappConsent) {
      toast.error('Please confirm WhatsApp communication preference');
      return;
    }
    if (!informationAccuracy) {
      toast.error('Please confirm that the information provided is accurate');
      return;
    }
    if (!privacyAccepted) {
      toast.error('Please read and accept the Privacy Policy');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please read and accept the Terms and Conditions');
      return;
    }

    // Validate form fields
    const validationErrors: Record<string, string> = {};
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

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await investorService.completeLegalEntityRegistration(uniqueCode, {
        ...legalEntityData,
        termsAccepted: true,
      } as LegalEntityRegistrationDto);

      if (!response.success) {
        toast.error(response.message || 'Registration failed');
        return;
      }

      toast.success(response.message);
      navigate('/investor/register/success');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isIndianNationality = () => {
    const indianNat = nationalities.find(n => n.name === 'Indian');
    return individualData.nationality === indianNat?.id;
  };

  const isIndiaIncorporation = () => {
    const indiaCountry = countries.find(c => c.ssName === 'India');
    return legalEntityData.countryOfIncorporation === indiaCountry?.id;
  };

  return (
    <>
      {/* Header with Logo */}
      <header className="header header_style_01">
        <nav className="navbar navbar-default">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand" href="/" style={{ padding: 0 }}>
                <img src="/assets/images/logo.png" alt="Facilon" style={{ height: '50px' }} />
              </a>
            </div>
          </div>
        </nav>
      </header>

      <section 
        className="login-form-style4 steps4-sec section-padding" 
        style={{ backgroundImage: 'url(/assets/images/banner/2125.jpg)' }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-12 col-sm-12">
              <div className="lgf4_Left_content">
                <h3>Investor <span>Registration</span></h3>
                <p>Please provide your details to complete registration</p>
              </div>
            </div>

            <div className="col-lg-7 col-md-12 col-sm-12" style={{ marginTop: '4%' }}>
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register3-form-middle">
                    {registerAs === 1 ? (
                      /* INDIVIDUAL REGISTRATION FORM */
                      <form onSubmit={handleIndividualSubmit}>
                        <h3 style={{ marginBottom: '20px' }}>Individual Registration</h3>

                        {/* First Name */}
                        <div className="single-field">
                          <label htmlFor="firstName">First Name <span className="star-color">*</span></label>
                          <input
                            type="text"
                            id="firstName"
                            value={individualData.firstName}
                            onChange={(e) => setIndividualData(p => ({ ...p, firstName: e.target.value.toUpperCase() }))}
                            placeholder="Enter your first name"
                            style={{ textTransform: 'uppercase' }}
                          />
                          {errors.firstName && <span role="alert">{errors.firstName}</span>}
                        </div>

                        {/* Middle Name */}
                        <div className="single-field">
                          <label htmlFor="middleName">Middle Name</label>
                          <input
                            type="text"
                            id="middleName"
                            value={individualData.middleName}
                            onChange={(e) => setIndividualData(p => ({ ...p, middleName: e.target.value.toUpperCase() }))}
                            placeholder="Enter your middle name (optional)"
                            style={{ textTransform: 'uppercase' }}
                          />
                        </div>

                        {/* Last Name */}
                        <div className="single-field">
                          <label htmlFor="lastName">Last Name <span className="star-color">*</span></label>
                          <input
                            type="text"
                            id="lastName"
                            value={individualData.lastName}
                            onChange={(e) => setIndividualData(p => ({ ...p, lastName: e.target.value.toUpperCase() }))}
                            placeholder="Enter your last name"
                            style={{ textTransform: 'uppercase' }}
                          />
                          {errors.lastName && <span role="alert">{errors.lastName}</span>}
                        </div>

                        {/* Date of Birth */}
                        <div className="single-field">
                          <label htmlFor="dateOfBirth">Date of Birth <span className="star-color">*</span></label>
                          <input
                            type="date"
                            id="dateOfBirth"
                            value={individualData.dateOfBirth}
                            onChange={(e) => setIndividualData(p => ({ ...p, dateOfBirth: e.target.value }))}
                          />
                          {errors.dateOfBirth && <span role="alert">{errors.dateOfBirth}</span>}
                        </div>

                        {/* Gender */}
                        <div className="single-field self-sec">
                          <label>Gender <span className="star-color">*</span></label>
                          <div className="radio-box">
                            <label className="radio">
                              <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={individualData.gender === 'Male'}
                                onChange={(e) => setIndividualData(p => ({ ...p, gender: e.target.value }))}
                              />
                              <span>Male</span>
                            </label>
                            <label className="radio">
                              <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={individualData.gender === 'Female'}
                                onChange={(e) => setIndividualData(p => ({ ...p, gender: e.target.value }))}
                              />
                              <span>Female</span>
                            </label>
                            <label className="radio">
                              <input
                                type="radio"
                                name="gender"
                                value="Other"
                                checked={individualData.gender === 'Other'}
                                onChange={(e) => setIndividualData(p => ({ ...p, gender: e.target.value }))}
                              />
                              <span>Other</span>
                            </label>
                          </div>
                          {errors.gender && <span role="alert">{errors.gender}</span>}
                        </div>

                        {/* Nationality */}
                        <div className="single-field">
                          <label htmlFor="nationality">Nationality <span className="star-color">*</span></label>
                          <select
                            id="nationality"
                            value={individualData.nationality}
                            onChange={(e) => setIndividualData(p => ({ ...p, nationality: parseInt(e.target.value) }))}
                          >
                            <option value="0">Select Nationality</option>
                            {nationalities.map(n => (
                              <option key={n.id} value={n.id}>{n.name}</option>
                            ))}
                          </select>
                          {errors.nationality && <span role="alert">{errors.nationality}</span>}
                        </div>

                        {/* Country of Residence */}
                        <div className="single-field">
                          <label htmlFor="countryOfResidence">Country of Residence <span className="star-color">*</span></label>
                          <select
                            id="countryOfResidence"
                            value={individualData.countryOfResidence}
                            onChange={(e) => setIndividualData(p => ({ ...p, countryOfResidence: parseInt(e.target.value) }))}
                          >
                            <option value="0">Select Country</option>
                            {countries.map(c => (
                              <option key={c.id} value={c.id}>{c.ssName}</option>
                            ))}
                          </select>
                          {errors.countryOfResidence && <span role="alert">{errors.countryOfResidence}</span>}
                        </div>

                        {/* Indian specific fields */}
                        {isIndianNationality() && (
                          <>
                            <div className="single-field self-sec">
                              <label>Do you have PAN Card? <span className="star-color">*</span></label>
                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="hasPanCard"
                                    checked={individualData.hasPanCard === true}
                                    onChange={() => setIndividualData(p => ({ ...p, hasPanCard: true }))}
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="hasPanCard"
                                    checked={individualData.hasPanCard === false}
                                    onChange={() => setIndividualData(p => ({ ...p, hasPanCard: false }))}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>

                            <div className="single-field self-sec">
                              <label>Are you a person of Indian Origin? <span className="star-color">*</span></label>
                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="isPersonOfIndianOrigin"
                                    checked={individualData.isPersonOfIndianOrigin === true}
                                    onChange={() => setIndividualData(p => ({ ...p, isPersonOfIndianOrigin: true }))}
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="radio">
                                  <input
                                    type="radio"
                                    name="isPersonOfIndianOrigin"
                                    checked={individualData.isPersonOfIndianOrigin === false}
                                    onChange={() => setIndividualData(p => ({ ...p, isPersonOfIndianOrigin: false }))}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>

                            {individualData.isPersonOfIndianOrigin && (
                              <div className="single-field self-sec">
                                <label>Do you have OCI Card? <span className="star-color">*</span></label>
                                <div className="radio-box">
                                  <label className="radio">
                                    <input
                                      type="radio"
                                      name="hasOciCard"
                                      checked={individualData.hasOciCard === true}
                                      onChange={() => setIndividualData(p => ({ ...p, hasOciCard: true }))}
                                    />
                                    <span>Yes</span>
                                  </label>
                                  <label className="radio">
                                    <input
                                      type="radio"
                                      name="hasOciCard"
                                      checked={individualData.hasOciCard === false}
                                      onChange={() => setIndividualData(p => ({ ...p, hasOciCard: false }))}
                                    />
                                    <span>No</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* 4 CONSENT CHECKBOXES - Laravel Match */}
                        <div id="note_confirm_div" style={{ marginTop: '30px' }}>
                          {/* 1. WhatsApp Communication */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox">
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  checked={whatsappConsent}
                                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I agree to receive communication on WhatsApp <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* 2. Information Accuracy */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox">
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  checked={informationAccuracy}
                                  onChange={(e) => setInformationAccuracy(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I hereby confirm that the information provided is accurate, correct and complete <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* 3. Privacy Policy */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox" onClick={(e) => !privacyCheckboxEnabled && openPrivacyModal(e)}>
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  id="privacyCheckbox"
                                  checked={privacyAccepted}
                                  disabled={!privacyCheckboxEnabled}
                                  onChange={(e) => privacyCheckboxEnabled && setPrivacyAccepted(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I have read and understood the{' '}
                                  <a href="javascript:void(0);" onClick={openPrivacyModal}>Privacy Policy</a>
                                  <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* 4. Terms and Conditions */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox" onClick={(e) => !termsCheckboxEnabled && openTermsModal(e)}>
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  id="termsCheckbox"
                                  checked={termsAccepted}
                                  disabled={!termsCheckboxEnabled}
                                  onChange={(e) => termsCheckboxEnabled && setTermsAccepted(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I have read, understood and hereby accept the{' '}
                                  <a href="javascript:void(0);" onClick={openTermsModal}>Terms and Conditions</a>
                                  <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div id="button_div" style={{ marginTop: '20px' }}>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="single-field mb-0">
                                <button 
                                  className="button-1" 
                                  type="submit" 
                                  disabled={loading}
                                >
                                  {loading ? 'Submitting...' : 'Submit'}
                                </button>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="single-field mb-0">
                                <button
                                  type="button"
                                  className="button-2"
                                  onClick={() => navigate('/investor/register/step2', { state: { uniqueCode, email, registerAs } })}
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* LEGAL ENTITY REGISTRATION FORM */
                      <form onSubmit={handleLegalEntitySubmit}>
                        <h3 style={{ marginBottom: '20px' }}>Legal Entity Registration</h3>

                        {/* Entity Name */}
                        <div className="single-field">
                          <label htmlFor="entityName">Legal Name of the Entity <span className="star-color">*</span></label>
                          <input
                            type="text"
                            id="entityName"
                            value={legalEntityData.entityName}
                            onChange={(e) => setLegalEntityData(p => ({ ...p, entityName: e.target.value }))}
                            placeholder="Enter entity name"
                          />
                          {errors.entityName && <span role="alert">{errors.entityName}</span>}
                        </div>

                        {/* Country of Incorporation */}
                        <div className="single-field">
                          <label htmlFor="countryOfIncorporation">Country of Incorporation <span className="star-color">*</span></label>
                          <select
                            id="countryOfIncorporation"
                            value={legalEntityData.countryOfIncorporation}
                            onChange={(e) => setLegalEntityData(p => ({ ...p, countryOfIncorporation: parseInt(e.target.value) }))}
                          >
                            <option value="0">Select Country</option>
                            {countries.map(c => (
                              <option key={c.id} value={c.id}>{c.ssName}</option>
                            ))}
                          </select>
                          {errors.countryOfIncorporation && <span role="alert">{errors.countryOfIncorporation}</span>}
                        </div>

                        {/* PAN Card for India */}
                        {isIndiaIncorporation() && (
                          <div className="single-field self-sec">
                            <label>Does entity have PAN Card? <span className="star-color">*</span></label>
                            <div className="radio-box">
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="hasPanCard"
                                  checked={legalEntityData.hasPanCard === true}
                                  onChange={() => setLegalEntityData(p => ({ ...p, hasPanCard: true }))}
                                />
                                <span>Yes</span>
                              </label>
                              <label className="radio">
                                <input
                                  type="radio"
                                  name="hasPanCard"
                                  checked={legalEntityData.hasPanCard === false}
                                  onChange={() => setLegalEntityData(p => ({ ...p, hasPanCard: false }))}
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Representative Name */}
                        <div className="single-field">
                          <label htmlFor="entityRepresentativeName">Name of the Entity Representative <span className="star-color">*</span></label>
                          <input
                            type="text"
                            id="entityRepresentativeName"
                            value={legalEntityData.entityRepresentativeName}
                            onChange={(e) => setLegalEntityData(p => ({ ...p, entityRepresentativeName: e.target.value }))}
                            placeholder="Name should be same as in the identity document"
                          />
                          {errors.entityRepresentativeName && <span role="alert">{errors.entityRepresentativeName}</span>}
                        </div>

                        {/* Representative Capacity */}
                        <div className="single-field self-sec">
                          <label>In what capacity representing company <span className="star-color">*</span></label>
                          <div className="radio-box">
                            <label className="radio">
                              <input
                                type="radio"
                                name="representativeCapacity"
                                value="Director"
                                checked={legalEntityData.representativeCapacity === 'Director'}
                                onChange={(e) => setLegalEntityData(p => ({ ...p, representativeCapacity: e.target.value }))}
                              />
                              <span>Director</span>
                            </label>
                            <label className="radio">
                              <input
                                type="radio"
                                name="representativeCapacity"
                                value="Employee"
                                checked={legalEntityData.representativeCapacity === 'Employee'}
                                onChange={(e) => setLegalEntityData(p => ({ ...p, representativeCapacity: e.target.value }))}
                              />
                              <span>Employee</span>
                            </label>
                            <label className="radio">
                              <input
                                type="radio"
                                name="representativeCapacity"
                                value="POA Holder"
                                checked={legalEntityData.representativeCapacity === 'POA Holder'}
                                onChange={(e) => setLegalEntityData(p => ({ ...p, representativeCapacity: e.target.value }))}
                              />
                              <span>POA Holder</span>
                            </label>
                          </div>
                          {errors.representativeCapacity && <span role="alert">{errors.representativeCapacity}</span>}
                        </div>

                        {/* Securities Regulated */}
                        <div className="single-field self-sec">
                          <label>Whether Entity is regulated as a Securities or Banking Company <span className="star-color">*</span></label>
                          <div className="radio-box">
                            <label className="radio">
                              <input
                                type="radio"
                                name="isSecuritiesRegulated"
                                checked={legalEntityData.isSecuritiesRegulated === true}
                                onChange={() => setLegalEntityData(p => ({ ...p, isSecuritiesRegulated: true }))}
                              />
                              <span>Yes</span>
                            </label>
                            <label className="radio">
                              <input
                                type="radio"
                                name="isSecuritiesRegulated"
                                checked={legalEntityData.isSecuritiesRegulated === false}
                                onChange={() => setLegalEntityData(p => ({ ...p, isSecuritiesRegulated: false }))}
                              />
                              <span>No</span>
                            </label>
                          </div>
                          {errors.isSecuritiesRegulated && <span role="alert">{errors.isSecuritiesRegulated}</span>}
                        </div>

                        {/* 4 CONSENT CHECKBOXES */}
                        <div id="note_confirm_div" style={{ marginTop: '30px' }}>
                          {/* 1. WhatsApp Communication */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox">
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  checked={whatsappConsent}
                                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I agree to receive communication on WhatsApp <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* 2. Information Accuracy */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox">
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  checked={informationAccuracy}
                                  onChange={(e) => setInformationAccuracy(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I hereby confirm that the information provided is accurate, correct and complete <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* 3. Privacy Policy */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox" onClick={(e) => !privacyCheckboxEnabled && openPrivacyModal(e)}>
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  id="privacyCheckbox"
                                  checked={privacyAccepted}
                                  disabled={!privacyCheckboxEnabled}
                                  onChange={(e) => privacyCheckboxEnabled && setPrivacyAccepted(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I have read and understood the{' '}
                                  <a href="javascript:void(0);" onClick={openPrivacyModal}>Privacy Policy</a>
                                  <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* 4. Terms and Conditions */}
                          <div className="single-field">
                            <div className="checkbox-wrapper-33">
                              <label className="checkbox" onClick={(e) => !termsCheckboxEnabled && openTermsModal(e)}>
                                <input
                                  className="checkbox__trigger visuallyhidden"
                                  type="checkbox"
                                  id="termsCheckbox"
                                  checked={termsAccepted}
                                  disabled={!termsCheckboxEnabled}
                                  onChange={(e) => termsCheckboxEnabled && setTermsAccepted(e.target.checked)}
                                />
                                <span className="checkbox__symbol">
                                  <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 14l8 7L24 7"></path>
                                  </svg>
                                </span>
                                <p className="checkbox__textwrapper">
                                  I have read, understood and hereby accept the{' '}
                                  <a href="javascript:void(0);" onClick={openTermsModal}>Terms and Conditions</a>
                                  <span className="star-color">*</span>
                                </p>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div id="button_div" style={{ marginTop: '20px' }}>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="single-field mb-0">
                                <button 
                                  className="button-1" 
                                  type="submit" 
                                  disabled={loading}
                                >
                                  {loading ? 'Submitting...' : 'Submit'}
                                </button>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="single-field mb-0">
                                <button
                                  type="button"
                                  className="button-2"
                                  onClick={() => navigate('/investor/register/step2', { state: { uniqueCode, email, registerAs } })}
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <PrivacyPolicyModal
        show={showPrivacyModal}
        onClose={closePrivacyModal}
        onAccept={acceptPrivacy}
      />
      <TermsModal
        show={showTermsModal}
        onClose={closeTermsModal}
        onAccept={acceptTerms}
      />
    </>
  );
};

export default SelfRegistrationStep3;
