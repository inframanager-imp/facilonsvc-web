import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { investorService, PhysicalSubmissionFormData, InvestorDashboardDto } from '../../../services/investor.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import './PhysicalSubmission.scss';

export const PhysicalSubmission: React.FC = () => {
  const regularNavigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);
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

      // Check if in-person verification is completed.
      // Trust either the verification endpoint's currentStatus OR the dashboard's
      // accountSummary.verificationDone flag — they read the same backing column
      // (ss_verification_done) but go through different services, and a stale
      // Dataverse sync in one path shouldn't lock the form.
      const isVerified =
        verificationStatus?.currentStatus === 'completed' ||
        dashboard?.accountSummary?.verificationDone === true;
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
    return <PremiumJourneyStepper dashboardData={dashboardData} />;
  };

  if (loading) {
    return (
      <div className="facilon-dashboard-wrapper">
        {!isProxyMode && <Header />}
        <main className="container-fluid dashboard-container-main">
          <div className="physical-submission-container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="loading">Loading physical submission...</div>
          </div>
        </main>
        {!isProxyMode && <Footer />}
      </div>
    );
  }

  return (
    <div className="facilon-dashboard-wrapper">
      {!isProxyMode && <Header />}
      <main className="container-fluid dashboard-container-main">
        <div className="physical-submission-container">
          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Main Content */}
          <div className="section derivatives-wrap trading-sec-1">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12">
                  <div className="tab" role="tabpanel">
                    <center>
                      <a
                        href="#"
                        className="btn btn-primary"
                        style={{
                          backgroundColor: '#be1717 !important',
                          borderColor: '#be1717 !important',
                          pointerEvents: 'none'
                        }}
                      >
                        Physical Submission
                      </a>
                    </center>

                    <div className="tab-content tabs">
                      <div role="tabpanel" className="tab-pane fade show active" id="Section1">
                        <center>
                          <p style={{ marginTop: '10px' }}>
                            Please download the checklist and send the documents by courier to the address of the service provider indicated in the checklist.
                          </p>
                        </center>

                        {/* Download Checklist Button */}
                        <center>
                          <p>
                            <button
                              className="btn btn-primary"
                              style={{ height: 'auto', marginTop: '10px', marginBottom: '10px' }}
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
      </main>
      {!isProxyMode && <Footer />}
    </div>
  );
};
