import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import {
  serviceAgentService,
  ServiceAgentProfileUpdateDto,
} from '../../../services/serviceAgent.service';
import { ServiceAgentDto } from '../../../models/ServiceAgentDto';
import { getPermissionErrorMessage } from '../../../utils/apiClient';
import './ServiceAgentProfile.scss';

export function ServiceAgentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ServiceAgentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServiceAgentProfileUpdateDto>({});

  useEffect(() => {
    serviceAgentService.getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm(pickEditable(p));
      })
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

  const onSave = async () => {
    setSaving(true);
    try {
      const updated = await serviceAgentService.updateMyProfile(form);
      setProfile(updated);
      setForm(pickEditable(updated));
      setEditing(false);
      toast.success('Profile updated');
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      toast.error(permissionError || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (profile) setForm(pickEditable(profile));
    setEditing(false);
  };

  const setField = (key: keyof ServiceAgentProfileUpdateDto, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

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

              {!editing ? (
                <>
                  <div className="sa-profile__fields">
                    <ReadOnlyField label="Agent Type" value={profile.agentType} />
                    <ReadOnlyField label="Email" value={profile.email} />
                    <ReadOnlyField label="Mobile" value={profile.mobile} />
                    <ReadOnlyField label="Assigned Region" value={profile.assignedRegion} />
                    <ReadOnlyField label="Assigned Segment" value={profile.assignedSegment} />
                    <ReadOnlyField label="Onboarding Status" value={profile.onboardingStatus} />
                  </div>
                  <div className="text-end mt-3">
                    <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                </>
              ) : (
                <Form className="sa-profile__edit-form mt-3" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                  <EditRow label="Full Name" value={form.fullName}
                    onChange={(v) => setField('fullName', v)} />
                  <ReadOnlyField label="Email (login)" value={profile.email}
                    hint="Email cannot be changed from here. Contact an administrator." />
                  <EditRow label="Mobile" value={form.mobile}
                    onChange={(v) => setField('mobile', v)} />
                  <EditRow label="Agent Type" value={form.agentType}
                    onChange={(v) => setField('agentType', v)} />
                  <EditRow label="Assigned Region" value={form.assignedRegion}
                    onChange={(v) => setField('assignedRegion', v)} />
                  <EditRow label="Assigned Segment" value={form.assignedSegment}
                    onChange={(v) => setField('assignedSegment', v)} />
                  <EditRow label="PAN Number" value={form.panNumber}
                    onChange={(v) => setField('panNumber', v.toUpperCase())} />
                  <EditRow label="Registration Number" value={form.registrationNumber}
                    onChange={(v) => setField('registrationNumber', v)} />

                  <div className="text-end mt-3">
                    <Button variant="outline-secondary" size="sm" className="me-2"
                      onClick={onCancel} disabled={saving}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" disabled={saving}>
                      {saving ? (<><Spinner as="span" animation="border" size="sm" /> Saving…</>) : 'Save'}
                    </Button>
                  </div>
                </Form>
              )}
            </>
          ) : (
            <p className="text-center text-muted py-4">Profile not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Presentational helpers
// ─────────────────────────────────────────────────────────────────────────

function ReadOnlyField({ label, value, hint }: { label: string; value?: string | null; hint?: string }) {
  return (
    <div className="sa-profile__field">
      <label>{label}</label>
      <div className="value">{value || '—'}</div>
      {hint && <div className="value" style={{ fontSize: '0.8rem', color: '#888' }}>{hint}</div>}
    </div>
  );
}

function EditRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <Form.Group className="mb-2">
      <Form.Label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</Form.Label>
      <Form.Control
        type="text"
        size="sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Form.Group>
  );
}

function pickEditable(p: ServiceAgentDto): ServiceAgentProfileUpdateDto {
  return {
    fullName: p.fullName,
    mobile: p.mobile,
    assignedRegion: p.assignedRegion,
    assignedSegment: p.assignedSegment,
    photoUrl: (p as any).photoUrl,
    panNumber: (p as any).panNumber,
    addressProofUrl: (p as any).addressProofUrl,
    registrationNumber: (p as any).registrationNumber,
    agentType: p.agentType,
  };
}

export default ServiceAgentProfile;
