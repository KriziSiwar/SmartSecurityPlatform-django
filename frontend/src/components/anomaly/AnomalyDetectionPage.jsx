import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import CameraAnomalyDetection from '../camera/CameraAnomalyDetection';

const AnomalyDetectionPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h2" variant="h4" gutterBottom>
          Détection d'Anomalies en Temps Réel
        </Typography>
        <Typography variant="body1" paragraph>
          Cette fonctionnalité permet de détecter en temps réel les comportements suspects et les objets abandonnés 
          à l'aide de l'intelligence artificielle. Activez votre caméra pour commencer la détection.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <CameraAnomalyDetection />
        </Box>
      </Paper>
    </Container>
  );
};

export default AnomalyDetectionPage;
