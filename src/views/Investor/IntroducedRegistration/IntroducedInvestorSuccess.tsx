import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './IntroducedInvestorRegistration.scss';

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
      <br /><br />
      <section className="login-form-style4 section-padding"
        style={{ backgroundImage: 'url(https://anvaya.online/facilon/public/frontend/images/banner/2125.jpg)' }}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-7 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Registration Successful!</h2>
                  </div>

                  <div className="login-register3-form-middle" style={{ textAlign: 'center' }}>
                    <div style={{ padding: '30px 0' }}>
                      <div style={{ marginBottom: '30px' }}>
                        <svg
                          width="80"
                          height="80"
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

                      <h3 style={{ color: '#28a745', marginBottom: '20px' }}>
                        Thank You for Registering with Facilon Services!
                      </h3>

                      {state.b2cCreated !== false && (
                        <>
                          <p style={{ fontSize: '16px', color: '#333', marginBottom: '15px' }}>
                            Your registration has been completed successfully.
                          </p>
                          <p style={{ fontSize: '16px', color: '#333', marginBottom: '15px' }}>
                            <strong>Login credentials have been sent to your email address.</strong>
                          </p>
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
                            Please check your inbox (and spam folder) for the email containing your login details.
                          </p>
                        </>
                      )}

                      {state.b2cCreated === false && (
                        <>
                          <p style={{ fontSize: '16px', color: '#333', marginBottom: '15px' }}>
                            Your registration has been completed, but there was an issue creating your login account.
                          </p>
                          <p style={{ fontSize: '16px', color: '#BE1717', marginBottom: '30px' }}>
                            Please contact support at support@facilonservices.com
                          </p>
                        </>
                      )}

                      <div style={{ marginTop: '40px' }}>
                        <button
                          className="button-1"
                          onClick={() => navigate('/login')}
                          style={{ display: 'inline-block', minWidth: '200px' }}
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
    </>
  );
};

export default IntroducedInvestorSuccess;
