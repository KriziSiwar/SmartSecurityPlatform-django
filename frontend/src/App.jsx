import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TechnicienDashboard from './components/dashboard/TechnicienDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import SitesList from './components/sites/SitesList';
import SiteDetail from './components/sites/SiteDetail';
import SiteForm from './components/sites/SiteForm';
import AlertsList from './components/alerts/AlertsList';
import AlertDetail from './components/alerts/AlertDetail';
import AlertForm from './components/alerts/AlertForm';
import CamerasList from './components/cameras/CamerasList';
import CameraDetail from './components/cameras/CameraDetail';
import CameraForm from './components/cameras/CameraForm';
import SensorsList from './components/sensors/SensorsList';
import SensorDetail from './components/sensors/SensorDetail';
import SensorForm from './components/sensors/SensorForm';
import EventsList from './components/events/EventsList';
import EventDetail from './components/events/EventDetail';
import EventForm from './components/events/EventForm';
import ReportsList from './components/reports/ReportsList';
import ReportDetail from './components/reports/ReportDetail';
import ReportForm from './components/reports/ReportForm';
import MaintenancesList from './components/maintenances/MaintenancesList';
import MaintenanceDetail from './components/maintenances/MaintenanceDetail';
import MaintenanceForm from './components/maintenances/MaintenanceForm';
import AITestPage from './components/ai/AITestPage';
import Layout from './components/layout/Layout';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A', // Dark Slate Blue - header/sidebar
    },
    secondary: {
      main: '#3B82F6', // Electric Blue - active elements
    },
    background: {
      default: '#F5F7FA', // Gris Très Clair
    },
    success: {
      main: '#10B981', // Green for active items
    },
    warning: {
      main: '#F59E0B', // Amber for maintenances
    },
    info: {
      main: '#03A9F4', // Blue for general info
    },
    error: {
      main: '#EF4444', // Red for alerts
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E3A8A', // Dark Slate Blue pour header
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E3A8A', // Dark Slate Blue pour sidebar
          color: '#ffffff',
        },
      },
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function RoleBasedDashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'technicien':
      return <TechnicienDashboard />;
    case 'client':
      return <ClientDashboard />;
    default:
      return <Dashboard />;
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<RoleBasedDashboard />} />
              <Route path="sites" element={<SitesList />} />
              <Route path="sites/new" element={<SiteForm />} />
              <Route path="sites/:id" element={<SiteDetail />} />
              <Route path="sites/:id/edit" element={<SiteForm />} />
              <Route path="alerts" element={<AlertsList />} />
              <Route path="alerts/new" element={<AlertForm />} />
              <Route path="alerts/:id" element={<AlertDetail />} />
              <Route path="alerts/:id/edit" element={<AlertForm />} />
              <Route path="cameras" element={<CamerasList />} />
              <Route path="cameras/new" element={<CameraForm />} />
              <Route path="cameras/:id" element={<CameraDetail />} />
              <Route path="cameras/:id/edit" element={<CameraForm />} />
              <Route path="sensors" element={<SensorsList />} />
              <Route path="sensors/new" element={<SensorForm />} />
              <Route path="sensors/:id" element={<SensorDetail />} />
              <Route path="sensors/:id/edit" element={<SensorForm />} />
              <Route path="events" element={<EventsList />} />
              <Route path="events/new" element={<EventForm />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="events/:id/edit" element={<EventForm />} />
              <Route path="reports" element={<ReportsList />} />
              <Route path="reports/new" element={<ReportForm />} />
              <Route path="reports/:id" element={<ReportDetail />} />
              <Route path="reports/:id/edit" element={<ReportForm />} />
              <Route path="maintenances" element={<MaintenancesList />} />
              <Route path="maintenances/new" element={<MaintenanceForm />} />
              <Route path="maintenances/:id" element={<MaintenanceDetail />} />
              <Route path="maintenances/:id/edit" element={<MaintenanceForm />} />
              <Route path="ai-test" element={<AITestPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
