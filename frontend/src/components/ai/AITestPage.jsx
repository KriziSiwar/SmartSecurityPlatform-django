import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const AITestPage = () => {
  const [message, setMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Exemples prédéfinis
  const examples = [
    'Détection de mouvement suspect dans le parking après fermeture',
    'Fumée détectée dans la salle serveurs température élevée',
    'Caméra 5 hors ligne depuis 2 heures maintenance nécessaire',
    'Test hebdomadaire du système d\'alarme effectué',
    'Intrusion confirmée entrée forcée porte arrière',
    'Température critique détectée local électrique',
  ];

  const classifyMessage = async (testMessage = null) => {
    const msgToClassify = testMessage || message;
    
    if (!msgToClassify.trim()) {
      setError('Veuillez entrer un message');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await axios.post('http://localhost:8000/api/classify-alert/', {
        message: msgToClassify
      });

      if (response.data.success) {
        setPrediction(response.data.prediction);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Erreur lors de la classification');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setMessage(example);
    classifyMessage(example);
  };

  const handleReset = () => {
    setMessage('');
    setPrediction(null);
    setError('');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'intrusion': 'error',
      'incendie': 'warning',
      'technique': 'info',
      'fausse_alerte': 'success'
    };
    return colors[category] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critique': 'error',
      'urgent': 'warning',
      'normal': 'info',
      'faible': 'default'
    };
    return colors[priority] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <PsychologyIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4">
            🤖 Test du Classificateur IA d'Alertes
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Testez le système de classification automatique des alertes.
          Entrez un message ou cliquez sur un exemple.
        </Typography>

        <Grid container spacing={3}>
          {/* Zone de saisie */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Message à analyser
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Entrez le message de l'alerte à classifier..."
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={() => classifyMessage()}
                  disabled={loading || !message.trim()}
                  fullWidth
                >
                  {loading ? 'Classification...' : 'Classifier'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Exemples rapides
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Cliquez sur un exemple pour le tester
              </Typography>

              <Box display="flex" flexDirection="column" gap={1}>
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleExampleClick(example)}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      textAlign: 'left',
                      textTransform: 'none'
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Résultats de l'IA */}
          <Grid item xs={12} md={6}>
            {prediction ? (
              <Card 
                elevation={3}
                sx={{ 
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Résultats de l'Analyse
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Catégorie */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      🎯 Catégorie détectée
                    </Typography>
                    <Chip
                      label={prediction.category_label}
                      color={getCategoryColor(prediction.category)}
                      size="large"
                      sx={{ fontSize: '1.1rem', py: 2.5 }}
                    />
                  </Box>

                  {/* Priorité */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ⚡ Priorité
                    </Typography>
                    <Chip
                      label={prediction.priority_label}
                      color={getPriorityColor(prediction.priority)}
                      size="large"
                      sx={{ fontSize: '1.1rem', py: 2.5 }}
                    />
                  </Box>

                  {/* Confiance */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📊 Niveau de confiance
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box 
                        sx={{ 
                          flex: 1,
                          height: 12, 
                          bgcolor: 'grey.200', 
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${prediction.confidence * 100}%`,
                            height: '100%',
                            bgcolor: prediction.confidence > 0.7 
                              ? 'success.main' 
                              : prediction.confidence > 0.5 
                              ? 'warning.main' 
                              : 'error.main',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Explication */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      💡 Explication
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        {prediction.explanation}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Actions recommandées */}
                  {prediction.recommended_actions && prediction.recommended_actions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ✅ Actions recommandées
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                        <List dense disablePadding>
                          {prediction.recommended_actions.map((action, index) => (
                            <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                              <ListItemText 
                                primary={`${index + 1}. ${action}`}
                                primaryTypographyProps={{ 
                                  variant: 'body2',
                                  fontWeight: 500
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Box>
                  )}

                  {/* Données brutes (pour debug) */}
                  <Box mt={3}>
                    <Typography variant="caption" color="text.secondary">
                      ID Catégorie: {prediction.category} | ID Priorité: {prediction.priority}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50'
                }}
              >
                <PsychologyIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  En attente d'analyse
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Entrez un message et cliquez sur "Classifier" pour voir les résultats de l'IA
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Statistiques et informations */}
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  📚 Modèle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Naive Bayes Multinomial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  60 exemples d'entraînement
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  🎯 Catégories
                </Typography>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Chip label="Intrusion" color="error" size="small" />
                  <Chip label="Incendie" color="warning" size="small" />
                  <Chip label="Technique" color="info" size="small" />
                  <Chip label="Fausse alerte" color="success" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  ⚡ Priorités
                </Typography>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Chip label="Critique" color="error" size="small" />
                  <Chip label="Urgent" color="warning" size="small" />
                  <Chip label="Normal" color="info" size="small" />
                  <Chip label="Faible" color="default" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Note pour l'admin */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Astuce:</strong> Pour améliorer la précision du modèle, ajoutez plus d'exemples 
            dans <code>training_data.py</code> et réentraînez le modèle via 
            <code> POST /api/alertes/train-classifier/</code>
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default AITestPage;