import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export const TermsOfUse: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="public-page">
        <div className="container">
          <h1>Terms of Use</h1>
          <div className="card">
            <p>Terms of Use content will be displayed here.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
