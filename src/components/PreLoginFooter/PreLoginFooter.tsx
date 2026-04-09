import React from 'react';
import './PreLoginFooter.scss';

const PreLoginFooter: React.FC = () => {
  return (
    <footer className="pre-login-footer">
      <div className="container-fluid">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Facilon Platform. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span>|</span>
            <a href="#terms">Terms of Service</a>
            <span>|</span>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PreLoginFooter;
