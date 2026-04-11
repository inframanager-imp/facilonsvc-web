import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, KycDocumentRequirementDto } from '../../../services/investor.service';
import { pdfService } from '../../../services/pdf.service';
import './OnboardingDocuments.scss';

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
    if (!dashboardData) return null;

    const progress = dashboardData.progress;
    const accountSummary = dashboardData.accountSummary;

    const isCompleted = (key: string) => {
      return progress?.sections?.[key]?.completed || false;
    };

    const steps = [
      { 
        label: 'Submit Information', 
        route: '/investor/profile', 
        key: 'information',
        percent: isCompleted('personalInfo') ? '100%' : '50%',
        isComplete: isCompleted('personalInfo')
      },
      { 
        label: 'KYC Documents', 
        route: '/investor/documents', 
        key: 'documents',
        percent: accountSummary ? `${Math.min(100, Math.round((accountSummary.kycDocumentsUploaded / accountSummary.kycDocumentsRequired) * 100))}%` : '0%',
        isComplete: accountSummary ? accountSummary.kycDocumentsUploaded >= accountSummary.kycDocumentsRequired : false
      },
      { 
        label: 'Onboarding Forms', 
        route: '/investor/onboarding', 
        key: 'onboarding',
        percent: accountSummary ? `${Math.min(100, Math.round((accountSummary.onboardingDocumentsUploaded / accountSummary.onboardingDocumentsRequired) * 100))}%` : '0%',
        isComplete: accountSummary ? accountSummary.onboardingDocumentsUploaded >= accountSummary.onboardingDocumentsRequired : false
      },
      { 
        label: 'In-person Verification', 
        route: '/investor/verification', 
        key: 'verification',
        percent: accountSummary?.verificationDone ? '100%' : '0%',
        isComplete: accountSummary?.verificationDone || false
      },
      { 
        label: 'Physical Submission', 
        route: '/investor/physical-submission', 
        key: 'physical',
        percent: accountSummary?.physicalSubmissionDone ? '100%' : '0%',
        isComplete: accountSummary?.physicalSubmissionDone || false
      },
      { 
        label: 'Account Details', 
        route: '/investor/account-details', 
        key: 'account',
        percent: accountSummary?.accountOpeningStatus ? '100%' : '0%',
        isComplete: accountSummary?.accountOpeningStatus || false
      }
    ];

    return (
      <div className="onboarding__progress-section">
        <div className="container-fluid">
          <center>
            <strong>
              <h2 style={{ fontSize: '36px', color: '#be1717', fontWeight: 500, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                Your Journey
              </h2>
            </strong>
          </center>
          <div className="step-progress">
            {steps.map((step) => (
              <div
                key={step.key}
                className="step"
                onClick={() => navigate(step.route)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`circle-chart ${step.isComplete ? 'active-one' : ''}`}>
                  {step.isComplete ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    'Start'
                  )}
                </div>
                <p>{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="onboarding-documents">
            <div className="loading">Loading onboarding documents...</div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering OnboardingDocuments - requirements:', requirements, 'kycComplete:', kycComplete);

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="onboarding-documents">
          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Main Content */}
          <div className="section derivatives-wrap trading-sec-1" style={{ display: 'block', opacity: 1, visibility: 'visible' }}>
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="tab-content tabs onboarding-submission">
                    <div role="tabpanel" className="tab-pane active show" id="Section2" style={{ display: 'block', opacity: 1 }}>
                      <h2 className="onboarding-heading">Onboarding Documents Submission</h2>
                      <h2 className="text-center on-borad-subtitle-custom">
                        As Required by {getServiceProviderDisplayName()}
                      </h2>

                      {/* Instructional Accordion */}
                      <div className="tab-content tabs tab-content-main">
                        <div role="tabpanel" className="tab-pane active show" id="Section1" style={{ display: 'block', opacity: 1 }}>
                          <div className="accordion-menu">
                            <span style={{ marginTop: '-42px' }}>
                              <b style={{ margin: '40px 0 20px' }}>
                                This portal provides you with real-time visibility into your onboarding and account opening process.
                              </b>
                            </span>

                            <div className="row">
                              <div className="col-md-6">
                                <ul>
                                  <li>
                                    <input type="checkbox" checked readOnly />
                                    <i className="arrow"></i>
                                    <h2>
                                      <i className="fa-solid fa-circle"></i>
                                      Download
                                    </h2>
                                    <p>The document provided and review it carefully for accuracy.</p>
                                  </li>
                                  <li>
                                    <input type="checkbox" checked readOnly />
                                    <i className="arrow"></i>
                                    <h2>
                                      <i className="fa-solid fa-circle"></i>
                                      Fill in
                                    </h2>
                                    <p>Any missing or incomplete information.</p>
                                  </li>
                                  <li>
                                    <input type="checkbox" checked readOnly />
                                    <i className="arrow"></i>
                                    <h2>
                                      <i className="fa-solid fa-circle"></i>
                                      Upload
                                    </h2>
                                    <p>The completed and signed document as a soft copy through this platform.</p>
                                  </li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul>
                                  <li>
                                    <input type="checkbox" checked readOnly />
                                    <i className="arrow"></i>
                                    <h2>
                                      <i className="fa-solid fa-circle"></i>
                                      Retain Physical Copies
                                    </h2>
                                    <p>
                                      Once your soft copies are approved, we suggest that you retain the physical copies as you will be required to send the original documents either in person or by courier.
                                    </p>
                                  </li>
                                  <li>
                                    <input type="checkbox" checked readOnly />
                                    <i className="arrow"></i>
                                    <h2>
                                      <i className="fa-solid fa-circle"></i>
                                      Physical Submission Notice
                                    </h2>
                                    <p>
                                      Please note that some documents may need to be physically submitted—either in person or via courier—depending on the Service Provider's requirements.
                                    </p>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Document Upload Section */}
                          {requirements && (
                            <div className="onboarding-documents-section mt-4">
                              {!kycComplete && (
                                <div className="alert alert-warning" style={{ margin: '20px 55px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', padding: '15px' }}>
                                  <strong style={{ color: '#856404' }}>⚠️ Please complete KYC documents first!</strong>
                                  <p style={{ marginBottom: 10, color: '#856404' }}>You need to upload all required KYC documents before you can upload onboarding forms.</p>
                                  <button className="btn btn-primary" onClick={() => navigate('/investor/documents')} style={{ backgroundColor: '#be1717', border: 'none' }}>
                                    Go to KYC Documents
                                  </button>
                                </div>
                              )}
                              
                              <h3 style={{ marginLeft: '55px' }}>
                                <strong>Account Opening</strong>
                              </h3>
                              <span style={{ color: '#be1717', marginLeft: '55px' }}>
                                Please provide self-attested copies of the requested documents (Allowed formats: PDF, JPG, JPEG | Max size: 10 MB per file).
                              </span>

                              <div className="row" style={{ borderBottom: '2px solid #BE1717', marginTop: '10px', marginLeft: '37px', paddingBottom: '20px' }}>
                                {requirements.documents.length === 0 ? (
                                  <div className="col-md-12">
                                    <p>No onboarding documents required at this time.</p>
                                  </div>
                                ) : (
                                  [...requirements.documents]
                                    .sort((a, b) => a.description.localeCompare(b.description))
                                    .map((doc, index) => {
                                      const selectedFile = selectedFiles.get(doc.description);
                                      const isUploading = uploadingFile === doc.description;

                                      return (
                                        <div key={doc.dynamicsId || index} className="col-md-4">
                                          <div className="form-group first">
                                            <label style={{ marginLeft: '18px' }}>
                                              {doc.description}
                                              {isAccountOpeningBooklet(doc) && (
                                                <a
                                                  href="#"
                                                  onClick={handleDownloadAccountOpeningBooklet}
                                                  style={{ color: '#be1717', marginLeft: '5px', cursor: 'pointer' }}
                                                >
                                                  <u>Download</u>
                                                </a>
                                              )}
                                              {!isAccountOpeningBooklet(doc) && doc.documentMasterUrl && (
                                                <a
                                                  href="#"
                                                  onClick={(e) => handleDownloadMasterDocument(e, doc.documentMasterUrl, doc.description)}
                                                  style={{ color: '#be1717', marginLeft: '5px', cursor: 'pointer' }}
                                                >
                                                  <u>Download</u>
                                                </a>
                                              )}
                                            </label>

                                            <input
                                              type="file"
                                              id={`doc_${index}`}
                                              accept=".pdf,.jpg,.jpeg,.png"
                                              style={{ display: 'none' }}
                                              onChange={(e) => handleFileSelect(e, doc.description, doc.dynamicsId)}
                                              disabled={!kycComplete || doc.localRecordExists || isUploading}
                                            />
                                            <br />

                                            {doc.localRecordExists ? (
                                              <>
                                                <span id={`file-chosen-uploaded-${index}`} style={{ marginLeft: '20px' }}>
                                                  File Uploaded
                                                </span>
                                                <br />
                                                <span style={{ color: 'orange', marginLeft: '20px' }}>
                                                  {doc.localStatus || 'Pending'}
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <label
                                                  className="upload-button"
                                                  htmlFor={`doc_${index}`}
                                                  style={{
                                                    backgroundColor: (!kycComplete || isUploading) ? '#888' : '#be1717',
                                                    cursor: (!kycComplete || isUploading) ? 'not-allowed' : 'pointer',
                                                    pointerEvents: (!kycComplete || isUploading) ? 'none' : 'auto'
                                                  }}
                                                >
                                                  {isUploading ? 'Uploading...' : 'Upload'}
                                                </label>
                                                <br /><br />
                                                <span id={`file-chosen-${index}`}>
                                                  {selectedFile ? selectedFile.fileName : 'File to be uploaded'}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                )}
                              </div>

                              {/* Submit Button */}
                              <br />
                              {requirements && requirements.totalRequired > 0 && (
                                <div style={{ marginLeft: '39px', marginTop: '-14px' }}>
                                  {requirements.uploaded >= requirements.totalRequired && requirements.totalRequired > 0 ? (
                                    <>
                                      <button
                                        type="button"
                                        className="btn px-5 btn-primary"
                                        style={{ fontWeight: 'normal', borderRadius: '25px' }}
                                        disabled
                                      >
                                        Submit
                                      </button>
                                      <small style={{ color: 'green', marginLeft: '10px' }}>All documents uploaded</small>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        className="btn px-5 btn-primary"
                                        style={{ fontWeight: 'normal', borderRadius: '25px' }}
                                        onClick={handleBatchSubmit}
                                        disabled={uploadingFile === 'batch' || selectedFiles.size === 0}
                                      >
                                        {uploadingFile === 'batch' ? 'Uploading...' : 'Submit'}
                                      </button>
                                      {selectedFiles.size > 0 && (
                                        <small style={{ color: '#be1717', marginLeft: '10px' }}>
                                          {selectedFiles.size} file(s) selected
                                        </small>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
