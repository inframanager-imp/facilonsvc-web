import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService, { Step4CompletionDto } from '../../../services/introducedInvestorService';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsModal from './TermsModal';
import './IntroducedInvestorRegistration.scss';

/**
 * Step 4: Final Registration Details (Nationality-specific fields)
 * Matches Laravel: introduce-register-step4.blade.php
 */
const IntroducedInvestorStep4: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNationalityDiv, setShowNationalityDiv] = useState(false);
  const [showOtherNationalityDiv, setShowOtherNationalityDiv] = useState(false);
  const [showOciCardDiv, setShowOciCardDiv] = useState(false);
  const [showLegalEntityDiv, setShowLegalEntityDiv] = useState(false);
  const [showWhatsappDiv, setShowWhatsappDiv] = useState(false);
  const [showDiffWhatsappDiv, setShowDiffWhatsappDiv] = useState(false);
  
  // Modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyCheckboxEnabled, setPrivacyCheckboxEnabled] = useState(false);
  const [termsCheckboxEnabled, setTermsCheckboxEnabled] = useState(false);

  const [formData, setFormData] = useState<Step4CompletionDto>({
    uniqueCode: uniqueCode!,
    selfOrLegalEntity: 'Self',
    nationality: '',
    countryOfResidence: '',
    panCardStatus: 'Yes',
    indianOrigin: 'Yes',
    ociCardStatus: 'Yes',
    entityName: '',
    legalPanCard: 'Yes',
    representativeCapacity: 'Director',
    securityRegulated: 'Yes',
    termsAccepted: false,
    privacyPolicyAccepted: false,
    agreeForWhatsapp: false,
    agreeForMarketing: false,
    whatsappNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Handle nationality change
    if (name === 'nationality') {
      if (value === 'Indian') {
        setShowNationalityDiv(true);
        setShowOtherNationalityDiv(false);
      } else {
        setShowNationalityDiv(false);
        setShowOtherNationalityDiv(true);
      }
    }

    // Handle Indian origin change
    if (name === 'indianOrigin') {
      setShowOciCardDiv(value === 'Yes');
    }

    // Handle WhatsApp agreement
    if (name === 'agreeForWhatsapp') {
      setShowWhatsappDiv(checked);
    }

    // Handle self/legal entity change
    if (name === 'selfOrLegalEntity') {
      setShowLegalEntityDiv(value === 'Legal Entity');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) {
      alert('Please read and accept the Privacy Policy to continue');
      return;
    }
    
    if (!termsAccepted) {
      alert('Please read and accept the Terms and Conditions to continue');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const submitData: Step4CompletionDto = {
        ...formData,
        termsAccepted: termsAccepted,
        privacyPolicyAccepted: privacyAccepted
      };
      
      const response = await introducedInvestorService.completeRegistration(submitData);
      
      if (response.data.success) {
        navigate('/investor/introduced/success', { 
          state: { 
            message: response.data.message,
            b2cCreated: response.data.b2cAccountCreated 
          } 
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration');
      console.error('Error completing registration:', err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

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
    setFormData(prev => ({ ...prev, termsAccepted: termsAccepted && true }));
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
    setFormData(prev => ({ ...prev, termsAccepted: privacyAccepted && true }));
    setShowTermsModal(false);
  };

  return (
    <>
      <br /><br />
      <section className="login-form-style4 steps4-sec section-padding align-items-center"
        style={{ backgroundImage: 'url(https://anvaya.online/facilon/public/frontend/images/banner/2125.jpg)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-12 col-sm-12">
              <div className="lgf4_Left_content">
                <h3>Investor <span>Registration</span></h3>
              </div>
            </div>

            <div className="col-lg-7 col-md-12 col-sm-12" style={{ marginTop: '4%' }}>
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="login-register3-form-middle">
                    <form onSubmit={handleSubmit} id="investor_form">
                      <input type="hidden" name="unique_code" value={uniqueCode} />
                      <input type="hidden" name="market_invest" value="Self" />

                      {/* Self or Legal Entity Selection */}
                      {formData.selfOrLegalEntity === 'Self' && (
                        <div className="name-sec" id="section_self_div">
                          {/* Indian Nationality Fields */}
                          {showNationalityDiv && (
                            <div id="nationality_div">
                              <div className="row">
                                <div className="col-md-12">
                                  <div className="single-field">
                                    <label htmlFor="countryOfResidence">
                                      <i className="fa-solid fa-user"></i> Country of Residency: <span className="star-color">*</span>
                                      <a href="#" data-toggle="popover" data-trigger="hover" data-content="Specify your country of residence">
                                        <img src="/frontend/images/information-button.png" alt="info" />
                                      </a>
                                    </label>
                                    <select
                                      name="countryOfResidence"
                                      id="countryOfResidence"
                                      value={formData.countryOfResidence}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select Country</option>
                                      <option value="1">India</option>
                                      <option value="2">USA</option>
                                      <option value="3">UK</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <div className="single-field self-sec1">
                                    <label htmlFor="pancard">
                                      <i className="fa-solid fa-address-card"></i> Do you have PAN card? <span className="star-color">*</span>
                                      <a href="#" data-toggle="popover" data-trigger="hover" data-content="Permanent Account Number (PAN) is a ten-digit tax identification alphanumeric number, issued by Income-tax Department, Government of India">
                                        <img src="/frontend/images/information-button.png" alt="info" />
                                      </a>
                                    </label>
                                    <div className="radio-box">
                                      <label className="radio">
                                        <input
                                          name="panCardStatus"
                                          type="radio"
                                          value="Yes"
                                          checked={formData.panCardStatus === 'Yes'}
                                          onChange={handleChange}
                                        />
                                        <span>Yes</span>
                                      </label>
                                      <label className="radio">
                                        <input
                                          name="panCardStatus"
                                          type="radio"
                                          value="No"
                                          checked={formData.panCardStatus === 'No'}
                                          onChange={handleChange}
                                        />
                                        <span>No</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Other Nationality Fields */}
                          {showOtherNationalityDiv && (
                            <div id="other_nationality_div">
                              <div className="row">
                                <div className="col-md-12">
                                  <div className="single-field">
                                    <label htmlFor="countryOfResidence">
                                      <i className="fa-solid fa-user"></i> Country of Residency: <span className="star-color">*</span>
                                      <a href="#" data-toggle="popover" data-trigger="hover" data-content="Specify your country of residence">
                                        <img src="/frontend/images/information-button.png" alt="info" />
                                      </a>
                                    </label>
                                    <select
                                      name="countryOfResidence"
                                      id="countryOfResidence"
                                      value={formData.countryOfResidence}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select Country</option>
                                      <option value="1">India</option>
                                      <option value="2">USA</option>
                                      <option value="3">UK</option>
                                    </select>
                                  </div>
                                </div>

                                {showOciCardDiv && (
                                  <div id="oci_card_div">
                                    <div className="col-md-12">
                                      <div className="single-field self-sec1">
                                        <label htmlFor="ociCard">
                                          <i className="fa-solid fa-address-card"></i> Do you have an OCI Card: <span className="star-color">*</span>
                                          <a href="#" data-toggle="popover" data-trigger="hover" data-content="OCI card is issued by High Commission/Consulate of India, where you reside through an application process">
                                            <img src="/frontend/images/information-button.png" alt="info" />
                                          </a>
                                        </label>
                                        <div className="radio-box">
                                          <label className="radio">
                                            <input
                                              name="ociCardStatus"
                                              type="radio"
                                              value="Yes"
                                              checked={formData.ociCardStatus === 'Yes'}
                                              onChange={handleChange}
                                            />
                                            <span>Yes</span>
                                          </label>
                                          <label className="radio">
                                            <input
                                              name="ociCardStatus"
                                              type="radio"
                                              value="No"
                                              checked={formData.ociCardStatus === 'No'}
                                              onChange={handleChange}
                                            />
                                            <span>No</span>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Legal Entity Fields */}
                      {showLegalEntityDiv && (
                        <div className="name-sec" id="section_legal_div">
                          <div id="legal_country_div">
                            <div className="single-field self-sec1">
                              <label htmlFor="legalPanCard">
                                <i className="fa-solid fa-building"></i> Do you have pan card? <span className="star-color">*</span>
                                <a href="#" data-toggle="popover" data-trigger="hover" data-content="Permanent Account Number (PAN) is a ten-digit tax identification alphanumeric number, issued by Income-tax Department, Government of India">
                                  <img src="/frontend/images/information-button.png" alt="info" />
                                </a>
                              </label>
                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    name="legalPanCard"
                                    type="radio"
                                    value="Yes"
                                    checked={formData.legalPanCard === 'Yes'}
                                    onChange={handleChange}
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="radio">
                                  <input
                                    name="legalPanCard"
                                    type="radio"
                                    value="No"
                                    checked={formData.legalPanCard === 'No'}
                                    onChange={handleChange}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>

                            <div className="single-field self-sec1">
                              <label htmlFor="representativeCapacity">
                                <i className="fa-solid fa-building"></i> In what capacity representing company: <span className="star-color">*</span>
                              </label>
                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    name="representativeCapacity"
                                    type="radio"
                                    value="Director"
                                    checked={formData.representativeCapacity === 'Director'}
                                    onChange={handleChange}
                                  />
                                  <span>Director</span>
                                </label>
                                <label className="radio">
                                  <input
                                    name="representativeCapacity"
                                    type="radio"
                                    value="Employee"
                                    checked={formData.representativeCapacity === 'Employee'}
                                    onChange={handleChange}
                                  />
                                  <span>Employee</span>
                                </label>
                                <label className="radio">
                                  <input
                                    name="representativeCapacity"
                                    type="radio"
                                    value="POA Holder"
                                    checked={formData.representativeCapacity === 'POA Holder'}
                                    onChange={handleChange}
                                  />
                                  <span>POA Holder</span>
                                </label>
                              </div>
                            </div>

                            <div className="single-field self-sec1">
                              <label htmlFor="securityRegulated">
                                <i className="fa-solid fa-lock"></i> Whether Company is regulated as Securities or Banking Company: <span className="star-color">*</span>
                              </label>
                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    name="securityRegulated"
                                    type="radio"
                                    value="Yes"
                                    checked={formData.securityRegulated === 'Yes'}
                                    onChange={handleChange}
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="radio">
                                  <input
                                    name="securityRegulated"
                                    type="radio"
                                    value="No"
                                    checked={formData.securityRegulated === 'No'}
                                    onChange={handleChange}
                                  />
                                  <span>
                                    No
                                    <a href="#" data-toggle="popover" data-trigger="hover" data-title="Regulated Entity" data-content="Is the entity regulated as a securities or banking provider?">
                                      <img src="/frontend/images/information-button.png" alt="info" />
                                    </a>
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp Communication */}
                      <div id="note_confirm_div">
                        <div className="single-field">
                          <div className="checkbox-wrapper-33">
                            <label className="checkbox">
                              <input
                                className="checkbox__trigger visuallyhidden"
                                type="checkbox"
                                name="agreeForWhatsapp"
                                checked={formData.agreeForWhatsapp}
                                onChange={handleChange}
                              />
                              <span className="checkbox__symbol">
                                <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 14l8 7L24 7"></path>
                                </svg>
                              </span>
                              <p className="checkbox__textwrapper">
                                I agree to receive communication on WhatsApp
                              </p>
                            </label>
                          </div>
                        </div>

                        {showWhatsappDiv && (
                          <div id="whatsapp_no_div">
                            <div className="single-field">
                              <label htmlFor="sameWhatsapp">
                                Is your mobile number the same as your WhatsApp number?
                                <span className="star-color">*</span>
                                <a href="#" data-toggle="popover" data-trigger="hover" title="WhatsApp Mobile No." data-content="If different from mobile number input earlier">
                                  <img src="/frontend/images/information-button.png" alt="info" />
                                </a>
                              </label>

                              <div className="radio-box">
                                <label className="radio">
                                  <input
                                    name="sameWhatsapp"
                                    type="radio"
                                    value="Yes"
                                    onChange={() => setShowDiffWhatsappDiv(false)}
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="radio">
                                  <input
                                    name="sameWhatsapp"
                                    type="radio"
                                    value="No"
                                    onChange={() => setShowDiffWhatsappDiv(true)}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>

                            {showDiffWhatsappDiv && (
                              <div className="single-field mobile-no" id="second_mob_div">
                                <label htmlFor="whatsappNumber">Please enter WhatsApp Mobile No:</label>
                                <select name="whatsappCountryCode" id="whatsappCountryCode">
                                  <option value="+91">+91 (India)</option>
                                  <option value="+1">+1 (USA)</option>
                                  <option value="+44">+44 (UK)</option>
                                </select>
                                <input
                                  type="text"
                                  name="whatsappNumber"
                                  value={formData.whatsappNumber}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData(prev => ({ ...prev, whatsappNumber: value }));
                                  }}
                                  minLength={10}
                                  maxLength={16}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Marketing Communications */}
                        <div className="single-field">
                          <div className="checkbox-wrapper-33">
                            <label className="checkbox">
                              <input
                                className="checkbox__trigger visuallyhidden"
                                type="checkbox"
                                name="confirmation2"
                                checked={formData.agreeForMarketing}
                                onChange={(e) => setFormData(prev => ({ ...prev, agreeForMarketing: e.target.checked }))}
                              />
                              <span className="checkbox__symbol">
                                <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 14l8 7L24 7"></path>
                                </svg>
                              </span>
                              <p className="checkbox__textwrapper">
                                Yes, I would like to receive marketing communications from Facilon Services Private Limited
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* Privacy Policy */}
                        <div className="single-field">
                          <div className="checkbox-wrapper-33">
                            <label className="checkbox" onClick={(e) => !privacyCheckboxEnabled && openPrivacyModal(e)}>
                              <input
                                className="checkbox__trigger visuallyhidden"
                                type="checkbox"
                                id="privacyCheckbox"
                                name="agree_privacy"
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

                        {/* Terms and Conditions */}
                        <div className="single-field">
                          <div className="checkbox-wrapper-33">
                            <label className="checkbox" onClick={(e) => !termsCheckboxEnabled && openTermsModal(e)}>
                              <input
                                className="checkbox__trigger visuallyhidden"
                                type="checkbox"
                                id="termsCheckbox"
                                name="agree_terms"
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
                      <div id="button_div">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="single-field mb-0">
                              <button
                                className="button-1"
                                type="submit"
                                id="submitBtn"
                                disabled={loading || !termsAccepted}
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
                                onClick={() => navigate(-1)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
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

export default IntroducedInvestorStep4;
