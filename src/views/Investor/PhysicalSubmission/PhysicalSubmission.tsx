import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, PhysicalSubmissionFormData } from '../../../services/investor.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import './PhysicalSubmission.scss';

export const PhysicalSubmission: React.FC = () => {
  const regularNavigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [submissionType, setSubmissionType] = useState<'inperson' | 'courier'>('inperson');
  const [formData, setFormData] = useState<PhysicalSubmissionFormData>({
    physicalSubmission: 'inperson',
    courierName: '',
    dispatchDate: '',
    awbNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboard, verificationStatus, physicalStatus] = await Promise.all([
        investorService.getDashboard(),
        investorService.getVerificationStatus(),
        investorService.getPhysicalSubmissionStatus()
      ]);
      
      setDashboardData(dashboard);
      
      // Check if in-person verification is completed (matching Laravel logic)
      const isVerified = verificationStatus?.currentStatus === 'completed';
      setVerificationCompleted(isVerified);
      
      if (!isVerified) {
        toast.warning('Please complete In-person Verification before submitting documents physically.');
      }
      
      // Pre-fill form if submission already exists
      if (physicalStatus && physicalStatus.submitted) {
        // Set submission type and pre-select radio button
        if (physicalStatus.physicalSubmission) {
          setSubmissionType(physicalStatus.physicalSubmission as 'inperson' | 'courier');
        }
        
        // Pre-fill form data
        setFormData({
          physicalSubmission: physicalStatus.physicalSubmission || 'inperson',
          courierName: physicalStatus.courierName || '',
          dispatchDate: physicalStatus.dispatchDate || '',
          awbNumber: physicalStatus.trackingNumber || '',
          notes: ''
        });
        
        toast.info('Physical submission already recorded. You can update the details below.');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load physical submission status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check verification status (matching Laravel's workflow enforcement)
    if (!verificationCompleted) {
      toast.error('You must complete In-person Verification before proceeding with physical submission.');
      return;
    }

    // Validation
    if (!submissionType) {
      toast.error('Please select a submission method');
      return;
    }

    if (submissionType === 'courier') {
      if (!formData.courierName || !formData.dispatchDate || !formData.awbNumber) {
        toast.error('Please fill in all courier details');
        return;
      }
    }

    try {
      setSubmitting(true);
      await investorService.submitPhysicalDocuments({
        ...formData,
        physicalSubmission: submissionType
      });
      toast.success('Physical submission details saved successfully!');
      await loadData();
    } catch (error: any) {
      console.error('Error submitting physical documents:', error);
      toast.error(error.response?.data?.message || 'Failed to submit physical documents');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PhysicalSubmissionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownloadChecklist = async () => {
    try {
      const response = await investorService.downloadDocumentChecklist();
      // Open in new window
      const blob = new Blob([response], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        toast.error('Please allow popups to view the checklist');
      }
    } catch (error: any) {
      console.error('Error downloading checklist:', error);
      toast.error('Failed to download checklist');
    }
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
      <div className="physical__progress-section">
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
                onClick={() => isProxyMode ? saNavigate(step.route) : regularNavigate(step.route)}
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
          <div className="physical-submission-container">
            <div className="loading">Loading physical submission...</div>
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
        <div className="physical-submission-container">
          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Main Content */}
          <div className="section derivatives-wrap trading-sec-1">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="tab" role="tabpanel">
                    <center>
                      <a
                        href="#"
                        className="btn btn-primary px-5"
                        style={{
                          backgroundColor: '#be1717 !important',
                          borderColor: '#be1717 !important',
                          fontSize: '21px !important',
                          pointerEvents: 'none'
                        }}
                      >
                        Physical Submission
                      </a>
                    </center>

                    <div className="tab-content tabs">
                      <div role="tabpanel" className="tab-pane fade in active" id="Section1">
                        <center>
                          <p style={{ marginTop: '20px' }}>
                            Please download the checklist and send the documents by courier to the address of the service provider indicated in the checklist.
                          </p>
                        </center>

                        {/* Download Checklist Button */}
                        <center>
                          <p>
                            <button
                              className="btn btn-primary px-5"
                              style={{ height: 'auto', marginTop: '20px', marginBottom: '20px' }}
                              onClick={handleDownloadChecklist}
                            >
                              Download checklist of documents to be submitted
                            </button>
                          </p>
                        </center>

                        <center>
                          <h3 className="physical-submission">Details of Physical Submission</h3>
                        </center>

                        {/* Verification Required Warning */}
                        {!verificationCompleted && (
                          <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '4px',
                            padding: '15px',
                            margin: '20px auto',
                            maxWidth: '800px',
                            textAlign: 'center'
                          }}>
                            <p style={{ margin: 0, color: '#856404', fontWeight: 'bold' }}>
                              ⚠️ In-person Verification Required
                            </p>
                            <p style={{ margin: '5px 0 0', color: '#856404' }}>
                              You must complete the in-person verification step before submitting documents physically.
                            </p>
                          </div>
                        )}

                        {/* Submission Form */}
                        <center>
                          <form onSubmit={handleSubmit}>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="form-group first">
                                  <label className="radio-inline" style={{ marginRight: '20px' }}>
                                    <input
                                      type="radio"
                                      name="physical_submission"
                                      value="inperson"
                                      checked={submissionType === 'inperson'}
                                      onChange={(e) => setSubmissionType('inperson')}
                                      disabled={!verificationCompleted}
                                      style={{ marginRight: '5px' }}
                                    />
                                    In Person
                                  </label>
                                  <label className="radio-inline">
                                    <input
                                      type="radio"
                                      name="physical_submission"
                                      value="courier"
                                      checked={submissionType === 'courier'}
                                      onChange={(e) => setSubmissionType('courier')}
                                      disabled={!verificationCompleted}
                                      style={{ marginRight: '5px' }}
                                    />
                                    Courier
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Courier Details (conditional) */}
                            {submissionType === 'courier' && (
                              <div className="row" id="physical_submission_done_div">
                                <div className="col-md-4">
                                  <div className="form-group first">
                                    <label htmlFor="courier_name">Courier Name</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="courier_name"
                                      value={formData.courierName}
                                      onChange={(e) => handleInputChange('courierName', e.target.value)}
                                      disabled={!verificationCompleted}
                                      placeholder="e.g., DHL, BlueDart"
                                      required={submissionType === 'courier'}
                                      maxLength={100}
                                    />
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <div className="form-group first">
                                    <label htmlFor="dispatch_date">Dispatch Date</label>
                                    <input
                                      type="datetime-local"
                                      className="form-control"
                                      id="dispatch_date"
                                      value={formData.dispatchDate}
                                      onChange={(e) => handleInputChange('dispatchDate', e.target.value)}
                                      disabled={!verificationCompleted}
                                      required={submissionType === 'courier'}
                                    />
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <div className="form-group first">
                                    <label htmlFor="awb_number">AWB Number</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="awb_number"
                                      value={formData.awbNumber}
                                      onChange={(e) => handleInputChange('awbNumber', e.target.value)}
                                      disabled={!verificationCompleted}
                                      placeholder="Tracking Number"
                                      required={submissionType === 'courier'}
                                      maxLength={50}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="btn px-5 btn-primary"
                              disabled={submitting || !verificationCompleted}
                              style={{ 
                                marginTop: '20px',
                                opacity: !verificationCompleted ? 0.5 : 1,
                                cursor: !verificationCompleted ? 'not-allowed' : 'pointer'
                              }}
                              title={!verificationCompleted ? 'Complete in-person verification first' : ''}
                            >
                              {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                          </form>
                        </center>
                      </div>
                    </div>
                    <br />
                    <br />
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
