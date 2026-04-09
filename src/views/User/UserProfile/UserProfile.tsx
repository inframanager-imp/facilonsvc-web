import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import './UserProfile.scss';

export const UserProfile: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="user-profile-page">
          <h1>User Settings</h1>
          <div className="card">
            <p>User profile settings will be implemented here.</p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
