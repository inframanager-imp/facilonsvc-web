import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './PublicDocumentSubmission.scss';

interface RequiredDocument {
  dynamicsId: string;
  description: string;
  documentTypeCode: string;
  mandatory: boolean;
  localRecordExists: boolean;
  localStatus: string | null;
  reason: string | null;
  localDocumentId: number | null;
  fileName: string | null;
  documentUrl: string | null;
  uploadedAt: string | null;
  inputId: string;
  spanId: string;
  errorId: string;
  fileInputName: string;
  acceptedFormats: string[];
  maxSize: string;
}

interface DocumentRequirements {
  totalRequired: number;
  uploaded: number;
  approved: number;
  rejected: number;
  pending: number;
  completionPercentage: number;
  serviceProviderName: string;
  documents: RequiredDocument[];
}

interface SubmissionData {
  success: boolean;
  uniqueCode: string;
  requirements: DocumentRequirements;
}

export const PublicDocumentSubmission: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSubmissionData();
    }
  }, [token]);

  const loadSubmissionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:8082/facilon/api/clients/documents/submission/${token}`
      );

      if (response.data.success) {
        setSubmissionData(response.data);
      } else {
        setError(response.data.error || 'Failed to load document submission data');
      }
    } catch (err: any) {
      console.error('Error loading submission data:', err);
      setError(err.response?.data?.error || 'Invalid or expired submission link');
      toast.error('Failed to load document submission page');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (documentType: string, file: File | null) => {
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

      newSelectedFiles.set(documentType, file);
      toast.info(`${documentType} selected. Click "Upload Selected Documents" to submit.`);
    } else {
      newSelectedFiles.delete(documentType);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.size === 0) {
      toast.warning('Please select at least one document to upload');
      return;
    }

    if (!token) {
      toast.error('Invalid submission token');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [documentType, file] of Array.from(selectedFiles.entries())) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);

        await axios.post(
          `http://localhost:8082/facilon/api/clients/documents/submission/${token}/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        successCount++;
      } catch (error: any) {
        console.error(`Error uploading ${documentType}:`, error);
        toast.error(error.response?.data?.error || `Failed to upload ${documentType}`);
        errorCount++;
      }
    }

    setUploading(false);
    setSelectedFiles(new Map());

    if (successCount > 0) {
      toast.success(`${successCount} document(s) uploaded successfully`);
      await loadSubmissionData(); // Reload to get updated status
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} document(s)`);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="badge badge-secondary">Not Uploaded</span>;
    
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="badge badge-success">✓ Approved</span>;
      case 'rejected':
      case 'sent back':
        return <span className="badge badge-danger">✗ Rejected</span>;
      case 'pending':
      case 'submitted':
      case 'under review':
        return <span className="badge badge-warning">⏱ Pending</span>;
      default:
        return <span className="badge badge-secondary">Not Uploaded</span>;
    }
  };

  if (loading) {
    return (
      <div className="public-document-submission">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading document submission...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-document-submission">
        <div className="container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Unable to Load Document Submission</h2>
            <p>{error}</p>
            <p className="help-text">
              Please contact support if you believe this is an error or if your link has expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return null;
  }

  const requirements = submissionData.requirements;

  return (
    <div className="public-document-submission">
      <div className="container">
        <div className="submission-header">
          <h1>Document Submission Portal</h1>
          <p className="subtitle">Upload your required KYC documents</p>
          <p className="investor-code">Investor ID: <strong>{submissionData.uniqueCode}</strong></p>
        </div>

        <div className="progress-summary">
          <div className="stat-card">
            <div className="stat-value">{requirements.totalRequired}</div>
            <div className="stat-label">Total Required</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{requirements.uploaded}</div>
            <div className="stat-label">Uploaded</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{requirements.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{requirements.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(requirements.completionPercentage)}%</div>
            <div className="stat-label">Completion</div>
          </div>
        </div>

        <div className="documents-list">
          <h2>Required Documents</h2>
          
          {requirements.documents.map((doc) => (
            <div key={doc.dynamicsId} className="document-card">
              <div className="document-header">
                <div className="document-info">
                  <h3>
                    {doc.description}
                    {doc.mandatory && <span className="mandatory-badge">*</span>}
                  </h3>
                  <p className="document-meta">
                    Accepted: {doc.acceptedFormats.join(', ')} | Max Size: {doc.maxSize}
                  </p>
                </div>
                <div className="document-status">
                  {getStatusBadge(doc.localStatus)}
                </div>
              </div>

              {doc.localRecordExists && (
                <div className="uploaded-info">
                  <p className="file-name">📎 {doc.fileName}</p>
                  {doc.uploadedAt && (
                    <p className="upload-time">Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                  )}
                  {doc.reason && (
                    <div className="rejection-reason">
                      <strong>Reason:</strong> {doc.reason}
                    </div>
                  )}
                </div>
              )}

              <div className="document-actions">
                <input
                  type="file"
                  id={doc.inputId}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(doc.description, e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                <label htmlFor={doc.inputId} className="file-select-btn">
                  Choose File
                </label>
                {selectedFiles.has(doc.description) && (
                  <span className="selected-file-name">
                    {selectedFiles.get(doc.description)?.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedFiles.size > 0 && (
          <div className="upload-actions">
            <button
              className="btn-upload-all"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.size} Document(s)`}
            </button>
            <button
              className="btn-clear"
              onClick={() => setSelectedFiles(new Map())}
              disabled={uploading}
            >
              Clear Selection
            </button>
          </div>
        )}

        <div className="help-section">
          <h3>Need Help?</h3>
          <p>If you have any questions or issues uploading your documents, please contact support at:</p>
          <p><strong>Email:</strong> support@facilonservices.com</p>
        </div>
      </div>
    </div>
  );
};

export default PublicDocumentSubmission;
