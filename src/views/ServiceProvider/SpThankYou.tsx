import React from 'react';
import './ServiceProvider.scss';

/**
 * Pixel-faithful port of `service-provider/register-thank-you.blade.php`.
 */
const SpThankYou: React.FC = () => {
  return (
    <section className="sp-thank-you">
      <div className="content">
        <h3>
          <span>Thank You!</span>
        </h3>
        <p>Your details have been submitted successfully.</p>
        <p>
          The <strong>Facilon Team</strong> will get back to you shortly.
        </p>
        <p className="small">
          (Please check your <strong>Inbox</strong>. Kindly check your{' '}
          <strong>Spam</strong> or <strong>Junk</strong> folder.)
        </p>
      </div>
    </section>
  );
};

export default SpThankYou;
