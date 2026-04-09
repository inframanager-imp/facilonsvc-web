import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export const NationalityManagement: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="admin-page">
          <h1>Nationality Management</h1>
          <div className="card">
            <p>Nationality CRUD will be implemented here.</p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
