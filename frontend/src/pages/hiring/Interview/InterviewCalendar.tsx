import { alpha, Box, GlobalStyles, Typography, useTheme } from "@mui/material";
import moment from "moment-timezone";
import { useCallback, useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import InterviewEvent from "./InterviewEvent";
import TimezoneGutterOverlay from "./TimezoneGutterOverlay";

const localizer = momentLocalizer(moment);

type Props = {
  filteredData: Array<any>;
  startDate: moment.Moment;
  onNavigate?: (newDate: moment.Moment) => void;
};

const InterviewCalendar = ({ filteredData, startDate, onNavigate }: Props) => {
  const theme = useTheme();

  const events = useMemo(() => {
    return filteredData.map((interview) => ({
      id: interview.eventId || interview.id,
      title: interview.candidateName || "Interview",
      start: new Date(interview.meetingStartedOn),
      end: new Date(interview.meetingEndedOn),
      resource: {
        interviewerName: interview.interviewerName || "N/A",
        candidateEmail: interview.candidateEmail || "",
        status: interview.status || "scheduled",
        jobId: interview.jobId,
      },
    }));
  }, [filteredData]);

  const handleNavigate = useCallback(
    (newDate: Date) => {
      if (onNavigate) {
        onNavigate(moment(newDate));
      }
    },
    [onNavigate]
  );

  const calendarStyles = (
    <GlobalStyles
      styles={{
        ".rbc-calendar": {
          fontFamily: theme.typography.fontFamily,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        ".rbc-header": {
          padding: "12px 4px",
          fontWeight: 600,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
        ".rbc-time-view": {
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.default,
        },
        ".rbc-time-header-content": {
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
        ".rbc-time-content": {
          borderTop: `1px solid ${theme.palette.divider}`,
        },
        ".rbc-time-slot": {
          borderTop: `1px solid ${theme.palette.divider}`,
        },
        ".rbc-day-slot .rbc-time-slot": {
          borderTop: `1px solid ${theme.palette.divider}`,
        },
        ".rbc-timeslot-group": {
          borderLeft: `1px solid ${theme.palette.divider}`,
          minHeight: "60px !important",
        },
        ".rbc-time-gutter": {
          display: "none",
        },
        ".rbc-label": {
          display: "none",
        },
        ".rbc-today": {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        ".rbc-current-time-indicator": {
          backgroundColor: theme.palette.error.main,
          height: "2px",
        },
        ".rbc-toolbar": {
          padding: "16px",
          marginBottom: "16px",
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
          flexWrap: "wrap",
          gap: "8px",
        },
        ".rbc-toolbar button": {
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          padding: "8px 16px",
          borderRadius: theme.shape.borderRadius,
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.primary.main,
          },
          "&:focus": {
            outline: "none",
            borderColor: theme.palette.primary.main,
          },
        },
        ".rbc-toolbar button.rbc-active": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        },
        ".rbc-toolbar-label": {
          fontWeight: 600,
          fontSize: "1.125rem",
          color: theme.palette.text.primary,
        },
        ".rbc-off-range": {
          color: theme.palette.text.disabled,
        },
        ".rbc-off-range-bg": {
          backgroundColor: theme.palette.action.disabledBackground,
        },
        ".rbc-event": {
          padding: 0,
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
        },
        ".rbc-selected": {
          backgroundColor: "transparent",
        },
        ".rbc-event-label": {
          display: "none",
        },
        ".rbc-event-content": {
          height: "100%",
        },
        ".rbc-addons-dnd-resizable": {
          border: "none",
        },
      }}
    />
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 200px)",
        bgcolor: "background.default",
        borderRadius: 1,
        p: 2,
      }}
    >
      {calendarStyles}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          pl: "140px",
        }}
      >
        <TimezoneGutterOverlay
          min={new Date(2024, 0, 1, 8, 0, 0)}
          max={new Date(2024, 0, 1, 20, 0, 0)}
          step={60}
          timeslots={1}
        />
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view={Views.WEEK}
          views={[Views.WEEK]}
          toolbar={true}
          date={startDate.toDate()}
          onNavigate={handleNavigate}
          step={60}
          timeslots={1}
          min={new Date(2024, 0, 1, 8, 0, 0)}
          max={new Date(2024, 0, 1, 20, 0, 0)}
          components={{
            event: InterviewEvent,
          }}
          eventPropGetter={() => ({
            style: {
              border: "none",
              backgroundColor: "transparent",
            },
          })}
          messages={{
            noEventsInRange: "No interviews scheduled for this period.",
          }}
        />
      </Box>
    </Box>
  );
};

export default InterviewCalendar;
