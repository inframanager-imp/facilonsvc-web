import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PreLoginHeader from '../../components/PreLoginHeader/PreLoginHeader';
import PreLoginFooter from '../../components/PreLoginFooter/PreLoginFooter';
import './Landing.scss';

const Landing: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-layout">
      <PreLoginHeader />
      <div className="landing-container">
        <div className="landing-content">
          <h1 className="landing-title">{t('welcome')}</h1>
          <p className="landing-subtitle">
            Facilon Management System - Your comprehensive platform solution
          </p>
          <div className="landing-actions">
            <Link to="/login" className="btn btn-primary btn-lg me-3">
              {t('login')}
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg me-3">
              {t('signup')}
            </Link>
            <Link to="/investor/register" className="btn btn-outline-secondary btn-lg">
              Investor Registration
            </Link>
          </div>
        </div>
      </div>
      <PreLoginFooter />
    </div>
  );
};

export default Landing;
