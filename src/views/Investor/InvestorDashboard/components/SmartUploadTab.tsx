import React from 'react';
import { KycDocumentsPage } from './SmartUpload/KycDocumentsPage';
import './SmartUploadTab.scss';

/**
 * Smart Upload (OCR) tab in the Investor Dashboard.
 * Hosts the KycDocumentsPage component tree described in
 * KYC_DOCUMENT_PLAN.md §3.8.
 */
export const SmartUploadTab: React.FC = () => {
  return (
    <div className="smart-upload-tab">
      <KycDocumentsPage />
    </div>
  );
};

export default SmartUploadTab;
