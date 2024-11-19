import React from 'react';
import { LandingPage } from './pages/LandingPage';
import { ApplyPage } from './pages/ApplyPage';
import { PendingPage } from './pages/PendingPage';
import { AuthenticatedApp } from './components/AuthenticatedApp';
import { useSession } from './hooks/useSession';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StripeProvider } from './contexts/StripeContext';

export default function App() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-green-500 font-mono">Loading...</div>
      </div>
    );
  }

  // Not logged in - show landing page
  if (!session) {
    return (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    );
  }

  // Check if user is admin
  const isAdmin = session.user.email === 'andre@thegarden.pt';

  // Admin always sees the full app
  if (isAdmin) {
    return (
      <ErrorBoundary>
        <StripeProvider>
          <AuthenticatedApp />
        </StripeProvider>
      </ErrorBoundary>
    );
  }

  // For non-admin users, check application status from metadata
  const applicationStatus = session.user.user_metadata?.application_status;

  // If no application status, show application page
  if (!applicationStatus) {
    return (
      <ErrorBoundary>
        <ApplyPage />
      </ErrorBoundary>
    );
  }

  // If application is pending or rejected, show status page
  if (applicationStatus === 'pending' || applicationStatus === 'rejected') {
    return (
      <ErrorBoundary>
        <PendingPage status={applicationStatus} />
      </ErrorBoundary>
    );
  }

  // If application is approved, show full app
  if (applicationStatus === 'approved') {
    return (
      <ErrorBoundary>
        <StripeProvider>
          <AuthenticatedApp />
        </StripeProvider>
      </ErrorBoundary>
    );
  }

  // Fallback to application page
  return (
    <ErrorBoundary>
      <ApplyPage />
    </ErrorBoundary>
  );
}