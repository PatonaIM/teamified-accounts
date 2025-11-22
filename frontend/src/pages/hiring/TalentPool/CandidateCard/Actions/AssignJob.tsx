import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import { useCallback, useState } from "react";
import AssignJobDialog from "../Components/AssignJobDialog";

type Props = {
  candidateName?: string;
  candidateId?: string;
  preJobs?: number[];
};

const AssignJob = ({ candidateName, candidateId, preJobs }: Props) => {
  const [open, setOpen] = useState(false);

  const closePopup = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);
  return (
    <Grid>
      <Dialog open={open} onClose={closePopup} maxWidth="sm" fullWidth>
        <DialogTitle
          fontSize={"24px"}
          fontWeight={"700"}
          lineHeight={"32px"}
          textAlign={"center"}
        >
          Assign To Job - {candidateName}
        </DialogTitle>
        <DialogContent>
          <AssignJobDialog
            candidateIds={[candidateId || ""]}
            close={closePopup}
            preJobs={preJobs}
          />
        </DialogContent>
      </Dialog>
      <IconButton size="small" onClick={onOpen}>
        <img src="/images/AssignJob.svg" alt="Assign Job" />
      </IconButton>
    </Grid>
  );
};

export default AssignJob;
