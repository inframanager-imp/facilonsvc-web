import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CompactHeader.scss';

export const CompactHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="compact-header-container">
      {/* Top thin info bar */}
      <div className="top-info-bar">
        <div className="container-fluid d-flex justify-content-between align-items-center px-4">
          <div className="contact-info d-flex align-items-center">
            <a href="mailto:reachus@facilonservices.com" className="email-link d-flex align-items-center">
              <svg className="me-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              reachus@facilonservices.com
            </a>
            <span className="separator mx-2">/</span>
            <div className="social-icons d-flex align-items-center gap-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="main-nav-bar">
        <div className="container-fluid d-flex align-items-center justify-content-between p-0">

          {/* Logo container with diagonal cut */}
          <div className="logo-tab px-4">
            <Link to="/">
              <img src="/assets/images/logo.png" alt="Facilon Logo" className="header-logo" />
            </Link>
          </div>

          {/* Hamburger toggle button for mobile */}
          <button className="mobile-toggle-btn d-md-none me-3" onClick={toggleMobileMenu} aria-label="Toggle Navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

          {/* Desktop menu links with diagonal tab background */}
          <nav className="nav-menu-tab d-none d-md-flex align-items-center">
            <ul className="nav-list d-flex m-0 p-0 align-items-center">
              <li><a href="#about-us" className="nav-item">About Us</a></li>
              <li><a href="#our-team" className="nav-item">Our Team</a></li>
              <li><a href="#our-expertise" className="nav-item">Our Experties</a></li>
              <li><a href="#faqs" className="nav-item">FAQS</a></li>
              <li><Link to="/contact-us" className="nav-item">Contact Us</Link></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile navigation overlay menu */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-menu d-md-none">
          <ul className="mobile-nav-list m-0 p-3">
            <li><a href="#about-us" className="mobile-nav-item" onClick={toggleMobileMenu}>ABOUT US</a></li>
            <li><a href="#our-team" className="mobile-nav-item" onClick={toggleMobileMenu}>OUR TEAM</a></li>
            <li><a href="#our-expertise" className="mobile-nav-item" onClick={toggleMobileMenu}>OUR EXPERTISE</a></li>
            <li><a href="#faqs" className="mobile-nav-item" onClick={toggleMobileMenu}>FAQS</a></li>
            <li><Link to="/contact-us" className="mobile-nav-item" onClick={toggleMobileMenu}>CONTACT US</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
};
