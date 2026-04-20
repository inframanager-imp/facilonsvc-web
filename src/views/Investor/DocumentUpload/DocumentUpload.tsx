import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, type KycDocumentRequirementDto, type RequiredDocument, type InvestorDashboardDto, type DocumentResponseDto } from '../../../services/investor.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
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
    return <PremiumJourneyStepper dashboardData={dashboardData} />;
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
      <div className="facilon-dashboard-wrapper">
        {!isProxyMode && <Header />}
        <main className="container-fluid dashboard-container-main">
          <div className="loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Loading KYC document requirements...</p>
          </div>
        </main>
        {!isProxyMode && <Footer />}
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className="facilon-dashboard-wrapper">
        {!isProxyMode && <Header />}
        <main className="container-fluid dashboard-container-main">
          <div className="error-container">
            <p>Failed to load document requirements. Please try again later.</p>
            <button onClick={loadData} className="btn-retry">Retry</button>
          </div>
        </main>
        {!isProxyMode && <Footer />}
      </div>
    );
  }

  const rejectedDocs = getRejectedDocuments();

  return (
    <div className="facilon-dashboard-wrapper">
      {!isProxyMode && <Header />}
      <main className="container-fluid dashboard-container-main">
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
                      <label htmlFor={`file-${doc.dynamicsId}`} className="btn btn-outline-primary file-input-label-custom">
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
    </main>
      {!isProxyMode && <Footer />}

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
