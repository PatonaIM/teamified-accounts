import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Close as CloseIcon } from "@mui/icons-material";

const RescheduleErrorBook = ({ open, closeModal }) => {
  const navigate = useNavigate();

  const navigateToSetSlots = useCallback(() => {
    closeModal();
    navigate("/set-slot");
  }, [closeModal, navigate]);
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
          You have choose to reschedule the call.Unfortunately there no
          available time slots form current week.
        </Typography>
        <Typography variant="body2" textAlign={"center"} px={4}>
          Please give your time slots for upcoming week. So that candidate will
          choose a new time slot as per your given available time slots.
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
            onClick={navigateToSetSlots}
          >
            Book your available timeslots
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleErrorBook;
