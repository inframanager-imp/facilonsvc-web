import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export const ContactUs: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="public-page">
        <div className="container">
          <h1>Contact Us</h1>
          <div className="card">
            <p>Contact information will be displayed here.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
