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
      <main className="container-fluid dashboard-container-main p-0">
        <div className="investor-profile px-3 px-md-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2 shadow-sm">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#2c5e6a] to-[#355f69] p-3 flex flex-col md:flex-row justify-between items-center text-white gap-3 md:gap-6">
              <div className="flex-shrink-0">
                <h2 className="m-0 text-base font-bold text-white tracking-tight">Physical Submission</h2>
                {dashboardData?.productAssignment?.serviceProviderName && (
                  <p className="m-0 text-[11.5px] font-normal text-white/80 mt-0.5">
                    Service Provider: <strong>{dashboardData.productAssignment.serviceProviderName}</strong>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <PremiumJourneyStepper dashboardData={dashboardData} compact={true} />
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 bg-white">

            <p className="text-[12px] font-medium text-slate-500 mb-3">
              Please download the physical document checklist, gather the required documents, and record your submission details below.
            </p>

            {/* Verification Required Warning Banner */}
            {!verificationCompleted && (
              <div className="alert alert-warning mb-3 py-2 px-3 flex items-center justify-between flex-wrap gap-2 rounded-lg text-[11px] border border-amber-200 bg-amber-50 text-amber-800">
                <span className="flex items-center gap-2">
                  <strong>⚠️ In-person Verification Required:</strong>
                  <span>You must complete the in-person verification step before submitting physical documents.</span>
                </span>
                <button className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer" onClick={() => navigate('/investor/verification')}>
                  Go to Verification
                </button>
              </div>
            )}

            {/* Download Checklist Button */}
            <div className="mb-4 flex justify-start">
              <button
                type="button"
                className="inline-flex items-center text-[10px] font-bold h-[28px] px-3 rounded transition-all shadow-sm bg-[#eff6ff] text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 cursor-pointer animate-fadeIn"
                onClick={handleDownloadChecklist}
              >
                <i className="bi bi-download me-1.5" />
                Download Checklist of Physical Documents
              </button>
            </div>

            <h3 className="text-[12px] font-bold text-slate-700 border-b border-gray-100 pb-2 mb-3">Submission Method & Courier Details</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-[11px] font-bold text-slate-500 block mb-2">Submission Method</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[12px] text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="physical_submission"
                      value="inperson"
                      checked={submissionType === 'inperson'}
                      onChange={() => setSubmissionType('inperson')}
                      className="w-4 h-4 text-[#3e6f7c] border-gray-300 focus:ring-[#3e6f7c]"
                    />
                    <span>Hand Deliver In-Person</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[12px] text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="physical_submission"
                      value="courier"
                      checked={submissionType === 'courier'}
                      onChange={() => setSubmissionType('courier')}
                      className="w-4 h-4 text-[#3e6f7c] border-gray-300 focus:ring-[#3e6f7c]"
                    />
                    <span>Send via Courier</span>
                  </label>
                </div>
              </div>

              {submissionType === 'courier' && (
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="form-group flex flex-col">
                      <label htmlFor="courier_name" className="text-[11px] font-medium text-slate-500 mb-1">Courier Name</label>
                      <input
                        type="text"
                        className="w-full h-7 px-2.5 bg-white border border-gray-200 rounded text-[11px] text-slate-700 font-medium focus:outline-none focus:border-[#3e6f7c] focus:ring-1 focus:ring-[#3e6f7c] placeholder-slate-400"
                        id="courier_name"
                        value={formData.courierName}
                        onChange={(e) => handleInputChange('courierName', e.target.value)}
                        placeholder="e.g. DHL, BlueDart"
                        required
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group flex flex-col">
                      <label htmlFor="dispatch_date" className="text-[11px] font-medium text-slate-500 mb-1">Dispatch Date & Time</label>
                      <input
                        type="datetime-local"
                        className="w-full h-7 px-2.5 bg-white border border-gray-200 rounded text-[11px] text-slate-700 font-medium focus:outline-none focus:border-[#3e6f7c] focus:ring-1 focus:ring-[#3e6f7c]"
                        id="dispatch_date"
                        value={formData.dispatchDate}
                        onChange={(e) => handleInputChange('dispatchDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group flex flex-col">
                      <label htmlFor="awb_number" className="text-[11px] font-medium text-slate-500 mb-1">AWB / Tracking Number</label>
                      <input
                        type="text"
                        className="w-full h-7 px-2.5 bg-white border border-gray-200 rounded text-[11px] text-slate-700 font-medium focus:outline-none focus:border-[#3e6f7c] focus:ring-1 focus:ring-[#3e6f7c] placeholder-slate-400"
                        id="awb_number"
                        value={formData.awbNumber}
                        onChange={(e) => handleInputChange('awbNumber', e.target.value)}
                        placeholder="Tracking Number"
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-3 border-t border-gray-100 mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-[#3e6f7c] hover:bg-[#355f69] text-white text-[11px] font-bold h-[32px] px-4 rounded-md border-0 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || !verificationCompleted}
                >
                  <i className="bi bi-check-circle me-1.5" />
                  {submitting ? 'Submitting...' : 'Record Submission'}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};
