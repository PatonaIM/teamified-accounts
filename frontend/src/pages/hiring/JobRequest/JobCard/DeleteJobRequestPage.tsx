import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import type { JobRequest } from "../../../../types/hiring";

type Props = {
  cancel: () => void;
  requestId: string;
};

const DeleteJobRequestPage = ({ requestId, cancel }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Job request closed successfully");
      cancel();
    } catch (error) {
      console.error("Error closing job request", error);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, cancel]);

  return (
    <Dialog open={true} onClose={cancel} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: "24px",
          lineHeight: "32px",
          fontWeight: 700,
          color: "text.primary",
        }}
      >
        Close Job Request
      </DialogTitle>
      <DialogContent>
        <Grid container size={{ xs: 10 }} alignItems={"center"} gap={2}>
          <Avatar sx={{ bgcolor: "error.main" }}>
            <DeleteOutlined fontSize="medium" />
          </Avatar>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: "text.primary",
            }}
          >
            Are you sure you want to close the job request?
          </Typography>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          mr: 2,
          mb: 2,
        }}
      >
        <Button
          onClick={cancel}
          sx={{
            mr: 2,
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? (
            <CircularProgress size={20} color="primary" />
          ) : (
            "Close request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteJobRequestPage;
