import { Box, Grid, Tooltip, Typography, useTheme } from "@mui/material";
import moment from "moment";
import type { Event } from "react-big-calendar";

type Props = {
  event: Event & {
    resource?: {
      interviewerName?: string;
      candidateEmail?: string;
      status?: string;
      jobId?: string;
    };
  };
};

const InterviewEvent = ({ event }: Props) => {
  const theme = useTheme();
  const start = moment(event.start);
  const end = moment(event.end);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return theme.palette.info.main;
      case "completed":
        return theme.palette.success.main;
      case "cancelled":
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const bgColor = getStatusColor(event.resource?.status);
  const textColor = theme.palette.getContrastText(bgColor);

  const tooltipContent = (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {event.title}
      </Typography>
      {event.resource?.interviewerName && (
        <Typography variant="caption" display="block">
          Interviewer: {event.resource.interviewerName}
        </Typography>
      )}
      <Typography variant="caption" display="block">
        Time: {start.format("h:mm A")} - {end.format("h:mm A")}
      </Typography>
      {event.resource?.candidateEmail && (
        <Typography variant="caption" display="block">
          Email: {event.resource.candidateEmail}
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="bottom"
      arrow
      PopperProps={{
        modifiers: [{ name: "offset", options: { offset: [0, -40] } }],
      }}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            maxWidth: 280,
            borderColor: "divider",
            borderWidth: 1,
            borderStyle: "solid",
            boxShadow: theme.shadows[4],
          },
        },
      }}
    >
      <Grid
        container
        flexDirection={"column"}
        sx={{
          bgcolor: bgColor,
          color: textColor,
          gap: 0.5,
          p: 0.5,
          height: "100%",
          borderRadius: 1,
          cursor: "pointer",
          overflow: "hidden",
          "&:hover": {
            opacity: 0.9,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}
        >
          {event.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.65rem",
            opacity: 0.8,
          }}
        >
          {start.format("h:mm A")}
        </Typography>
      </Grid>
    </Tooltip>
  );
};

export default InterviewEvent;
