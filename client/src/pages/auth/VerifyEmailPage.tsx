import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid verification link');
        setIsLoading(false);
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setIsVerified(true);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setError(error.response?.data?.message || 'Failed to verify email');
        toast.error('Email verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Verifying your email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            The verification link may have expired or is invalid.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/register" className="btn btn-outline">
              Sign up again
            </Link>
            <Link to="/auth/login" className="btn btn-primary">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now sign in to your account.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Redirecting to login page in a few seconds...
          </p>
          
          <Link to="/auth/login" className="btn btn-primary">
            Continue to login
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmailPage;
