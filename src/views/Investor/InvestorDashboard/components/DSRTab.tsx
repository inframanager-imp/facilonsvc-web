import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DSRTab: React.FC = () => {
  const navigate = useNavigate();

  const rights = [
    {
      icon: 'bi-eye',
      title: 'Right to Access',
      description: 'Request a copy of your personal data we hold.',
    },
    {
      icon: 'bi-pencil-square',
      title: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete personal data.',
    },
    {
      icon: 'bi-trash',
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data under certain conditions.',
    },
    {
      icon: 'bi-download',
      title: 'Right to Data Portability',
      description: 'Receive your data in a machine-readable format.',
    },
    {
      icon: 'bi-hand-thumbs-down',
      title: 'Right to Object',
      description: 'Object to processing of your personal data in certain situations.',
    },
  ];

  return (
    <div className="dsr-tab">
      <div className="card p-4 mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h4 className="mb-3">
          <i className="bi bi-shield-lock me-2"></i>
          Data Subject Rights
        </h4>
        <p className="mb-0">
          Exercise your privacy rights and manage your personal data. We are committed to protecting
          your privacy and ensuring compliance with data protection regulations.
        </p>
      </div>

      <div className="row g-3 mb-4">
        {rights.map((right, idx) => (
          <div className="col-md-6" key={idx}>
            <div className="card h-100 p-3">
              <div className="d-flex align-items-start">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3"
                  style={{ width: '48px', height: '48px', flexShrink: 0 }}
                >
                  <i className={`bi ${right.icon}`} style={{ fontSize: '1.25rem', color: '#0d6efd' }}></i>
                </div>
                <div>
                  <h6 className="mb-1">{right.title}</h6>
                  <p className="text-muted small mb-0">{right.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h5 className="mb-3">Access DSR Center</h5>
        <p className="text-muted mb-3">
          Visit the Data Subject Rights Center to submit requests, view your request history, and
          manage your privacy preferences.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/investor/dsr-center')}
        >
          <i className="bi bi-arrow-right-circle me-2"></i>
          Open Data Subject Rights Center
        </button>
      </div>
    </div>
  );
};
