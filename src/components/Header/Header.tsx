import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Header.scss';

const Header: React.FC = () => {
  const { logout, userName } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
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
    console.log('[Header] handleLogout called');
    logout();
    // Note: logout() handles navigation via window.location.replace
  };

  return (
    <header className="app-header header_style_01">
      <div className="header-content container">
        <div className="header-title">
          {/* Using style from Laravel */}
          <a className="navbar-brand" href="#" style={{ padding: 0 }}>
            <img src="/assets/images/facilon-main-logo.png" alt="image" style={{ height: '80px' }} />
          </a>
        </div>

        {/* Laravel Top Nav Links & Dropdown */}
        <div className="header-nav hidden-xs">
          <ul className="nav navbar-nav navbar-right" style={{ display: 'flex', flexDirection: 'row', listStyle: 'none', margin: 0, alignItems: 'center' }}>
            <li style={{ margin: '0 10px' }}><a href="#" onClick={(e) => { e.preventDefault(); navigate('/investor/dashboard') }} style={{ color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 500 }}>Home</a></li>
            <li style={{ margin: '0 10px' }}><a href="#" onClick={(e) => { e.preventDefault(); navigate('/investor/profile') }} style={{ color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 500 }}>My Profile</a></li>
            <li style={{ margin: '0 10px' }}><a href="#" onClick={(e) => { e.preventDefault(); navigate('/investor/progress') }} style={{ color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 500 }}>My Progress</a></li>
            <li style={{ margin: '0 10px' }}><a href="#" onClick={(e) => { e.preventDefault(); navigate('/investor/delegations') }} style={{ color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 500 }}>Service Agent</a></li>

            <li ref={dropdownRef} className={`dropdown ${isDropdownOpen ? 'open' : ''}`} style={{ margin: '0 10px', position: 'relative' }}>
              <a
                href="#"
                className="dropdown-toggle"
                onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }}
                style={{ color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 500, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                Welcome {userName || ''}
              </a>

              {isDropdownOpen && (
                <ul className="dropdown-menu" style={{ display: 'block', position: 'absolute', right: 0, left: 'auto', minWidth: '160px', padding: '5px 0', margin: '2px 0 0', fontSize: '14px', textAlign: 'left', listStyle: 'none', backgroundColor: '#fff', backgroundClip: 'padding-box', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 6px 12px rgba(0,0,0,.175)', zIndex: 1000 }}>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); navigate('/change-password'); setIsDropdownOpen(false); }}
                      style={{ display: 'block', padding: '3px 20px', clear: 'both', fontWeight: 400, lineHeight: 1.42857143, color: '#333', whiteSpace: 'nowrap', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Change Password
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLogout(); }}
                      style={{ display: 'block', padding: '3px 20px', clear: 'both', fontWeight: 400, lineHeight: 1.42857143, color: '#333', whiteSpace: 'nowrap', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {t('logout')}
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
