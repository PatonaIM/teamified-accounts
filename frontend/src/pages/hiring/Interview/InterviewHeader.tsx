import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import moment from "moment";
import { memo, useCallback } from "react";

type Props = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  selectedView?: "list" | "calendar";
  setSelectedView?: (view: "list" | "calendar") => void;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToThisWeek: () => void;
  isFetching?: boolean;
  onBookTimeslots?: () => void;
};

const InterviewHeader = ({
  startDate,
  endDate,
  selectedView,
  setSelectedView,
  goToNextWeek,
  goToPrevWeek,
  goToThisWeek,
  isFetching,
  onBookTimeslots,
}: Props) => {
  const handleViewChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (setSelectedView) {
        setSelectedView(event.target.value as "list" | "calendar");
      }
    },
    [setSelectedView],
  );
  return (
    <Grid container justifyContent={"space-between"} alignItems={"center"}>
      <Grid container size="auto">
        {onBookTimeslots && (
          <Button
            variant="outlined"
            onClick={onBookTimeslots}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Book interview timeslots
          </Button>
        )}
      </Grid>
      <Grid container size="auto" justifyContent={"flex-end"} alignItems={"center"} gap={2}>
        {isFetching && (
          <Grid container gap={2} alignItems={"center"} size="auto">
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
            <CircularProgress size={20} />
          </Grid>
        )}
        <RadioGroup
          row
          value={selectedView}
          onChange={handleViewChange}
        >
          <FormControlLabel
            value="calendar"
            control={<Radio />}
            label="Calendar View"
          />
          <FormControlLabel
            value="list"
            control={<Radio />}
            label="List View"
          />
        </RadioGroup>
      </Grid>
    </Grid>
  );
};

export default memo(InterviewHeader);
