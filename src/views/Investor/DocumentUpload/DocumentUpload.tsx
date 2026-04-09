import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, type KycDocumentRequirementDto, type RequiredDocument, type InvestorDashboardDto, type DocumentResponseDto } from '../../../services/investor.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import './DocumentUpload.scss';

export const DocumentUpload: React.FC = () => {
  const regularNavigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
  
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [requirements, setRequirements] = useState<KycDocumentRequirementDto | null>(null);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReasonsModal, setShowReasonsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, reqData, dashData] = await Promise.all([
        investorService.getDocuments(),
        investorService.getKycRequirements(),
        investorService.getDashboard()
      ]);
      setDocuments(docsData || []);
      setRequirements(reqData);
      setDashboardData(dashData);
    } catch (err: any) {
      console.error('Error loading KYC requirements:', err);
      toast.error('Failed to load document requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await investorService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      await loadData();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const handleFileSelect = (documentKey: string, file: File | null) => {
    const newSelectedFiles = new Map(selectedFiles);
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPG, JPEG, and PNG files are allowed');
        return;
      }

      newSelectedFiles.set(documentKey, file);
    } else {
      newSelectedFiles.delete(documentKey);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.size === 0) {
      toast.warning('Please select at least one document to upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [documentKey, file] of Array.from(selectedFiles.entries())) {
      try {
        // documentKey format: "{dynamicsId}|{description}"
        const [dynamicsId, documentDescription] = documentKey.split('|');
        await investorService.uploadDocument(file, documentDescription, dynamicsId);
        successCount++;
      } catch (error: any) {
        console.error(`Error uploading document:`, error);
        errorCount++;
      }
    }

    setUploading(false);
    setSelectedFiles(new Map());

    if (successCount > 0) {
      toast.success(`${successCount} document(s) uploaded successfully`);
      await loadData(); // Reload to get updated status
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} document(s)`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="status-badge status-approved">✓ Approved</span>;
      case 'rejected':
      case 'sent back':
        return <span className="status-badge status-rejected">✗ Rejected</span>;
      case 'pending':
      case 'under review':
        return <span className="status-badge status-pending">⏱ Pending</span>;
      default:
        return <span className="status-badge status-not-uploaded">Not Uploaded</span>;
    }
  };

  const getRejectedDocuments = (): RequiredDocument[] => {
    if (!requirements?.documents) return [];
    return requirements.documents.filter(
      doc => doc.localStatus?.toLowerCase() === 'rejected' || 
             doc.localStatus?.toLowerCase() === 'sent back'
    );
  };

  const renderProgressBar = () => {
    if (!dashboardData) return null;

    const progress = dashboardData.progress;
    const accountSummary = dashboardData.accountSummary;

    const isCompleted = (key: string) => progress?.sections?.[key]?.completed || false;

    const isDoneFor = (key: string) => {
      if (key === 'information') return isCompleted('personalInfo');
      if (key === 'documents') return requirements?.completionPercentage === 100 || (accountSummary ? accountSummary.kycDocumentsUploaded >= accountSummary.kycDocumentsRequired : false);
      if (key === 'onboarding') return accountSummary ? accountSummary.onboardingDocumentsUploaded >= accountSummary.onboardingDocumentsRequired : false;
      if (key === 'verification') return accountSummary?.verificationDone || false;
      if (key === 'physical') return accountSummary?.physicalSubmissionDone || false;
      if (key === 'account') return accountSummary?.accountOpeningStatus || false;
      return false;
    };

    const stepKeys = ['information', 'documents', 'onboarding', 'verification', 'physical', 'account'] as const;
    const currentStepKey = stepKeys.find((k) => !isDoneFor(k)) ?? 'account';
    const isCurrent = (key: string) => currentStepKey === key;

    const renderStep = (label: string, route: string, stepKey: string) => {
      const isDone = isDoneFor(stepKey);
      
      const handleStepClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isProxyMode) {
          saNavigate(route);
        } else {
          regularNavigate(route);
        }
      };

      return (
        <div key={stepKey} className="step">
          {isDone ? (
            <div className="circle-chart active-one">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <a href="#" onClick={handleStepClick} style={{ textDecoration: 'none' }}>
              <div className={`circle-chart ${isCurrent(stepKey) ? 'active-three' : ''}`}>
                Start
              </div>
            </a>
          )}
          <p>
            <a href="#" onClick={handleStepClick}>{label}</a>
          </p>
        </div>
      );
    };

    return (
      <div className="document-upload__progress-section">
        <div className="container-fluid">
          <center>
            <strong>
              <h2 style={{ fontSize: '36px', color: '#be1717', fontWeight: 500, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                Your Journey
              </h2>
            </strong>
          </center>
          <div className="step-progress">
            {renderStep('Submit Information', '/investor/profile', 'information')}
            {renderStep('KYC Documents', '/investor/documents', 'documents')}
            {renderStep('Onboarding Forms', '/investor/onboarding', 'onboarding')}
            {renderStep('In-person Verification', '/investor/verification', 'verification')}
            {renderStep('Physical Submission', '/investor/physical-submission', 'physical')}
            {renderStep('Account Details', '/investor/account-details', 'account')}
          </div>
        </div>
      </div>
    );
  };

  const allDocumentsSubmitted = () => {
    if (!requirements?.documents) return false;
    return requirements.documents.every(doc => 
      doc.localStatus && doc.localStatus.toLowerCase() !== 'not uploaded'
    );
  };

  const isUploadButtonDisabled = () => {
    return uploading || selectedFiles.size === 0 || allDocumentsSubmitted();
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading KYC document requirements...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="error-container">
            <p>Failed to load document requirements. Please try again later.</p>
            <button onClick={loadData} className="btn-retry">Retry</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const rejectedDocs = getRejectedDocuments();

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="document-upload">
          <div className="profile-header">
            <h1>KYC Documents</h1>
          </div>

          {renderProgressBar()}

          <div className="document-upload__content">
            {requirements.serviceProviderName && (
              <p className="document-upload__service-provider">Service Provider: <strong>{requirements.serviceProviderName}</strong></p>
            )}

          <div className="progress-summary">
            <div className="progress-summary__stats">
              <div className="stat">
                <span className="stat-value">{requirements.uploaded}</span>
                <span className="stat-label">of {requirements.totalRequired} Uploaded</span>
              </div>
              <div className="stat">
                <span className="stat-value">{requirements.completionPercentage}%</span>
                <span className="stat-label">Complete</span>
              </div>
              <div className="stat">
                <span className="stat-value stat-approved">{requirements.approved}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat">
                <span className="stat-value stat-rejected">{requirements.rejected}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
            {rejectedDocs.length > 0 && (
              <button 
                className="btn-see-reasons" 
                onClick={() => setShowReasonsModal(true)}
              >
                See Reasons for Rejection
              </button>
            )}
          </div>

          <div className="document-list">
            <h2>Required Documents</h2>
            <p className="document-list__note">
              Please upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG (Max size: 10MB)
            </p>

            {requirements.documents.map((doc) => {
              const isUploaded = doc.localRecordExists || (doc.localStatus && doc.localStatus.toLowerCase() !== 'not uploaded');
              const isRejected = doc.localStatus?.toLowerCase() === 'rejected' || doc.localStatus?.toLowerCase() === 'sent back';
              const uploadedDoc = doc.localDocumentId ? documents.find((d) => d.id === doc.localDocumentId) : null;

              return (
                <div key={doc.dynamicsId} className="document-item">
                  <div className="document-item__header">
                    <h3>{doc.description}</h3>
                    {getStatusBadge(doc.localStatus || 'not uploaded')}
                  </div>

                  {isRejected && doc.reason && (
                    <div className="document-item__reason">
                      <strong>Rejection Reason:</strong> {doc.reason}
                    </div>
                  )}

                  {isUploaded && doc.localDocumentId ? (
                    <div className="document-item__uploaded">
                      <div className="document-item__uploaded-info">
                        <span className="document-item__uploaded-icon">📄</span>
                        <div>
                          <div className="document-item__uploaded-name">
                            {uploadedDoc?.fileName || doc.fileName || 'Document'}
                          </div>
                          <div className="document-item__uploaded-date">
                            Uploaded{' '}
                            {uploadedDoc?.uploadedAt
                              ? new Date(uploadedDoc.uploadedAt).toLocaleDateString()
                              : doc.uploadedAt
                                ? new Date(doc.uploadedAt).toLocaleDateString()
                                : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() => handleDelete(doc.localDocumentId!)}
                        disabled={uploading}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="document-item__upload">
                      <input
                        type="file"
                        id={`file-${doc.dynamicsId}`}
                        accept={
                          Array.isArray(doc.acceptedFormats)
                            ? doc.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',')
                            : doc.acceptedFormats || '.pdf,.jpg,.jpeg,.png'
                        }
                        onChange={(e) => handleFileSelect(`${doc.dynamicsId}|${doc.description}`, e.target.files?.[0] || null)}
                        disabled={uploading}
                      />
                      <label htmlFor={`file-${doc.dynamicsId}`} className="file-input-label">
                        {selectedFiles.has(`${doc.dynamicsId}|${doc.description}`)
                          ? selectedFiles.get(`${doc.dynamicsId}|${doc.description}`)?.name
                          : 'Choose File'}
                      </label>
                      {doc.maxSize && (
                        <span className="file-size-hint">Max size: {doc.maxSize}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="document-upload__actions">
            <button
              type="button"
              onClick={() => regularNavigate(-1)}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-primary"
              disabled={isUploadButtonDisabled()}
            >
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Rejection Reasons Modal */}
      {showReasonsModal && (
        <div className="modal-overlay" onClick={() => setShowReasonsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rejection Reasons</h2>
              <button className="modal-close" onClick={() => setShowReasonsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {rejectedDocs.length === 0 ? (
                <p>No rejected documents.</p>
              ) : (
                <div className="rejection-list">
                  {rejectedDocs.map((doc) => (
                    <div key={doc.dynamicsId} className="rejection-item">
                      <h4>{doc.description}</h4>
                      <p><strong>Status:</strong> {doc.localStatus}</p>
                      <p><strong>Reason:</strong> {doc.reason || 'No reason provided'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowReasonsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
