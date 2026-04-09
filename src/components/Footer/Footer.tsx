import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Facilon Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
