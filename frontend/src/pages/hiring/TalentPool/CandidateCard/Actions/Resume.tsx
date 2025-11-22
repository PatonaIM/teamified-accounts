import { Grid, IconButton } from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import documentService from "../../../../../services/hiring/documentService";
import CandiadateResumePopup from "../../../../../components/hiring/CandidateResumePopup";

type Props = {
  resumeFileName: string;
  candidateName: string;
};

const Resume = ({ resumeFileName, candidateName }: Props) => {
  const [open, setOpen] = useState(false);
  const [cvUrl, setCvUrl] = useState<string>("");

  const closePopup = useCallback(() => {
    setOpen(false);
  }, []);

  const onClickThumbnail = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!resumeFileName || resumeFileName.length === 0 || !open) return;

    const fetchDocument = async () => {
      try {
        const response = await documentService.downloadDocument(resumeFileName);
        setCvUrl(response.link || "");
      } catch (error) {
        console.error("Error downloading document:", error);
      }
    };

    fetchDocument();
  }, [resumeFileName, open]);

  return (
    <Grid>
      <CandiadateResumePopup
        resumeUrl={cvUrl || ""}
        candidateName={candidateName}
        open={open}
        onClose={closePopup}
      />
      <IconButton size="small" onClick={onClickThumbnail}>
        <img src="/images/ResumeIcon.svg" alt="Resume" />
      </IconButton>
    </Grid>
  );
};

export default Resume;
