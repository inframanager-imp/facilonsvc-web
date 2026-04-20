import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../../../../services/investor.service';
import { toast } from 'react-toastify';
import Header from '../../../../components/Header/Header';
import Footer from '../../../../components/Footer/Footer';
import { PremiumSelect } from '../../../../components/PremiumSelect/PremiumSelect';
import './PersonalInformation.scss';

const GENDER_OPTIONS = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'Transgender' },
];

const MARITAL_STATUS_OPTIONS = [
    { value: '1', label: 'Single' },
    { value: '2', label: 'Married' },
    { value: '3', label: 'Divorced' },
    { value: '4', label: 'Widowed' },
];

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
    const { control, handleSubmit, watch, formState: { errors } } = useForm<PersonalInformationFormData>();

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
                                    <Controller
                                        name="fullName"
                                        control={control}
                                        rules={{ required: 'Full name is required' }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                id="fullName"
                                                className={errors.fullName ? 'error' : ''}
                                            />
                                        )}
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                                    <Controller
                                        name="dateOfBirth"
                                        control={control}
                                        rules={{ required: 'Date of birth is required' }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="date"
                                                id="dateOfBirth"
                                                className={errors.dateOfBirth ? 'error' : ''}
                                            />
                                        )}
                                    />
                                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth.message}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <Controller
                                        name="gender"
                                        control={control}
                                        rules={{ required: 'Gender is required' }}
                                        render={({ field }) => (
                                            <PremiumSelect
                                                value={field.value?.toString() ?? ''}
                                                onChange={(val) => field.onChange(val ? Number(val) : '')}
                                                options={GENDER_OPTIONS}
                                                placeholder="Select Gender"
                                                error={errors.gender?.message}
                                            />
                                        )}
                                    />
                                    {errors.gender && <span className="error-message">{errors.gender.message}</span>}
                                </div>

                                <div className="form-group">
                                    <Controller
                                        name="maritalStatus"
                                        control={control}
                                        rules={{ required: 'Marital status is required' }}
                                        render={({ field }) => (
                                            <PremiumSelect
                                                value={field.value?.toString() ?? ''}
                                                onChange={(val) => field.onChange(val ? Number(val) : '')}
                                                options={MARITAL_STATUS_OPTIONS}
                                                placeholder="Select Marital Status"
                                                error={errors.maritalStatus?.message}
                                            />
                                        )}
                                    />
                                    {errors.maritalStatus && <span className="error-message">{errors.maritalStatus.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Family Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fatherName">Father's Name *</label>
                                    <Controller
                                        name="fatherName"
                                        control={control}
                                        rules={{ required: "Father's name is required" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                id="fatherName"
                                                className={errors.fatherName ? 'error' : ''}
                                            />
                                        )}
                                    />
                                    {errors.fatherName && <span className="error-message">{errors.fatherName.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="motherName">Mother's Name *</label>
                                    <Controller
                                        name="motherName"
                                        control={control}
                                        rules={{ required: "Mother's name is required" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                id="motherName"
                                                className={errors.motherName ? 'error' : ''}
                                            />
                                        )}
                                    />
                                    {errors.motherName && <span className="error-message">{errors.motherName.message}</span>}
                                </div>
                            </div>

                            {maritalStatus === 2 && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="spouseName">Spouse Name</label>
                                        <Controller
                                            name="spouseName"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    id="spouseName"
                                                />
                                            )}
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
                                    <Controller
                                        name="occupation"
                                        control={control}
                                        rules={{ required: 'Occupation is required' }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                id="occupation"
                                                className={errors.occupation ? 'error' : ''}
                                            />
                                        )}
                                    />
                                    {errors.occupation && <span className="error-message">{errors.occupation.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="annualIncome">Annual Income (USD) *</label>
                                    <Controller
                                        name="annualIncome"
                                        control={control}
                                        rules={{
                                            required: 'Annual income is required',
                                            min: { value: 0, message: 'Income must be positive' }
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                id="annualIncome"
                                                step="0.01"
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                                                className={errors.annualIncome ? 'error' : ''}
                                            />
                                        )}
                                    />
                                    {errors.annualIncome && <span className="error-message">{errors.annualIncome.message}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="employerName">Employer Name</label>
                                    <Controller
                                        name="employerName"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                id="employerName"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="employerAddress">Employer Address</label>
                                    <Controller
                                        name="employerAddress"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                id="employerAddress"
                                            />
                                        )}
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
