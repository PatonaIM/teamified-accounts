import { Button, CircularProgress } from "@mui/material";
import { MouseEvent } from "react";

type Props = {
  text: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
};

const TaskApproveButton = ({ text, onClick, loading = false }: Props) => {
  return (
    <Button
      size="small"
      variant="contained"
      onClick={onClick}
      disabled={loading}
      sx={{
        height: "32px",
      }}
    >
      {loading ? <CircularProgress size={24}></CircularProgress> : text}
    </Button>
  );
};

export default TaskApproveButton;
