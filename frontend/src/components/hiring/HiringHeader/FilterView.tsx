import { Close } from "@mui/icons-material";
import { Grid, IconButton, Typography } from "@mui/material";
import { memo, useMemo } from "react";
import { type MenuOptions } from "../CommonFilters/CommonFilterMenu";

type Props = {
  el: [string, string];
  options: Array<MenuOptions>;
  onClick: () => void;
};

const FilterView = ({ el, options, onClick }: Props) => {
  const text = useMemo(() => {
    const parent = options?.findIndex((option) => option.id === el[0]);
    const child = options[parent]?.options?.find(
      (option) => option.id === el[1],
    );
    return `${options[parent]?.title} : ${child?.title}`;
  }, [options, el]);
  return (
    <Grid
      container
      size={{ xs: "auto" }}
      gap={1}
      alignItems={"center"}
      flexWrap={"nowrap"}
      sx={{
        bgcolor: "action.hover",
        px: 2,
        py: 0.5,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography 
        noWrap 
        variant="body2" 
        textTransform={"capitalize"}
        sx={{
          color: "text.primary",
        }}
      >
        {text}
      </Typography>
      <IconButton 
        onClick={onClick}
        size="small"
        sx={{
          color: "text.secondary",
        }}
      >
        <Close sx={{ width: 16, height: 16 }} />
      </IconButton>
    </Grid>
  );
};

export default memo(FilterView);
