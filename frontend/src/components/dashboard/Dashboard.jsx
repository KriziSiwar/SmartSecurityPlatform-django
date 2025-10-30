import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Videocam as VideocamIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Build as BuildIcon,
  Sensors as SensorsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import CameraAnomalyDetection from '../camera/CameraAnomalyDetection';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  const statCards = [
    {
      title: 'Sites Clients',
      value: stats?.total_sites || 0,
      active: stats?.active_sites || 0,
      icon: <BusinessIcon />,
      color: '#1976d2',
    },
    {
      title: 'Caméras',
      value: stats?.total_cameras || 0,
      active: stats?.active_cameras || 0,
      icon: <VideocamIcon />,
      color: '#388e3c',
    },
    {
      title: 'Capteurs',
      value: stats?.total_capteurs || 0,
      icon: <SensorsIcon />,
      color: '#f57c00',
    },
    {
      title: 'Événements',
      value: stats?.total_evenements || 0,
      active: stats?.active_events || 0,
      icon: <EventIcon />,
      color: '#7b1fa2',
    },
    {
      title: 'Alertes',
      value: stats?.total_alertes || 0,
      critical: stats?.alertes_critiques || 0,
      icon: <WarningIcon />,
      color: '#d32f2f',
    },
    {
      title: 'Maintenances',
      value: stats?.total_maintenances || 0,
      planned: stats?.maintenances_planifiees || 0,
      icon: <BuildIcon />,
      color: '#0288d1',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="primary">
                  {card.value}
                </Typography>
                {card.active !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    Actif: {card.active}
                  </Typography>
                )}
                {card.critical !== undefined && (
                  <Typography variant="body2" color="error">
                    Critiques: {card.critical}
                  </Typography>
                )}
                {card.planned !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    Planifiées: {card.planned}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité Récente
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                • Nouveau site ajouté: Siège Central
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Alerte de sécurité détectée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Maintenance terminée: Caméra 1
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alertes Non Lues
            </Typography>
            <Typography variant="h4" color="error">
              {stats?.unread_alerts_count || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de vos alertes: {stats?.user_alerts_count || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Section Détection d'Anomalies */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <VideocamIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
              <Box>
                <Typography variant="h5" component="h2" color="primary">
                  Détection d'Anomalies en Temps Réel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activez votre caméra pour détecter des objets et des comportements suspects
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: 2, 
              p: 3, 
              textAlign: 'center',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'background.paper'
            }}>
              <CameraAnomalyDetection 
                cameraId="dashboard-cam-1" 
                cameraName="Caméra de surveillance"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;