import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';

/**
 * Market interest landing page for /investor/register.
 *
 * Uses the same two-column layout as Laravel register-step.blade.php:
 *   - Left col: .lgf4_Left_content with the welcome heading
 *   - Right col: .login-form-style3-main white card with the question
 *
 * All styling comes from the shared IntroducedInvestorRegistration.scss
 * (ported from formdesign.css). No inline styles.
 */
const MarketInterestCheck: React.FC = () => {
  const navigate = useNavigate();

  const handleYes = () => {
    navigate('/investor/register/email');
  };

  const handleNo = () => {
    navigate('/investor/register/thank-you');
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
          <h3 className="text-center m-0" style={{ lineHeight: '1.8' }}>
            Welcome to <br />
            <span>Facilon Services</span>
          </h3>
        </div>

        {/* Investor Registration Card */}
        <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
          <div className="login-form-style3-main_full">
            <div className="login-register_style3-head">
              <h2 className="text-center" style={{ textAlign: 'center' }}>Investor Registration</h2>
            </div>

            <div className="login-register3-form-middle">
              <form>
                <div className="single-field self-sec">
                  <label className="text-center w-100 mb-3" style={{ fontSize: '16px', fontWeight: '600' }}>
                    Are you interested in the Indian Market?
                    <span className="star-color">*</span>
                  </label>
                  <div className="radio-box d-flex justify-content-center gap-4">
                    <label className="radio m-0" onClick={handleYes} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="market_interest" value="yes" />
                      <span>Yes, I'm Interested</span>
                    </label>
                    <label className="radio m-0" onClick={handleNo} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="market_interest" value="no" />
                      <span>No, Thank You</span>
                    </label>
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

export default MarketInterestCheck;


