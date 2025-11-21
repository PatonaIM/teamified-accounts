import { Box, Container, useMediaQuery, useTheme } from "@mui/material";

interface LayoutProps {
  header: React.ReactNode;
  subHeader?: React.ReactNode;
  body: React.ReactNode;
}

const Layout = ({ header, subHeader, body }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth={false}
      disableGutters={isMobile}
      sx={{
        overflow: "auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 1.5,
        backgroundColor: "background.default",
      }}
    >
      {/* Header container that takes the size of its content */}
      <Box>
        <Box>{header}</Box>
        {subHeader && <Box>{subHeader}</Box>}
      </Box>

      {/* Body container that takes the remaining space */}
      <Box 
        sx={{
          marginTop: 2.5,
          flexGrow: 1,
        }}
      >
        {body}
      </Box>
    </Container>
  );
};

export default Layout;
