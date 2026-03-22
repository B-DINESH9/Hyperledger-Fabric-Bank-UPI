import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminTransactions from './pages/AdminTransactions';
import AdminFraudAlerts from './pages/AdminFraudAlerts';
import AdminAnalytics from './pages/AdminAnalytics';
import DebugAuth from './pages/DebugAuth';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Layout Component
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/transfer"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Transfer />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Transactions />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/transactions"
                element={
                  <ProtectedRoute requireAdmin>
                    <AppLayout>
                      <AdminTransactions />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/fraud-alerts"
                element={
                  <ProtectedRoute requireAdmin>
                    <AppLayout>
                      <AdminFraudAlerts />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute requireAdmin>
                    <AppLayout>
                      <AdminAnalytics />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Debug Route */}
              <Route
                path="/debug"
                element={
                  <AppLayout>
                    <DebugAuth />
                  </AppLayout>
                }
              />
              
              {/* Default Route */}
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
              
              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <AppLayout>
                    <div className="text-center py-12">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page not found</p>
                      <button
                        onClick={() => window.history.back()}
                        className="btn-primary"
                      >
                        Go Back
                      </button>
                    </div>
                  </AppLayout>
                }
              />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
