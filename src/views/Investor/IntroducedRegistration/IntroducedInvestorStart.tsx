import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import introducedInvestorService from '../../../services/introducedInvestorService';
import './IntroducedInvestorRegistration.scss';

/**
 * Step 0: Initial landing page showing investor details from Dataverse.
 * Matches Laravel: introduce-multiple-register-main-step.blade.php
 *
 * Layout: .login-form-style4 with two-column intro + card from formdesign.css.
 * The detail labels (Investor Type, Nationality, etc.) are shown as plain
 * bold text on a light gray box — NOT as radio circles.
 */
const IntroducedInvestorStart: React.FC = () => {
  const params = useParams();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <section
      className="login-form-style4 steps4-sec section-padding align-items-center"
      style={{ backgroundImage: "url('https://anvaya.online/facilon/public/frontend/images/banner/2125.jpg')" }}
    >
      <div className="container">
        <div className="row align-items-center">
          {/* Left column — intro text */}
          <div className="col-lg-5 col-md-12 col-sm-12">
            <div className="lgf4_Left_content">
              <h3>Welcome To <span>Facilon Services</span> Registration Process</h3>
            </div>
          </div>

          {/* Right column — white card */}
          <div className="col-lg-7 col-md-12 col-sm-12">
            <div className="login-form-style3-main">
              <div className="login-form-style3-main_full">
                <div className="login-register_style3-head">
                  <h2>Investor Registration</h2>
                </div>

                <p><strong>Welcome {investorDetails.firstName?.toUpperCase()},</strong></p>
                <p>
                  You have been introduced to Facilon by your{' '}
                  {investorDetails.serviceProviderType}{' '}
                  {investorDetails.brokerName?.toUpperCase()}.
                </p>
                <p>
                  Facilon has been engaged by {investorDetails.brokerName?.toUpperCase()} to
                  facilitate your onboarding journey.
                </p>
                <p>Please confirm the details below before registering with us.</p>

                <div className="login-register3-form-middle">
                  {/* Gray detail box — matches the Laravel screenshot exactly:
                      plain bold text labels, light gray background, rounded corners */}
                  <div className="investor-detail-box">
                    <p><strong>INVESTOR TYPE : </strong>{investorDetails.investorTypeName?.toUpperCase()}</p>
                    <p><strong>NATIONALITY : </strong>{investorDetails.nationalityName?.toUpperCase()}</p>
                    {investorDetails.countryOfResidence && (
                      <p><strong>COUNTRY OF RESIDENCE : </strong>{investorDetails.countryOfResidence?.toUpperCase()}</p>
                    )}
                    <p><strong>PRODUCT : </strong>{investorDetails.productName?.toUpperCase()}</p>
                    <p><strong>PLAN : </strong>{investorDetails.planName?.toUpperCase()}</p>
                    <p><strong>SCHEME : </strong>Not Applicable</p>

                    {investorDetails.emailAlreadyExists ? (
                      <>
                        <br />
                        <p>Your email <strong>{investorDetails.email}</strong> is already registered with Us.</p>
                        <div className="single-field mb-0">
                          <button className="button-1" onClick={() => navigate('/login')}>
                            Login with Existing and Check details
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <br />
                        <p>Please click on Continue to provide your consent for the data and proceed with the registration.</p>
                        <div className="single-field mb-0">
                          <button className="button-1" onClick={handleContinue}>
                            Continue
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroducedInvestorStart;
