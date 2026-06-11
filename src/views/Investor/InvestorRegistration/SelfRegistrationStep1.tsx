import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Step 3: Email Entry & OTP Generation
 * User enters email and registration type, then OTP is generated and sent
 */
export const SelfRegistrationStep1: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: initialEmail, registerAs: initialRegisterAs } = location.state || {};

  const [registerAs, setRegisterAs] = useState<number>(initialRegisterAs || 1);
  const [email, setEmail] = useState<string>(initialEmail || '');
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

    setLoading(true);
    try {
      // Send OTP
      const response = await investorService.submitEmail({
        email: email.trim(),
        registerAs,
      });

      if (!response.success) {
        toast.error(response.message || 'Failed to send OTP');
        return;
      }

      toast.success(response.message);
      navigate('/investor/register/otp', {
        state: {
          uniqueCode: response.uniqueCode,
          email: email.trim(),
          registerAs
        }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout">
            {/* Left Panel: Form & Stepper */}
            <div className="left-panel">
              {/* Stepper Progress */}
              <RegistrationStepper currentStep={3} title="Email Verification" maxWidth="550px" />

              {/* Investor Registration Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                <div className="login-form-style3-main_full">
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

                      {/* Submit / Action Buttons */}

                      <div className="flex gap-2 justify-center single-field mb-0 mt-3 border-t pt-3">
                        <button
                          className="button-1"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Continue'}
                        </button>
                        <button
                          type="button"
                          className="button-2"
                          onClick={() => navigate('/investor/register/consent', { state: { email, registerAs } })}
                          disabled={loading}
                        >
                          Back
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
