import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import { serviceAgentService } from '../../../services/serviceAgent.service';
import { ServiceAgentDto } from '../../../models/ServiceAgentDto';
import { getPermissionErrorMessage } from '../../../utils/apiClient';
import './ServiceAgentProfile.scss';

export function ServiceAgentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ServiceAgentDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serviceAgentService.getMyProfile()
      .then(setProfile)
      .catch((err: any) => {
        const permissionError = getPermissionErrorMessage(err);
        if (permissionError) {
          toast.error(permissionError);
        } else {
          toast.error('Failed to load profile.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="sa-profile">
      <PostLoginHeader />
      <div className="sa-profile__body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>My Profile</h2>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/service-agent/dashboard')}>
            ← Dashboard
          </Button>
        </div>

        <div className="sa-profile__card">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : profile ? (
            <>
              <div className="sa-profile__avatar">{initials}</div>
              <div className="sa-profile__name">{profile.fullName}</div>
              <div className="sa-profile__code">Agent Code: {profile.agentCode}</div>

              <span className={`sa-profile__status sa-profile__status--${profile.isActive ? 'active' : 'inactive'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>

              <div className="sa-profile__fields">
                <div className="sa-profile__field">
                  <label>Agent Type</label>
                  <div className="value">{profile.agentType}</div>
                </div>
                <div className="sa-profile__field">
                  <label>Email</label>
                  <div className="value">{profile.email}</div>
                </div>
                <div className="sa-profile__field">
                  <label>Mobile</label>
                  <div className="value">{profile.mobile || '—'}</div>
                </div>
                <div className="sa-profile__field">
                  <label>Assigned Region</label>
                  <div className="value">{profile.assignedRegion || '—'}</div>
                </div>
                <div className="sa-profile__field">
                  <label>Assigned Segment</label>
                  <div className="value">{profile.assignedSegment || '—'}</div>
                </div>
                <div className="sa-profile__field">
                  <label>Onboarding Status</label>
                  <div className="value">{profile.onboardingStatus}</div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted py-4">Profile not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceAgentProfile;
