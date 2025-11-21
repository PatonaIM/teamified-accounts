import { CircularProgress, Grid } from "@mui/material";
import { useEffect, useRef } from "react";

const CircularProgressWithScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);
  return (
    <Grid
      container
      ref={ref}
      item
      height={"100px"}
      justifyContent={"center"}
      alignItems={"center"}
      flexShrink={0}
    >
      <CircularProgress size={36} color="primary"></CircularProgress>
    </Grid>
  );
};

export default CircularProgressWithScroll;
