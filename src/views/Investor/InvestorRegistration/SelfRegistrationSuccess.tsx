import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

/**
 * Success Page after Registration
 * Matches Laravel: registration-success page
 */
export const SelfRegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();

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
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full" style={{ textAlign: 'center', padding: '50px 30px' }}>
                  <div className="login-register_style3-head">
                    <h2 style={{ color: '#28a745', marginBottom: '20px' }}>✓ Registration Successful!</h2>
                  </div>

                  <div style={{ fontSize: '16px', color: '#333', lineHeight: '1.8' }}>
                    <p>Thank you for registering with Facilon Services.</p>
                    <p>Your registration has been submitted successfully.</p>
                    <p>You will receive login credentials via email shortly.</p>
                    <p>Please check your inbox (and spam folder) for further instructions.</p>
                  </div>

                  <div style={{ marginTop: '40px' }}>
                    <button 
                      className="button-1" 
                      onClick={() => navigate('/login')}
                      style={{ marginRight: '15px' }}
                    >
                      Go to Login
                    </button>
                    <button 
                      className="button-2" 
                      onClick={() => navigate('/')}
                    >
                      Go to Home
                    </button>
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

export default SelfRegistrationSuccess;
