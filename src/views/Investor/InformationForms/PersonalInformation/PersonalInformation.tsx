import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../../../../services/investor.service';
import { toast } from 'react-toastify';
import Header from '../../../../components/Header/Header';
import Footer from '../../../../components/Footer/Footer';
import './PersonalInformation.scss';

interface PersonalInformationFormData {
    fullName: string;
    dateOfBirth: string;
    gender: number;
    maritalStatus: number;
    fatherName: string;
    motherName: string;
    spouseName?: string;
    occupation: string;
    annualIncome: number;
    employerName?: string;
    employerAddress?: string;
}

export const PersonalInformation: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm<PersonalInformationFormData>();

    const maritalStatus = watch('maritalStatus');

    const onSubmit = async (data: PersonalInformationFormData) => {
        setLoading(true);
        try {
            await investorService.submitPersonalInformation(data);
            toast.success('Personal information saved successfully!');
            navigate('/investor/dashboard');
        } catch (error: any) {
            console.error('Error submitting personal information:', error);
            toast.error(error.response?.data?.error || 'Failed to save personal information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="personal-information-form">
                    <div className="form-header">
                        <h1>Personal Information</h1>
                        <p>Please provide your personal details as per your identity documents</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="info-form">
                        <div className="form-section">
                            <h3>Basic Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name (as per ID) *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        {...register('fullName', { required: 'Full name is required' })}
                                        className={errors.fullName ? 'error' : ''}
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        {...register('dateOfBirth', { required: 'Date of birth is required' })}
                                        className={errors.dateOfBirth ? 'error' : ''}
                                    />
                                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth.message}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">Gender *</label>
                                    <select
                                        id="gender"
                                        {...register('gender', { required: 'Gender is required', valueAsNumber: true })}
                                        className={errors.gender ? 'error' : ''}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="1">Male</option>
                                        <option value="2">Female</option>
                                        <option value="3">Transgender</option>
                                    </select>
                                    {errors.gender && <span className="error-message">{errors.gender.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="maritalStatus">Marital Status *</label>
                                    <select
                                        id="maritalStatus"
                                        {...register('maritalStatus', { required: 'Marital status is required', valueAsNumber: true })}
                                        className={errors.maritalStatus ? 'error' : ''}
                                    >
                                        <option value="">Select Marital Status</option>
                                        <option value="1">Single</option>
                                        <option value="2">Married</option>
                                        <option value="3">Divorced</option>
                                        <option value="4">Widowed</option>
                                    </select>
                                    {errors.maritalStatus && <span className="error-message">{errors.maritalStatus.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Family Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fatherName">Father's Name *</label>
                                    <input
                                        type="text"
                                        id="fatherName"
                                        {...register('fatherName', { required: "Father's name is required" })}
                                        className={errors.fatherName ? 'error' : ''}
                                    />
                                    {errors.fatherName && <span className="error-message">{errors.fatherName.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="motherName">Mother's Name *</label>
                                    <input
                                        type="text"
                                        id="motherName"
                                        {...register('motherName', { required: "Mother's name is required" })}
                                        className={errors.motherName ? 'error' : ''}
                                    />
                                    {errors.motherName && <span className="error-message">{errors.motherName.message}</span>}
                                </div>
                            </div>

                            {maritalStatus === 2 && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="spouseName">Spouse Name</label>
                                        <input
                                            type="text"
                                            id="spouseName"
                                            {...register('spouseName')}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Employment & Income</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="occupation">Occupation *</label>
                                    <input
                                        type="text"
                                        id="occupation"
                                        {...register('occupation', { required: 'Occupation is required' })}
                                        className={errors.occupation ? 'error' : ''}
                                    />
                                    {errors.occupation && <span className="error-message">{errors.occupation.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="annualIncome">Annual Income (USD) *</label>
                                    <input
                                        type="number"
                                        id="annualIncome"
                                        step="0.01"
                                        {...register('annualIncome', {
                                            required: 'Annual income is required',
                                            valueAsNumber: true,
                                            min: { value: 0, message: 'Income must be positive' }
                                        })}
                                        className={errors.annualIncome ? 'error' : ''}
                                    />
                                    {errors.annualIncome && <span className="error-message">{errors.annualIncome.message}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="employerName">Employer Name</label>
                                    <input
                                        type="text"
                                        id="employerName"
                                        {...register('employerName')}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="employerAddress">Employer Address</label>
                                    <input
                                        type="text"
                                        id="employerAddress"
                                        {...register('employerAddress')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/investor/dashboard')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </form>
                </div>
                <Footer />
            </div>
        </div>
    );
};
