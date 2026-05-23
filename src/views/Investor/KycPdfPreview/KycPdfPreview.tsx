import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { toast } from 'react-toastify';
import '../../Investor/InvestorProfilePdf/InvestorProfilePdf.css';

/**
 * KYC Account Opening Kit PDF Preview page.
 *
 * Route: /investor/kyc-pdf
 * Fetches the HTML preview from /api/investor/pdf/kyc-form/preview,
 * renders it inline, and provides Print / Download / Close actions.
 *
 * Mirrors the same pattern as InvestorProfilePdf.tsx.
 */
export const KycPdfPreview: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<string>('/api/investor/pdf/kyc-form/preview', {
        headers: { Accept: 'text/html' },
        responseType: 'text',
      });
      setHtmlContent(response.data as string);
    } catch (error: any) {
      console.error('Failed to fetch KYC preview:', error);
      toast.error('Failed to load KYC form preview');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await apiClient.get<Blob>('/api/investor/pdf/kyc-form', {
        responseType: 'blob',
      });

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'KYC_Account_Opening_Kit.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('KYC PDF downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download KYC PDF:', error);
      toast.error('Failed to download KYC PDF');
    }
  };

  const handleClose = () => {
    window.close();
    // Fallback if window.close() doesn't work
    setTimeout(() => navigate('/investor/journey'), 100);
  };

  if (loading) {
    return (
      <div className="pdf-preview-loading">
        <div className="spinner"></div>
        <p>Loading KYC Form Preview...</p>
      </div>
    );
  }

  return (
    <div className="pdf-preview-container">
      <div className="pdf-preview-toolbar no-print">
        <button onClick={handlePrint} className="btn-action">
          Print KYC Form
        </button>
        <button onClick={handleDownload} className="btn-action">
          Download PDF
        </button>
        <button onClick={handleClose} className="btn-close">
          Close
        </button>
      </div>
      <div
        className="pdf-preview-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
