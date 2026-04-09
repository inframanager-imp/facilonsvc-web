import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './PreLoginHeader.scss';

const PreLoginHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="pre-login-header">
      <div className="container-fluid">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h3>Facilon Platform</h3>
            </Link>
          </div>
          <nav className="header-nav">
            <Link to="/login" className="nav-link">
              {t('login')}
            </Link>
            <Link to="/register" className="nav-link btn btn-primary">
              {t('signup')}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PreLoginHeader;
