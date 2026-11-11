import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { DatasetProvider } from '@/lib/datasetStore';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import UploadDataset from '@/pages/UploadDataset';
import DataQuality from '@/pages/DataQuality';
import RfmAnalysis from '@/pages/RfmAnalysis';
import Segmentation from '@/pages/Segmentation';
import CustomerExplorer from '@/pages/CustomerExplorer';
import CustomerProfile from '@/pages/CustomerProfile';
import Insights from '@/pages/Insights';
import Exports from '@/pages/Exports';
import TableauGuide from '@/pages/TableauGuide';
import Tests from '@/pages/Tests';
import Settings from '@/pages/Settings';
import Docs from '@/pages/Docs';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route
          element={
            <DatasetProvider>
              <Layout />
            </DatasetProvider>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadDataset />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route path="/rfm" element={<RfmAnalysis />} />
          <Route path="/segments" element={<Segmentation />} />
          <Route path="/customers" element={<CustomerExplorer />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/exports" element={<Exports />} />
          <Route path="/tableau" element={<TableauGuide />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/docs" element={<Docs />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App