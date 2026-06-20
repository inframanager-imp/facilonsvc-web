import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { investorService, type KycDocumentRequirementDto, type RequiredDocument, type InvestorDashboardDto, type DocumentResponseDto } from '../../../services/investor.service';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi';
import { BsEyeFill } from 'react-icons/bs';
import '../InvestorProfile/InvestorProfile.scss';
import './DocumentUpload.scss';

const ChevronLeftIcon = FiChevronLeft as any;
const TrashIcon = FiTrash2 as any;
const EyeIcon = BsEyeFill as any;

export const DocumentUpload: React.FC = () => {
  const regularNavigate = useNavigate();
  const { pathname } = useLocation();

  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [requirements, setRequirements] = useState<KycDocumentRequirementDto | null>(null);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReasonsModal, setShowReasonsModal] = useState(false);

  const handlePreview = async (documentId: number, documentUrl?: string) => {
    // A real http(s) URL (e.g. a SharePoint web link) can be opened directly.
    if (documentUrl && /^https?:\/\//i.test(documentUrl)) {
      window.open(documentUrl, '_blank');
      return;
    }
    // Otherwise the stored ref is a non-openable scheme (azureblob:// / sharepoint://
    // / item id), so stream the bytes via the authenticated endpoint and open a blob URL.
    try {
      const blob = await investorService.downloadDocument(documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      toast.error('Unable to open document');
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
    const baseClass = "inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider";
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className={`${baseClass} bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20`}>
            <i className="bi bi-check-circle-fill" />
            Approved
          </span>
        );
      case 'rejected':
      case 'sent back':
        return (
          <span className={`${baseClass} bg-[#fef2f2] text-[#ef4444] border border-[#ef4444]/20`}>
            <i className="bi bi-x-circle-fill" />
            Rejected
          </span>
        );
      case 'pending':
      case 'under review':
        return (
          <span className={`${baseClass} bg-[#fff8f0] text-[#f59e0b] border border-[#f59e0b]/20`}>
            <i className="bi bi-clock-fill" />
            Pending
          </span>
        );
      default:
        if (dynamicsId) {
          return (
            <label
              htmlFor={`file-${dynamicsId}`}
              className={`${baseClass} bg-[#f1f5f9] text-[#64748b] border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors`}
              title="Click to choose and upload file"
            >
              <i className="bi bi-cloud-arrow-up-fill" />
              Not Uploaded
            </label>
          );
        }
        return (
          <span className={`${baseClass} bg-[#f1f5f9] text-[#64748b] border border-slate-200`}>
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
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile px-3 px-md-0 pb-0">

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2 shadow-sm">
            {/* Blue Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex flex-col md:flex-row justify-between items-center text-white gap-3 md:gap-6">
              <div className="flex-shrink-0">
                <h2 className="m-0 text-base font-bold text-white tracking-tight">KYC Documents</h2>
                {requirements.serviceProviderName && (
                  <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">
                    Service Provider: <strong>{requirements.serviceProviderName}</strong>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <PremiumJourneyStepper dashboardData={dashboardData} compact={true} />
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 bg-white">
              <div className="bg-transparent border-0 rounded-none mb-0 pt-2.5 p-0 bg-white">
                <div className="flex flex-col gap-0">

                  {/* Progress and Requirements Summary */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2">
                    <span className="text-[12px] font-medium text-slate-500">
                      Please upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG (Max size: 10MB)
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        Uploaded: <strong className="ms-1">{requirements.uploaded}/{requirements.totalRequired}</strong>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20">
                        Approved: <strong className="ms-1">{requirements.approved}</strong>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#fef2f2] text-[#ef4444] border border-[#ef4444]/20">
                        Rejected: <strong className="ms-1">{requirements.rejected}</strong>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                        {requirements.completionPercentage}% Complete
                      </span>
                      {rejectedDocs.length > 0 && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                          onClick={() => setShowReasonsModal(true)}
                        >
                          <i className="bi bi-exclamation-triangle-fill" />
                          Reasons
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto w-full border-t border-[#e2e8f0]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0] bg-slate-50/50">
                          <th className="pb-3.5 px-2 py-3" style={{ width: '40%' }}>Required Document</th>
                          <th className="pb-3.5 px-2 py-3" style={{ width: '15%' }}>Status</th>
                          <th className="pb-3.5 px-2 py-3" style={{ width: '35%' }}>Uploaded File / Upload Tool</th>
                          <th className="pb-3.5 px-2 py-3 text-right" style={{ width: '10%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {requirements.documents.map((doc) => {
                          const isUploaded = doc.localRecordExists || (doc.localStatus && doc.localStatus.toLowerCase() !== 'not uploaded');
                          const isRejected = doc.localStatus?.toLowerCase() === 'rejected' || doc.localStatus?.toLowerCase() === 'sent back';
                          const uploadedDoc = doc.localDocumentId ? documents.find((d) => d.id === doc.localDocumentId) : null;
                          const hasSelectedFile = selectedFiles.has(`${doc.dynamicsId}|${doc.description}`);

                          return (
                            <tr key={doc.dynamicsId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-2 text-[12px] align-middle">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700">{doc.description}</span>
                                  {isRejected && doc.reason && (
                                    <div className="text-[10.5px] text-red-600 bg-red-50/50 border border-red-100 rounded px-1.5 py-0.5 mt-1 max-w-fit font-medium">
                                      <strong>Rejection Reason:</strong> {doc.reason}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 text-[12px] align-middle">
                                {getStatusBadge(doc.localStatus || 'not uploaded', doc.dynamicsId)}
                              </td>
                              <td className="p-2 text-[12px] align-middle">
                                {isUploaded && doc.localDocumentId ? (
                                  <div className="flex items-center gap-2 text-slate-700">
                                    <i className="bi bi-file-earmark-check-fill text-success-500 text-lg flex-shrink-0" />
                                    <div>
                                      <div className="text-[11.5px] font-semibold text-slate-800 truncate max-w-[200px]" title={uploadedDoc?.fileName || doc.fileName || 'Document'}>
                                        {uploadedDoc?.fileName || doc.fileName || 'Document'}
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">
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
                                  <div className="flex flex-col gap-1">
                                    <input
                                      type="file"
                                      id={`file-${doc.dynamicsId}`}
                                      className="hidden"
                                      accept={
                                        Array.isArray(doc.acceptedFormats)
                                          ? doc.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',')
                                          : doc.acceptedFormats || '.pdf,.jpg,.jpeg,.png'
                                      }
                                      onChange={(e) => handleFileSelect(`${doc.dynamicsId}|${doc.description}`, e.target.files?.[0] || null)}
                                      disabled={uploading}
                                    />
                                    <div className="flex items-center gap-2">
                                      <label
                                        htmlFor={`file-${doc.dynamicsId}`}
                                        className={`inline-flex items-center text-[10px] font-bold h-[26px] px-2 rounded transition-all cursor-pointer shadow-sm
                                          ${hasSelectedFile
                                            ? 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20 hover:bg-[#10b981]/10'
                                            : 'bg-[#eff6ff] text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10'
                                          }
                                        `}
                                      >
                                        <i className="bi bi-file-earmark-arrow-up me-1.5" />
                                        {hasSelectedFile
                                          ? selectedFiles.get(`${doc.dynamicsId}|${doc.description}`)?.name
                                          : 'Choose File'}
                                      </label>
                                      {doc.maxSize && (
                                        <span className="text-[10px] text-slate-400 font-normal">Max size: {doc.maxSize}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 text-[12px] align-middle text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-preview-${doc.dynamicsId}`} className="text-[10px]">Preview Document</Tooltip>}
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-[28px] h-[28px] bg-transparent border border-gray-200 hover:border-[#3e6f7c] hover:bg-[#3e6f7c]/5 text-[#3e6f7c] rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                      onClick={() => handlePreviewClick(doc.localDocumentId, uploadedDoc?.documentUrl)}
                                      disabled={!doc.localDocumentId}
                                    >
                                      <EyeIcon size={12} className="flex-shrink-0" />
                                    </button>
                                  </OverlayTrigger>

                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-delete-${doc.dynamicsId}`} className="text-[10px]">Delete Document</Tooltip>}
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-[28px] h-[28px] bg-transparent border border-gray-200 hover:border-red-600 hover:bg-red-50 text-red-600 rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                      onClick={() => handleDeleteClick(doc.localDocumentId)}
                                      disabled={!doc.localDocumentId || uploading}
                                    >
                                      <TrashIcon size={12} className="flex-shrink-0" />
                                    </button>
                                  </OverlayTrigger>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-center gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => regularNavigate(-1)}
                      className="inline-flex items-center justify-center text-[11px] font-bold h-[32px] px-3.5 rounded-md border border-gray-300 hover:bg-slate-50 transition-colors cursor-pointer"
                      disabled={uploading}
                    >
                      <i className="bi bi-x-circle me-1.5" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="inline-flex items-center justify-center bg-[#3e6f7c] hover:bg-[#355f69] text-white text-[11px] font-bold h-[32px] px-3.5 rounded-md border-0 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUploadButtonDisabled()}
                    >
                      <i className="bi bi-cloud-upload me-1.5" />
                      {uploading ? 'Uploading...' : 'Upload Documents'}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rejection Reasons Modal */}
      {showReasonsModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40" onClick={() => setShowReasonsModal(false)}>
          <div className="bg-white rounded-xl border border-gray-200 max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-md animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h2 className="m-0 text-[14px] font-bold text-slate-800">Rejection Reasons</h2>
              <button className="text-[20px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0 leading-none" onClick={() => setShowReasonsModal(false)}>×</button>
            </div>
            <div className="p-3">
              {rejectedDocs.length === 0 ? (
                <p className="text-[12px] text-slate-500 m-0">No rejected documents.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {rejectedDocs.map((doc) => (
                    <div key={doc.dynamicsId} className="border border-red-200 bg-red-50/50 p-2.5 rounded-lg text-[#991b1b]">
                      <h4 className="m-0 text-[12px] font-bold text-red-700">{doc.description}</h4>
                      <p className="m-0 mt-1 text-[11px]"><strong>Status:</strong> {doc.localStatus}</p>
                      <p className="m-0 mt-0.5 text-[11px]"><strong>Reason:</strong> {doc.reason || 'No reason provided'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center bg-[#3e6f7c] hover:bg-[#355f69] text-white text-[11px] font-bold h-[30px] px-3 rounded-md border-0 transition-colors cursor-pointer"
                onClick={() => setShowReasonsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
