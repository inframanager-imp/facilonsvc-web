import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

const MarketInterestCheck: React.FC = () => {
  const navigate = useNavigate();

  const handleYes = () => {
    navigate('/investor/register/email');
  };

  const handleNo = () => {
    navigate('/investor/register/thank-you');
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
        className="login-form-style4 steps4-sec section-padding" 
        style={{ backgroundImage: 'url(/assets/images/banner/2125.jpg)' }}
      >
        <div className="container">
          <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <div className="col-lg-7 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head text-center">
                    <div className="market-interest-icon mb-4">
                      <i className="fas fa-globe" style={{ fontSize: '4rem', color: '#BE1717' }}></i>
                    </div>
                    
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                      Welcome to Investor Registration
                    </h2>
                    
                    <h3 style={{ fontSize: '1.5rem', color: '#BE1717', marginBottom: '2rem' }}>
                      Are you interested in the Indian Market?
                    </h3>
                  </div>

                  <div className="login-register3-form-middle">
                    <p style={{ 
                      fontSize: '1rem', 
                      color: '#666', 
                      lineHeight: '1.6',
                      textAlign: 'center',
                      marginBottom: '2.5rem'
                    }}>
                      Our platform specializes in providing investment opportunities in the Indian financial markets. 
                      Please let us know if you're interested in exploring these opportunities.
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1rem', 
                      maxWidth: '350px', 
                      margin: '0 auto' 
                    }}>
                      <button 
                        type="button"
                        className="btn-style3 w-100"
                        onClick={handleYes}
                        style={{
                          padding: '0.75rem 2rem',
                          fontSize: '1.1rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <i className="fas fa-check-circle"></i>
                        Yes, I'm Interested
                      </button>
                      
                      <button 
                        type="button"
                        className="btn-outline-style"
                        onClick={handleNo}
                        style={{
                          padding: '0.75rem 2rem',
                          fontSize: '1.1rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          background: 'white',
                          border: '2px solid #6c757d',
                          color: '#6c757d',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#6c757d';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#6c757d';
                        }}
                      >
                        <i className="fas fa-times-circle"></i>
                        No, Thank You
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

export default MarketInterestCheck;
