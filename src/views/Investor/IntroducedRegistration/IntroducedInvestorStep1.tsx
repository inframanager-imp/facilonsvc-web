import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService, { Step1RequestDto } from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';

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
          mobileNumber: data.mobile || ''
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
      <br /><br />
      <section className="login-form-style4 section-padding"
        style={{ backgroundImage: 'url(https://anvaya.online/facilon/public/frontend/images/banner/2125.jpg)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 col-md-7 col-sm-12">
              <div className="lgf4_Left_content">
                <h3>Investor <span>Registration</span></h3>
                <p>
                  Before we start the registration process we would like to verify your email address
                </p>
              </div>
            </div>

            <div className="col-lg-5 col-md-5 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Investor Registrations</h2>
                  </div>

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
                        <select
                          name="gender"
                          id="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          style={{ textTransform: 'uppercase' }}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Transgender">Transgender</option>
                        </select>
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
                          <select
                            name="countryCode"
                            id="countryCode"
                            value={formData.countryCode}
                            onChange={handleChange}
                          >
                            <option value="+91">+91 (India)</option>
                            <option value="+1">+1 (USA)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+971">+971 (UAE)</option>
                          </select>
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

                      <div className="single-field mb-0">
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
          </div>
        </div>
      </section>
    </>
  );
};

export default IntroducedInvestorStep1;
