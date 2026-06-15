import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../../components/RegistrationVisualCard/RegistrationVisualCard';

/**
 * Step 3: OTP Verification Page
 * Matches Laravel: introduce-register-step2.blade.php
 */
const IntroducedInvestorStep2: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
  const [showResend, setShowResend] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setShowResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setError('Please enter complete OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await introducedInvestorService.verifyOtp({
        uniqueCode: uniqueCode!,
        emailOtp: otpString
      });
      
      if (response.data.success) {
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          navigate(`/investor/introduced/step4/${uniqueCode}`);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setOtp(['', '', '', '']);
      
      const response = await introducedInvestorService.resendOtp(uniqueCode!);
      
      if (response.data.success) {
        setSuccess('OTP has been resent to your email');
        setTimeLeft(600);
        setShowResend(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      console.error('Error resending OTP:', err);
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
              <RegistrationStepper currentStep={4} title="Verify OTP" maxWidth="550px" />

              {/* Investor Registration Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                <div className="login-form-style3-main_full">
                  <div className="login-register3-form-middle" style={{ textAlign: 'left' }}>
                    <p>
                      An email with a One-Time Password has been sent to your email address.
                      This OTP is valid for 10 minutes.
                    </p>

                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="unique_code" value={uniqueCode} />

                      <div className="single-field">
                        <label htmlFor="otp-input-0">Enter 4-digit OTP <span className="star-color">*</span></label>
                        <div className="otp-inputs-container">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-input-${index}`}
                              type="text"
                              maxLength={1}
                              value={digit}
                              ref={inputRefs[index]}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              className="otp-digit-input"
                              autoComplete="off"
                              required
                            />
                          ))}
                        </div>
                      </div>

                      <div className="timer-sec mt-2">
                        <p className="mb-0">
                          Time Remaining: <span className="timer">{formatTime(timeLeft)}</span>
                        </p>
                      </div>

                      <div className="flex gap-2 justify-center single-field mb-0 mt-3 border-t pt-3">
                        <button
                          className="button-1"
                          type="submit"
                          id="submitBtn"
                          disabled={loading || otp.join('').length !== 4}
                        >
                          {loading ? 'Submitting...' : 'Submit'}
                        </button>

                        {showResend && (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="button-2"
                            disabled={loading}
                          >
                            Resend OTP
                          </button>
                        )}
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

export default IntroducedInvestorStep2;
