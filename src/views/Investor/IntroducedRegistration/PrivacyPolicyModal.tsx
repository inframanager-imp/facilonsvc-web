import React from 'react';

interface PrivacyPolicyModalProps {
  show: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ show, onClose, onAccept }) => {
  if (!show) return null;

  return (
    <div id="privacyModal" className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <section className="privacy-policy-sec">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="privacy-policy-text terms-use-text">
                  <h2>Facilon Privacy Policy</h2>
                  <h3>Introduction</h3>
                  <p>We at Facilon Services Private Limited and our affiliates (hereinafter referred to as "Facilon", "we", "us" or "our"), place paramount importance on safeguarding the privacy and security of your personal information and data <b>("Personal Data")</b> and consider trust as our top priority and take the protection of your Personal Data very seriously. We want you to feel safe using our websites, portals, mobile applications, services, and solutions <b>("Platform")</b>. This Privacy Policy informs you of the way in which we collect, use, transfer, and store your Personal Data when you use our Platform, as well as your rights in relation to this Personal Data.</p>
                  <p>Please read this Privacy Policy carefully prior to accessing our Platform or availing our services. </p>
                  <p>By accessing and using our Platform, you hereby acknowledge that you have read, understood, and agree to the processing of your Personal Data in accordance with the terms of this Privacy Policy and our Terms of Use.</p>
                  
                  <h3>I. What Data Is Collected</h3>
                  <h3>1. Personal Data</h3>
                  <p>While using our Platform, we may ask you to provide us with certain Personal Data that can be used to contact or identify you. Where possible, we indicate the mandatory and the optional fields. You always have the option to not provide your Personal Data by choosing not to use a particular service or feature on the Platform. Personal Data may include, but is not limited to:</p>
                  <ul className="alpha-list" style={{ marginBottom: '10px' }}>
                    <li>Email address;</li>
                    <li>First name and Last name;</li>
                    <li>Phone number;</li>
                    <li>Address, State, Province, ZIP/Postal code, City;</li>
                    <li>Nationality</li>
                    <li>Job title;</li>
                    <li>Company name</li>
                  </ul>
                  <p>Not sharing the mandatory Personal Data may lead to certain features of the Platform or our services being restricted, unavailable, or unusable. For instance, withholding your email address will not allow us to share relevant information about our services.</p>
                  
                  <h3>II. How We Use Your Data</h3>
                  <p>We use the collected data for various purposes including:</p>
                  <ul className="alpha-list" style={{ marginBottom: '10px' }}>
                    <li>To provide and maintain our Platform;</li>
                    <li>To notify you about changes to our Platform;</li>
                    <li>To provide customer support;</li>
                    <li>To gather analysis or valuable information to improve our Platform;</li>
                    <li>To monitor the usage of our Platform;</li>
                    <li>To detect, prevent and address technical issues;</li>
                    <li>To fulfill any other purpose for which you provide it;</li>
                    <li>To carry out our obligations and enforce our rights arising from any contracts;</li>
                    <li>To provide you with notices about your account and/or subscription;</li>
                    <li>To provide you with news, special offers and general information;</li>
                  </ul>
                  
                  <h3>III. Data Security</h3>
                  <p>The security of your Personal Data is important to us, and we strive to implement and maintain reasonable, commercially acceptable security procedures and practices appropriate to the nature of the Personal Data we store, in order to protect it from unauthorized access, destruction, use, modification, or disclosure.</p>
                  
                  <h3>IV. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:reachus@facilonservices.com">reachus@facilonservices.com</a></p>
                </div>
              </div>
            </div>
            
            <div className="col-sm-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button className="button-1" onClick={onAccept}>Accept</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
