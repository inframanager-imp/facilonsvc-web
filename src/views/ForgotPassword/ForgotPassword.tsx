import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { toast } from 'react-toastify';
import PreLoginHeader from '../../components/PreLoginHeader/PreLoginHeader';
import PreLoginFooter from '../../components/PreLoginFooter/PreLoginFooter';
import './ForgotPassword.scss';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await userService.forgotPassword(data.email);
      toast.success('Password reset link sent to your email address');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'There was an error sending the reset link';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="forgot-password-layout">
      <PreLoginHeader />
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h2 className="text-center mb-4">{t('forgotPassword')}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!!errors.email}
            >
              Send Reset Link
            </button>
          </form>
          <div className="mt-3 text-center">
            <a href="/login" className="text-decoration-none">
              Back to Login
            </a>
          </div>
        </div>
      </div>
      <PreLoginFooter />
    </div>
  );
};

export default ForgotPassword;
