import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  kycDocumentsService,
  KycRequirementsResponseDto,
  KycRequirementSlotDto,
  KycSmartDocumentDto,
  UploadRequest,
} from '../../../../../services/kycDocuments.service';
import { RequirementCard } from './RequirementCard';
import { UploadDialog } from './UploadDialog';
import { ExtractedFieldsReview } from './ExtractedFieldsReview';
import { ExpiryNotice } from './ExpiryNotice';
import { blockingAlertText } from './kycDiscrepancy';
import AlertDialog from '../../../../../components/AlertDialog/AlertDialog';
import './SmartUpload.scss';

export const KycDocumentsPage: React.FC = () => {
  const [requirements, setRequirements] = useState<KycRequirementsResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<KycRequirementSlotDto | null>(null);
  const [reviewDoc, setReviewDoc] = useState<KycSmartDocumentDto | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await kycDocumentsService.getRequirements();
      setRequirements(data);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load requirements';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const progressText = useMemo(() => {
    if (!requirements) return '';
    return `${requirements.mandatoryComplete} of ${requirements.mandatoryTotal} required documents uploaded`;
  }, [requirements]);

  const handleUpload = async (req: UploadRequest, supersedesId?: number) => {
    setSubmitting(true);
    try {
      const doc = supersedesId
        ? await kycDocumentsService.reUpload(supersedesId, req)
        : await kycDocumentsService.uploadDocument(req);
      setActiveSlot(null);
      setReviewDoc(doc);
      toast.success('Document uploaded');
      await load();
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data) {
        setActiveSlot(null);
        const doc = err.response.data as KycSmartDocumentDto;
        const blockingText = blockingAlertText(doc);
        if (blockingText) {
          // Rejected (mismatch / random / unreadable / unverifiable) - surface the
          // specific reason in the shared alert popup, per design.
          setAlert({ title: 'Document not accepted', message: blockingText });
        } else {
          // 409 without a blocking reason: fall back to the review modal.
          setReviewDoc(doc);
          toast.warning('Upload needs review - please check the flagged fields');
        }
        await load();
      } else {
        const message = err?.response?.data?.message || err?.message || 'Upload failed';
        setAlert({ title: 'Upload failed', message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="smart-upload">
        <div className="text-center py-5 text-muted">Loading your KYC requirements...</div>
      </div>
    );
  }

  if (error || !requirements) {
    return (
      <div className="smart-upload">
        <div className="alert alert-danger">{error || 'Unable to load requirements'}</div>
        <button className="btn btn-outline-primary btn-sm" onClick={() => load()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="smart-upload">
      <div className="smart-upload__header">
        <div>
          <h5 className="mb-1">Smart Upload</h5>
          <p className="text-muted mb-0 small">
            Upload your KYC documents. We extract key fields automatically via OCR and validate them
            against your PAN and registration details.
          </p>
        </div>
        <div className="smart-upload__progress">
          <span className="badge bg-light text-dark">{progressText}</span>
          {requirements.expiredCount > 0 && (
            <span className="badge bg-danger ms-2">
              {requirements.expiredCount} expired
            </span>
          )}
          {requirements.kycVerifiedAt && (
            <span className="badge bg-success ms-2">KYC Verified</span>
          )}
        </div>
      </div>

      <ExpiryNotice slots={requirements.slots} />

      <div className="smart-upload__grid">
        {requirements.slots.map((slot) => (
          <RequirementCard
            key={slot.documentType}
            slot={slot}
            onUpload={() => setActiveSlot(slot)}
            onReview={async () => {
              if (!slot.currentDocumentId) return;
              try {
                const detail = await kycDocumentsService.detail(slot.currentDocumentId);
                setReviewDoc(detail);
              } catch (err: any) {
                toast.error(err?.message || 'Failed to load document detail');
              }
            }}
          />
        ))}
      </div>

      {activeSlot && (
        <UploadDialog
          slot={activeSlot}
          investorType={requirements.investorType}
          submitting={submitting}
          onCancel={() => setActiveSlot(null)}
          onSubmit={(req) => handleUpload(req, activeSlot.currentDocumentId ?? undefined)}
        />
      )}

      {reviewDoc && (
        <ExtractedFieldsReview
          doc={reviewDoc}
          onClose={() => setReviewDoc(null)}
          onConfirm={async (id) => {
            try {
              const updated = await kycDocumentsService.confirm(id);
              setReviewDoc(updated);
              toast.success('Confirmed - your profile has been updated from this document');
              await load();
            } catch (err: any) {
              const message = err?.response?.data?.message || err?.message || 'Confirm failed';
              toast.error(message);
            }
          }}
          onReject={async (id) => {
            try {
              await kycDocumentsService.reject(id);
              setReviewDoc(null);
              toast.info('Upload removed - you can re-upload now');
              await load();
            } catch (err: any) {
              const message = err?.response?.data?.message || err?.message || 'Could not remove';
              toast.error(message);
            }
          }}
        />
      )}

      <AlertDialog
        show={!!alert}
        title={alert?.title}
        message={alert?.message ?? ''}
        onClose={() => setAlert(null)}
      />
    </div>
  );
};

export default KycDocumentsPage;
