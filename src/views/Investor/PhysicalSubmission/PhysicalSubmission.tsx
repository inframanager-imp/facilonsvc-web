import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { investorService, PhysicalSubmissionFormData, InvestorDashboardDto } from '../../../services/investor.service';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';
import '../DocumentUpload/DocumentUpload.scss';

export const PhysicalSubmission: React.FC = () => {
  const navigate = useNavigate();
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

      const isVerified =
        verificationStatus?.currentStatus === 'completed' ||
        dashboard?.accountSummary?.verificationDone === true;
      setVerificationCompleted(isVerified);
      
      if (physicalStatus && physicalStatus.submitted) {
        if (physicalStatus.physicalSubmission) {
          setSubmissionType(physicalStatus.physicalSubmission as 'inperson' | 'courier');
        }
        
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

    if (!verificationCompleted) {
      toast.error('You must complete In-person Verification before proceeding with physical submission.');
      return;
    }

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
        <main className="container-fluid dashboard-container-main">
          <div className="physical-submission-container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="loading">Loading physical submission...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="facilon-dashboard-wrapper">
      <main className="container-fluid dashboard-container-main px-0">
        <div className="investor-profile px-3 px-md-0">
          {/* Progress Bar */}
          {renderProgressBar()}

          <div className="investor-profile__card document-upload">
            
            <p className="document-list__subtitle">
              Please download the physical document checklist, gather the required documents, and record your submission details below.
            </p>

            {/* Verification Required Warning Banner */}
            {!verificationCompleted && (
              <div className="alert alert-warning mb-3 py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', fontSize: '11px', color: '#856404' }}>
                <span className="d-flex align-items-center gap-2">
                  <strong>⚠️ In-person Verification Required:</strong>
                  <span>You must complete the in-person verification step before submitting physical documents.</span>
                </span>
                <button className="btn btn-xs btn-warning py-1 px-2 font-weight-bold" onClick={() => navigate('/investor/verification')} style={{ fontSize: '10px', height: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                  Go to Verification
                </button>
              </div>
            )}

            {/* Download Checklist Button */}
            <div className="mb-4 d-flex justify-content-start">
              <button
                type="button"
                className="file-input-label-custom btn btn-outline-primary"
                onClick={handleDownloadChecklist}
                style={{ height: '32px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', fontWeight: 700 }}
              >
                <i className="bi bi-download me-2" />
                Download Checklist of Physical Documents
              </button>
            </div>

            <h3 className="mb-3 no-before" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--facilon-slate)', borderBottom: '1.5px solid var(--facilon-grey-200)', paddingBottom: '6px' }}>Submission Method & Courier Details</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label d-block mb-2" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--facilon-text-muted)' }}>Submission Method</label>
                <div className="d-flex gap-4">
                  <label className="d-inline-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '11px' }}>
                    <input
                      type="radio"
                      name="physical_submission"
                      value="inperson"
                      checked={submissionType === 'inperson'}
                      onChange={() => setSubmissionType('inperson')}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Hand Deliver In-Person</span>
                  </label>
                  <label className="d-inline-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '11px' }}>
                    <input
                      type="radio"
                      name="physical_submission"
                      value="courier"
                      checked={submissionType === 'courier'}
                      onChange={() => setSubmissionType('courier')}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Send via Courier</span>
                  </label>
                </div>
              </div>

              {submissionType === 'courier' && (
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="courier_name" style={{ fontSize: '11px', fontWeight: 600 }}>Courier Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="courier_name"
                        value={formData.courierName}
                        onChange={(e) => handleInputChange('courierName', e.target.value)}
                        placeholder="e.g. DHL, BlueDart"
                        required
                        maxLength={100}
                        style={{ height: '32px', fontSize: '11px' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="dispatch_date" style={{ fontSize: '11px', fontWeight: 600 }}>Dispatch Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="dispatch_date"
                        value={formData.dispatchDate}
                        onChange={(e) => handleInputChange('dispatchDate', e.target.value)}
                        required
                        style={{ height: '32px', fontSize: '11px' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="awb_number" style={{ fontSize: '11px', fontWeight: 600 }}>AWB / Tracking Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="awb_number"
                        value={formData.awbNumber}
                        onChange={(e) => handleInputChange('awbNumber', e.target.value)}
                        placeholder="Tracking Number"
                        required
                        maxLength={50}
                        style={{ height: '32px', fontSize: '11px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="document-upload__actions mt-4 pt-3" style={{ borderTop: '1.5px solid var(--facilon-grey-200)' }}>
                <button
                  type="submit"
                  className="btn btn-save"
                  disabled={submitting || !verificationCompleted}
                  style={{ minWidth: '160px', height: '38px', fontSize: '11px', fontWeight: 700 }}
                >
                  <i className="bi bi-check-circle me-2" />
                  {submitting ? 'Submitting...' : 'Record Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
