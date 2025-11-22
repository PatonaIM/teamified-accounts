import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
  setShowNewJobRequest: (show: boolean) => void;
};

// Stub component - TODO: Implement full job request form
const NewJobForm: React.FC<Props> = ({ setShowNewJobRequest }) => {
  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "background.paper",
        borderRadius: 2,
      }}
    >
      <Typography 
        variant="body1"
        sx={{
          color: "text.secondary",
        }}
      >
        Job request form will be implemented here.
      </Typography>
    </Box>
  );
};

export default NewJobForm;
