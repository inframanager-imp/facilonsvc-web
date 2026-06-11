import React from 'react';

export type RegistrationStepKey = 'interest' | 'email' | 'consent' | 'otp' | 'details';

interface Props {
  step: RegistrationStepKey;
  registerAs?: number; // 1 = Individual, 2 = Legal Entity
}

export const RegistrationVisualCard: React.FC<Props> = ({ step, registerAs = 1 }) => {
  const getCardDetails = () => {
    switch (step) {
      case 'interest':
        return {
          title: 'Market Connectivity',
          description: 'Facilon connects you securely to regulated asset classes in Indian financial markets.',
          illustration: (
            <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Concentric data rings */}
              <circle cx="110" cy="90" r="70" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              <circle cx="110" cy="90" r="45" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="110" cy="90" r="20" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

              {/* Network lines connecting nodes */}
              <line x1="45" y1="50" x2="110" y2="90" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
              <line x1="175" y1="50" x2="110" y2="90" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
              <line x1="110" y1="90" x2="60" y2="135" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
              <line x1="110" y1="90" x2="160" y2="135" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
              <line x1="45" y1="50" x2="175" y2="50" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="60" y1="135" x2="160" y2="135" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="2 2" />

              {/* Connecting Nodes (Gateway endpoints) */}
              <circle cx="45" cy="50" r="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
              <circle cx="45" cy="50" r="3" fill="#be1717" />

              <circle cx="175" cy="50" r="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
              <circle cx="175" cy="50" r="3" fill="#be1717" />

              <circle cx="60" cy="135" r="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
              <circle cx="60" cy="135" r="3" fill="#be1717" />

              <circle cx="160" cy="135" r="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
              <circle cx="160" cy="135" r="3" fill="#be1717" />

              {/* Central Server Node (Facilon Secure Hub) */}
              <circle cx="110" cy="90" r="14" fill="#be1717" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />
              {/* Central Server rack icon */}
              <path d="M106 86 H114 M106 90 H114 M106 94 H114" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )
        };
      case 'email':
        return {
          title: 'Verify Your Identity',
          description: 'A secure, verified email is the first step to transparent and secure investing.',
          illustration: (
            <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Laptop screen background */}
              <rect x="40" y="50" width="140" height="90" rx="6" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
              <line x1="30" y1="140" x2="190" y2="140" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="4" strokeLinecap="round" />
              <line x1="95" y1="140" x2="125" y2="140" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="4" strokeLinecap="round" />

              {/* Mail emerging from screen */}
              <g transform="translate(0, -10)">
                {/* Envelope body */}
                <rect x="65" y="65" width="90" height="58" rx="6" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" style={{ backdropFilter: 'blur(4px)' }} />
                {/* Envelope fold flap */}
                <path d="M65 67 L110 98 L155 67" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
                <path d="M65 121 L100 95" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" />
                <path d="M155 121 L120 95" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" />

                {/* Verification checkmark seal stamp in brand red */}
                <circle cx="110" cy="98" r="14" fill="#be1717" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="2" />
                <path d="M104 98 L108 102 L117 93" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* OTP code / signal packets */}
              <circle cx="35" cy="80" r="3" fill="#be1717" />
              <circle cx="185" cy="95" r="4" fill="#be1717" />
              <circle cx="65" cy="40" r="2.5" fill="rgba(255, 255, 255, 0.4)" />
              <circle cx="155" cy="35" r="3" fill="rgba(255, 255, 255, 0.6)" />
            </svg>
          )
        };
      case 'consent':
        return {
          title: 'Secure & Compliant',
          description: 'Your consent guarantees secure and compliant data processing in line with the DPDP Act 2023.',
          illustration: (
            <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Document Sheet / Consent form */}
              <rect x="65" y="30" width="90" height="120" rx="4" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />

              {/* Clip on top of clipboard */}
              <rect x="95" y="24" width="30" height="10" rx="2" fill="rgba(255, 255, 255, 0.25)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
              <circle cx="110" cy="29" r="2" fill="rgba(255, 255, 255, 0.6)" />

              {/* Text lines in document */}
              <line x1="80" y1="55" x2="140" y2="55" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" strokeLinecap="round" />
              <line x1="80" y1="70" x2="130" y2="70" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" strokeLinecap="round" />

              {/* Consent items (checkbox + checkmark) */}
              <rect x="80" y="88" width="10" height="10" rx="2" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
              <path d="M82 93 L84 95 L88 91" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="98" y1="93" x2="140" y2="93" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeLinecap="round" />

              <rect x="80" y="108" width="10" height="10" rx="2" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
              <path d="M82 113 L84 115 L88 111" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="98" y1="113" x2="135" y2="113" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeLinecap="round" />

              {/* Signature line / checked indicator */}
              <line x1="80" y1="132" x2="140" y2="132" stroke="#be1717" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />

              {/* Shield of compliance / security in brand red */}
              <g transform="translate(130, 95)">
                <path d="M20 0 C32 0 40 4 40 4 C40 4 40 22 36 32 C30 42 20 48 20 48 C20 48 10 42 4 32 C0 22 0 4 0 4 C0 4 8 0 20 0 Z"
                  fill="#be1717" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" />
                {/* Shield check icon */}
                <path d="M13 22 L18 27 L28 17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Orbiting data rings */}
              <circle cx="110" cy="90" r="72" stroke="rgba(190, 23, 23, 0.12)" strokeWidth="1.5" />
            </svg>
          )
        };
      case 'otp':
        return {
          title: 'Verify Verification Code',
          description: 'Enter the secure 4-digit code sent to your email to verify your identity.',
          illustration: (
            <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer circular countdown track */}
              <circle cx="110" cy="75" r="58" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="5" />
              <circle cx="110" cy="75" r="58" stroke="#be1717" strokeWidth="4.5" strokeDasharray="160 365" strokeLinecap="round" />

              {/* Lock inside the timer */}
              <g transform="translate(95, 40)">
                <rect x="2" y="14" width="26" height="20" rx="3" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
                <path d="M7 14 V9 C7 5.5 10 3.5 15 3.5 C20 3.5 23 5.5 23 9 V14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
                <circle cx="15" cy="22" r="2" fill="#be1717" />
              </g>

              {/* 4 Digit Boxes representing OTP Code */}
              <g transform="translate(35, 115)">
                <rect x="0" y="0" width="30" height="36" rx="4" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
                <circle cx="15" cy="18" r="4" fill="#ffffff" />

                <rect x="40" y="0" width="30" height="36" rx="4" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
                <circle cx="55" cy="18" r="4" fill="#ffffff" />

                <rect x="80" y="0" width="30" height="36" rx="4" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
                <circle cx="95" cy="18" r="4" fill="#ffffff" />

                {/* Digit 4 - Active blinking box in brand red */}
                <rect x="120" y="0" width="30" height="36" rx="4" fill="rgba(190, 23, 23, 0.12)" stroke="#be1717" strokeWidth="2" />
                <text x="131" y="24" fill="#be1717" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif">|</text>
              </g>

              {/* Floating sparks */}
              <circle cx="30" cy="50" r="2" fill="rgba(255, 255, 255, 0.4)" />
              <circle cx="190" cy="65" r="3" fill="#be1717" />
            </svg>
          )
        };
      case 'details':
        const cardTitle = registerAs === 1 ? 'INDIVIDUAL' : 'LEGAL ENTITY';
        const cardHolder = registerAs === 1 ? 'INVESTOR MEMBER' : 'CORPORATE MEMBER';
        const cardIcon = registerAs === 1 ? 'bi-person-fill' : 'bi-building-fill';
        return {
          title: 'Complete Profile Setup',
          description: 'Provide your registration particulars to complete setup and activate your custom investor card.',
          illustration: (
            <div style={{ perspective: '800px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {/* 3D Glass Credit Card Visual */}
              <div className="" style={{
                width: '240px',
                height: '145px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 15px 30px rgba(190, 23, 23, 0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transform: 'rotateY(-15deg) rotateX(10deg)',
                transformStyle: 'preserve-3d',
                color: '#ffffff',
                fontFamily: 'system-ui, sans-serif'
              }}>
                {/* Shiny gloss stripe effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
                  borderRadius: '14px',
                  pointerEvents: 'none'
                }} />

                {/* Top Row: Brand & Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.8)' }}>
                    FACILON
                  </span>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    backgroundColor: '#be1717',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    {cardTitle}
                  </div>
                </div>

                {/* Middle Row: Gold Chip & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0 14px' }}>
                  {/* Microchip */}
                  <div style={{
                    width: '28px',
                    height: '22px',
                    backgroundColor: '#ffd54f',
                    borderRadius: '4px',
                    backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '7px 5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} />
                  {/* Profile type icon */}
                  <i className={`bi ${cardIcon}`} style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.65)' }} />
                </div>

                {/* Bottom Row: Holder Name & Status */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '7px', color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.5px' }}>CARDHOLDER</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>{cardHolder}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '7px', color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.5px' }}>STATUS</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#81c784', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#81c784', display: 'inline-block' }} />
                      ACTIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        };
      default:
        return {
          title: 'Facilon Platform',
          description: 'Secure, institutional-grade access to Indian financial markets.',
          illustration: (
            <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="110" cy="90" r="50" stroke="#be1717" strokeWidth="1.5" />
              <path d="M100 90 L107 97 L122 82" stroke="#be1717" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        };
    }
  };

  const getHeaderDetails = () => {
    switch (step) {
      case 'interest':
        return {
          icon: 'bi-bank',
          badge: 'Compliant Market Access',
          time: '30s'
        };
      case 'email':
        return {
          icon: 'bi-shield-lock-fill',
          badge: 'Secure Encryption Session',
          time: '1m'
        };
      case 'consent':
        return {
          icon: 'bi-file-earmark-check-fill',
          badge: 'Regulatory Data Consent',
          time: '2m'
        };
      case 'otp':
        return {
          icon: 'bi-key-fill',
          badge: 'One-Time Security Token',
          time: '45s'
        };
      case 'details':
        return {
          icon: 'bi-person-check-fill',
          badge: 'Profile Identity Verification',
          time: '3m'
        };
      default:
        return {
          icon: 'bi-shield-check',
          badge: 'Facilon Platform',
          time: '1m'
        };
    }
  };

  const details = getCardDetails();
  const header = getHeaderDetails();

  return (
    <div className="creative-step-card">
      {/* Background Decor */}
      <div className="decor-glow" />
      <div className="decor-glow-bottom" />

      {/* Card Header Section */}
      <div className="card-top">
        <div className="card-brand flex flex-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`bi ${header.icon}`} style={{ fontSize: '15px', color: '#7facb7' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.8)' }}>
              {header.badge}
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', paddingLeft: '12px' }}>
            <i className="bi bi-clock-history" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }} />
            Time Required: {header.time}
          </span>
        </div>
      </div>

      {/* Visual / Illustration Area */}
      <div className="card-illustration-container">
        {details.illustration}
      </div>

      {/* Text / Context Info */}
      <div className="card-bottom">
        <h3 className='text-center'>{details.title}</h3>
        <p className='text-center'>{details.description}</p>
      </div>
    </div>
  );
};

