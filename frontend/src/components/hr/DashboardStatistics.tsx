import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import {
  Group as CandidatesIcon,
  CheckCircle as CompleteIcon,
  HourglassEmpty as InProgressIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { type OnboardingCandidate } from '../../services/hrOnboardingService';

interface DashboardStatisticsProps {
  candidates: OnboardingCandidate[];
  onFilterPreset?: (preset: 'all' | 'complete' | 'in_progress' | 'pending_review' | 'needs_changes') => void;
  loading?: boolean;
}

const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({
  candidates,
  onFilterPreset,
  loading = false,
}) => {
  const calculateProgress = (candidate: OnboardingCandidate) => {
    let totalExpected = 0;
    let totalVerified = 0;
    Object.values(candidate.documentProgress).forEach((progress) => {
      totalExpected += progress.total;
      totalVerified += progress.verified;
    });
    return totalExpected > 0 ? (totalVerified / totalExpected) * 100 : 0;
  };

  const totalCandidates = candidates.length;
  const completeCandidates = candidates.filter((c) => calculateProgress(c) === 100).length;
  const inProgressCandidates = candidates.filter((c) => {
    const progress = calculateProgress(c);
    return progress > 0 && progress < 100;
  }).length;

  // Calculate pending documents across all candidates
  let pendingCount = 0;
  candidates.forEach((candidate) => {
    Object.values(candidate.documentProgress).forEach((progress) => {
      pendingCount += progress.uploaded - progress.verified;
    });
  });

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    preset?: 'all' | 'complete' | 'in_progress' | 'pending_review' | 'needs_changes';
  }> = ({ title, value, icon, color, bgColor, preset }) => (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        p: 1,
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s ease',
        cursor: preset && onFilterPreset ? 'pointer' : 'default',
        '&:hover': preset && onFilterPreset ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        } : {},
      }}
      onClick={() => preset && onFilterPreset && onFilterPreset(preset)}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: color,
          '& .MuiSvgIcon-root': {
            fontSize: '1rem',
          },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: 'text.secondary',
            display: 'block',
            mb: 0.25,
            fontSize: '0.65rem',
          }}
        >
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width="80%" height={28} />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {value.toLocaleString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
      <StatCard
        title="Total Candidates"
        value={totalCandidates}
        icon={<CandidatesIcon />}
        color="#A16AE8"
        bgColor="rgba(161, 106, 232, 0.1)"
        preset="all"
      />
      <StatCard
        title="Complete"
        value={completeCandidates}
        icon={<CompleteIcon />}
        color="#10B981"
        bgColor="rgba(16, 185, 129, 0.1)"
        preset="complete"
      />
      <StatCard
        title="In Progress"
        value={inProgressCandidates}
        icon={<InProgressIcon />}
        color="#8096FD"
        bgColor="rgba(128, 150, 253, 0.1)"
        preset="in_progress"
      />
      <StatCard
        title="Pending Review"
        value={pendingCount}
        icon={<PendingIcon />}
        color="#F59E0B"
        bgColor="rgba(245, 158, 11, 0.1)"
        preset="pending_review"
      />
    </Box>
  );
};

export default DashboardStatistics;
