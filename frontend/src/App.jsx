import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Founder Pages
import FounderDashboard from './pages/founder/FounderDashboard';
import StartupProfile from './pages/founder/StartupProfile';
import DocumentUpload from './pages/founder/DocumentUpload';
import AIAnalysis from './pages/founder/AIAnalysis';
import FundingReadiness from './pages/founder/FundingReadiness';
import InvestorRecommendations from './pages/founder/InvestorRecommendations';
import GovernmentSchemes from './pages/founder/GovernmentSchemes';
import ApplicationTracker from './pages/founder/ApplicationTracker';
import FounderAnalytics from './pages/founder/FounderAnalytics';
import Notifications from './pages/founder/Notifications';

// Investor Pages
import InvestorDashboard from './pages/investor/InvestorDashboard';
import InvestorProfile from './pages/investor/InvestorProfile';
import StartupDiscovery from './pages/investor/StartupDiscovery';
import StartupDetail from './pages/investor/StartupDetail';
import SavedStartups from './pages/investor/SavedStartups';
import InvestorApplications from './pages/investor/InvestorApplications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AdminStartups from './pages/admin/AdminStartups';
import AIStatistics from './pages/admin/AIStatistics';

const Loading = () => (
  <div className="min-h-screen gradient-bg flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading Fundora AI..." />
  </div>
);

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Founder Routes */}
            <Route element={<ProtectedRoute roles={['founder']} />}>
              <Route element={<Layout />}>
                <Route path="/founder" element={<FounderDashboard />} />
                <Route path="/founder/profile" element={<StartupProfile />} />
                <Route path="/founder/documents" element={<DocumentUpload />} />
                <Route path="/founder/ai-analysis" element={<AIAnalysis />} />
                <Route path="/founder/funding-readiness" element={<FundingReadiness />} />
                <Route path="/founder/investors" element={<InvestorRecommendations />} />
                <Route path="/founder/schemes" element={<GovernmentSchemes />} />
                <Route path="/founder/applications" element={<ApplicationTracker />} />
                <Route path="/founder/analytics" element={<FounderAnalytics />} />
                <Route path="/founder/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Investor Routes */}
            <Route element={<ProtectedRoute roles={['investor']} />}>
              <Route element={<Layout />}>
                <Route path="/investor" element={<InvestorDashboard />} />
                <Route path="/investor/profile" element={<InvestorProfile />} />
                <Route path="/investor/discover" element={<StartupDiscovery />} />
                <Route path="/investor/startup/:id" element={<StartupDetail />} />
                <Route path="/investor/saved" element={<SavedStartups />} />
                <Route path="/investor/applications" element={<InvestorApplications />} />
                <Route path="/investor/analytics" element={<FounderAnalytics />} />
                <Route path="/investor/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/startups" element={<AdminStartups />} />
                <Route path="/admin/schemes" element={<GovernmentSchemes />} />
                <Route path="/admin/ai-stats" element={<AIStatistics />} />
                <Route path="/admin/reports" element={<FounderAnalytics />} />
                <Route path="/admin/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}
