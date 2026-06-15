import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../IntroducedRegistration/IntroducedInvestorRegistration.scss';
import { CompactHeader } from '../../../components/CompactHeader/CompactHeader';
import { CompactFooter } from '../../../components/CompactFooter/CompactFooter';
import { FiCheck } from 'react-icons/fi';

const CheckIcon = FiCheck as any;

/**
 * Success Page after Registration
 * Matches Laravel: registration-success page
 */
export const SelfRegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <CompactHeader />

      <section className="login-form-style4 section-padding py-12 flex justify-center items-center min-h-[60vh]">
        <div className="container flex justify-center">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckIcon size={32} className="text-emerald-600 flex-shrink-0" />
            </div>
            
            <h3 className="text-[22px] font-bold text-slate-800 mb-2">Registration Successful!</h3>

            <div className="text-[12px] text-slate-500 mb-4 max-w-[280px] leading-relaxed">
              <p className="mb-2">Thank you for registering with Facilon Services.</p>
              <p className="mb-2">Your registration has been submitted successfully.</p>
              <p className="mb-2">We've sent you an email with a secure link to set your password and activate your account.</p>
              <p className="mb-0">Please check your inbox (and spam folder) and click the link to continue.</p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button 
                type="button"
                className="w-full py-2 bg-[#3e6f7c] hover:bg-[#355f69] text-white text-[12px] font-bold rounded-md transition-colors cursor-pointer border-0 shadow-sm" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
              <button 
                type="button"
                className="w-full py-2 bg-[#f8fafc] hover:bg-slate-100 text-slate-600 text-[12px] font-bold rounded-md transition-colors cursor-pointer border border-slate-200 shadow-sm" 
                onClick={() => navigate('/')}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </section>
      <CompactFooter />
    </>
  );
};

export default SelfRegistrationSuccess;
