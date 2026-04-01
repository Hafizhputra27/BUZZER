import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import BuzzerLayout from './layouts/BuzzerLayout';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import CampaignDetail from './pages/CampaignDetail';
import BuzzerDashboard from './pages/BuzzerDashboard';
import AssignmentDetail from './pages/AssignmentDetail';

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a2540',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/campaigns/:id" element={<CampaignDetail />} />
        </Route>

        {/* Protected Buzzer Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="buzzer">
              <BuzzerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard/buzzer" element={<BuzzerDashboard />} />
          <Route path="/dashboard/buzzer/assignments/:id" element={<AssignmentDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
