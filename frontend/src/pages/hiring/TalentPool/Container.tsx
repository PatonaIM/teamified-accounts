import { Box } from "@mui/material";
import TalentPoolBody from "./TalentPoolBody";

type Props = {};

const TalentPool = (props: Props) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        backgroundColor: 'background.default',
      }}
    >
      <TalentPoolBody />
    </Box>
  );
};

export default TalentPool;
