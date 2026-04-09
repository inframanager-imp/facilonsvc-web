import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { authenticationService } from '../../services/authentication.service';
import { toast } from 'react-toastify';
import './ChangePassword.scss';

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForcedChange, setIsForcedChange] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    // Check if this is a forced password change (temporary password)
    const mustChange = localStorage.getItem('mustChangePassword') === 'true';
    setIsForcedChange(mustChange);
  }, []);

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Both Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.changePassword(data.oldPassword || '', data.newPassword);
      const responseData = response.data as any;
      
      if (responseData.warning) {
        toast.warning(`${responseData.message}. Warning: ${responseData.warning}`);
      } else {
        toast.success(responseData.message || 'Password changed successfully');
      }
      
      // Clear the mustChangePassword flag
      localStorage.removeItem('mustChangePassword');
      
      reset();
      
      // If it was a forced change, redirect to appropriate dashboard
      if (isForcedChange) {
        setTimeout(() => {
          const roles = authenticationService.getUserRoles();
          const isSuperAdmin = roles.some(role => 
            role === 'PLATFORM_SUPER_ADMIN' || 
            role.toUpperCase().includes('SUPER_ADMIN')
          );
          const isAdmin = !isSuperAdmin && roles.some(role => 
            role === 'ADMIN' || 
            role.toUpperCase().includes('ADMIN')
          );
          
          if (isSuperAdmin) {
            navigate('/super-admin/dashboard');
          } else if (isAdmin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'There was an error changing the password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="fullpage2">
      <div id="section0" className="section service-provider2">
        <div className="container21">
          <div className="row">
            <div className="facilon-login-container">
              <div className="left-section">
                <div className="branding">
                  <h2>Welcome <br /> To <br />Facilon Services</h2>
                </div>
              </div>
              <div className="right-section">
                <div className="login-form">
                  <div className="icon">
                    <h2>Change Password</h2>
                  </div>
                  {isForcedChange && (
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#fff3cd', 
                      border: '1px solid #ffc107', 
                      borderRadius: '4px', 
                      marginBottom: '15px',
                      color: '#856404'
                    }}>
                      <strong>⚠️ Security Notice:</strong> You must change your temporary password before accessing the system.
                    </div>
                  )}
                  <form onSubmit={handleSubmit(onSubmit)} id="passwordForm">
                    <span>Current Password</span>
                    <div className="input-wrapper">
                      <i className="fas fa-lock"></i>
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        id="old_password"
                        className="login-form-input"
                        autoComplete="off"
                        {...register('oldPassword', {
                          required: 'Current password is required'
                        })}
                      />
                      <i
                        className={`fas ${showOldPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-password`}
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      ></i>
                    </div>
                    {errors.oldPassword && (
                      <div className="error-message">{errors.oldPassword.message}</div>
                    )}

                    <span>New Password</span>
                    <div className="input-wrapper">
                      <i className="fas fa-lock"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="new_password"
                        className="login-form-input"
                        autoComplete="off"
                        {...register('newPassword', {
                          required: 'New password is required',
                          pattern: {
                            value: /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/,
                            message: 'At least 8 chars with uppercase, lowercase, number & special char (e.g., Abc@1234).'
                          }
                        })}
                      />
                      <i
                        className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-password`}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                    </div>
                    {errors.newPassword && (
                      <div className="error-message">{errors.newPassword.message}</div>
                    )}

                    <span>Re-enter Password</span>
                    <div className="input-wrapper">
                      <i className="fas fa-lock"></i>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="new_password_confirmation"
                        className="login-form-input"
                        autoComplete="off"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === newPassword || 'Both Passwords do not match'
                        })}
                      />
                      <i
                        className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-password`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      ></i>
                    </div>
                    {errors.confirmPassword && (
                      <div className="error-message">{errors.confirmPassword.message}</div>
                    )}

                    <div className="form-button">
                      <button type="submit" name="submit" className="sharp-button" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
