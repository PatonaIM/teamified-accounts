import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { Close as CloseIcon } from "@mui/icons-material";

const RescheduleModal = ({
  open,
  closeModal,
  interviewId,
  interviewerEmail,
  interviewerName,
  showError,
}: any) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const rescheduleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Candidate will select a new slot");
      closeModal();
    } catch (error) {
      console.error("Something went wrong while notifying the candidate", error);
    } finally {
      setIsLoading(false);
    }
  }, [interviewId, interviewerEmail, interviewerName, closeModal]);

  return (
    <Dialog open={open} onClose={closeModal} maxWidth="xl">
      <DialogTitle
        fontSize={"32px"}
        justifyContent={"center"}
        display={"flex"}
        alignItems={"center"}
        flexDirection={"column"}
      >
        <Typography fontSize={"24px"} lineHeight={"32px"} fontWeight={700}>
          Reschedule interview call
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          px: 6,
          py: 2,
          width: "50vw",
        }}
      >
        <Typography variant="body2" textAlign={"center"} px={4}>
          You have chosen to reschedule the call.
        </Typography>
        <Typography variant="body2" textAlign={"center"} px={4}>
          Candidate will choose a new time slot as per your given available time
          slots.
        </Typography>

        <Box
          display="flex"
          justifyContent="flex-end"
          sx={{ mt: 1, mb: 1 }}
          gap={2}
        >
          <Button variant="text" sx={{ mt: 2 }} onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={rescheduleClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={20}></CircularProgress>
            ) : (
              "Reschedule"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
