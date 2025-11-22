import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import MagicEditIcon from "../../../components/hiring/HiringLayout/MagicEditIcon";
import { useTalentPool } from "./TalentPoolContext";

type Props = {};

const AISearchBar = (props: Props) => {
  const [searchText, setSearchText] = useState("");

  const {
    state: { tags, loading, searchText: contextSearchText, candidateList },
    setFilters,
    setFiltersMeta,
    clearAll,
    performSearch,
  } = useTalentPool();

  React.useEffect(() => {
    // Only trigger initial search on mount
    if (Array.isArray(candidateList) && candidateList.length === 0) {
      performSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async () => {
    // Clear filters and meta if search text is different
    if (searchText !== contextSearchText) {
      setFilters({
        yearsOfExperience: [0, 15],
        location: [],
        jobTitle: [],
        type: null,
        stages: [],
        clients: [],
        levels: [],
      });
      setFiltersMeta({
        yearsOfExperience: [],
        location: [],
        jobTitle: [],
        stages: [],
        clients: [],
      });
    }
    // Reset to first page on search
    // Use context's performSearch function
    performSearch(searchText);
  }, [
    searchText,
    contextSearchText,
    setFilters,
    setFiltersMeta,
    performSearch,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleClear = useCallback(() => {
    setSearchText("");
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchText("");
    clearAll();
  }, [clearAll]);

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid size={{ xs: "grow" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            sx: {
              bgcolor: "background.paper",
              borderRadius: "10px",
              height: 52,
              fontSize: "14px",
              lineHeight: "20px",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            },
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleSearch} edge="start">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            bgcolor: "background.paper",
            borderRadius: "10px",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            height: 52,
            ".MuiInputBase-input": {
              height: "52px",
              boxSizing: "border-box",
              padding: "0 14px",
            },
          }}
        />
      </Grid>
      <Grid>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MagicEditIcon />}
          onClick={handleSearch}
          disabled={!searchText.trim()}
          sx={{
            height: 40,
            minWidth: 100,
            borderRadius: "10px",
            boxShadow: "none",
          }}
        >
          Search
        </Button>
        {/* Clear Search Button */}
        <Button
          variant="text"
          onClick={handleClearAll}
          size="small"
          sx={{
            height: 40,
            minWidth: 100,
            marginLeft: 1,
            boxShadow: "none",
          }}
        >
          Clear Search
        </Button>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Grid
          container
          spacing={1}
          sx={{ minHeight: 30, alignItems: "center" }}
        >
          {tags.map((tag) => (
            <Grid key={tag}>
              <Chip
                label={tag}
                icon={<MagicEditIcon />}
                sx={{
                  paddingLeft: 1,
                  height: 26,
                  bgcolor: "background.paper",
                  fontSize: "12px",
                  color: "text.secondary",
                  borderRadius: "8px",
                }}
              />
            </Grid>
          ))}
          {loading && (
            <Grid>
              <CircularProgress size={16} />
            </Grid>
          )}
        </Grid>
      </Grid>
      {/* meta object is stored in state, you can use it as needed */}
    </Grid>
  );
};

export default AISearchBar;
