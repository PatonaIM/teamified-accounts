import { ExpandMore, MoreVert } from "@mui/icons-material";
import { CircularProgress, Grid, IconButton, Typography, useTheme } from "@mui/material";
import { Country } from "country-state-city";
import { type MouseEvent, useCallback } from "react";
import { ACTIVE_VIEW } from "../../../../types/hiring";
import type { JobRequest } from "../../../../types/hiring";
import { useJobStats } from "../../../../hooks/hiring/useJobRequests";
import GenericMenu from "../common/GenericMenu";
import TaskApproveButton from "../JobRequestTable/TaskApproveButton";
import StageView from "./StageView";

type Props = {
  jobRequest: JobRequest;
  changeActiveView: (value: ACTIVE_VIEW | string) => void;
  activeView: string;
};

const JobRequestDetails = ({
  jobRequest,
  changeActiveView,
  activeView,
}: Props) => {
  const theme = useTheme();
  
  const ACTIONS = [
    {
      name: "View request details",
      value: ACTIVE_VIEW.view,
    },
    {
      name: "View timeline",
      value: ACTIVE_VIEW.timeline,
    },
    {
      name: "Edit request",
      value: ACTIVE_VIEW.edit,
    },
    {
      name: "Clone Request",
      value: ACTIVE_VIEW.clone,
    },
    {
      name: "Close Request",
      value: ACTIVE_VIEW.delete,
      color: theme.palette.error.main,
    },
  ];
  const assignRecruiter = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      changeActiveView(ACTIVE_VIEW.edit);
    },
    [changeActiveView],
  );

  const { data, loading: isLoading } = useJobStats((jobRequest as any).jobRequestId);

  const expand = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (activeView === ACTIVE_VIEW.details) {
        changeActiveView("");
        return;
      }
      changeActiveView(ACTIVE_VIEW.details);
    },
    [activeView, changeActiveView],
  );

  const approveTask = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
    },
    [],
  );

  const showApproveRequestButton = false;
  const showAddRecruiterButton = false;

  return (
    <Grid container size={12} direction={"column"} p={1} gap={1} minHeight={"200px"}>
      <Grid
        container
        size={12}
        justifyContent={"space-between"}
        wrap="nowrap"
        alignItems={"center"}
      >
        <Grid container size={{ xs: 9 }} gap={2} alignItems={"flex-end"}>
          <Typography 
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {(jobRequest as any).title || "Job Request"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 400,
              color: "text.secondary",
            }}
            align="center"
          >
            Location: {(jobRequest as any).countryCode ? Country.getCountryByCode((jobRequest as any).countryCode)?.name : jobRequest.location}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 400,
              color: "text.secondary",
            }}
            align="center"
          >
            Client: {(jobRequest as any).client || jobRequest.clientName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 400,
              color: "text.secondary",
            }}
            align="center"
          >
            Recruiter: {(jobRequest as any).recruiter || jobRequest.recruiterName || "No recruiter assigned"}
          </Typography>
          <Grid
            size={{ xs: "auto" }}
            alignItems={"center"}
            onClick={(e) => {
              e.stopPropagation();
              const code = (jobRequest as any).workableInternalCode || "N/A";
              navigator.clipboard.writeText(code);
              console.log("Code Copied Successfully");
            }}
            title="Copy code"
            role="button"
            sx={{
              cursor: "pointer",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {(jobRequest as any).workableInternalCode || "N/A"}
            </Typography>{" "}
            <IconButton
              component="div"
              size="small"
              sx={{
                p: 0,
              }}
            >
              <img
                src="/images/copy-icon.svg"
                alt="copy"
                width={16}
                height={16}
              ></img>
            </IconButton>
          </Grid>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 400,
              color: "text.secondary",
            }}
            align="center"
          >
            {jobRequest.status}
          </Typography>
        </Grid>
        <Grid
          container
          size={{ xs: 3 }}
          justifyContent={"flex-end"}
          gap={1}
          alignItems={"center"}
        >
          <GenericMenu
            selectAction={changeActiveView}
            actions={ACTIONS}
            view="icon-button"
            icon={<MoreVert />}
          />
          <IconButton component="div" onClick={expand}>
            <ExpandMore
              color="primary"
              sx={{
                transform:
                  activeView === ACTIVE_VIEW.details ? "rotate(180deg)" : "",
                transitionProperty: "transform",
                transitionDuration: "300ms",
                transitionTimingFunction: "ease-in-out",
              }}
            />
          </IconButton>
        </Grid>
      </Grid>

      {isLoading ? (
        <Grid
          container
          size={12}
          height={"150px"}
          justifyContent={"center"}
          alignItems="center"
        >
          <CircularProgress color="primary" size={36} />
        </Grid>
      ) : (
        <Grid
          container
          size={12}
          wrap="nowrap"
          gap={1}
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {data?.map((el: any, index: number) => (
            <StageView
              jobId={(jobRequest as any).jobRequestId}
              last={data.length === index + 1}
              key={el.code}
              {...el}
            />
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default JobRequestDetails;
