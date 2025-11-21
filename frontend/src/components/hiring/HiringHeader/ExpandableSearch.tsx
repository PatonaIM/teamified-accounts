import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Fade,
  IconButton,
  TextField,
} from "@mui/material";
import React, {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ExpandableSearchBoxProps = {
  onSearch?: (query: string) => void;
};

const ExpandableSearchBox = ({ onSearch }: ExpandableSearchBoxProps) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce logic
  useEffect(() => {
    if (!expanded) return;
    const handler = setTimeout(() => {
      onSearch?.(searchText.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText, onSearch, expanded]);

  const handleExpand = useCallback(() => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleCollapse = useCallback(() => {
    setSearchText("");
    onSearch?.("");
    setExpanded(false);
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(searchText.trim());
      }
    },
    [onSearch, searchText],
  );

  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
      // Removed immediate onSearch call for debounce
    },
    [],
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      <TextField
        variant="standard"
        size="small"
        inputRef={inputRef}
        value={searchText}
        onChange={onChangeHandler}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        InputProps={{
          disableUnderline: false,
        }}
        sx={{
          width: expanded ? "250px" : 0,
          transition: "width 0.3s ease",
          '& .MuiInputBase-input': {
            color: "text.primary",
          },
          '& .MuiInput-underline:before': {
            borderColor: "divider",
          },
          '& .MuiInput-underline:hover:before': {
            borderColor: "primary.main",
          },
          '& .MuiInput-underline:after': {
            borderColor: "primary.main",
          },
        }}
      />

      <Fade in={!expanded} timeout={200} unmountOnExit>
        <IconButton 
          onClick={handleExpand} 
          aria-label="Open search"
          sx={{
            color: "primary.main",
          }}
        >
          <SearchIcon />
        </IconButton>
      </Fade>

      <Fade in={expanded} timeout={200} unmountOnExit>
        <IconButton
          onClick={handleCollapse}
          aria-label="Close search"
          sx={{ 
            ml: 1,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Fade>
    </Box>
  );
};

export default ExpandableSearchBox;
