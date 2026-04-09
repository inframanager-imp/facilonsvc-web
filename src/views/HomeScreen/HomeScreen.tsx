import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './HomeScreen.scss';

interface HomeScreenFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  zip: string;
}

const HomeScreen: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HomeScreenFormData>();

  const onSubmit = (data: HomeScreenFormData) => {
    console.log('Submitting form payload:', data);
    // TODO: send data to backend via a service when available
  };

  return (
    <div className="home-screen-container">
      <div className="container">
        <h2>Contact Form</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="home-screen-form">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                id="firstName"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && (
                <div className="invalid-feedback">{errors.firstName.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="lastName" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                id="lastName"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && (
                <div className="invalid-feedback">{errors.lastName.message}</div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="mobile" className="form-label">
                Mobile *
              </label>
              <input
                type="tel"
                className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                id="mobile"
                {...register('mobile', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Mobile must be 10 digits',
                  },
                })}
              />
              {errors.mobile && (
                <div className="invalid-feedback">{errors.mobile.message}</div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="city" className="form-label">
                City *
              </label>
              <input
                type="text"
                className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                id="city"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && (
                <div className="invalid-feedback">{errors.city.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="zip" className="form-label">
                ZIP Code *
              </label>
              <input
                type="text"
                className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
                id="zip"
                {...register('zip', { required: 'ZIP code is required' })}
              />
              {errors.zip && (
                <div className="invalid-feedback">{errors.zip.message}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => reset()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeScreen;
