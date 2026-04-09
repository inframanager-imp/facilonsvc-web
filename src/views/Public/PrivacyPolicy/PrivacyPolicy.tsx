import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="public-page">
        <div className="container">
          <h1>Privacy Policy</h1>
          <div className="card">
            <p>Privacy Policy content will be displayed here.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
