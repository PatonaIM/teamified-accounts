import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import React from "react";
import type { Filters } from "../TalentPoolContext";
import { useTalentPool } from "../TalentPoolContext";

interface GenericFilterProps {
  title: string;
  options: string[];
  filterKey: keyof Filters;
  multiSelect?: boolean;
}

const GenericFilter: React.FC<GenericFilterProps> = ({
  title,
  options,
  filterKey,
  multiSelect = true,
}) => {
  const {
    state: { filters },
    setFilters,
  } = useTalentPool();

  // Convert camelCase to normal case with proper capitalization
  const convertCamelCaseToNormalCase = (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters that follow lowercase letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim(); // Remove any leading/trailing spaces
  };

  const selectedValues = filters[filterKey] as string[];
  const selectedValue = filters[filterKey] as string;

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const updatedValues = checked
      ? [...selectedValues, option]
      : selectedValues.filter((value) => value !== option);

    setFilters({
      ...filters,
      [filterKey]: updatedValues,
    });
  };

  const handleSingleCheckboxChange = (option: string, checked: boolean) => {
    setFilters({
      ...filters,
      [filterKey]: checked ? option : "",
    });
  };

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
        {multiSelect ? (
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={selectedValues?.includes(option)}
                    onChange={(e) =>
                      handleCheckboxChange(option, e.target.checked)
                    }
                  />
                }
                label={convertCamelCaseToNormalCase(option)}
              />
            ))}
          </FormGroup>
        ) : (
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={selectedValue === option}
                    onChange={(e) =>
                      handleSingleCheckboxChange(option, e.target.checked)
                    }
                  />
                }
                label={convertCamelCaseToNormalCase(option)}
              />
            ))}
          </FormGroup>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default GenericFilter;
