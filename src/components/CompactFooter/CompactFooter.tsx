import React from 'react';
import { Link } from 'react-router-dom';
import './CompactFooter.scss';

export const CompactFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="compact-footer-container">
      {/* Main footer layout with links */}
      <div className="main-footer-section py-4 px-3 px-md-5">
        <div className="container-fluid">
          <div className="row justify-content-between align-items-start gy-4">
            
            {/* Column 1 */}
            <div className="col-12 col-sm-6 col-md-3 footer-col">
              <ul className="footer-links-list p-0 m-0">
                <li><a href="#about-us">About Us</a></li>
                <li><a href="#our-team">Our Team</a></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="col-12 col-sm-6 col-md-2 footer-col">
              <ul className="footer-links-list p-0 m-0">
                <li><a href="#our-expertise">Our Expertise</a></li>
                <li><a href="#faqs">FAQs</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-12 col-sm-6 col-md-3 footer-col">
              <ul className="footer-links-list p-0 m-0">
                <li><Link to="/contact-us">Contact Us</Link></li>
                <li><Link to="/service-agreement">Terms Of Use</Link></li>
                <li><a href="#disclaimer">Disclaimer</a></li>
              </ul>
            </div>

            {/* Column 4 - Follow Us and scroll to top */}
            <div className="col-12 col-sm-6 col-md-3 footer-col d-flex justify-content-between align-items-start flex-wrap">
              <div className="social-follow">
                <h4 className="follow-title mb-3">Follow Us</h4>
                <div className="social-icons d-flex gap-2">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Scroll to top button */}
              <button 
                type="button" 
                className="scroll-to-top-btn" 
                onClick={scrollToTop} 
                aria-label="Scroll to top"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="copyright-bar py-3 text-center">
        <p className="m-0 text-white">
          &copy; Copyright {new Date().getFullYear()} Facilon | Designed By Matrix Bricks. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
