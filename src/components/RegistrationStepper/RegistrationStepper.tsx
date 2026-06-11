import React from 'react';

interface Props {
  currentStep: 1 | 2 | 3 | 4 | 5;
  title: string;
  maxWidth?: string;
}

export const RegistrationStepper: React.FC<Props> = ({ currentStep, title, maxWidth }) => {
  const steps = [
    { num: 1, label: 'Interest', icon: 'bi-globe2' },
    { num: 2, label: 'Email', icon: 'bi-envelope' },
    { num: 3, label: 'Consent', icon: 'bi-shield-check' },
    { num: 4, label: 'Verify', icon: 'bi-key' },
    { num: 5, label: 'Details', icon: 'bi-person-badge' }
  ];

  return (
    <div 
      className="registration-stepper-card mx-auto" 
      style={maxWidth ? { maxWidth } : undefined}
    >
      <div className="gradient-header">
        {/* Left Side: Step Title */}
        <div className="step-info">
          <h2>{title}</h2>
          <p>Step {currentStep} of 5</p>
        </div>

        {/* Right Side: Stepper Progress */}
        <div className="stepper-progress-container">
          {steps.map((step, idx) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div key={step.num} className="stepper-step-node">
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="node-line">
                    <div className={`line-progress ${isDone ? 'done' : ''}`} />
                  </div>
                )}

                {/* Node Circle */}
                <div className={`node-circle ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                  {isDone ? (
                    <i className="bi bi-check-lg done-check" />
                  ) : (
                    <i className={`bi ${step.icon} ${isCurrent ? 'current-icon' : ''}`} />
                  )}

                  {/* Active Pulse Ring */}
                  {isCurrent && <div className="pulse-ring" />}
                </div>

                {/* Label */}
                <span className={`step-label ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

