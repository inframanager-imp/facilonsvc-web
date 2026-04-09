import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SmartUploadTab.scss';

export const SmartUploadTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="smart-upload-tab">
      <div className="card p-4 p-md-5 smart-upload-tab__card">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h5 className="mb-0">Smart upload (OCR)</h5>
          <span className="badge bg-secondary">Coming soon</span>
        </div>
        <p className="text-muted mb-4 mb-md-5">
          Soon you will be able to upload required KYC documents here. Text will be read automatically
          and used to fill your information in the onboarding journey.
        </p>
        <p className="small text-muted mb-4">Until then, use documents or profile as usual.</p>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/investor/documents')}>
            Upload documents
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/investor/profile')}>
            Go to profile
          </button>
        </div>
      </div>
    </div>
  );
};
