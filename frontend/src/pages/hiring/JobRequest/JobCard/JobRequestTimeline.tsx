import { Avatar, CircularProgress, Grid, Typography } from "@mui/material";
import moment from "moment";
import type { JobRequest } from "../../../../types/hiring";
import { useState, useEffect } from "react";

type Props = {
  jobRequest: JobRequest;
};

const JobRequestTimeline = ({ jobRequest }: Props) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setData({ data: [] });
  }, [(jobRequest as any).jobRequestId]);
  return (
    <Grid container size={12} minHeight={"100px"} spacing={1}>
      <Grid
        container
        size={12}
        spacing={1}
        alignItems={"center"}
        key={`timeline-header`}
        mb={1}
      >
        <Grid size={{ xs: 4 }}>
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
        <Grid size={{ xs: 5 }}>
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
        <Grid size={{ xs: 3 }}>
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
      </Grid>
      {isLoading && (
        <Grid container size={12} justifyContent={"center"} alignItems={"center"}>
          <CircularProgress size={36} color="primary"></CircularProgress>
        </Grid>
      )}
      {data?.data.map((timelineItem: any) => (
        <Grid
          container
          size={12}
          spacing={1}
          alignItems={"center"}
          key={`timeline-${timelineItem.id}`}
        >
          <Grid container size={{ xs: 4 }} alignItems={"center"} gap={2}>
            <Grid size={{ xs: "auto" }}>
              <Avatar />
            </Grid>
            <Grid size={{ xs: "grow" }}>
              {timelineItem.addedByUName ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                  }}
                >
                  {timelineItem.addedByUName}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  {" "}
                  Unknown User
                </Typography>
              )}
            </Grid>
          </Grid>
          <Grid size={{ xs: 5 }}>
            <Typography 
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {timelineItem.text}
            </Typography>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Typography 
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {moment
                .utc(timelineItem.addedOn)
                .local()
                .format("Do MMM yy, hh:mm A")}
            </Typography>
          </Grid>
        </Grid>
      ))}
      {data?.data.length === 0 && (
        <Grid container size={12} justifyContent={"center"} alignItems={"center"}>
          <Typography 
            variant="subtitle2"
            sx={{
              color: "text.secondary",
            }}
          >
            No items added in timeline{" "}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default JobRequestTimeline;
