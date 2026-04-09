import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

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
        className="login-form-style4 section-padding" 
        style={{ backgroundImage: 'url(/assets/images/banner/2125.jpg)' }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-12 col-sm-12">
              <div className="lgf4_Left_content">
                <h3>Investor <span>Registration</span></h3>
                <p>Please enter the OTP sent to your email address</p>
              </div>
            </div>

            <div className="col-lg-7 col-md-12 col-sm-12" style={{ marginTop: '4%' }}>
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Verify OTP</h2>
                  </div>

                  <div className="login-register3-form-middle">
                    <p>An OTP has been sent to: <strong>{email}</strong></p>
                    
                    <form onSubmit={handleOtpVerification}>
                      <div className="single-field">
                        <label htmlFor="otp">Enter 4-digit OTP <span className="star-color">*</span></label>
                        <input
                          type="text"
                          id="otp"
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 4) setOtp(value);
                          }}
                          placeholder="Enter OTP"
                          maxLength={4}
                          required
                        />
                      </div>

                      <div className="timer-sec">
                        <p>
                          OTP expires in: <span className="timer">{formatTime(otpTimer)}</span>
                        </p>
                        {otpTimer === 0 && (
                          <button 
                            type="button" 
                            className="button-2" 
                            onClick={handleResendOtp}
                            disabled={loading}
                          >
                            Resend OTP
                          </button>
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
                              onClick={() => navigate('/investor/register')}
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
          </div>
        </div>
      </section>
    </>
  );
};

export default SelfRegistrationStep2;
