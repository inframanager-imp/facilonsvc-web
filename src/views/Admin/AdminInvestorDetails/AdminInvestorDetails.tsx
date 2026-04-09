import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  adminClientService,
  type InvestorDto,
  type InvestorFullProfileDto,
  type KycDocumentDto,
} from '../../../services/adminClient.service';
import { toast } from 'react-toastify';
import './AdminInvestorDetails.scss';

export const AdminInvestorDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<InvestorDto | null>(null);
  const [profile, setProfile] = useState<InvestorFullProfileDto | null>(null);
  const [documents, setDocuments] = useState<KycDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'kyc'>('overview');
  const [rejectDocId, setRejectDocId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const id = parseInt(clientId, 10);
      const [inv, prof, docs] = await Promise.all([
        adminClientService.getClient(id),
        adminClientService.getClientProfile(id),
        adminClientService.getClientDocuments(id),
      ]);
      setInvestor(inv);
      setProfile(prof);
      setDocuments(docs);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load investor');
      navigate('/admin/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const handleVerify = async (docId: number) => {
    try {
      await adminClientService.verifyDocument(docId);
      toast.success('Document verified');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify');
    }
  };

  const handleReject = async (docId: number) => {
    try {
      await adminClientService.rejectDocument(docId, rejectReason || undefined);
      toast.success('Document rejected');
      setRejectDocId(null);
      setRejectReason('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleInvestorVerify = async (status: number) => {
    if (!clientId) return;
    try {
      await adminClientService.updateVerificationStatus(parseInt(clientId, 10), status);
      toast.success(status === 1 ? 'Investor verified' : 'Investor rejected');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <span className="badge bg-success">Verified</span>;
      case 2:
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 3:
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getDocStatusBadge = (status?: string) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s === 'approved') return <span className="badge bg-success">Approved</span>;
    if (s === 'rejected') return <span className="badge bg-danger">Rejected</span>;
    return <span className="badge bg-warning text-dark">{status}</span>;
  };

  if (loading) {
    return (
      <div className="admin-investor-details-layout">
        <Header />
        <div className="dashboard-main-content">
          <div className="admin-investor-details admin-investor-details--loading">
            <div className="spinner-border text-primary"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!investor) return null;

  return (
    <div className="admin-investor-details-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="admin-investor-details">
          <div className="admin-investor-details__header">
            <button className="btn btn-link text-decoration-none" onClick={() => navigate('/admin/clients')}>
              <i className="fas fa-arrow-left"></i> Back to list
            </button>
            <h1>
              <i className="fas fa-user"></i> {investor.firstName} {investor.lastName}
            </h1>
            <div className="d-flex align-items-center gap-2">
              {getStatusBadge(investor.verifyStatus)}
              {investor.verifyStatus === 2 && (
                <>
                  <button className="btn btn-sm btn-success" onClick={() => handleInvestorVerify(1)}>
                    Verify Investor
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleInvestorVerify(3)}>
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>

          <nav className="admin-investor-details__tabs">
            <button
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`btn ${activeTab === 'kyc' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('kyc')}
            >
              KYC Documents ({documents.length})
            </button>
          </nav>

          {activeTab === 'overview' && (
            <div className="admin-investor-details__content card">
              <div className="card-body">
                <h5>Basic Information</h5>
                <dl className="row">
                  <dt className="col-sm-3">Email</dt>
                  <dd className="col-sm-9">{investor.emailId || '-'}</dd>
                  <dt className="col-sm-3">Phone</dt>
                  <dd className="col-sm-9">{investor.mobilePhone || '-'}</dd>
                  <dt className="col-sm-3">Unique Code</dt>
                  <dd className="col-sm-9">{investor.uniqueCode || '-'}</dd>
                  <dt className="col-sm-3">Verification Status</dt>
                  <dd className="col-sm-9">{getStatusBadge(investor.verifyStatus)}</dd>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="admin-investor-details__content card">
              <div className="card-body">
                {profile?.personalInfo && (
                  <div className="mb-4">
                    <h5>Personal Information</h5>
                    <p>
                      {profile.personalInfo.investorFirstName} {profile.personalInfo.investorMiddleName}{' '}
                      {profile.personalInfo.investorLastName}
                    </p>
                    <p>DOB: {profile.personalInfo.userDob || '-'}</p>
                    <p>Address: {profile.personalInfo.addressLine1 || '-'}</p>
                    <p>PAN: {profile.personalInfo.userPanNo || '-'}</p>
                  </div>
                )}
                {profile?.passport && (
                  <div className="mb-4">
                    <h5>Passport</h5>
                    <p>Number: {profile.passport.passportNumber || '-'}</p>
                  </div>
                )}
                {profile?.experience && (
                  <div className="mb-4">
                    <h5>Experience</h5>
                    <p>Occupation: {profile.experience.occupation || '-'}</p>
                    <p>Annual Income: {profile.experience.annualIncome || '-'}</p>
                  </div>
                )}
                {profile?.consents && (
                  <div>
                    <h5>Consents</h5>
                    <p>Terms: {profile.consents.termsAccepted ? 'Yes' : 'No'}</p>
                    <p>Privacy: {profile.consents.privacyPolicyAccepted ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {!profile?.personalInfo && !profile?.passport && !profile?.experience && !profile?.consents && (
                  <p className="text-muted">No profile data available yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="admin-investor-details__content card">
              <div className="card-body">
                <h5>KYC Documents</h5>
                {documents.length === 0 ? (
                  <p className="text-muted">No documents uploaded yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Uploaded</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id}>
                            <td>{doc.documentType || doc.docDescription || '-'}</td>
                            <td>{getDocStatusBadge(doc.status)}</td>
                            <td>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}</td>
                            <td>
                              {doc.status?.toLowerCase() !== 'approved' &&
                                doc.status?.toLowerCase() !== 'rejected' && (
                                  <>
                                    <button
                                      className="btn btn-sm btn-success me-1"
                                      onClick={() => handleVerify(doc.id)}
                                    >
                                      Verify
                                    </button>
                                    {rejectDocId === doc.id ? (
                                      <div className="d-inline-flex gap-1 align-items-center">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Rejection reason"
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => handleReject(doc.id)}
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => setRejectDocId(null)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => setRejectDocId(doc.id)}
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
