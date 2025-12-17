import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  NewReleases,
  CheckCircle,
  AutoAwesome,
  DateRange,
  Analytics,
  TipsAndUpdates,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReleaseNote_v106() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <NewReleases color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="v1.0.6" color="primary" sx={{ fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">
                    December 17, 2025
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  AI-Powered Analytics & Enhanced Reporting
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity="info" icon={<AutoAwesome />}>
            <Typography variant="body2">
              <strong>What's New:</strong> The Analytics & Reports page now features AI-powered search 
              capabilities, comprehensive date range filtering across all analytics sections, and 
              dynamically generated query suggestions based on your platform data.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              10-Second Summary
            </Typography>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="AI-powered natural language analytics search" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Date range filtering with 11 preset options across all sections" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Dynamic AI-generated query suggestions based on current data" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="10 comprehensive analytics sections with visualizations" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Enhanced loading animations for AI processing" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                1. AI-Powered Analytics Search
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Ask questions about your platform data in natural language and receive intelligent 
              insights with automatically generated visualizations. Powered by OpenAI's GPT-4o-mini model.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Natural Language Queries" 
                  secondary="Ask questions like 'Which app has the highest engagement?' or 'Show me login patterns by time of day'"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Automatic Visualizations" 
                  secondary="AI generates appropriate charts (bar, line, pie, area) based on your query and the data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Actionable Insights" 
                  secondary="Each response includes a summary and key insights to help with decision-making"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="POST /api/v1/analytics/ai/query" 
                  secondary="New endpoint for processing natural language analytics queries"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TipsAndUpdates color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                2. Dynamic AI Suggestions
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Query suggestions are now dynamically generated by AI based on your current platform 
              analytics data, providing relevant and contextual starting points for exploration.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Context-Aware Suggestions" 
                  secondary="AI analyzes current user counts, top apps, peak hours, and more to generate relevant questions"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Varied Questions" 
                  secondary="Suggestions change each time, highlighting different trends and opportunities"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Graceful Fallback" 
                  secondary="Default suggestions displayed if AI generation fails or API key is not configured"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="GET /api/v1/analytics/ai/suggestions" 
                  secondary="New endpoint returning AI-generated query suggestions"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <DateRange color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                3. Comprehensive Date Range Filtering
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              All 10 analytics sections now include date range filtering with 11 preset options 
              and custom date picker support for flexible time-based analysis.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="11 Preset Options" 
                  secondary="Last 15 mins, 1 hour, 4 hours, 12 hours, 24 hours, 3 days, 7 days, 14 days, 30 days, 90 days, and custom range"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Custom Date Picker" 
                  secondary="Select specific start and end dates for precise time-based analysis"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Default: Last 30 Days" 
                  secondary="All sections default to showing the last 30 days of data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Server-Side Filtering" 
                  secondary="Date parameters passed to backend for efficient data retrieval"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Analytics color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                4. Analytics Sections Available
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              The Analytics & Reports page includes 10 comprehensive sections covering all aspects 
              of platform usage and health:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="AI Search" 
                  secondary="Natural language analytics with AI-powered insights and visualizations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="App Usage" 
                  secondary="Track which apps are used most and feature usage patterns"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Login Traffic" 
                  secondary="Monitor login patterns by hour and day with peak time analysis"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="User Engagement" 
                  secondary="View top users by engagement score and login activity"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Organization Health" 
                  secondary="Identify healthy, at-risk, and inactive organizations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Sessions" 
                  secondary="Active session counts and device type distribution"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Security" 
                  secondary="Audit logs, admin actions, and security event tracking"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Invitations" 
                  secondary="Track invitation send and acceptance rates with top inviters"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Feature Stickiness" 
                  secondary="Identify which features drive user retention"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Time-to-Value & Adoption Funnel" 
                  secondary="Measure how quickly users become active and conversion rates"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Search color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                5. UI/UX Improvements
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enhanced user experience with improved navigation and visual feedback:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Back Button Navigation" 
                  secondary="Easy navigation back to Admin Tools from the Analytics page"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Updated Header Styling" 
                  secondary="Consistent header styling matching Organization Management page"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="AI Loading Animation" 
                  secondary="Sparkle animation effect while AI processes queries"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary="Responsive Charts" 
                  secondary="All charts are fully responsive and adapt to container size"
                />
              </ListItem>
            </List>
          </Box>

          <Divider />

          <Box sx={{ pt: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/docs/release-notes')}
              variant="outlined"
            >
              Back to Release Notes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
