import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';

/**
 * Success Page after Registration
 * Matches Laravel: registration-success page
 */
export const SelfRegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <CompactHeader />

      <section className="login-form-style4 section-padding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                 <div className="login-form-style3-main_full" style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div className="login-register_style3-head">
                    <h2 style={{ color: '#28a745', marginBottom: '12px' }}>✓ Registration Successful!</h2>
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                    <p style={{ marginBottom: '8px' }}>Thank you for registering with Facilon Services.</p>
                    <p style={{ marginBottom: '8px' }}>Your registration has been submitted successfully.</p>
                    <p style={{ marginBottom: '8px' }}>We've sent you an email with a secure link to set your password and activate your account.</p>
                    <p style={{ marginBottom: '0' }}>Please check your inbox (and spam folder) and click the link to continue.</p>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button 
                      className="button-1" 
                      onClick={() => navigate('/login')}
                      style={{ marginRight: '12px' }}
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
      <CompactFooter />
    </>
  );
};

export default SelfRegistrationSuccess;
