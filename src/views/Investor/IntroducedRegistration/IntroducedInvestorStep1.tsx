import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService, { Step1RequestDto } from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';
import { PremiumSelect } from '../../../components/PremiumSelect/PremiumSelect';
import { contentService } from '../../../services/content.service';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../../components/RegistrationVisualCard/RegistrationVisualCard';

// Dropdown values are UPPERCASE by convention (see V12__uppercase_dropdown_values.sql),
// so the option value and the stored DB value match and the select re-renders on reload.
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'MALE' },
  { value: 'FEMALE', label: 'FEMALE' },
  { value: 'TRANSGENDER', label: 'TRANSGENDER' },
];

// Fallback used only until the ISD list loads from the backend (/master/isd-codes).
const COUNTRY_CODE_OPTIONS = [
  { value: '+91', label: '+91 (India)' },
  { value: '+1', label: '+1 (USA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+971', label: '+971 (UAE)' },
];

/**
 * Step 2: Personal Details Form + Send OTP
 * Matches Laravel: introduce-register-step1.blade.php
 */
const IntroducedInvestorStep1: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [error, setError] = useState('');
  const [countryCodeOptions, setCountryCodeOptions] = useState(COUNTRY_CODE_OPTIONS);
  const [formData, setFormData] = useState<Step1RequestDto>({
    uniqueCode: uniqueCode!,
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    mobileNumber: '',
    countryCode: '+91',
    agreeForOtp: false
  });

  // Fetch session prefill data (email, name) on mount
  useEffect(() => {
    const fetchPrefill = async () => {
      try {
        setPrefillLoading(true);
        const response = await introducedInvestorService.getSessionPrefill(uniqueCode!);
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          email: data.email || '',
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          lastName: data.lastName || '',
          mobileNumber: data.mobile || '',
          // Preselect the investor's country dialing code from Dataverse (e.g. "+65").
          countryCode: data.countryCode || prev.countryCode
        }));
      } catch (err: any) {
        console.error('Error fetching session prefill:', err);
      } finally {
        setPrefillLoading(false);
      }
    };
    if (uniqueCode) {
      fetchPrefill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueCode]);

  // Load the full country dialing-code list (matches Laravel's master_country_of_residence dropdown).
  useEffect(() => {
    contentService.getIsdCodes()
      .then(list => {
        const opts = (list || [])
          .filter(c => c.codeValue != null)
          .map(c => ({ value: `+${c.codeValue}`, label: `+${c.codeValue} (${c.countryName ?? ''})` }));
        if (opts.length) {
          setCountryCodeOptions(opts);
        }
      })
      .catch(err => console.error('Error fetching ISD codes:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeForOtp) {
      alert('Please agree to receive OTP on your email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await introducedInvestorService.submitStep1(formData);

      if (response.data.success) {
        navigate(`/investor/introduced/step2/${uniqueCode}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit details');
      console.error('Error submitting Step1:', err);
    } finally {
      setLoading(false);
    }
  };

  if (prefillLoading) {
    return <div className="loading-container">Loading registration form...</div>;
  }

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout">
            {/* Left Panel: Form & Stepper */}
            <div className="left-panel">
              {/* Stepper Progress */}
              <RegistrationStepper currentStep={3} title="Registration Details" maxWidth="850px" />

              {/* Investor Registration Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
                <div className="login-form-style3-main_full">
                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="login-register3-form-middle">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="unique_code" value={uniqueCode} />
                      <input type="hidden" name="version" value="1.0" />

                      <div className="single-field">
                        <label htmlFor="firstName">
                          First Name: <span className="star-color">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          style={{ textTransform: 'uppercase' }}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label htmlFor="middleName">Middle Name:</label>
                        <input
                          type="text"
                          name="middleName"
                          id="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>

                      <div className="single-field">
                        <label htmlFor="lastName">
                          Last Name: <span className="star-color">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          style={{ textTransform: 'uppercase' }}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label htmlFor="dateOfBirth">
                          DOB: <span className="star-color">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          id="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label htmlFor="gender">
                          Gender: <span className="star-color">*</span>
                        </label>
                        <PremiumSelect
                          value={formData.gender}
                          onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                          options={GENDER_OPTIONS}
                          placeholder="Select Gender"
                        />
                      </div>

                      <div className="single-field">
                        <label htmlFor="email">
                          Please enter your Email: <span className="star-color">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          readOnly
                          required
                        />
                      </div>

                      <div className="single-field">
                        <label htmlFor="mobileNumber">
                          Please enter your Mobile No: <span className="star-color">*</span>
                        </label>
                        <div className="mobile-input-row">
                          <PremiumSelect
                            value={formData.countryCode}
                            onChange={(val) => setFormData(prev => ({ ...prev, countryCode: val }))}
                            options={countryCodeOptions}
                            className="country-code-select"
                          />
                          <input
                            type="text"
                            name="mobileNumber"
                            id="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setFormData(prev => ({ ...prev, mobileNumber: value }));
                            }}
                            placeholder="Enter mobile number"
                            minLength={10}
                            maxLength={16}
                            required
                          />
                        </div>
                      </div>

                      <div className="single-field">
                        <div className="checkbox-wrapper-33">
                          <label className="checkbox">
                            <input
                              className="checkbox__trigger visuallyhidden"
                              type="checkbox"
                              name="agreeForOtp"
                              checked={formData.agreeForOtp}
                              onChange={handleChange}
                            />
                            <span className="checkbox__symbol">
                              <svg aria-hidden="true" className="icon-checkbox" width="28px" height="28px" viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 14l8 7L24 7"></path>
                              </svg>
                            </span>
                            <p className="checkbox__textwrapper">
                              I agree to receive the OTP on my email <span className="star-color">*</span>
                            </p>
                          </label>
                        </div>
                      </div>

                      <div className="single-field mb-0 text-center border-t pt-3 mt-3">
                        <button
                          className="button-1"
                          id="submitBtn"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="details" registerAs={1} />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default IntroducedInvestorStep1;
