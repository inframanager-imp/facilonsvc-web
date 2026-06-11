import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';

const ThankYouMessage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <CompactHeader />

      <section className="login-form-style4 steps4-sec section-padding">
        <div className="container">
          <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <div className="col-lg-8 col-md-10 col-sm-12">
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head text-center">
                    <div className="thank-you-icon mb-3">
                      <i className="fas fa-heart" style={{ fontSize: '2.5rem', color: '#3e6f7c' }}></i>
                    </div>
                    
                    <h2 style={{ fontSize: '1.4rem', color: '#3e6f7c', marginBottom: '1rem', textAlign: 'center' }}>
                      Thank You for Your Interest!
                    </h2>
                  </div>

                  <div className="login-register3-form-middle">
                    <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                        We appreciate you taking the time to explore our platform. While our current focus 
                        is on the Indian financial markets, we're continuously expanding our services and 
                        coverage areas.
                      </p>
                      
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                        We would love to stay connected with you and inform you about future opportunities 
                        that may align with your investment interests in other markets.
                      </p>
                      
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                        Please feel free to visit us again or reach out to our team if you have any questions 
                        or if your investment preferences change in the future.
                      </p>
                    </div>

                    <div style={{ 
                      backgroundColor: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      borderLeft: '4px solid #3e6f7c',
                      marginBottom: '1.5rem'
                    }}>
                      <h5 style={{ color: '#3e6f7c', fontWeight: 600, fontSize: '14px', marginBottom: '0.5rem' }}>
                        Stay Connected
                      </h5>
                      <p style={{ color: '#475569', fontSize: '12.5px', marginBottom: '0.5rem' }}>
                        <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                        For inquiries: <a 
                          href="mailto:info@facilon.com" 
                          style={{ 
                            color: '#3e6f7c', 
                            textDecoration: 'none', 
                            fontWeight: 500 
                          }}
                        >
                          info@facilon.com
                        </a>
                      </p>
                      <p style={{ color: '#475569', fontSize: '12.5px', marginBottom: '0' }}>
                        <i className="fas fa-phone" style={{ marginRight: '0.5rem' }}></i>
                        Customer Support: <a 
                          href="tel:+911234567890" 
                          style={{ 
                            color: '#3e6f7c', 
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
                      gap: '0.75rem', 
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <button 
                        type="button"
                        className="button-1"
                        onClick={() => navigate('/investor/register')}
                        style={{
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
                        className="button-2"
                        onClick={() => navigate('/')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
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
      <CompactFooter />
    </>
  );
};

export default ThankYouMessage;
