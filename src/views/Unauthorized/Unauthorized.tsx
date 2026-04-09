import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Unauthorized.scss';

const Unauthorized: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1 className="unauthorized-title">403</h1>
        <h2 className="unauthorized-subtitle">{t('unauthorized')}</h2>
        <p className="unauthorized-message">{t('unauthorizedMessage')}</p>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
