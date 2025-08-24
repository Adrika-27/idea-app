import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const { connect } = useSocketStore();

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      const error = searchParams.get('error');
      const user = searchParams.get('user');
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (error) {
        toast.error(decodeURIComponent(error));
        navigate('/auth/login');
        return;
      }

      if (success === 'true' && user && accessToken && refreshToken) {
        try {
          const userData = JSON.parse(decodeURIComponent(user));
          const tokens = {
            accessToken: decodeURIComponent(accessToken),
            refreshToken: decodeURIComponent(refreshToken),
          };

          setUser(userData);
          setTokens(tokens);
          
          // Connect to socket
          connect(tokens.accessToken);

          toast.success('Successfully signed in!');
          
          // Get redirect URL from sessionStorage or default to dashboard
          const redirectUrl = sessionStorage.getItem('auth_redirect') || '/dashboard';
          sessionStorage.removeItem('auth_redirect');
          
          navigate(redirectUrl, { replace: true });
        } catch (parseError) {
          console.error('Failed to parse OAuth response:', parseError);
          toast.error('Authentication failed. Please try again.');
          navigate('/auth/login');
        }
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setTokens, connect]);

  return (
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Completing authentication...</p>
    </div>
  );
};

export default AuthCallbackPage;
