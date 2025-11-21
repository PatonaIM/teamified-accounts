import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CandidateResumePopupProps {
  resumeUrl: string;
  candidateName: string;
  open: boolean;
  onClose: () => void;
}

const CandidateResumePopup = ({
  resumeUrl,
  candidateName,
  open,
  onClose,
}: CandidateResumePopupProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {candidateName}'s Resume
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {resumeUrl ? (
          <iframe
            src={resumeUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title={`${candidateName} Resume`}
          />
        ) : (
          <div>No resume available</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CandidateResumePopup;
