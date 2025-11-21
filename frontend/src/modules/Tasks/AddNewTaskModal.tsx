import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
  closeModal: () => void;
};

// Stub component - TODO: Implement full task modal
const AddNewTaskModal: React.FC<Props> = ({ closeModal }) => {
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
        Add task modal will be implemented here.
      </Typography>
    </Box>
  );
};

export default AddNewTaskModal;
