import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';

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
      <br /><br />
      <section className="login-form-style4 section-padding"
        style={{ backgroundImage: 'url(https://anvaya.online/facilon/public/frontend/images/banner/2125.jpg)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 col-md-7 col-sm-12">
              <div className="lgf4_Left_content">
                <h3>Investor <span>Registration</span></h3>

                <div className="list-type1">
                  <ul>
                    <li style={{ color: '#fff' }}>
                      <i className="fa-solid fa-check"></i>
                      An email with a One-Time Password has been sent to your email address.
                      This OTP is valid for 10 minutes.
                    </li>
                    <li style={{ color: '#fff' }}>
                      <i className="fa-solid fa-check"></i>
                      Please check your spam or junk folder if you do not see the email.
                    </li>
                    <li style={{ color: '#fff' }}>
                      <i className="fa-solid fa-check"></i>
                      If you have not received the OTP, you may resend it after the timer ends.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-5 col-md-5 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Investor Registration</h2>
                  </div>

                  <div className="login-register3-form-middle">
                    {(success || error) && (
                      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        {success && <p style={{ color: 'green', margin: 0 }}>{success}</p>}
                        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="unique_code" value={uniqueCode} />

                      <div className="single-field">
                        <label>
                          Please enter your Email OTP:
                          <span className="star-color">*</span>
                        </label>

                        <div className="row otp-sec">
                          {otp.map((digit, index) => (
                            <div className="col" key={index}>
                              <input
                                type="text"
                                maxLength={1}
                                value={digit}
                                ref={inputRefs[index]}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="row mt-2">
                        <div className="col-md-6"></div>
                        <div className="col-md-6 text-end">
                          <div className="timer-sec">
                            Time Remaining:
                            <span id="timer" className="timer">{formatTime(timeLeft)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="single-field mb-0 d-flex gap-2 mt-3">
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
          </div>
        </div>
      </section>
    </>
  );
};

export default IntroducedInvestorStep2;
