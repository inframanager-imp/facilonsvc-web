import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

const ThankYouMessage: React.FC = () => {
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
        className="login-form-style4 steps4-sec section-padding" 
        style={{ backgroundImage: 'url(/assets/images/banner/2125.jpg)' }}
      >
        <div className="container">
          <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <div className="col-lg-8 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head text-center">
                    <div className="thank-you-icon mb-4">
                      <i className="fas fa-heart" style={{ fontSize: '4rem', color: '#BE1717' }}></i>
                    </div>
                    
                    <h2 style={{ fontSize: '2rem', color: '#BE1717', marginBottom: '1.5rem' }}>
                      Thank You for Your Interest!
                    </h2>
                  </div>

                  <div className="login-register3-form-middle">
                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                      <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.8', marginBottom: '1rem' }}>
                        We appreciate you taking the time to explore our platform. While our current focus 
                        is on the Indian financial markets, we're continuously expanding our services and 
                        coverage areas.
                      </p>
                      
                      <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.8', marginBottom: '1rem' }}>
                        We would love to stay connected with you and inform you about future opportunities 
                        that may align with your investment interests in other markets.
                      </p>
                      
                      <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        Please feel free to visit us again or reach out to our team if you have any questions 
                        or if your investment preferences change in the future.
                      </p>
                    </div>

                    <div style={{ 
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      borderLeft: '4px solid #BE1717',
                      marginBottom: '2rem'
                    }}>
                      <h5 style={{ color: '#BE1717', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>
                        Stay Connected
                      </h5>
                      <p style={{ color: '#555', marginBottom: '0.5rem' }}>
                        <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                        For inquiries: <a 
                          href="mailto:info@facilon.com" 
                          style={{ 
                            color: '#BE1717', 
                            textDecoration: 'none', 
                            fontWeight: 500 
                          }}
                        >
                          info@facilon.com
                        </a>
                      </p>
                      <p style={{ color: '#555', marginBottom: '0' }}>
                        <i className="fas fa-phone" style={{ marginRight: '0.5rem' }}></i>
                        Customer Support: <a 
                          href="tel:+911234567890" 
                          style={{ 
                            color: '#BE1717', 
                            textDecoration: 'none', 
                            fontWeight: 500 
                          }}
                        >
                          +91 123-456-7890
                        </a>
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <button 
                        type="button"
                        className="btn-style3"
                        onClick={() => navigate('/investor/register')}
                        style={{
                          padding: '0.75rem 2rem',
                          fontSize: '1rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <i className="fas fa-arrow-left"></i>
                        Return to Start
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => window.location.href = '/'}
                        style={{
                          padding: '0.75rem 2rem',
                          fontSize: '1rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'white',
                          border: '2px solid #BE1717',
                          color: '#BE1717',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#BE1717';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#BE1717';
                        }}
                      >
                        <i className="fas fa-home"></i>
                        Go to Homepage
                      </button>
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

export default ThankYouMessage;
