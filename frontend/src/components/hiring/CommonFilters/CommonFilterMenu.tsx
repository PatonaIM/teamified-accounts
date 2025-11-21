import { Menu, MenuItem, Typography, Box } from "@mui/material";
import React from "react";

export type Option = Record<string, string>;

export type SubOption = {
  id: string;
  title: string;
};

export type MenuOptions = {
  id: string;
  title: string;
  options: SubOption[];
};

type Props = {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  open: boolean;
  options: MenuOptions[];
  changeOption: (option: Option) => void;
  filters: Option;
};

const CommonFilterMenu: React.FC<Props> = ({
  anchorEl,
  handleClose,
  open,
  options,
  changeOption,
  filters,
}) => {
  const handleOptionClick = (parentId: string, optionId: string) => {
    changeOption({ [parentId]: optionId });
    handleClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: 'background.paper',
          boxShadow: 2,
          borderRadius: 2,
          minWidth: 200,
        },
      }}
    >
      {options.map((option) => (
        <Box key={option.id}>
          <MenuItem disabled>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              {option.title}
            </Typography>
          </MenuItem>
          {option.options.map((subOption) => (
            <MenuItem
              key={subOption.id}
              onClick={() => handleOptionClick(option.id, subOption.id)}
              selected={filters[option.id] === subOption.id}
              sx={{
                pl: 3,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                }}
              >
                {subOption.title}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      ))}
    </Menu>
  );
};

export default CommonFilterMenu;
