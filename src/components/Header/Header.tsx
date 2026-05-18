import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Header.scss';

interface HeaderProps {
  variant?: 'sidebar' | 'topbar' | 'legacy';
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ variant = 'legacy', title, subtitle }) => {
  const { logout, userName } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | any>(null);
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

  // ---------------------------------------------------------
  // SIDEBAR VARIANT
  // ---------------------------------------------------------
  if (variant === 'sidebar') {
    return (
      <aside className="group fixed left-0 top-0 h-screen w-sidebar bg-sidebar border-r border-sidebar-border z-50 flex flex-col items-center py-4 hover:w-sidebar-expanded group">
        {/* Logo Section */}
        <div className="mb-8 px-2 w-full flex justify-center">
          <Link to="/investor/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-white font-bold text-lg hidden group-hover:block whitespace-nowrap overflow-hidden transition-all duration-300">
              Facilon
            </span>
          </Link>
        </div >

        {/* Navigation Section */}
        < nav className="flex-1 w-full flex flex-col gap-2" >
          <SidebarLink
            to="/investor/dashboard"
            icon="bi-house-door"
            label="Home"
          />
          <SidebarLink
            to="/investor/profile"
            icon="bi-person"
            label="My Profile"
          />
          <SidebarLink
            to="/investor/progress"
            icon="bi-bar-chart"
            label="My Progress"
          />
          <SidebarLink
            to="/investor/delegations"
            icon="bi-briefcase"
            label="Service Agent"
          />
        </nav >

        {/* Bottom Section */}
        < div className="mt-auto w-full px-2" >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-2 p-3 rounded-xl text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-all"
            title={t('logout')}
          >
            <i className="bi bi-box-arrow-right text-xl"></i>
            <span className="hidden group-hover:block font-medium text-[13px]">{t('logout')}</span>
          </button>
        </div >
      </aside >
    );
  }

  // ---------------------------------------------------------
  // TOPBAR VARIANT
  // ---------------------------------------------------------
  if (variant === 'topbar') {
    return (
      <header className="h-header bg-white border-b border-neutral-100 flex items-center justify-between pr-6 pl-16 sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 leading-tight mb-0">
            {title || 'Investor Console'}
          </h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 font-medium mb-0">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-50 transition-colors relative">
            <i className="bi bi-bell text-lg"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 border-2 border-white rounded-full"></span>
          </button>

          <div className="h-8 w-px bg-neutral-200 mx-1"></div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-neutral-900 leading-none mb-1">
                {userName || 'User'}
              </p>
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-0">
                Investor
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-white font-medium text-sm border border-neutral-200 bg-primary-900">
              {userName?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ---------------------------------------------------------
  // LEGACY VARIANT (DEFAULT)
  // ---------------------------------------------------------
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

// Helper Component for Sidebar Links
const SidebarLink: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center justify-start gap-3 px-3 py-2.5 transition-all duration-200 group-hover:px-4 ${isActive
          ? 'bg-[#1e323e] text-[#d4eef2] border-l-[3px] border-[#59a8b8]'
          : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white border-l-[3px] border-transparent'
        }`
      }
      title={label}
    >
      <i className={`bi ${icon} text-lg`}></i>
      <span className="hidden group-hover:block font-medium text-[13px] whitespace-nowrap tracking-wide">{label}</span>
    </NavLink>
  );
};

export default Header;
