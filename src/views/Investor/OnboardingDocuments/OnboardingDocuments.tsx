import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { investorService, KycDocumentRequirementDto } from '../../../services/investor.service';
import { pdfService } from '../../../services/pdf.service';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import '../DocumentUpload/DocumentUpload.scss';

interface FileSelection {
  file: File;
  fileName: string;
  /** Dataverse ss_investordocumentsid — required for CRM-aligned upload */
  investorDocumentId?: string;
}

export const OnboardingDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<KycDocumentRequirementDto | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Map<string, FileSelection>>(new Map());
  const [kycComplete, setKycComplete] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [onboardingReqs, dashboard] = await Promise.all([
        investorService.getOnboardingRequirements(),
        investorService.getDashboard()
      ]);
      
      console.log('📦 Onboarding Requirements:', onboardingReqs);
      console.log('📊 Dashboard Data:', dashboard);
      
      setRequirements(onboardingReqs);
      setDashboardData(dashboard);

      // Check if KYC is complete
      if (dashboard?.accountSummary) {
        const isKycComplete = 
          dashboard.accountSummary.kycDocumentsUploaded >= 
          dashboard.accountSummary.kycDocumentsRequired;
        console.log('✅ KYC Complete:', isKycComplete);
        setKycComplete(isKycComplete);
        
        if (!isKycComplete) {
          toast.warning('Please complete KYC documents before accessing onboarding forms.');
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading onboarding data:', error);
      toast.error(error.response?.data?.message || 'Failed to load onboarding requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    docDescription: string,
    investorDocumentId?: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10 MB max)
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error('File size exceeds 10 MB. Please choose a smaller file.');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, JPG, JPEG, PNG are allowed.');
      event.target.value = '';
      return;
    }

    // Store the selected file (keyed by description; include CRM row id for upload)
    setSelectedFiles(prev => {
      const updated = new Map(prev);
      updated.set(docDescription, { file, fileName: file.name, investorDocumentId });
      return updated;
    });
  };

  const handleBatchSubmit = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    if (!kycComplete) {
      toast.error('Please complete KYC documents first before uploading onboarding forms.');
      return;
    }

    const failedUploads: string[] = [];
    const successfulUploads: string[] = [];

    setUploadingFile('batch');

    for (const [docDescription, fileSelection] of Array.from(selectedFiles.entries())) {
      if (!fileSelection.investorDocumentId?.trim()) {
        toast.error(
          `Missing CRM document ID for "${docDescription}". Refresh the page or contact support.`
        );
        failedUploads.push(docDescription);
        continue;
      }
      try {
        await investorService.uploadOnboardingDocument(
          fileSelection.file,
          docDescription,
          fileSelection.investorDocumentId
        );
        successfulUploads.push(docDescription);
      } catch (error: any) {
        console.error(`Error uploading ${docDescription}:`, error);
        failedUploads.push(docDescription);
      }
    }

    setUploadingFile(null);

    if (successfulUploads.length > 0) {
      toast.success(`Successfully uploaded ${successfulUploads.length} document(s)`);
      setSelectedFiles(new Map());
      await loadData();
    }

    if (failedUploads.length > 0) {
      toast.error(`Failed to upload: ${failedUploads.join(', ')}`);
    }
  };

  const handleDownloadAccountOpeningBooklet = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      toast.info('Generating KYC Account Opening Kit PDF, please wait...');

      // Uses FreeMarker template (kyc-form-master.ftl) converted from Laravel pdf.blade
      const blob = await pdfService.downloadKycFormPdf();

      console.log('[KYC Form PDF] Blob size:', blob.size, 'bytes');
      console.log('[KYC Form PDF] Blob type:', blob.type);

      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      // Create blob URL and open in new tab (like Laravel stream with inline disposition)
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      if (!newWindow) {
        // If popup blocked, try downloading instead
        const a = document.createElement('a');
        a.href = url;
        a.download = 'KYC_Account_Opening_Kit.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('KYC Account Opening Kit PDF downloaded successfully');
      } else {
        toast.success('KYC Account Opening Kit PDF opened in new tab');
      }

      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);

    } catch (error: any) {
      console.error('[KYC Form PDF] Error:', error);
      toast.error(error.message || 'Failed to generate KYC Account Opening Kit PDF. Please try again.');
    }
  };

  const handleDownloadMasterDocument = async (e: React.MouseEvent, documentUrl: string | undefined, documentName: string) => {
    e.preventDefault();
    
    if (!documentUrl) {
      toast.error('Document URL is not available');
      return;
    }
    
    try {
      toast.info('Downloading document, please wait...');
      
      const blob = await investorService.downloadSharePointDocument(documentUrl);
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      toast.success('Document downloaded successfully');
      
    } catch (error: any) {
      console.error('[Document Download] Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to download document. Please try again.');
    }
  };

  const getDocTypeValue = (doc: any): number | null => {
    const candidates = [doc?.documentType, doc?.documentTypeCode, doc?.ss_documenttype];
    for (const candidate of candidates) {
      if (candidate === undefined || candidate === null || candidate === '') {
        continue;
      }
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return null;
  };

  const isAccountOpeningBooklet = (doc: any): boolean => {
    if (getDocTypeValue(doc) === 100000012) {
      return true;
    }
    const description = String(doc?.description ?? '').trim().toLowerCase();
    return description === 'account opening booklet';
  };

  const getServiceProviderDisplayName = (): string => {
    const rawName = (requirements?.serviceProviderName || '').trim();
    if (!rawName || rawName.toLowerCase() === 'default tenant') {
      return 'Facilon Matrix Broker';
    }
    return rawName;
  };

  const renderProgressBar = () => {
    return <PremiumJourneyStepper dashboardData={dashboardData} />;
  };

  if (loading) {
    return (
      <div className="facilon-dashboard-wrapper">
        <main className="container-fluid dashboard-container-main">
          <div className="onboarding-documents">
            <div className="loading">Loading onboarding documents...</div>
          </div>
        </main>
      </div>
    );
  }

  console.log('🎨 Rendering OnboardingDocuments - requirements:', requirements, 'kycComplete:', kycComplete);

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">
          {/* Progress Bar */}
          {renderProgressBar()}

          <div className="investor-profile__card document-upload">
            {requirements && requirements.serviceProviderName && (
              <p className="document-upload__service-provider">
                Service Provider: <strong>{getServiceProviderDisplayName()}</strong>
              </p>
            )}

            {/* Instruction Banner */}
            <div className="mb-4 p-3 bg-light rounded border border-neutral-200" style={{ fontSize: '11px', color: 'var(--facilon-text-muted)', lineHeight: '1.6' }}>
              <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--facilon-primary)', fontWeight: 700 }}>
                <i className="bi bi-info-circle-fill" />
                <span>Onboarding Documents Process</span>
              </div>
              <ul className="ps-3 mb-0" style={{ listStyleType: 'disc' }}>
                <li><strong>Download Templates:</strong> Use the "Download Template" links to get templates for documents such as the Account Opening Booklet.</li>
                <li><strong>Fill & Sign:</strong> Review carefully for accuracy, fill in any missing details, and sign.</li>
                <li><strong>Upload Soft Copy:</strong> Upload clear, self-attested soft copies through this platform.</li>
                <li><strong>Retain Physical Copies:</strong> Keep signed physical documents safe; some may need to be couriered or submitted in person later.</li>
              </ul>
            </div>

            {/* Document Upload Section */}
            {requirements && (
              <div className="document-list">
                {!kycComplete && (
                  <div className="alert alert-warning mb-3 py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', fontSize: '11px', color: '#856404' }}>
                    <span className="d-flex align-items-center gap-2">
                      <strong>⚠️ KYC Verification Required First!</strong>
                      <span>Please upload all KYC documents before uploading onboarding forms.</span>
                    </span>
                    <button className="btn btn-xs btn-warning py-1 px-2 font-weight-bold" onClick={() => navigate('/investor/documents')} style={{ fontSize: '10px', height: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                      Go to KYC Documents
                    </button>
                  </div>
                )}

                <div className="document-list__header-row">
                  <h2>Required Onboarding Documents</h2>
                  <div className="progress-summary-compact">
                    <span className="stat-pill">
                      Uploaded: <strong>{requirements.uploaded}/{requirements.totalRequired}</strong>
                    </span>
                    <span className="stat-pill stat-percentage">
                      {requirements.totalRequired > 0 
                        ? Math.round((requirements.uploaded / requirements.totalRequired) * 100) 
                        : 0}% Complete
                    </span>
                  </div>
                </div>

                <p className="document-list__subtitle">
                  Please provide completed and signed copies of the requested onboarding files. Accepted formats: PDF, JPG, PNG (Max size: 10MB)
                </p>

                <div className="document-table-container">
                  <table className="document-table">
                    <thead>
                      <tr>
                        <th style={{ width: '45%' }}>Required Document</th>
                        <th style={{ width: '15%' }}>Status</th>
                        <th style={{ width: '30%' }}>Uploaded File / Upload Tool</th>
                        <th style={{ width: '10%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...requirements.documents]
                        .sort((a, b) => a.description.localeCompare(b.description))
                        .map((doc, index) => {
                          const selectedFile = selectedFiles.get(doc.description);
                          const isUploaded = doc.localRecordExists;
                          const isUploading = uploadingFile === doc.description;

                          return (
                            <tr key={doc.dynamicsId || index}>
                              <td>
                                <div className="table-document-info">
                                  <div className="table-document-name">
                                    {doc.description}
                                    {isAccountOpeningBooklet(doc) && (
                                      <a
                                        href="#"
                                        onClick={handleDownloadAccountOpeningBooklet}
                                        style={{ color: 'var(--facilon-primary)', marginLeft: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                        title="Download Booklet Template"
                                      >
                                        <i className="bi bi-download me-1" />
                                        Download Template
                                      </a>
                                    )}
                                    {!isAccountOpeningBooklet(doc) && doc.documentMasterUrl && (
                                      <a
                                        href="#"
                                        onClick={(e) => handleDownloadMasterDocument(e, doc.documentMasterUrl, doc.description)}
                                        style={{ color: 'var(--facilon-primary)', marginLeft: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                        title="Download Master Template"
                                      >
                                        <i className="bi bi-download me-1" />
                                        Download Template
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {isUploaded ? (
                                  <span className="status-badge status-approved">
                                    <i className="bi bi-check-circle-fill" />
                                    {doc.localStatus || 'Uploaded'}
                                  </span>
                                ) : (
                                  <label 
                                    htmlFor={`doc_${index}`}
                                    className="status-badge status-not-uploaded"
                                    title="Click to choose and upload file"
                                  >
                                    <i className="bi bi-cloud-arrow-up-fill" />
                                    Not Uploaded
                                  </label>
                                )}
                              </td>
                              <td>
                                {isUploaded ? (
                                  <div className="table-file-uploaded">
                                    <i className="bi bi-file-earmark-check-fill table-file-uploaded__icon" />
                                    <div>
                                      <div className="table-file-uploaded__name" title={doc.fileName || 'Document'}>
                                        {doc.fileName || 'Onboarding Document'}
                                      </div>
                                      {doc.uploadedAt && (
                                        <div className="table-file-uploaded__date">
                                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="table-file-upload">
                                    <input
                                      type="file"
                                      id={`doc_${index}`}
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleFileSelect(e, doc.description, doc.dynamicsId)}
                                      disabled={!kycComplete || isUploading}
                                      style={{ display: 'none' }}
                                    />
                                    <div className="file-upload-wrapper">
                                      <label 
                                        htmlFor={`doc_${index}`} 
                                        className={`file-input-label-custom ${selectedFile ? 'file-selected' : ''}`}
                                        style={{
                                          opacity: !kycComplete ? 0.6 : 1,
                                          cursor: !kycComplete ? 'not-allowed' : 'pointer'
                                        }}
                                      >
                                        <i className="bi bi-file-earmark-arrow-up me-2" />
                                        {selectedFile ? selectedFile.fileName : 'Choose File'}
                                      </label>
                                      <span className="file-size-hint">Max size: 10MB</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="table-actions-cell">
                                  <button
                                    type="button"
                                    className="btn-action-icon text-primary"
                                    onClick={() => {
                                      if (doc.documentUrl) {
                                        window.open(doc.documentUrl, '_blank');
                                      } else if (doc.localDocumentId) {
                                        window.open(`/api/clients/me/documents/${doc.localDocumentId}/download`, '_blank');
                                      } else {
                                        toast.warning('No document preview available');
                                      }
                                    }}
                                    disabled={!isUploaded}
                                    title="Preview Document"
                                  >
                                    <i className="bi bi-eye-fill" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="document-upload__actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-outline-primary"
              >
                <i className="bi bi-x-circle me-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchSubmit}
                className="btn-save"
                disabled={uploadingFile === 'batch' || selectedFiles.size === 0 || !kycComplete}
              >
                <i className="bi bi-cloud-upload me-2" />
                {uploadingFile === 'batch' ? 'Uploading...' : 'Submit Documents'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
