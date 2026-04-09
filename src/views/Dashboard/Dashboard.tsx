import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userId, userRoles } = useAuth();

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="dashboard-container">
          <h1 className="dashboard-title">{t('dashboard')}</h1>
          <div className="dashboard-content">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Welcome to Facilon Platform</h5>
                <p className="card-text">
                  User ID: {userId}
                </p>
                <p className="card-text">
                  Roles: {userRoles.join(', ')}
                </p>
                <Link to="/investor/documents" className="btn btn-primary mt-3">
                  KYC Documents
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
