import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import ApplicationTimeline from "../Components/ApplicationTimeline";

type Props = {
  candidateName?: string;
  candidateId?: string;
};

const ApplicationHistory = ({ candidateName, candidateId }: Props) => {
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
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">
            {candidateName ? `${candidateName}'s History` : "History"}
          </Typography>
          <IconButton onClick={closePopup} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: 500 }}>
          <ApplicationTimeline candidateId={candidateId || ""} />
        </DialogContent>
      </Dialog>
      <IconButton size="small" onClick={onOpen}>
        <img src="/images/ApplicationHistoryIcon.svg" alt="Assign Job" />
      </IconButton>
    </Grid>
  );
};

export default ApplicationHistory;
