import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import type { OnboardingCandidate } from '../../services/hrOnboardingService';

interface CandidateCardProps {
  candidate: OnboardingCandidate;
  onClick: (candidate: OnboardingCandidate) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick }) => {
  // Calculate overall progress
  const calculateProgress = () => {
    let totalExpected = 0;
    let totalVerified = 0;

    Object.values(candidate.documentProgress).forEach((progress) => {
      totalExpected += progress.total;
      totalVerified += progress.verified;
    });

    return totalExpected > 0 ? (totalVerified / totalExpected) * 100 : 0;
  };

  // Format category name with proper capitalization
  const formatCategoryName = (category: string) => {
    if (category.toLowerCase() === 'cv') {
      return 'CV';
    }
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const overallProgress = calculateProgress();
  const isComplete = overallProgress === 100;
  const isOnboardingCompleted = candidate.employmentStatus === 'active';

  return (
    <Card
      onClick={() => onClick(candidate)}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isComplete ? 'success.main' : 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {candidate.userName.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {candidate.userName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {candidate.userEmail}
              </Typography>
            </Box>
          </Box>
          {isOnboardingCompleted ? (
            <Chip
              label="Onboarded"
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.success.main, 0.2) 
                    : alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
                border: '1px solid',
                borderColor: 'success.main',
              }}
            />
          ) : isComplete ? (
            <Chip
              label="Ready"
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.success.main, 0.2) 
                    : alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
                border: '1px solid',
                borderColor: 'success.main',
              }}
            />
          ) : null}
        </Box>

        {/* Submission Date */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Submitted: {new Date(candidate.submittedAt).toLocaleDateString()}
            </Typography>
          </Box>
          {isOnboardingCompleted && candidate.onboardingCompletedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2.5 }}>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                Completed: {new Date(candidate.onboardingCompletedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Overall Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Overall Progress
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {Math.round(overallProgress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.white, 0.1) 
                  : 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: 'primary.main',
              },
            }}
          />
        </Box>

        {/* Category Progress */}
        <Stack spacing={1}>
          {Object.entries(candidate.documentProgress).map(([category, progress]) => (
            <Box
              key={category}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1,
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.05) 
                    : 'grey.50',
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {formatCategoryName(category)}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {progress.verified}/{progress.total} verified
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
