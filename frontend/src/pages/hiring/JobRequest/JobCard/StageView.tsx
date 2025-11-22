import { Grid, Typography } from "@mui/material";
import { type MouseEvent, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Stage } from "../../../../types/hiring";

type Props = Stage & {
  jobId: number;
  last?: boolean;
};

const StageView = ({
  code,
  count,
  disqualifiedCount,
  name,
  jobId,
  pedingTaskCount,
  qualifiedCount,
  last = false,
}: Props) => {
  const navigate = useNavigate();

  const handleTaskClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      navigate("/tasks", {
        preventScrollReset: true,
      });
    },
    [navigate],
  );
  return (
    <>
      <Grid
        direction={"column"}
        container
        size={{ xs: "auto" }}
        flexBasis={"165px"}
        flexGrow={1}
        flexShrink={0}
        gap={1}
        role="button"
        justifyContent={"center"}
        alignItems={"center"}
        position={"relative"}
      >
        <Link
          to={`/job-request/${jobId}?stage=${code}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Grid container size={12} justifyContent={"flex-end"} mb={2}>
            <Grid container size={12} justifyContent={"flex-end"}>
              {pedingTaskCount ? (
                <Grid
                  size={{ xs: "auto" }}
                  sx={{
                    height: "20px",
                    minWidth: "20px",
                    px: 1,
                    bgcolor: "success.main",
                    borderRadius: "10px",
                    position: "absolute",
                    top: 0,
                    cursor: "pointer",
                  }}
                  onClick={handleTaskClick}
                  role="button"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "15px",
                      lineHeight: "15px",
                      fontWeight: 500,
                      color: "success.contrastText",
                    }}
                  >
                    {pedingTaskCount}
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
          </Grid>
          <Grid
            container
            size={12}
            alignItems={"center"}
            direction={"column"}
            pb={2}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {count}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {name}
            </Typography>
          </Grid>
          <Grid container size={12} justifyContent={"center"} gap={1}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 300,
                color: "info.main",
              }}
            >
              {qualifiedCount}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 300,
                color: "text.secondary",
              }}
            >
              |
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 300,
                color: "error.main",
              }}
            >
              {disqualifiedCount}
            </Typography>
          </Grid>
        </Link>
      </Grid>
      {last ? null : (
        <Grid
          size={{ xs: "auto" }}
          sx={{
            flexBasis: "1px",
            height: "80px",
            bgcolor: "divider",
            mt: "35px",
            flexShrink: 0,
          }}
        ></Grid>
      )}
    </>
  );
};

export default StageView;
