import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useMemo, useState } from "react";

export type SplitButtonOption = {
  id: string;
  label: string;
};

export type SplitButtonProps = {
  options: SplitButtonOption[];
  defaultSelectedId?: string;
  onSelect: (id: string, checkboxValue?: boolean) => void;
  variant?: "contained" | "outlined" | "text";
  color?:
    | "primary"
    | "secondary"
    | "inherit"
    | "error"
    | "info"
    | "success"
    | "warning";
  mainLabel?: string;
  checkboxLabel?: string;
};

const SplitButton: React.FC<SplitButtonProps> = ({
  options,
  defaultSelectedId,
  onSelect,
  variant = "contained",
  color = "primary",
  mainLabel,
  checkboxLabel,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultSelectedId ?? options[0]?.id,
  );
  const [checkboxValue, setCheckboxValue] = useState<boolean>(true);

  const open = Boolean(anchorEl);

  // Map id -> label lookup to display selected label easily
  const selectedOption = options.find((opt) => opt.id === selectedId);

  // Pre-build stable handlers for menu items - memoized
  const menuItemHandlers = useMemo(() => {
    return options.reduce(
      (acc, option) => {
        acc[option.id] = () => {
          onSelect(option.id, checkboxValue);
          setAnchorEl(null);
        };
        return acc;
      },
      {} as Record<string | number, () => void>,
    );
    // include checkboxValue in deps so handler always has latest value
  }, [options, onSelect, checkboxValue]);

  const handleMainClick = () => {
    if (selectedId !== undefined) {
      onSelect(selectedId, checkboxValue);
    }
  };

  const handleArrowClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <ButtonGroup variant={variant} color={color}>
        <Button onClick={handleMainClick}>
          {mainLabel ?? selectedOption?.label ?? "Select"}
        </Button>
        <Button
          size="small"
          onClick={handleArrowClick}
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="menu"
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Menu
        id="split-button-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map(({ id, label }) => (
          <MenuItem
            key={id}
            selected={id === selectedId}
            onClick={menuItemHandlers[id]}
          >
            {label}
          </MenuItem>
        ))}
        {checkboxLabel && (
          <>
            <Divider sx={{ my: 1 }} />
            <MenuItem disableRipple disableGutters sx={{ pl: 0, pr: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxValue}
                    onChange={(_, checked) => setCheckboxValue(checked)}
                  />
                }
                label={checkboxLabel}
                sx={{ ml: 1 }}
              />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default SplitButton;
