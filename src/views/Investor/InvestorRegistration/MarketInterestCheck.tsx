import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { RegistrationStepper } from '../../../components/RegistrationStepper/RegistrationStepper';
import { RegistrationVisualCard } from '../../../components/RegistrationVisualCard/RegistrationVisualCard';

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
  const [selectedOption, setSelectedOption] = useState<string | null>('yes');
  const [showModal, setShowModal] = useState(false);

  const handleYes = () => {
    setSelectedOption('yes');
  };

  const handleNo = () => {
    setSelectedOption('no');
  };

  const handleContinue = () => {
    if (selectedOption === 'yes') {
      navigate('/investor/register/email');
    } else if (selectedOption === 'no') {
      setShowModal(true);
    }
  };

  const handleReview = () => {
    setSelectedOption(null);
    setShowModal(false);
  };

  const handleExit = () => {
    setShowModal(false);
    const hasToken = !!localStorage.getItem('JwtToken');
    if (hasToken) {
      navigate('/investor/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <CompactHeader />
      <section className="login-form-style4 steps4-sec section-padding align-items-center">
        <div className="container">
          <div className="registration-split-layout">
            {/* Left Panel: Form & Stepper */}
            <div className="left-panel">

              {/* Stepper Progress */}
              <RegistrationStepper currentStep={1} title="Market Interest Check" maxWidth="550px" />

              {/* Investor Registration Card */}
              <div className="login-form-style3-main" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                <div className="login-form-style3-main_full">
                  <div className="login-register3-form-middle">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="single-field self-sec">
                        <label className="w-100 mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
                          Are you interested in the Indian Market?
                          <span className="star-color">*</span>
                        </label>

                        <div className="market-choice-container p-0 m-0">
                          <div
                            className={`market-choice-card highlight-primary ${selectedOption === 'yes' ? 'selected' : ''}`}
                            onClick={handleYes}
                          >
                            <div className="square-indicator">
                              <i className="bi bi-check-lg" />
                            </div>
                            <span className="choice-label">Yes, I'm Interested</span>
                          </div>

                          <div
                            className={`market-choice-card ${selectedOption === 'no' ? 'selected' : ''}`}
                            onClick={handleNo}
                          >
                            <div className="square-indicator">
                              <i className="bi bi-check-lg" />
                            </div>
                            <span className="choice-label">No, Thank You</span>
                          </div>
                        </div>
                      </div>

                      {/* Submit / Continue Button */}
                      <div className="single-field mb-0 text-center border-t pt-3 mt-3">
                        <button
                          className="button-1"
                          onClick={handleContinue}
                          disabled={!selectedOption}
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Creative Illustration Panel */}
            <div className="right-panel">
              <RegistrationVisualCard step="interest" />
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />

      {/* Warning/Stop Registration Modal */}
      <div
        className={`modal ${showModal ? 'show' : ''}`}
        style={{ display: showModal ? 'block' : 'none' }}
      >
        <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', color: '#be1717', marginBottom: '15px' }}>
            <i className="bi bi-exclamation-triangle" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0c2340', marginBottom: '12px' }}>
            Stop Registration?
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' }}>
            Choosing not to proceed with the Indian market will terminate your registration. Would you like to review your choice or exit?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="button-2" onClick={handleReview} style={{ flex: 1, padding: '10px 15px' }}>
              Review
            </button>
            <button className="button-1" onClick={handleExit} style={{ flex: 1, padding: '10px 15px' }}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketInterestCheck;
