import React from 'react';
import './PostLoginFooter.scss';

const PostLoginFooter: React.FC = () => {
  return (
    <footer className="post-login-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Facilon Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default PostLoginFooter;
