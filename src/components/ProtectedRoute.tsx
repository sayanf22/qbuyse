import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute = ({ children, requireAuth = true, fallback }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading, requireAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to access this page.</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Log In
              </button>
            </div>
          </div>
        )}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;