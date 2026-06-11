import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';

/**
 * Success Page after registration completion
 * Shows registration complete message and login link
 */
const IntroducedInvestorSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { message?: string; b2cCreated?: boolean } || {};

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 section-padding">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-7 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Registration Successful!</h2>
                  </div>

                  <div className="login-register3-form-middle" style={{ textAlign: 'center' }}>
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <svg
                          width="60"
                          height="60"
                          viewBox="0 0 80 80"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ display: 'inline-block' }}
                        >
                          <circle cx="40" cy="40" r="40" fill="#28a745" />
                          <path
                            d="M25 40L35 50L55 30"
                            stroke="white"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <h3 style={{ color: '#28a745', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                        Thank You for Registering with Facilon Services!
                      </h3>

                      {state.b2cCreated !== false && (
                        <>
                          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                            Your registration has been completed successfully.
                          </p>
                          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                            <strong>Login credentials have been sent to your email address.</strong>
                          </p>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                            Please check your inbox (and spam folder) for the email containing your login details.
                          </p>
                        </>
                      )}

                      {state.b2cCreated === false && (
                        <>
                          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                            Your registration has been completed, but there was an issue creating your login account.
                          </p>
                          <p style={{ fontSize: '13px', color: '#3e6f7c', marginBottom: '16px', fontWeight: '600' }}>
                            Please contact support at support@facilonservices.com
                          </p>
                        </>
                      )}

                      <div style={{ marginTop: '24px' }}>
                        <button
                          className="button-1"
                          onClick={() => navigate('/login')}
                          style={{ display: 'inline-block' }}
                        >
                          Proceed to Login
                        </button>
                      </div>

                    </div>
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

export default IntroducedInvestorSuccess;
