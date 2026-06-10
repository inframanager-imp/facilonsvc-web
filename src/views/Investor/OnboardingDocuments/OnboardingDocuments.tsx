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
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile px-3 px-md-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2 shadow-sm">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex flex-col md:flex-row justify-between items-center text-white gap-3 md:gap-6">
              <div className="flex-shrink-0">
                <h2 className="m-0 text-base font-bold text-white tracking-tight">Onboarding Documents</h2>
                {requirements?.serviceProviderName && (
                  <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">
                    Service Provider: <strong>{getServiceProviderDisplayName()}</strong>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <PremiumJourneyStepper dashboardData={dashboardData} compact={true} />
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 bg-white">

            {/* Instruction Banner */}
            <div className="mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <div className="flex items-center gap-1.5 mb-1.5 text-[#3e6f7c] font-bold">
                <i className="bi bi-info-circle-fill" />
                <span>Onboarding Documents Process</span>
              </div>
              <ul className="list-disc ps-4 space-y-0.5">
                <li><strong>Download Templates:</strong> Use the "Download Template" links to get templates for documents such as the Account Opening Booklet.</li>
                <li><strong>Fill & Sign:</strong> Review carefully for accuracy, fill in any missing details, and sign.</li>
                <li><strong>Upload Soft Copy:</strong> Upload clear, self-attested soft copies through this platform.</li>
                <li><strong>Retain Physical Copies:</strong> Keep signed physical documents safe; some may need to be couriered or submitted in person later.</li>
              </ul>
            </div>

            {/* Document Upload Section */}
            {requirements && (
              <div className="flex flex-col gap-0">
                {!kycComplete && (
                  <div className="alert alert-warning mb-3 py-2 px-3 flex items-center justify-between flex-wrap gap-2 rounded-lg text-[11px] border border-amber-200 bg-amber-50 text-amber-800">
                    <span className="flex items-center gap-2">
                      <strong>⚠️ KYC Verification Required First!</strong>
                      <span>Please upload all KYC documents before uploading onboarding forms.</span>
                    </span>
                    <button className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer" onClick={() => navigate('/investor/documents')}>
                      Go to KYC Documents
                    </button>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 pt-1">
                  <span className="text-[12px] font-medium text-slate-500">
                    Please provide completed and signed copies of the requested onboarding files. Accepted formats: PDF, JPG, PNG (Max size: 10MB)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      Uploaded: <strong className="ms-1">{requirements.uploaded}/{requirements.totalRequired}</strong>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      {requirements.totalRequired > 0
                        ? Math.round((requirements.uploaded / requirements.totalRequired) * 100)
                        : 0}% Complete
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto w-full border-t border-[#e2e8f0]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#e2e8f0] bg-slate-50/50">
                        <th className="pb-3.5 px-2 py-3" style={{ width: '45%' }}>Required Document</th>
                        <th className="pb-3.5 px-2 py-3" style={{ width: '15%' }}>Status</th>
                        <th className="pb-3.5 px-2 py-3" style={{ width: '30%' }}>Uploaded File / Upload Tool</th>
                        <th className="pb-3.5 px-2 py-3 text-right" style={{ width: '10%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {[...requirements.documents]
                        .sort((a, b) => a.description.localeCompare(b.description))
                        .map((doc, index) => {
                          const selectedFile = selectedFiles.get(doc.description);
                          const isUploaded = doc.localRecordExists;
                          const isUploading = uploadingFile === doc.description;

                          return (
                            <tr key={doc.dynamicsId || index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-2 text-[12px] align-middle">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700">
                                    {doc.description}
                                    {isAccountOpeningBooklet(doc) && (
                                      <a
                                        href="#"
                                        onClick={handleDownloadAccountOpeningBooklet}
                                        className="text-[#3e6f7c] ms-2 hover:underline font-semibold text-[10.5px]"
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
                                        className="text-[#3e6f7c] ms-2 hover:underline font-semibold text-[10.5px]"
                                        title="Download Master Template"
                                      >
                                        <i className="bi bi-download me-1" />
                                        Download Template
                                      </a>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2 text-[12px] align-middle">
                                {isUploaded ? (
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20">
                                    <i className="bi bi-check-circle-fill" />
                                    {doc.localStatus || 'Uploaded'}
                                  </span>
                                ) : (
                                  <label
                                    htmlFor={`doc_${index}`}
                                    className="inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#f1f5f9] text-[#64748b] border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                                    title="Click to choose and upload file"
                                  >
                                    <i className="bi bi-cloud-arrow-up-fill" />
                                    Not Uploaded
                                  </label>
                                )}
                              </td>
                              <td className="p-2 text-[12px] align-middle">
                                {isUploaded ? (
                                  <div className="flex items-center gap-2 text-slate-700">
                                    <i className="bi bi-file-earmark-check-fill text-[#10b981] text-lg flex-shrink-0" />
                                    <div>
                                      <div className="text-[11.5px] font-semibold text-slate-800 truncate max-w-[200px]" title={doc.fileName || 'Document'}>
                                        {doc.fileName || 'Onboarding Document'}
                                      </div>
                                      {doc.uploadedAt && (
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    <input
                                      type="file"
                                      id={`doc_${index}`}
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleFileSelect(e, doc.description, doc.dynamicsId)}
                                      disabled={!kycComplete || isUploading}
                                      className="hidden"
                                    />
                                    <div className="flex items-center gap-2">
                                      <label
                                        htmlFor={`doc_${index}`}
                                        className={`inline-flex items-center text-[10px] font-bold h-[26px] px-2 rounded transition-all shadow-sm
                                          ${!kycComplete 
                                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                            : selectedFile
                                              ? 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/20 hover:bg-[#10b981]/10 cursor-pointer'
                                              : 'bg-[#eff6ff] text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 cursor-pointer'
                                          }
                                        `}
                                      >
                                        <i className="bi bi-file-earmark-arrow-up me-1.5" />
                                        {selectedFile ? selectedFile.fileName : 'Choose File'}
                                      </label>
                                      <span className="text-[10px] text-slate-400 font-normal">Max size: 10MB</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 text-[12px] align-middle text-right">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-[28px] h-[28px] bg-transparent border border-gray-200 hover:border-[#3e6f7c] hover:bg-[#3e6f7c]/5 text-[#3e6f7c] rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-3 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center text-[11px] font-bold h-[32px] px-3.5 rounded-md border border-gray-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-circle me-1.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchSubmit}
                className="inline-flex items-center justify-center bg-[#3e6f7c] hover:bg-[#355f69] text-white text-[11px] font-bold h-[32px] px-3.5 rounded-md border-0 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploadingFile === 'batch' || selectedFiles.size === 0 || !kycComplete}
              >
                <i className="bi bi-cloud-upload me-1.5" />
                {uploadingFile === 'batch' ? 'Uploading...' : 'Submit Documents'}
              </button>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};
