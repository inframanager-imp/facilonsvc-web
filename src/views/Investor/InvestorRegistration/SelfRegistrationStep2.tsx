import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Step 2: OTP Verification (after consent acceptance)
 * User verifies OTP sent to email
 */
export const SelfRegistrationStep2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uniqueCode, email, registerAs } = location.state || {};

  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(15 * 60); // 15 minutes
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '']);

  // Sync otpValues to the main otp string and handle navigation focus
  const handleOtpChange = (index: number, value: string) => {
    const cleanedVal = value.replace(/[^0-9]/g, '');
    if (!cleanedVal && value !== '') return;

    const newValues = [...otpValues];
    newValues[index] = cleanedVal.substring(cleanedVal.length - 1);
    setOtpValues(newValues);
    setOtp(newValues.join(''));

    // Move focus forward if a digit is entered
    if (cleanedVal && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
        setOtp(newValues.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData) {
      const newValues = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newValues[i] = pastedData[i];
      }
      setOtpValues(newValues);
      setOtp(newValues.join(''));

      const focusIndex = Math.min(pastedData.length, 3);
      const targetInput = document.getElementById(`otp-input-${focusIndex}`) as HTMLInputElement;
      if (targetInput) {
        targetInput.focus();
      }
    }
  };

  useEffect(() => {
    if (!uniqueCode || !email) {
      navigate('/investor/register');
      return;
    }
  }, [uniqueCode, email, navigate]);

  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await investorService.verifyOtpWithConsent({
        uniqueCode,
        emailOtp: otp,
        consentGiven: true
      });

      if (!response.success) {
        toast.error(response.message || 'Invalid OTP');
        return;
      }

      toast.success('OTP verified successfully');
      navigate('/investor/register/step3', {
        state: { uniqueCode, email, registerAs }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await investorService.submitEmail({
        email,
        registerAs,
      });

      if (response.success) {
        setOtpTimer(15 * 60);
        setOtp('');
        setOtpValues(['', '', '', '']);
        toast.success('OTP has been resent to your email');
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      toast.error('Failed to resend OTP');
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
              {/* Welcome text */}
              {/* <div className="lgf4_Left_content mb-3" style={{ width: '100%', maxWidth: '550px' }}>
                <h3 className="text-center text-lg-start m-0" style={{ lineHeight: '1.4' }}>
                  Welcome to <br />
                  <span>Facilon Services</span>
                </h3>
              </div> */}

              {/* Stepper Progress */}
              <RegistrationStepper currentStep={4} title="Verify OTP" maxWidth="550px" />

              {/* Investor Registration Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                <div className="login-form-style3-main_full">
                  {/* <div className="login-register_style3-head">
                    <h2 className="text-center" style={{ textAlign: 'center' }}>Verify OTP</h2>
                    <p className="text-center mt-2 mb-0" style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Please enter the OTP sent to your email address.
                    </p>
                  </div> */}

                  <div className="login-register3-form-middle" style={{ textAlign: 'left' }}>
                    <p>An OTP has been sent to: <strong>{email}</strong></p>

                    <form onSubmit={handleOtpVerification}>
                      <div className="single-field">
                        <label htmlFor="otp-input-0">Enter 4-digit OTP <span className="text-error-500">*</span></label>
                        <div className="otp-inputs-container">
                          {[0, 1, 2, 3].map((index) => (
                            <input
                              key={index}
                              id={`otp-input-${index}`}
                              type="text"
                              maxLength={1}
                              value={otpValues[index]}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              onPaste={handlePaste}
                              className="otp-digit-input"
                              autoComplete="off"
                              required
                            />
                          ))}
                        </div>
                      </div>

                      <div className="timer-sec">
                        <p>
                          OTP expires in: <span className="timer">{formatTime(otpTimer)}</span>
                        </p>
                        {otpTimer === 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href="javascript:void(0);"
                              onClick={(e) => {
                                e.preventDefault();
                                if (!loading) handleResendOtp();
                              }}
                              style={{
                                color: '#2c5966',
                                textDecoration: 'underline',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              {loading ? 'Resending...' : 'Resend OTP'}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="single-field mb-0">
                            <button
                              className="button-1"
                              type="submit"
                              disabled={loading || otpTimer === 0}
                            >
                              {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="single-field mb-0">
                            <button
                              type="button"
                              className="button-2"
                              onClick={() => navigate('/investor/register/consent', { state: { email, registerAs } })}
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="otp" />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default SelfRegistrationStep2;
