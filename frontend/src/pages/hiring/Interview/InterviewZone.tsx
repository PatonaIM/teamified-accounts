import { Box } from "@mui/material";
import { type PropsWithChildren } from "react";
import InterviewZoneLine from "./InterviewZoneLine";

type Props = {};

const InterviewZone = ({ children }: PropsWithChildren<Props>) => {
  return (
    <Box
      display={"flex"}
      sx={{
        height: "100%",
      }}
    >
      <InterviewZoneLine
        unavailabilityHour={11.5}
        uncertainHour={2}
        zone="IST"
      />
      <InterviewZoneLine unavailabilityHour={9} uncertainHour={2} zone="PHT" />
      {children}
    </Box>
  );
};

export default InterviewZone;
