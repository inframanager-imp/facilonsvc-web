import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../../../services/investor.service';
import type { PhysicalSubmissionFormData } from '../../../services/investor.service';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import './PhysicalSubmission.scss';

export const PhysicalSubmission: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm<PhysicalSubmissionFormData>({
        defaultValues: {
            physicalSubmission: 'inperson',
            courierName: '',
            dispatchDate: '',
            awbNumber: '',
            notes: ''
        },
    });

    const submissionType = watch('physicalSubmission');

    const onSubmit = async (data: PhysicalSubmissionFormData) => {
        setLoading(true);
        try {
            await investorService.submitPhysicalDocuments(data);
            toast.success('Physical submission recorded successfully!');
            navigate('/investor/verification-status');
        } catch (error: any) {
            console.error('Error submitting physical documents:', error);
            toast.error(error.response?.data?.error || 'Failed to record submission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="physical-submission">
                    <div className="physical-submission__header">
                        <h1>Physical Document Submission</h1>
                        <p>Record your physical document submission details</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="submission-form">
                        <div className="form-section">
                            <h3>Submission Method</h3>
                            
                            <div className="form-group">
                                <label>How will you submit the documents? *</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            value="inperson"
                                            {...register('physicalSubmission', { required: 'Submission method is required' })}
                                        />
                                        In Person
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="courier"
                                            {...register('physicalSubmission', { required: 'Submission method is required' })}
                                        />
                                        Courier
                                    </label>
                                </div>
                                {errors.physicalSubmission && <span className="error-message">{errors.physicalSubmission.message}</span>}
                            </div>
                        </div>

                        {submissionType === 'courier' && (
                            <div className="form-section">
                                <h3>Courier Details</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="courierName">Courier Name *</label>
                                        <input
                                            type="text"
                                            id="courierName"
                                            placeholder="e.g., FedEx, DHL, UPS"
                                            {...register('courierName', { 
                                                required: submissionType === 'courier' ? 'Courier name is required' : false 
                                            })}
                                            className={errors.courierName ? 'error' : ''}
                                        />
                                        {errors.courierName && <span className="error-message">{errors.courierName.message}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="dispatchDate">Dispatch Date *</label>
                                        <input
                                            type="date"
                                            id="dispatchDate"
                                            {...register('dispatchDate', { 
                                                required: submissionType === 'courier' ? 'Dispatch date is required' : false 
                                            })}
                                            className={errors.dispatchDate ? 'error' : ''}
                                        />
                                        {errors.dispatchDate && <span className="error-message">{errors.dispatchDate.message}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="awbNumber">AWB Number *</label>
                                    <input
                                        type="text"
                                        id="awbNumber"
                                        placeholder="Enter Air Waybill number"
                                        {...register('awbNumber', { 
                                            required: submissionType === 'courier' ? 'AWB number is required' : false 
                                        })}
                                        className={errors.awbNumber ? 'error' : ''}
                                    />
                                    {errors.awbNumber && <span className="error-message">{errors.awbNumber.message}</span>}
                                </div>
                            </div>
                        )}

                        <div className="form-section">
                            <h3>Additional Information</h3>

                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    placeholder="Any additional information about the submission"
                                    {...register('notes')}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Submitting...' : 'Submit Physical Submission'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};
