import StarIcon from "@mui/icons-material/Star";
import {
  Avatar,
  Box,
  CircularProgress,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useState, useEffect } from "react";
import jobRequestService from "../../../../../services/hiring/jobRequestService";

type Props = {
  candidateId: string;
};

// Removed - using theme sx props directly instead

const ApplicationTimeline = ({ candidateId }: Props) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        const response = await jobRequestService.getAssignJobTimelineOnCandidate(candidateId);
        setData(response);
      } catch (error) {
        console.error("Error fetching timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [candidateId]);

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <CircularProgress />
      </Grid>
    );
  }
  if (data?.data && data?.data?.length === 0) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          No timeline events available
        </Typography>
      </Grid>
    );
  }
  return (
    <Grid container direction={"column"} gap={2}>
      <Grid container gap={2} wrap="nowrap">
        <Grid size={{ xs: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            User
          </Typography>
        </Grid>
        <Grid size={{ xs: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            Date
          </Typography>
        </Grid>

        <Grid size={{ xs: 7 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            Action
          </Typography>
        </Grid>
      </Grid>
      {data?.data.map((timelineItem: any) => (
        <Grid
          container
          gap={2}
          wrap="nowrap"
          key={timelineItem.id}
          alignItems={"center"}
        >
          <Grid
            container
            size={{ xs: 3 }}
            gap={1}
            wrap="nowrap"
            alignItems={"center"}
          >
            <Avatar>
              {(timelineItem.addedByUName || "T").charAt(0).toUpperCase()}
            </Avatar>
            {timelineItem.addedByUName ? (
              <Typography sx={defaultStyle}>
                {timelineItem.addedByUName}
              </Typography>
            ) : (
              <Typography sx={defaultStyle}>Unknown User</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Typography sx={defaultStyle}>
              {moment
                .utc(timelineItem.addedOn)
                .local()
                .format("Do MMM yy, hh:mm A")}
            </Typography>
          </Grid>
          <Grid size={{ xs: 7 }}>
            {(() => {
              const text = timelineItem.text || "";
              const isPrioritized = /\bprioriti[sz]ed the candidate\b/i.test(
                text,
              );

              return (
                <Typography
                  sx={{
                    ...defaultStyle,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    height: "20px",
                    width: "100%",
                  }}
                >
                  {isPrioritized && (
                    <Tooltip title="Prioritized" arrow>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: "20px",
                          mr: 1,
                          flex: "0 0 auto",
                        }}
                      >
                        <StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
                      </Box>
                    </Tooltip>
                  )}

                  <Box
                    component="span"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: "1 1 auto",
                      minWidth: 0, // REQUIRED for ellipsis in flex items
                    }}
                  >
                    {text}
                  </Box>
                </Typography>
              );
            })()}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default ApplicationTimeline;
