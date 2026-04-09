import React, { useEffect } from 'react';
import { InvestorDashboardDto } from '../../../../services/investor.service';

interface ServiceProviderTabProps {
  dashboardData: InvestorDashboardDto;
}

export const ServiceProviderTab: React.FC<ServiceProviderTabProps> = ({ dashboardData }) => {
  const productAssignment = dashboardData?.productAssignment;
  const assignmentReady = Boolean(productAssignment?.assigned);

  // Debug: Log the product assignment data
  useEffect(() => {
    console.log('[ServiceProviderTab] Product Assignment Data:', productAssignment);
    console.log('[ServiceProviderTab] Assignment Ready:', assignmentReady);
  }, [productAssignment, assignmentReady]);

  return (
    <div className="service-provider-tab">
      <div className="card p-4 mb-3">
        <h5 className="mb-4">
          <i className="bi bi-building me-2"></i>
          Product Assignment
        </h5>
        
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="text-muted small">Service Provider</label>
            <p className="fw-bold mb-0">
              {productAssignment?.serviceProviderName || 'Not assigned'}
            </p>
          </div>
          <div className="col-md-3">
            <label className="text-muted small">Provider Type</label>
            <p className="fw-bold mb-0">
              {productAssignment?.serviceProviderType || 'Not specified'}
            </p>
          </div>
          <div className="col-md-3">
            <label className="text-muted small">Product</label>
            <p className="fw-bold mb-0">
              {productAssignment?.productName ||
                productAssignment?.productCode ||
                'Not assigned'}
            </p>
          </div>
          <div className="col-md-3">
            <label className="text-muted small">Plan</label>
            <p className="fw-bold mb-0">{productAssignment?.planName || 'Not specified'}</p>
          </div>
        </div>

        <div
          className={`alert ${assignmentReady ? 'alert-success' : 'alert-warning'} mb-0`}
          role="alert"
        >
          <i className={`bi ${assignmentReady ? 'bi-check-circle' : 'bi-clock'} me-2`}></i>
          {productAssignment?.message ||
            (assignmentReady ? 'Assignment available.' : 'Assignment pending.')}
        </div>
      </div>

      <div className="card p-4">
        <h6 className="mb-3">Product Information</h6>
        <p className="text-muted small mb-3">
          Your assigned product determines the services and features available to you. Contact your
          service provider for more details or to request changes.
        </p>
        
        {productAssignment?.serviceProviderName ? (
          <div className="border-start border-4 border-primary ps-3">
            <p className="mb-1">
              <strong>Current Provider:</strong>{' '}
              {productAssignment.serviceProviderName}
            </p>
            <p className="mb-1">
              <strong>Active Product:</strong>{' '}
              {productAssignment.productName || productAssignment.productCode || 'Standard'}
            </p>
            {productAssignment.planName && (
              <p className="mb-0">
                <strong>Service Plan:</strong> {productAssignment.planName}
              </p>
            )}
          </div>
        ) : (
          <div className="alert alert-light border mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Service provider details will appear here once assignment is complete.
          </div>
        )}
      </div>
    </div>
  );
};
