import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Header.scss';

const Header: React.FC = () => {
  const { logout, userName } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="facilon-header">
      <div className="container-fluid header-container">
        <div className="header-brand">
          <Link to="/investor/dashboard" className="navbar-brand">
            <img src="/assets/images/facilon-main-logo.png" alt="Facilon Services" />
          </Link>
        </div>

        <nav className="header-nav">
          <ul className="nav-links">
            <li><NavLink to="/investor/dashboard" className="nav-link-item">Home</NavLink></li>
            <li><NavLink to="/investor/profile" className="nav-link-item">My Profile</NavLink></li>
            <li><NavLink to="/investor/progress" className="nav-link-item">My Progress</NavLink></li>
            <li><NavLink to="/investor/delegations" className="nav-link-item">Service Agent</NavLink></li>

            <li ref={dropdownRef} className={`nav-dropdown ${isDropdownOpen ? 'active' : ''}`}>
              <button
                className="dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <i className="bi bi-person-circle me-2"></i>
                <span className="user-name">Welcome, {userName || 'User'}</span>
                <i className={`bi bi-chevron-down ms-2 ${isDropdownOpen ? 'rotate' : ''}`}></i>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu-custom">
                  <Link to="/change-password" onClick={() => setIsDropdownOpen(false)} className="dropdown-item">
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {t('logout')}
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
