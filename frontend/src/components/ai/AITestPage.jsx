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
  Fade,
  Slide,
  Zoom,
  Grow,
  LinearProgress,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  LocalFireDepartment as FireIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

const AITestPage = () => {
  const [message, setMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Exemples prédéfinis avec icônes
  const examples = [
    {
      text: 'Détection de mouvement suspect dans le parking après fermeture',
      icon: '🚨',
      color: '#f44336'
    },
    {
      text: 'Fumée détectée dans la salle serveurs température élevée',
      icon: '🔥',
      color: '#ff9800'
    },
    {
      text: 'Caméra 5 hors ligne depuis 2 heures maintenance nécessaire',
      icon: '🔧',
      color: '#2196f3'
    },
    {
      text: 'Test hebdomadaire du système d\'alarme effectué',
      icon: '✅',
      color: '#4caf50'
    },
    {
      text: 'Intrusion confirmée entrée forcée porte arrière',
      icon: '⚠️',
      color: '#d32f2f'
    },
    {
      text: 'Température critique détectée local électrique',
      icon: '🌡️',
      color: '#ff5722'
    },
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
    setShowResult(false);

    try {
      const response = await axios.post('http://localhost:8000/api/classify-alert/', {
        message: msgToClassify
      });

      if (response.data.success) {
        // Délai pour l'animation
        setTimeout(() => {
          setPrediction(response.data.prediction);
          setShowResult(true);
        }, 500);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Erreur lors de la classification');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setMessage(example.text);
    classifyMessage(example.text);
  };

  const handleReset = () => {
    setMessage('');
    setPrediction(null);
    setError('');
    setShowResult(false);
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

  const getCategoryIcon = (category) => {
    const icons = {
      'intrusion': <ShieldIcon />,
      'incendie': <FireIcon />,
      'technique': <BuildIcon />,
      'fausse_alerte': <CheckCircleIcon />
    };
    return icons[category] || <AutoAwesomeIcon />;
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
        {/* En-tête animé */}
        <Fade in timeout={800}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            mb={4}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              p: 4,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              }
            }}
          >
            <Zoom in timeout={1000}>
              <PsychologyIcon sx={{ fontSize: 60, mr: 2, animation: 'pulse 2s infinite' }} />
            </Zoom>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                Classificateur IA d'Alertes
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                Analyse intelligente et automatique des alertes de sécurité
              </Typography>
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {/* Zone de saisie */}
          <Grid item xs={12} md={6}>
            <Slide direction="right" in timeout={600}>
              <Paper 
                elevation={8} 
                sx={{ 
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <Box display="flex" alignItems="center" mb={3}>
                  <SendIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" fontWeight="600">
                    Message à analyser
                  </Typography>
                </Box>

                {error && (
                  <Fade in>
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  </Fade>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Entrez le message de l'alerte à classifier..."
                  variant="outlined"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                      }
                    }
                  }}
                />

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    onClick={() => classifyMessage()}
                    disabled={loading || !message.trim()}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      },
                      '&:disabled': {
                        background: 'grey.300',
                      }
                    }}
                  >
                    {loading ? 'Classification en cours...' : 'Classifier avec l\'IA'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleReset}
                    sx={{
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'rotate(180deg)',
                        transition: 'transform 0.5s',
                      }
                    }}
                  >
                    Reset
                  </Button>
                </Box>

                {loading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      sx={{ 
                        borderRadius: 1,
                        height: 8,
                        background: 'rgba(102, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        }
                      }} 
                    />
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box display="flex" alignItems="center" mb={2}>
                  <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    Exemples rapides
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Cliquez sur un exemple pour le tester instantanément
                </Typography>

                <Box display="flex" flexDirection="column" gap={1.5}>
                  {examples.map((example, index) => (
                    <Grow in timeout={800 + (index * 100)} key={index}>
                      <Button
                        variant="outlined"
                        onClick={() => handleExampleClick(example)}
                        sx={{ 
                          justifyContent: 'flex-start', 
                          textAlign: 'left',
                          textTransform: 'none',
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          borderWidth: 2,
                          borderColor: 'grey.300',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: example.color,
                            backgroundColor: `${example.color}10`,
                            transform: 'translateX(8px)',
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            fontSize: '1.5rem', 
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {example.icon}
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {example.text}
                        </Typography>
                      </Button>
                    </Grow>
                  ))}
                </Box>
              </Paper>
            </Slide>
          </Grid>

          {/* Résultats de l'IA */}
          <Grid item xs={12} md={6}>
            {prediction && showResult ? (
              <Slide direction="left" in timeout={600}>
                <Card 
                  elevation={8}
                  sx={{ 
                    borderRadius: 3,
                    background: 'linear-gradient(to bottom right, #ffffff 0%, #f0f4ff 100%)',
                    border: '3px solid',
                    borderColor: 'primary.main',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -100,
                      right: -100,
                      width: 300,
                      height: 300,
                      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                      animation: 'float 6s ease-in-out infinite',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Zoom in timeout={800}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <Box
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            p: 1.5,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <PsychologyIcon sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="700">
                          Résultats de l'Analyse IA
                        </Typography>
                      </Box>
                    </Zoom>

                    <Divider sx={{ mb: 3 }} />

                    {/* Catégorie */}
                    <Fade in timeout={1000}>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          🎯 Catégorie détectée
                        </Typography>
                        <Chip
                          icon={getCategoryIcon(prediction.category)}
                          label={prediction.category_label}
                          color={getCategoryColor(prediction.category)}
                          size="large"
                          sx={{ 
                            fontSize: '1.1rem', 
                            py: 3, 
                            px: 2,
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              transition: 'transform 0.3s',
                            }
                          }}
                        />
                      </Box>
                    </Fade>

                    {/* Priorité */}
                    <Fade in timeout={1200}>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          ⚡ Niveau de priorité
                        </Typography>
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={prediction.priority_label}
                          color={getPriorityColor(prediction.priority)}
                          size="large"
                          sx={{ 
                            fontSize: '1.1rem', 
                            py: 3,
                            px: 2,
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              transition: 'transform 0.3s',
                            }
                          }}
                        />
                      </Box>
                    </Fade>

                    {/* Confiance */}
                    <Fade in timeout={1400}>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          📊 Niveau de confiance IA
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{ 
                              flex: 1,
                              height: 16, 
                              bgcolor: 'grey.200', 
                              borderRadius: 3,
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${prediction.confidence * 100}%`,
                                height: '100%',
                                background: prediction.confidence > 0.7 
                                  ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)' 
                                  : prediction.confidence > 0.5 
                                  ? 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)' 
                                  : 'linear-gradient(90deg, #f44336 0%, #e57373 100%)',
                                transition: 'width 1s ease-out',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                              }}
                            />
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {(prediction.confidence * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>

                    {/* Explication */}
                    <Fade in timeout={1600}>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          💡 Explication de l'IA
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2.5, 
                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: 2,
                            borderColor: 'primary.light',
                            borderWidth: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                            {prediction.explanation}
                          </Typography>
                        </Paper>
                      </Box>
                    </Fade>

                    {/* Actions recommandées */}
                    {prediction.recommended_actions && prediction.recommended_actions.length > 0 && (
                      <Fade in timeout={1800}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                            ✅ Actions recommandées
                          </Typography>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2.5, 
                              bgcolor: 'rgba(76, 175, 80, 0.05)',
                              borderRadius: 2,
                              borderColor: 'success.light',
                              borderWidth: 2,
                            }}
                          >
                            <List dense disablePadding>
                              {prediction.recommended_actions.map((action, index) => (
                                <Zoom in timeout={2000 + (index * 100)} key={index}>
                                  <ListItem 
                                    sx={{ 
                                      pl: 0, 
                                      py: 1,
                                      transition: 'all 0.3s',
                                      '&:hover': {
                                        transform: 'translateX(8px)',
                                      }
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        mr: 2,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      {index + 1}
                                    </Box>
                                    <ListItemText 
                                      primary={action}
                                      primaryTypographyProps={{ 
                                        variant: 'body2',
                                        fontWeight: 500,
                                        lineHeight: 1.6,
                                      }}
                                    />
                                  </ListItem>
                                </Zoom>
                              ))}
                            </List>
                          </Paper>
                        </Box>
                      </Fade>
                    )}
                  </CardContent>
                </Card>
              </Slide>
            ) : (
              <Fade in timeout={600}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: '3px dashed',
                    borderColor: 'grey.300',
                    bgcolor: 'grey.50',
                    borderRadius: 3,
                    minHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.05)' },
                      }
                    }}
                  >
                    <PsychologyIcon sx={{ fontSize: 100, color: 'grey.400', mb: 3 }} />
                  </Box>
                  <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                    En attente d'analyse
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Entrez un message et cliquez sur "Classifier" pour voir la magie de l'IA opérer ✨
                  </Typography>
                </Paper>
              </Fade>
            )}
          </Grid>
        </Grid>

        {/* Statistiques et informations */}
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={4}>
            <Grow in timeout={1000}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        p: 1,
                        mr: 1.5,
                      }}
                    >
                      <PsychologyIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Modèle IA
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <strong>Type:</strong> Naive Bayes Multinomial
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Données:</strong> 60 exemples d'entraînement
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grow in timeout={1200}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                    🎯 Catégories
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Chip icon={<ShieldIcon />} label="Intrusion" color="error" size="small" />
                    <Chip icon={<FireIcon />} label="Incendie" color="warning" size="small" />
                    <Chip icon={<BuildIcon />} label="Technique" color="info" size="small" />
                    <Chip icon={<CheckCircleIcon />} label="Fausse alerte" color="success" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grow in timeout={1400}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                    ⚡ Niveaux de priorité
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Chip label="Critique" color="error" size="small" />
                    <Chip label="Urgent" color="warning" size="small" />
                    <Chip label="Normal" color="info" size="small" />
                    <Chip label="Faible" color="default" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Note améliorée */}
        <Fade in timeout={1600}>
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3,
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'info.light',
              '& .MuiAlert-icon': {
                fontSize: 32,
              }
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              <strong>💡 Conseil pro:</strong> Pour améliorer la précision du modèle, enrichissez 
              les données d'entraînement dans <code style={{ 
                background: 'rgba(0,0,0,0.1)', 
                padding: '2px 8px', 
                borderRadius: 4,
                fontFamily: 'monospace'
              }}>training_data.py</code> et réentraînez via 
              <code style={{ 
                background: 'rgba(0,0,0,0.1)', 
                padding: '2px 8px', 
                borderRadius: 4,
                fontFamily: 'monospace',
                marginLeft: 4
              }}>POST /api/alertes/train-classifier/</code>
            </Typography>
          </Alert>
        </Fade>
      </Box>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
      `}</style>
    </Container>
  );
};

export default AITestPage;