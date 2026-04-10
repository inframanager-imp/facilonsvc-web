import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="container">
        <div className="row align-items-center">
          {/* Left column — intro text (mirrors Laravel .lgf4_Left_content) */}
          <div className="col-lg-5 col-md-12 col-sm-12">
            <div className="lgf4_Left_content">
              <h3>
                Welcome to <span>Facilon Services</span> Registration Process
              </h3>
            </div>
          </div>

          {/* Right column — white card (mirrors Laravel .login-form-style3-main) */}
          <div className="col-lg-7 col-md-12 col-sm-12" style={{ marginTop: '4%' }}>
            <div className="login-form-style3-main">
              <div className="login-form-style3-main_full">
                <div className="login-register_style3-head">
                  <h2>Investor Registration</h2>
                </div>

                <div className="login-register3-form-middle">
                  <form>
                    <div className="single-field self-sec">
                      <label>
                        Are you interested in the Indian Market?
                        <span className="star-color">*</span>
                      </label>
                      <div className="radio-box">
                        <label className="radio" onClick={handleYes} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="market_interest" value="yes" />
                          <span>Yes, I'm Interested</span>
                        </label>
                        <label className="radio" onClick={handleNo} style={{ cursor: 'pointer' }}>
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
        </div>
      </div>
    </section>
  );
};

export default MarketInterestCheck;
