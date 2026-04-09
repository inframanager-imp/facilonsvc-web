import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export const ServiceAgreement: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="public-page">
        <div className="container">
          <h1>Service Agreement</h1>
          <div className="card">
            <p>Service Agreement content will be displayed here.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
