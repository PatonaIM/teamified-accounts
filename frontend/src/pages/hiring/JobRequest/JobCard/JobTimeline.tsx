import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import type { JobRequest } from "../../../../types/hiring";
import JobRequestTimeline from "./JobRequestTimeline";

type Props = {
  cancel: () => void;
  request: JobRequest;
};

const JobTimeline = ({ cancel, request }: Props) => {
  return (
    <Dialog open={true} onClose={cancel} maxWidth="md" fullWidth>
      <DialogTitle
        textAlign={"center"}
        fontSize={"24px"}
        lineHeight={"32px"}
        fontWeight={"700"}
      >
        Job Timeline
      </DialogTitle>
      <DialogContent>
        <JobRequestTimeline jobRequest={request} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={cancel}
          sx={{
            mr: 2,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobTimeline;
