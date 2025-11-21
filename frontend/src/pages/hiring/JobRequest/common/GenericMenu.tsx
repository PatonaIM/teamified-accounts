import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { type MouseEvent, useCallback, useState } from "react";
import type { ACTIVE_VIEW } from "../../../../types/hiring";

type Action = {
  name: string;
  value: string;
  color?: string;
};

type CommonProps = {
  selectAction: (value: ACTIVE_VIEW | string) => void;
  actions: Array<Action>;
};

type ConditionalProps =
  | {
      view: "button";
      text: string;
    }
  | {
      view: "icon-button";
      icon: React.ReactNode;
    };

type Props = CommonProps & ConditionalProps;

const GenericMenu = (props: Props) => {
  const { actions, selectAction, view } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectActionClick = useCallback(
    (action: ACTIVE_VIEW | string) => (e: MouseEvent<HTMLLIElement>) => {
      e.stopPropagation();
      selectAction(action);
      handleClose();
    },
    [selectAction],
  );

  return (
    <Box>
      {view === "icon-button" && (
        <IconButton
          component="div"
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          {props.icon}
        </IconButton>
      )}
      {view === "button" && (
        <Button variant="contained" size="small" onClick={handleClick}>
          {props.text}
        </Button>
      )}
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 48 * 4.5,
              width: "15ch",
              boxShadow: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          },
        }}
      >
        {actions.map((action) => (
          <MenuItem
            onClick={selectActionClick(action.value)}
            key={action.value}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: action.color || "text.primary",
              }}
            >
              {action.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default GenericMenu;
