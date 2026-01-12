import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Bolt as BoltIcon } from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 } }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#1a1a1a',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            teamified
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.9rem',
                  color: '#4B5563',
                  cursor: 'pointer',
                  '&:hover': { color: '#9333EA' },
                }}
              >
                Solutions
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.9rem',
                  color: '#4B5563',
                  cursor: 'pointer',
                  '&:hover': { color: '#9333EA' },
                }}
              >
                Who We Serve
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.9rem',
                  color: '#4B5563',
                  cursor: 'pointer',
                  '&:hover': { color: '#9333EA' },
                }}
              >
                Job Board
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.9rem',
                  color: '#4B5563',
                  cursor: 'pointer',
                  '&:hover': { color: '#9333EA' },
                }}
              >
                Pricing
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#9333EA',
                color: 'white',
                textTransform: 'none',
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 3,
                py: 1,
                borderRadius: '6px',
                '&:hover': {
                  bgcolor: '#7C3AED',
                },
              }}
            >
              Login / Signup
            </Button>

            <Button
              variant="contained"
              sx={{
                bgcolor: '#002DFF',
                color: 'white',
                textTransform: 'none',
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 3,
                py: 1,
                borderRadius: '6px',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  bgcolor: '#0022CC',
                },
              }}
            >
              Book A Demo
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Nunito Sans", sans-serif',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#9333EA',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Powered by Hybrid AI + Human Intelligence
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1,
                color: '#1a1a1a',
                mb: 3,
              }}
            >
              Build Your Global Team in Days — Not Weeks
            </Typography>

            <Typography
              sx={{
                fontFamily: '"Nunito Sans", sans-serif',
                fontSize: '1.125rem',
                color: '#6B7280',
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              AI-powered recruitment to shorten hiring cycles · Outsourcing model that cuts staffing costs by 70%
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 3,
                bgcolor: '#F9FAFB',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: '#EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BoltIcon sx={{ color: '#9333EA', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#1a1a1a',
                    mb: 0.5,
                  }}
                >
                  Hire in Days, Not Weeks
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontSize: '0.875rem',
                    color: '#6B7280',
                  }}
                >
                  AI + recruiter workflow automates shortlisting so you hire 4× faster.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box 
            sx={{ 
              flex: 1, 
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 450,
                height: 350,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #F3E8FF 0%, #E0E7FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '1rem',
                  color: '#6B7280',
                  textAlign: 'center',
                  px: 4,
                }}
              >
                Your team is waiting
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#E0E7FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.875rem' }}>👋</Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                }}
              >
                Hi there!
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
