import { apiClient } from '../utils/apiClient';

class PdfService {
    private baseUrl = '/api/investor/pdf';

    /**
     * Download investor information PDF for current user (Summary version)
     * Aligned with Laravel: user-print-preview-final.blade.php
     */
    async downloadInvestorPdf(): Promise<Blob> {
        const response = await apiClient.get<Blob>(`${this.baseUrl}/view`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get investor print preview HTML for current user (Summary version)
     * Aligned with Laravel: user-print-preview-final.blade.php
     */
    async getPrintPreviewHtml(): Promise<string> {
        const response = await apiClient.get<string>(`${this.baseUrl}/print-preview`, {
            responseType: 'text'
        });
        return response.data;
    }

    /**
     * Helper to trigger PDF download in browser (Summary version)
     */
    async downloadPdfFile(filename?: string): Promise<void> {
        const blob = await this.downloadInvestorPdf();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'investor_information.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Helper to open print preview in new window (Summary version)
     */
    async openPrintPreview(): Promise<void> {
        const html = await this.getPrintPreviewHtml();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    }

    // ─── KYC Form (36-page Account Opening Kit) ───

    /** Download the filled KYC form PDF for the current user. */
    async downloadKycFormPdf(): Promise<Blob> {
        const response = await apiClient.get<Blob>(`${this.baseUrl}/kyc-form`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /** Get the HTML preview of the filled KYC form. */
    async getKycFormPreviewHtml(): Promise<string> {
        const response = await apiClient.get<string>(`${this.baseUrl}/kyc-form/preview`, {
            responseType: 'text'
        });
        return response.data;
    }

    /** Get the structured form data JSON (for the edit UI). */
    async getKycFormData(): Promise<any> {
        const response = await apiClient.get(`${this.baseUrl}/kyc-form/data`);
        return response.data;
    }

    /** Trigger browser download of the KYC form PDF. */
    async downloadKycFormFile(filename?: string): Promise<void> {
        const blob = await this.downloadKycFormPdf();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'KYC_Account_Opening_Kit.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /** Open the KYC form preview in a new window. */
    async openKycFormPreview(): Promise<void> {
        const html = await this.getKycFormPreviewHtml();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    }
}

export const pdfService = new PdfService();
