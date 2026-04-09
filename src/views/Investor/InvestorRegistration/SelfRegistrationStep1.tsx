import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
                <h3>Welcome to <span>Facilon Services</span> Registration Process</h3>
                <p>Before we start the registration process, we would like to verify your email address</p>
              </div>
            </div>

            <div className="col-lg-7 col-md-12 col-sm-12" style={{ marginTop: '4%' }}>
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Investor Registration</h2>
                  </div>

                  <div className="login-register3-form-middle">
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
          </div>
        </div>
      </section>
    </>
  );
};

export default SelfRegistrationStep1;
