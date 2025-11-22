import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { forwardRef, useCallback, useState } from "react";
import { ACTIVE_VIEW, type JobRequest } from "../../../types/hiring";
import JobCardExpanded from "./JobCard/JobCardExpanded";
import JobRequestDetails from "./JobCard/JobRequestDetails";

type Props = {
  request: JobRequest;
};

const JobRequestAccordion = forwardRef<HTMLDivElement, Props>(
  ({ request }: Props, ref) => {
    const [activeView, setActiveView] = useState<ACTIVE_VIEW | string>("");

    const changeActiveView = useCallback((value: ACTIVE_VIEW | string) => {
      setActiveView(value);
    }, []);
    const closeDetails = useCallback(() => {
      setActiveView("");
    }, []);

    return (
      <Accordion
        ref={ref}
        disableGutters
        elevation={0}
        expanded={activeView === ACTIVE_VIEW.details}
      >
        <AccordionSummary
          onClick={closeDetails}
          sx={{ width: "100%" }}
        >
          <JobRequestDetails
            jobRequest={request}
            changeActiveView={changeActiveView}
            activeView={activeView}
          />
        </AccordionSummary>
        <AccordionDetails>
          <JobCardExpanded
            jobRequest={request}
            view={activeView}
            setSelectedStage={changeActiveView}
          />
        </AccordionDetails>
      </Accordion>
    );
  },
);

export default JobRequestAccordion;
