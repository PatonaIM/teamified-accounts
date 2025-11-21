import { Breadcrumbs, Grid, IconButton, Link as MuiLink } from "@mui/material";
import { type PropsWithChildren, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

type Props = PropsWithChildren<{
  paths?: {
    label: string;
    to: string;
  }[];
  showBack?: boolean;
}>;

const JobBreadcrumbs = ({ paths, showBack = false }: Props) => {
  const navigate = useNavigate();
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  return (
    <Grid container size={{ xs: 12 }} gap={2} alignItems="center">
      {showBack && (
        <IconButton size="small" onClick={handleBackClick}>
          <img src="/images/left-arrow.svg" alt="Back" />
        </IconButton>
      )}
      <Breadcrumbs aria-label="breadcrumb" separator="|">
        <MuiLink
          component={Link}
          to="/job-request"
          sx={{
            fontWeight: 500,
            fontSize: "13px",
            textDecoration: "none",
            color: paths?.length === 0 ? "text.secondary" : "primary.main",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Open Positions
        </MuiLink>
        {paths?.map((path, index) => (
          <MuiLink
            key={index}
            component={Link}
            to={path.to}
            sx={{
              fontWeight: 500,
              fontSize: "13px",
              textDecoration: "none",
              color: index === paths.length - 1 ? "text.secondary" : "primary.main",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {path.label}
          </MuiLink>
        ))}
      </Breadcrumbs>
    </Grid>
  );
};

export default JobBreadcrumbs;
