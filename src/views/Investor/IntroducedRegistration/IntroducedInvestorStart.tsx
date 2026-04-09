import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';

/**
 * Step 0: Initial landing page showing investor details from Dataverse
 * Matches Laravel: introduce-multiple-register-main-step.blade.php
 */
const IntroducedInvestorStart: React.FC = () => {
  const params = useParams();
  /** Laravel-style long token (may include '/') or plain ss_name — see route /investor/introduced/start/* */
  const investorRefFromSplat = params['*']?.trim();
  const investorRefFromParam = (params as { investorId?: string }).investorId?.trim();
  const investorRef = investorRefFromSplat || investorRefFromParam || '';

  const navigate = useNavigate();
  const [investorDetails, setInvestorDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvestorDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await introducedInvestorService.initiateRegistration(investorRef);
      setInvestorDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load investor details');
      console.error('Error fetching investor details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!investorRef) {
      setLoading(false);
      setError('Invalid registration link.');
      return;
    }
    fetchInvestorDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when ref from URL changes
  }, [investorRef]);

  const handleContinue = () => {
    const plainId = investorDetails?.dataverseInvestorId || investorRef;
    navigate(`/investor/introduced/consent/${encodeURIComponent(plainId)}`);
  };

  if (loading) {
    return <div className="loading-container">Loading investor details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!investorDetails) {
    return <div className="error-container">No investor data found</div>;
  }

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
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-12 col-sm-12">
              <div className="lgf4_Left_content">
                <h3>Welcome to <span>Facilon Services</span> Registration Process</h3>
              </div>
            </div>

            <div className="col-lg-7 col-md-12 col-sm-12" style={{ marginTop: '4%' }}>
              <div className="login-form-style3-main">
                <div className="login-form-style3-main_full">
                  <div className="login-register_style3-head">
                    <h2>Investor Registration</h2>
                  </div>

                  <span><strong>Welcome {investorDetails.firstName},</strong></span><br />
                  <span>You have been introduced to Facilon by your{' '}
                    <span>{investorDetails.serviceProviderType}{' '}</span>
                    {investorDetails.brokerName?.toUpperCase()}.
                  </span><br />
                  <p>Facilon has been engaged by {investorDetails.brokerName?.toUpperCase()} to facilitate your onboarding journey.</p>
                  <p>Please confirm the details below before registering with us.</p>

                  <div className="login-register3-form-middle">
                    <div className="single-field self-sec">
                      <div className="radio-box">
                        <label className="radio expander">
                          <span>INVESTOR TYPE: {investorDetails.investorTypeName?.toUpperCase()}</span>
                        </label><br />
                        <label className="radio expander">
                          <span>NATIONALITY: {investorDetails.nationalityName?.toUpperCase()}</span>
                        </label><br />
                        <label className="radio">
                          <span>PRODUCT: {investorDetails.productName?.toUpperCase()}</span>
                        </label><br />
                        <label className="radio">
                          <span>PLAN: {investorDetails.planName?.toUpperCase()}</span>
                        </label><br />
                        <label className="radio">
                          <span>SCHEME: {investorDetails.schemeName?.toUpperCase()}</span>
                        </label>
                      </div>
                    </div>

                    {investorDetails.emailAlreadyExists ? (
                      <div className="alert alert-warning">
                        <p>Your email {investorDetails.email} is already registered with us.</p>
                        <p>Please login with your existing credentials to continue.</p>
                        <button className="button-1" onClick={() => navigate('/login')}>
                          Login
                        </button>
                      </div>
                    ) : (
                      <>
                        <br />
                        <p>Please click on Continue to provide your consent for the data and proceed with the registration.</p>
                        <div id="button_div" className="mt-4">
                          <div className="row justify-content-center">
                            <div className="col-md-6 d-flex justify-content-center">
                              <button 
                                onClick={handleContinue}
                                className="button-1"
                                style={{ display: 'inline-block', textAlign: 'center' }}
                              >
                                Continue
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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

export default IntroducedInvestorStart;
