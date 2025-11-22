import { Box, Grid, Typography } from "@mui/material";
import moment from "moment";
import {
  type MouseEvent,
  type PropsWithChildren,
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Props = {
  uncertainHour: number;
  unavailabilityHour: number;
  zone: string;
};

const MINUTES_IN_24H = 1440;
const MINUTES_IN_HOUR = 60;

const InterviewZoneLine = ({
  children,
  uncertainHour,
  unavailabilityHour,
  zone = "IST",
}: PropsWithChildren<Props>) => {
  const [mousePositionVertical, setMousePositionVertical] = useState(0);

  const [scrollTop, setScrollTop] = useState(0);

  const handler = useCallback((e: Event) => {
    setScrollTop((e.target as any)?.scrollTop);
  }, []);

  useEffect(() => {
    const elem = document.querySelector(
      ".interview-calendar .rbc-time-content",
    );
    elem?.addEventListener("scroll", handler);
    return () => {
      elem?.removeEventListener("scroll", handler);
    };
  }, [handler]);

  const onMouseEnter = useCallback((e: MouseEvent<HTMLDivElement>) => {
    let bounds = e.currentTarget.getBoundingClientRect();
    let y = e.clientY - bounds.top;
    setMousePositionVertical(y);
  }, []);

  const onMouseLeave = useCallback(() => {
    setMousePositionVertical(0);
  }, []);
  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    let bounds = e.currentTarget.getBoundingClientRect();
    let y = e.clientY - bounds.top;
    setMousePositionVertical(y);
  }, []);

  const getTimeIST = useMemo(() => {
    const height = 960;
    const timeInMinutes = (MINUTES_IN_24H * mousePositionVertical) / height;

    return moment()
      .set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .add({
        minutes: timeInMinutes,
      })
      .tz("Asia/Kolkata")
      .format("hh:mm a");
  }, [mousePositionVertical]);
  const getTimePHST = useMemo(() => {
    const height = 960;
    const timeInMinutes = (MINUTES_IN_24H * mousePositionVertical) / height;

    return moment()
      .set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .add({
        minutes: timeInMinutes,
      })
      .tz("Asia/Manila")
      .format("hh:mm a");
  }, [mousePositionVertical]);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    console.dir(e);
  }, []);

  return (
    <Box
      display={"flex"}
      height={"960px"}
      pl={4}
      position={"relative"}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Grid
        container
        direction={"column"}
        position={"relative"}
        onScroll={onScroll}
      >
        <Box
          position={"absolute"}
          top={scrollTop + 5}
          left={-20}
          sx={{
            transform: "rotate(-90deg)",
          }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: "primary.main",
              fontWeight: 500,
            }}
          >
            {zone}
          </Typography>
        </Box>

        {mousePositionVertical > 0 && (
          <Box
            position={"absolute"}
            left={500}
            top={mousePositionVertical}
            zIndex={10}
          >
            <Box
              sx={{
                height: "50px",
                bgcolor: "background.paper",
                position: "relative",
                width: "130px",
                textAlign: "center",
                lineHeight: "50px",
                borderRadius: 1,
                borderColor: "divider",
                borderStyle: "solid",
                borderWidth: "3px",
              }}
            >
              <Typography
                fontSize={"12px"}
                lineHeight={"20px"}
                letterSpacing={"0.1px"}
              >
                India: {getTimeIST}
              </Typography>
              <Typography
                fontSize={"12px"}
                lineHeight={"20px"}
                letterSpacing={"0.1px"}
              >
                Php: {getTimePHST}
              </Typography>

              <Box
                sx={{
                  height: "35px",
                  bgcolor: "background.paper",
                  position: "absolute",
                  width: "35px",
                  top: 5,
                  left: -18,
                  textAlign: "center",
                  lineHeight: "50px",
                  borderRadius: 1,
                  borderStyle: "solid",
                  borderColor: "divider",
                  borderWidth: "0px 0px 3px 3px",
                  transform: "rotate(45deg)",
                }}
              ></Box>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            bgcolor: "error.main",
            width: "3px",
            height: `${((unavailabilityHour * MINUTES_IN_HOUR) / MINUTES_IN_24H) * 100}%`,
          }}
        ></Box>
        <Box
          sx={{
            bgcolor: "info.main",
            width: "3px",
            height: `${((uncertainHour * MINUTES_IN_HOUR) / MINUTES_IN_24H) * 100}%`,
          }}
        ></Box>
        <Box
          sx={{ 
            bgcolor: "success.main",
            width: "3px",
          }}
          flex={1}
        ></Box>
      </Grid>
      {children}
    </Box>
  );
};

export default InterviewZoneLine;
