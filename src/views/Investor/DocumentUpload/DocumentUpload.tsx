import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { investorService, type KycDocumentRequirementDto, type RequiredDocument, type InvestorDashboardDto, type DocumentResponseDto } from '../../../services/investor.service';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import './DocumentUpload.scss';

export const DocumentUpload: React.FC = () => {
  const regularNavigate = useNavigate();
  
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [requirements, setRequirements] = useState<KycDocumentRequirementDto | null>(null);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReasonsModal, setShowReasonsModal] = useState(false);

  const handlePreview = (documentId: number, documentUrl?: string) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      window.open(`/api/clients/me/documents/${documentId}/download`, '_blank');
    }
  };

  const handlePreviewClick = (localDocumentId?: number, documentUrl?: string) => {
    if (!localDocumentId) {
      toast.warning('Please upload a document first to preview');
      return;
    }
    handlePreview(localDocumentId, documentUrl);
  };

  const handleDeleteClick = (localDocumentId?: number) => {
    if (!localDocumentId) {
      toast.warning('No document uploaded to delete');
      return;
    }
    handleDelete(localDocumentId);
  };

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

  const getStatusBadge = (status: string, dynamicsId?: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className="status-badge status-approved">
            <i className="bi bi-check-circle-fill" />
            Approved
          </span>
        );
      case 'rejected':
      case 'sent back':
        return (
          <span className="status-badge status-rejected">
            <i className="bi bi-x-circle-fill" />
            Rejected
          </span>
        );
      case 'pending':
      case 'under review':
        return (
          <span className="status-badge status-pending">
            <i className="bi bi-clock-fill" />
            Pending
          </span>
        );
      default:
        if (dynamicsId) {
          return (
            <label 
              htmlFor={`file-${dynamicsId}`} 
              className="status-badge status-not-uploaded"
              title="Click to choose and upload file"
            >
              <i className="bi bi-cloud-arrow-up-fill" />
              Not Uploaded
            </label>
          );
        }
        return (
          <span className="status-badge status-not-uploaded">
            <i className="bi bi-cloud-arrow-up-fill" />
            Not Uploaded
          </span>
        );
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
        <main className="container-fluid dashboard-container-main">
          <div className="loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Loading KYC document requirements...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className="facilon-dashboard-wrapper">
        <main className="container-fluid dashboard-container-main">
          <div className="error-container">
            <p>Failed to load document requirements. Please try again later.</p>
            <button onClick={loadData} className="btn-retry">Retry</button>
          </div>
        </main>
      </div>
    );
  }

  const rejectedDocs = getRejectedDocuments();

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">
          {renderProgressBar()}

          <div className="investor-profile__card document-upload">
            {requirements.serviceProviderName && (
              <p className="document-upload__service-provider">Service Provider: <strong>{requirements.serviceProviderName}</strong></p>
            )}

            <div className="document-list">
              <div className="document-list__header-row">
                <h2>Required Documents</h2>

                <div className="progress-summary-compact">
                  <span className="stat-pill">
                    Uploaded: <strong>{requirements.uploaded}/{requirements.totalRequired}</strong>
                  </span>
                  <span className="stat-pill stat-approved">
                    Approved: <strong>{requirements.approved}</strong>
                  </span>
                  <span className="stat-pill stat-rejected">
                    Rejected: <strong>{requirements.rejected}</strong>
                  </span>
                  <span className="stat-pill stat-percentage">
                    {requirements.completionPercentage}% Complete
                  </span>
                  {rejectedDocs.length > 0 && (
                    <button 
                      className="btn-see-reasons-compact" 
                      onClick={() => setShowReasonsModal(true)}
                    >
                      <i className="bi bi-exclamation-triangle-fill" />
                      Reasons
                    </button>
                  )}
                </div>
              </div>

              <p className="document-list__subtitle">
                Please upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG (Max size: 10MB)
              </p>

              <div className="document-table-container">
                <table className="document-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Required Document</th>
                      <th style={{ width: '15%' }}>Status</th>
                      <th style={{ width: '30%' }}>Uploaded File / Upload Tool</th>
                      <th style={{ width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.documents.map((doc) => {
                      const isUploaded = doc.localRecordExists || (doc.localStatus && doc.localStatus.toLowerCase() !== 'not uploaded');
                      const isRejected = doc.localStatus?.toLowerCase() === 'rejected' || doc.localStatus?.toLowerCase() === 'sent back';
                      const uploadedDoc = doc.localDocumentId ? documents.find((d) => d.id === doc.localDocumentId) : null;
                      const hasSelectedFile = selectedFiles.has(`${doc.dynamicsId}|${doc.description}`);

                      return (
                        <tr key={doc.dynamicsId}>
                          <td>
                            <div className="table-document-info">
                              <div className="table-document-name">{doc.description}</div>
                              {isRejected && doc.reason && (
                                <div className="document-item__reason">
                                  <strong>Rejection Reason:</strong> {doc.reason}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(doc.localStatus || 'not uploaded', doc.dynamicsId)}
                          </td>
                          <td>
                            {isUploaded && doc.localDocumentId ? (
                              <div className="table-file-uploaded">
                                <i className="bi bi-file-earmark-check-fill table-file-uploaded__icon" />
                                <div>
                                  <div className="table-file-uploaded__name" title={uploadedDoc?.fileName || doc.fileName || 'Document'}>
                                    {uploadedDoc?.fileName || doc.fileName || 'Document'}
                                  </div>
                                  <div className="table-file-uploaded__date">
                                    Uploaded{' '}
                                    {uploadedDoc?.uploadedAt
                                      ? new Date(uploadedDoc.uploadedAt).toLocaleDateString()
                                      : doc.uploadedAt
                                        ? new Date(doc.uploadedAt).toLocaleDateString()
                                        : ''}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="table-file-upload">
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
                                <div className="file-upload-wrapper">
                                  <label htmlFor={`file-${doc.dynamicsId}`} className={`file-input-label-custom ${hasSelectedFile ? 'file-selected' : ''}`}>
                                    <i className="bi bi-file-earmark-arrow-up me-2" />
                                    {hasSelectedFile
                                      ? selectedFiles.get(`${doc.dynamicsId}|${doc.description}`)?.name
                                      : 'Choose File'}
                                  </label>
                                  {doc.maxSize && (
                                    <span className="file-size-hint">Max size: {doc.maxSize}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="btn-action-icon text-primary"
                                onClick={() => handlePreviewClick(doc.localDocumentId, uploadedDoc?.documentUrl)}
                                title="Preview Document"
                              >
                                <i className="bi bi-eye-fill" />
                              </button>
                              <button
                                type="button"
                                className="btn-action-icon text-danger"
                                onClick={() => handleDeleteClick(doc.localDocumentId)}
                                title="Delete Document"
                              >
                                <i className="bi bi-trash3-fill" />
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

            <div className="document-upload__actions">
              <button
                type="button"
                onClick={() => regularNavigate(-1)}
                className="btn-outline-primary"
                disabled={uploading}
              >
                <i className="bi bi-x-circle me-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="btn-save"
                disabled={isUploadButtonDisabled()}
              >
                <i className="bi bi-cloud-upload me-2" />
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </button>
            </div>
          </div>
        </div>
      </main>

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
