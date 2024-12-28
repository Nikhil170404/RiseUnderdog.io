import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Grid,
  Card,
  CardContent,
  Paper,
  AppBar,
  Toolbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  PlayCircleOutline, 
  EmojiEvents, 
  People, 
  SportsEsports,
  Security,
  Timeline,
  MonetizationOn,
  GroupAdd,
  Gamepad,
  EmojiPeople,
  Login
} from '@mui/icons-material';

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '90vh',
  background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4, 0),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 0),
    minHeight: '85vh',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
    minHeight: '80vh',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(/gaming-pattern.png) repeat',
    opacity: 0.1,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    background: 'rgba(255, 255, 255, 0.15)',
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(2),
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontSize: '1.1rem',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginRight: 0,
    marginBottom: theme.spacing(2),
  },
  '&.primary': {
    background: 'linear-gradient(45deg, #ff4081 30%, #ff6b9b 90%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
    },
  },
  '&.secondary': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '2px solid white',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  borderRadius: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const ResponsiveAppBar = styled(AppBar)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
}));

const features = [
  {
    icon: <SportsEsports sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Competitive Gaming',
    description: 'Join tournaments across multiple game titles and compete with players worldwide. Experience thrilling matches and showcase your skills.',
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Win Prizes',
    description: 'Compete for substantial cash prizes, premium gaming gear, and exclusive rewards. Every tournament offers exciting opportunities.',
  },
  {
    icon: <People sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Community',
    description: 'Connect with fellow gamers, form teams, and build your network. Join a thriving community of passionate players.',
  },
  {
    icon: <Security sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Secure Platform',
    description: 'Play on a secure platform with anti-cheat measures and fair play policies. Your gaming experience is our priority.',
  },
  {
    icon: <Timeline sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Track Progress',
    description: 'Monitor your performance with detailed statistics, rankings, and achievement tracking. Watch yourself improve over time.',
  },
  {
    icon: <MonetizationOn sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Easy Payments',
    description: 'Seamless transaction system for tournament entries and prize distributions. Quick and secure payment processing.',
  },
];

const howItWorks = [
  {
    icon: <GroupAdd sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: '1. Create Account',
    description: 'Sign up and complete your gaming profile with your achievements and preferences.',
  },
  {
    icon: <Gamepad sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: '2. Join Tournaments',
    description: 'Browse available tournaments and register for the ones that match your skill level.',
  },
  {
    icon: <EmojiPeople sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: '3. Compete & Win',
    description: 'Participate in matches, climb the leaderboard, and win exciting prizes.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector(state => state.auth.user);

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)' }}>
      {/* Navigation Bar for Non-logged Users */}
      {!user && (
        <ResponsiveAppBar>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{ color: 'white' }}
            >
              Sign In
            </Button>
          </Toolbar>
        </ResponsiveAppBar>
      )}

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            color: 'white', 
            mb: 8,
            pt: !user ? 8 : 0 // Add padding top if user is not logged in
          }}>
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                fontSize: {
                  xs: '2rem',
                  sm: '3rem',
                  md: '3.75rem'
                }
              }}
            >
              Rise UnderDog
            </Typography>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                px: 2
              }}
            >
              Where Underdogs Become Champions
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              gap: 2
            }}>
              <ActionButton
                className="primary"
                onClick={() => navigate('/register')}
                startIcon={<PlayCircleOutline />}
                fullWidth={isMobile}
              >
                Get Started
              </ActionButton>
              <ActionButton
                className="secondary"
                onClick={() => navigate('/tournaments')}
                fullWidth={isMobile}
              >
                View Tournaments
              </ActionButton>
            </Box>
          </Box>

          {/* Stats Section */}
          <Grid container spacing={isMobile ? 2 : 4} sx={{ mb: 8 }}>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant={isMobile ? "h4" : "h3"} sx={{ mb: 1 }}>10K+</Typography>
                <Typography>Active Players</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant={isMobile ? "h4" : "h3"} sx={{ mb: 1 }}>₹100K+</Typography>
                <Typography>Prize Pool</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant={isMobile ? "h4" : "h3"} sx={{ mb: 1 }}>50+</Typography>
                <Typography>Daily Tournaments</Typography>
              </StatsCard>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ py: isMobile ? 4 : 8, background: 'rgba(0, 0, 0, 0.3)' }}>
        <Container maxWidth="lg">
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h2" 
            sx={{ 
              mb: isMobile ? 4 : 6, 
              color: 'white', 
              textAlign: 'center' 
            }}
          >
            Platform Features
          </Typography>
          <Grid container spacing={isMobile ? 2 : 4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard>
                  <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                    {feature.icon}
                    <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: isMobile ? 4 : 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h2" 
            sx={{ 
              mb: isMobile ? 4 : 6, 
              color: 'white', 
              textAlign: 'center' 
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={isMobile ? 2 : 4}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'white',
                  mb: isMobile ? 2 : 0
                }}>
                  {step.icon}
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ 
        py: isMobile ? 4 : 8, 
        textAlign: 'center', 
        background: 'rgba(0, 0, 0, 0.3)' 
      }}>
        <Container maxWidth="sm">
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ mb: 3, color: 'white' }}
          >
            Ready to Start Your Journey?
          </Typography>
          <Typography 
            sx={{ 
              mb: 4, 
              color: 'white', 
              opacity: 0.9,
              px: isMobile ? 2 : 0
            }}
          >
            Join thousands of players competing in tournaments and winning prizes daily.
          </Typography>
          <ActionButton
            className="primary"
            onClick={() => navigate('/register')}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
          >
            Create Account Now
          </ActionButton>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
