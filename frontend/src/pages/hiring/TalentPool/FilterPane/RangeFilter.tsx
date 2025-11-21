import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import type { Filters } from "../TalentPoolContext";
import { useTalentPool } from "../TalentPoolContext";

interface RangeFilterProps {
  title: string;
  filterKey: keyof Filters;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}
const minDistance = 1;

const RangeFilter: React.FC<RangeFilterProps> = ({
  title,
  filterKey,
  min,
  max,
  step = 1,
  unit = "",
}) => {
  const {
    state: { filters },
    setFilters,
  } = useTalentPool();

  const currentRange = (filters[filterKey] as [number, number]) || [min, max];
  const [localRange, setLocalRange] = useState<[number, number]>(currentRange);

  const handleSliderChange = useCallback(
    (event: Event, newValue: number | number[], activeThumb: number) => {
      const range = newValue as [number, number];
      if (activeThumb === 0) {
        setLocalRange([
          Math.min(newValue[0], localRange[1] - minDistance),
          localRange[1],
        ]);
      } else {
        setLocalRange([
          localRange[0],
          Math.max(newValue[1], localRange[0] + minDistance),
        ]);
      }
      setFilters({
        ...filters,
        [filterKey]: range,
      });
    },
    [setFilters, filters, filterKey, localRange],
  );

  const handleInputChange = useCallback(
    (index: 0 | 1, value: string) => {
      const numValue = Math.max(min, Math.min(max, Number(value) || 0));
      const newRange: [number, number] = [...localRange];
      newRange[index] = numValue;

      // Ensure min <= max
      if (index === 0 && newRange[0] > newRange[1]) {
        newRange[1] = newRange[0];
      } else if (index === 1 && newRange[1] < newRange[0]) {
        newRange[0] = newRange[1];
      }

      setLocalRange(newRange);
      setFilters({
        ...filters,
        [filterKey]: newRange,
      });
    },
    [localRange, min, max, filters, setFilters, filterKey],
  );

  return (
    <Accordion
      defaultExpanded
      disableGutters
      sx={{
        boxShadow: "none",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography 
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ px: 1 }}>
              <Slider
                value={localRange}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={min}
                max={max}
                step={step}
                valueLabelFormat={(value) => `${value}${unit}`}
                disableSwap
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label={`Min ${unit}`}
              type="number"
              size="small"
              fullWidth
              value={localRange[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              inputProps={{ min, max }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label={`Max ${unit}`}
              type="number"
              size="small"
              fullWidth
              value={localRange[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              inputProps={{ min, max }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default RangeFilter;
