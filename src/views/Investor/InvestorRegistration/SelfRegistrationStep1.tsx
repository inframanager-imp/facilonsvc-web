import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

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
      setErrors({ email: 'Email is required' });
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
            Please verify your email to continue registration.
          </p>
        </div>

        {/* Investor Registration Card */}
        <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
          <div className="login-form-style3-main_full">
            <div className="login-register_style3-head">
              <h2 className="text-center" style={{ textAlign: 'center' }}>Investor Registration</h2>
            </div>

            <div className="login-register3-form-middle" style={{ textAlign: 'left' }}>
              <form onSubmit={handleEmailSubmit}>
                {/* Register As Selection */}
                <div className="single-field self-sec">
                  <label>Are you registering for an individual or a legal entity? <span className="star-color">*</span></label>
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
                  <label htmlFor="email">Please enter email address here <span className="star-color">*</span></label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && <span role="alert">{errors.email}</span>}
                </div>

                {/* Submit Button */}
                <div className="single-field mb-0">
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
    </section>
  );
};

export default SelfRegistrationStep1;
