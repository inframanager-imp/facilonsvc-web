import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  adminDocumentService,
  DocumentStats,
} from '../../../services/admin-document.service';
import { DocumentDto, DOCUMENT_TYPE_LABELS, documentService } from '../../../services/document.service';
import './DocumentVerification.scss';

export const DocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [stats, setStats] = useState<DocumentStats>({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [investorFilter, setInvestorFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter, investorFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, statistics] = await Promise.all([
        adminDocumentService.getAllDocuments(
          statusFilter === 'ALL' ? undefined : statusFilter,
          typeFilter === 'ALL' ? undefined : typeFilter,
          investorFilter || undefined
        ),
        adminDocumentService.getStats(),
      ]);
      setDocuments(docs);
      setStats(statistics);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (doc: DocumentDto) => {
    setSelectedDocument(doc);
    setShowModal(true);
    setActionType(null);
    setRemarks('');
  };

  const handleDownload = async (doc: DocumentDto) => {
    try {
      const blob = await adminDocumentService.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Document downloaded');
    } catch (err: any) {
      toast.error('Download failed');
    }
  };

  const handleVerify = () => {
    setActionType('verify');
    setRemarks('');
  };

  const handleReject = () => {
    setActionType('reject');
    setRemarks('');
  };

  const handleConfirmAction = async () => {
    if (!selectedDocument || !actionType) return;

    if (actionType === 'reject' && !remarks.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      if (actionType === 'verify') {
        await adminDocumentService.verifyDocument(selectedDocument.id, remarks || undefined);
        toast.success('Document verified successfully');
      } else {
        await adminDocumentService.rejectDocument(selectedDocument.id, remarks);
        toast.success('Document rejected');
      }
      setShowModal(false);
      setSelectedDocument(null);
      setActionType(null);
      setRemarks('');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'UPLOADED':
        return 'status-badge status-badge--warning';
      case 'VERIFIED':
        return 'status-badge status-badge--success';
      case 'REJECTED':
        return 'status-badge status-badge--danger';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="admin-documents">
            <div className="loading">Loading documents...</div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="admin-documents">
          <h1>Document Verification</h1>
          <p className="admin-documents__subtitle">
            Review and verify investor documents
          </p>

          {/* Stats Cards */}
          <div className="admin-documents__stats">
            <div className="stat-card">
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">Total Documents</div>
            </div>
            <div className="stat-card stat-card--warning">
              <div className="stat-card__value">{stats.pending}</div>
              <div className="stat-card__label">Pending Review</div>
            </div>
            <div className="stat-card stat-card--success">
              <div className="stat-card__value">{stats.verified}</div>
              <div className="stat-card__label">Verified</div>
            </div>
            <div className="stat-card stat-card--danger">
              <div className="stat-card__value">{stats.rejected}</div>
              <div className="stat-card__label">Rejected</div>
            </div>
          </div>

          {/* Filters */}
          <div className="admin-documents__card">
            <h2>Filters</h2>
            <div className="filters">
              <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="UPLOADED">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Document Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="ALL">All Types</option>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Investor Code</label>
                <input
                  type="text"
                  placeholder="Search by investor code..."
                  value={investorFilter}
                  onChange={(e) => setInvestorFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="admin-documents__card">
            <h2>Documents ({documents.length})</h2>
            {documents.length === 0 ? (
              <div className="empty-state">
                <p>No documents found</p>
              </div>
            ) : (
              <div className="documents-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Investor</th>
                      <th>Type</th>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td className="investor-cell">{doc.uploadedBy}</td>
                        <td>{DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}</td>
                        <td className="filename-cell">{doc.originalFileName}</td>
                        <td>{documentService.formatFileSize(doc.fileSize)}</td>
                        <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                        <td>
                          <span className={getStatusBadgeClass(doc.status)}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-action btn-action--primary"
                            onClick={() => handleViewDocument(doc)}
                            title="View & Verify"
                          >
                            👁️
                          </button>
                          <button
                            className="btn-action btn-action--secondary"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                          >
                            ⬇️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal for Document Verification */}
          {showModal && selectedDocument && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Document Details</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="document-details">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{selectedDocument.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Investor Code:</span>
                      <span className="detail-value">{selectedDocument.uploadedBy}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Document Type:</span>
                      <span className="detail-value">
                        {DOCUMENT_TYPE_LABELS[selectedDocument.documentType]}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">File Name:</span>
                      <span className="detail-value">{selectedDocument.originalFileName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">File Size:</span>
                      <span className="detail-value">
                        {documentService.formatFileSize(selectedDocument.fileSize)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Upload Date:</span>
                      <span className="detail-value">
                        {new Date(selectedDocument.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={getStatusBadgeClass(selectedDocument.status)}>
                        {selectedDocument.status}
                      </span>
                    </div>
                    {selectedDocument.verifiedBy && (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Verified By:</span>
                          <span className="detail-value">{selectedDocument.verifiedBy}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Verified At:</span>
                          <span className="detail-value">
                            {new Date(selectedDocument.verifiedAt!).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    {selectedDocument.remarks && (
                      <div className="detail-row detail-row--full">
                        <span className="detail-label">Remarks:</span>
                        <span className="detail-value remarks">{selectedDocument.remarks}</span>
                      </div>
                    )}
                  </div>

                  {actionType && (
                    <div className="action-form">
                      <h3>
                        {actionType === 'verify' ? 'Verify Document' : 'Reject Document'}
                      </h3>
                      <textarea
                        placeholder={
                          actionType === 'verify'
                            ? 'Add remarks (optional)'
                            : 'Reason for rejection (required)'
                        }
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {!actionType ? (
                    <>
                      <button
                        className="btn-modal btn-modal--download"
                        onClick={() => handleDownload(selectedDocument)}
                      >
                        Download Document
                      </button>
                      {selectedDocument.status === 'UPLOADED' && (
                        <>
                          <button
                            className="btn-modal btn-modal--success"
                            onClick={handleVerify}
                          >
                            ✓ Verify
                          </button>
                          <button
                            className="btn-modal btn-modal--danger"
                            onClick={handleReject}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                      <button
                        className="btn-modal btn-modal--secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-modal btn-modal--secondary"
                        onClick={() => {
                          setActionType(null);
                          setRemarks('');
                        }}
                        disabled={processing}
                      >
                        Cancel
                      </button>
                      <button
                        className={`btn-modal ${
                          actionType === 'verify' ? 'btn-modal--success' : 'btn-modal--danger'
                        }`}
                        onClick={handleConfirmAction}
                        disabled={processing}
                      >
                        {processing
                          ? 'Processing...'
                          : actionType === 'verify'
                          ? 'Confirm Verification'
                          : 'Confirm Rejection'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};
