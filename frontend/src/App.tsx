import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const SettingsPage = () => <div className="text-slate-900 font-display text-4xl font-bold">Settings Page (Coming Soon)</div>;

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Login Route Wrapper (Redirect if already logged in)
const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Or a spinner

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ]
      },
    ],
  },
  {
    path: '/login',
    element: <PublicRoute />,
    children: [
      { index: true, element: <LoginPage /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
