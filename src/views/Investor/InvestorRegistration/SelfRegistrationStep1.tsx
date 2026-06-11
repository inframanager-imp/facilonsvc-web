import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Step 1: Email Entry
 * User enters email and registration type, then proceeds to consent page
 */
export const SelfRegistrationStep1: React.FC = () => {
  const navigate = useNavigate();
  const [registerAs, setRegisterAs] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email || !email.trim()) {
      setErrors({ email: 'Email is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    if (!registerAs) {
      setErrors({ registerAs: 'Please select registration type' });
      return;
    }

    // Navigate to consent page without sending OTP
    navigate('/investor/register/consent', {
      state: {
        email: email.trim(),
        registerAs
      }
    });
  };

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout">
            {/* Left Panel: Form & Stepper */}
            <div className="left-panel">
              {/* Welcome text */}
              {/* <div className="lgf4_Left_content mb-3" style={{ width: '100%', maxWidth: '550px' }}>
                <h3 className="text-center text-lg-start m-0" style={{ lineHeight: '1.4' }}>
                  Welcome to <br />
                  <span>Facilon Services</span>
                </h3>
              </div> */}

              {/* Stepper Progress */}
              <RegistrationStepper currentStep={2} title="Email Verification" maxWidth="550px" />

              {/* Investor Registration Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                <div className="login-form-style3-main_full">
                  {/* <div className="login-register_style3-head">
                    <h2 className="text-center" style={{ textAlign: 'center' }}>Investor Registration</h2>
                    <p className="text-center mt-2 mb-0" style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Please verify your email to continue registration.
                    </p>
                  </div> */}

                  <div className="login-register3-form-middle" style={{ textAlign: 'left' }}>
                    <form onSubmit={handleEmailSubmit} noValidate>
                      {/* Register As Selection */}
                      <div className="single-field self-sec">
                        <label className="w-100 mb-0" style={{ fontSize: '14px', fontWeight: '600' }}>
                          Are you registering for an individual or a legal entity? <span className="star-color">*</span>
                        </label>
                        <div className="radio-box">
                          <label className="radio">
                            <input
                              type="radio"
                              name="registerAs"
                              value={1}
                              checked={registerAs === 1}
                              onChange={() => setRegisterAs(1)}
                            />
                            <span>Individual</span>
                          </label>
                          <label className="radio">
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
                        {errors.registerAs && <span role="alert">{errors.registerAs}</span>}
                      </div>

                      {/* Email Input */}
                      <div className="single-field">
                        <label htmlFor="email" className="w-100 mb-0" style={{ fontSize: '14px', fontWeight: '600' }}>
                          Please enter email address here <span className="star-color">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                        {errors.email && <span role="alert">{errors.email}</span>}
                      </div>

                      {/* Submit Button */}
                      <div className="single-field mb-0 text-center border-t pt-3 mt-3">
                        <button
                          className="button-1"
                          type="submit"
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="email" />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default SelfRegistrationStep1;
