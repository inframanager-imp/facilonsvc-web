import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { toast } from 'react-toastify';
import PreLoginHeader from '../../components/PreLoginHeader/PreLoginHeader';
import PreLoginFooter from '../../components/PreLoginFooter/PreLoginFooter';
import './ResetPassword.scss';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset token');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      await userService.resetPassword(token, data.newPassword);
      toast.success('Password has been successfully reset.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'There was an error resetting your password. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="reset-password-layout">
      <PreLoginHeader />
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2 className="text-center mb-4">{t('resetPassword')}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password:
              </label>
              <input
                type="password"
                id="newPassword"
                className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'New password must be at least 6 characters',
                  },
                })}
              />
              {errors.newPassword && (
                <div className="invalid-feedback">{errors.newPassword.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!!errors.newPassword || !!errors.confirmPassword}
            >
              Reset Password
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

export default ResetPassword;
