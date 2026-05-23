import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { toast } from 'react-toastify';
import './InvestorProfilePdf.css';

export const InvestorProfilePdf: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrintPreview();
  }, []);

  useEffect(() => {
    // Expose functions to window for the FreeMarker template buttons
    (window as any).submitProfile = handleSubmitProfile;
    (window as any).downloadPdf = handleDownloadPdf;
    
    // Cleanup
    return () => {
      delete (window as any).submitProfile;
      delete (window as any).downloadPdf;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrintPreview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<string>('/api/investor/pdf/print-preview', {
        headers: {
          'Accept': 'text/html'
        },
        responseType: 'text'
      });
      setHtmlContent(response.data as string);
    } catch (error: any) {
      console.error('Failed to fetch print preview:', error);
      toast.error('Failed to load PDF preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = () => {
    if (window.confirm('Are you sure you want to submit your profile? This action cannot be undone.')) {
      // Navigate back to journey page for submission
      navigate('/investor/journey');
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await apiClient.get<Blob>('/api/investor/pdf/view', {
        responseType: 'blob'
      });
      
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'investor_information.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleClose = () => {
    window.close();
    // If window.close() doesn't work (popup blocker), navigate back
    setTimeout(() => {
      navigate('/investor/journey');
    }, 100);
  };

  if (loading) {
    return (
      <div className="pdf-preview-loading">
        <div className="spinner"></div>
        <p>Loading PDF Preview...</p>
      </div>
    );
  }

  return (
    <div className="pdf-preview-container">
      <div className="pdf-preview-toolbar no-print">
        <button onClick={handlePrintPdf} className="btn-action">
          Print PDF
        </button>
        <button onClick={handleDownloadPdf} className="btn-action">
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
