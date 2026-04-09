import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { userService } from '../../services/user.service';
import { AuthorizedUserDto } from '../../models/AuthorizedUserDto';
import { toast } from 'react-toastify';
import PreLoginHeader from '../../components/PreLoginHeader/PreLoginHeader';
import PreLoginFooter from '../../components/PreLoginFooter/PreLoginFooter';
import './Signup.scss';

interface SignupFormData {
  firstName: string;
  lastName: string;
  emailId: string;
  mobilePhone: string;
  password: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
  } = useForm<SignupFormData>({
    mode: 'onChange',
  });

  const emailValue = watch('emailId');

  const isValidEmail = (email: string): boolean => {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
  };

  const checkEmailExistence = async () => {
    const email = emailValue;
    if (!email || !isValidEmail(email)) {
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await userService.checkEmailExists(email);
      if ((response.data as any)?.emailExists) {
        setEmailExists(true);
        setError('emailId', {
          type: 'manual',
          message: 'Email already exists',
        });
      } else {
        setEmailExists(false);
        clearErrors('emailId');
      }
    } catch (error) {
      console.error('Error checking email existence', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    if (!isValid) {
      return;
    }

    try {
      const userDto: Partial<AuthorizedUserDto> = {
        FirstName: data.firstName,
        LastName: data.lastName,
        EmailId: data.emailId,
        MobilePhone: data.mobilePhone,
        Password: data.password,
        LoginId: data.emailId, // Using email as loginId
      };

      await userService.registerUser(userDto as AuthorizedUserDto);
      toast.success('User registered successfully');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'There was an error during registration';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="signup-layout">
      <PreLoginHeader />
      <div className="signup-page">
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Left Side - Branding */}
            <div className="col-lg-6 d-none d-lg-flex signup-left-side">
              <div className="signup-content-wrapper">
                <div className="signup-brand">
                  <div className="logo-icon">
                    <i className="fas fa-heart"></i>
                  </div>
                  <h1 className="brand-name">Facilon</h1>
                  <p className="brand-tagline">Platform - Management Solutions</p>
                </div>

                <div className="signup-features">
                  <h3>Start Your Journey</h3>
                  <p className="lead">Join thousands of users who trust Facilon Platform</p>

                  <div className="feature-list">
                    <div className="feature-item">
                      <i className="fas fa-shield-alt"></i>
                      <div>
                        <h5>Secure & Reliable</h5>
                        <p>Enterprise-grade security for your data</p>
                      </div>
                    </div>

                    <div className="feature-item">
                      <i className="fas fa-users"></i>
                      <div>
                        <h5>User Management</h5>
                        <p>Comprehensive user management system</p>
                      </div>
                    </div>

                    <div className="feature-item">
                      <i className="fas fa-cog"></i>
                      <div>
                        <h5>Easy Configuration</h5>
                        <p>Simple setup and configuration</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="col-lg-6 signup-right-side">
              <div className="signup-form-container">
                <div className="signup-form-header">
                  <h2>Create Your Account</h2>
                  <p>Join Facilon Platform and get started</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
                  <div className="form-group">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          <i className="fas fa-user"></i>
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                          placeholder="Enter your first name"
                          {...register('firstName', { required: 'First name is required' })}
                        />
                        {errors.firstName && (
                          <div className="invalid-feedback">{errors.firstName.message}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">
                          <i className="fas fa-user"></i>
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                          placeholder="Enter your last name"
                          {...register('lastName', { required: 'Last name is required' })}
                        />
                        {errors.lastName && (
                          <div className="invalid-feedback">{errors.lastName.message}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="emailId" className="form-label">
                      <i className="fas fa-envelope"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="emailId"
                      className={`form-control ${errors.emailId ? 'is-invalid' : ''}`}
                      placeholder="Enter your email address"
                      {...register('emailId', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                          message: 'Please enter a valid email address',
                        },
                        onBlur: checkEmailExistence,
                      })}
                    />
                    {checkingEmail && <small className="text-muted">Checking email...</small>}
                    {errors.emailId && (
                      <div className="invalid-feedback">{errors.emailId.message}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="mobilePhone" className="form-label">
                      <i className="fas fa-phone"></i>
                      Mobile Phone
                    </label>
                    <input
                      type="text"
                      id="mobilePhone"
                      className={`form-control ${errors.mobilePhone ? 'is-invalid' : ''}`}
                      placeholder="Enter your mobile number"
                      {...register('mobilePhone', {
                        required: 'Mobile phone is required',
                        pattern: {
                          value: /^\+?\d{10,15}$/,
                          message: 'Mobile phone must be 10-15 digits',
                        },
                      })}
                    />
                    {errors.mobilePhone && (
                      <div className="invalid-feedback">{errors.mobilePhone.message}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Create a strong password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters long',
                        },
                      })}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password.message}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="agreeTerms"
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        I agree to the <a href="#" className="terms-link">Terms of Service</a> and{' '}
                        <a href="#" className="terms-link">Privacy Policy</a>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-signup w-100"
                    disabled={!isValid}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Create Account
                  </button>

                  <div className="signup-footer mt-3">
                    <p>
                      Already have an account?{' '}
                      <Link to="/login" className="login-link">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PreLoginFooter />
    </div>
  );
};

export default Signup;
