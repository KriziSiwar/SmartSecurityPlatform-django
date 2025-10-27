import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
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
import Layout from './components/layout/Layout';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
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
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
