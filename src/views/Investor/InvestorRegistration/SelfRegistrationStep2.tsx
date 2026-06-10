import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    <section 
      className="login-form-style4 steps4-sec section-padding align-items-center" 
      style={{ backgroundImage: "url('https://anvaya.online/facilon/public/frontend/images/banner/2125.jpg')" }}
    >
      <div className="container d-flex flex-column align-items-center justify-content-center text-center">
        {/* Facilon Logo with white background wrapper for contrast */}
        <div className="mb-4 bg-white px-4 py-2 rounded shadow-sm d-inline-block" style={{ borderRadius: '8px', marginTop: '-25px' }}>
          <Link to="/">
            <img src="/assets/images/logo.png" alt="Facilon" style={{ height: '45px', display: 'block' }} />
          </Link>
        </div>

        {/* Welcome text */}
        <div className="lgf4_Left_content mb-4" style={{ width: '100%', maxWidth: '600px' }}>
          <p className="text-center mt-2" style={{ color: '#fff', opacity: 0.9, fontSize: '18px', fontWeight: '500' }}>
            Please enter the OTP sent to your email address.
          </p>
        </div>

        {/* Investor Registration Card */}
        <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
          <div className="login-form-style3-main_full">
            <div className="login-register_style3-head">
              <h2 className="text-center" style={{ textAlign: 'center' }}>Verify OTP</h2>
            </div>

            <div className="login-register3-form-middle" style={{ textAlign: 'left' }}>
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
                          fontSize: '14px',
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
    </section>
  );
};

export default SelfRegistrationStep2;
