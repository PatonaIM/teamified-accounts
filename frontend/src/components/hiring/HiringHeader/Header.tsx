import { Box, Collapse, Grid, IconButton, Typography } from "@mui/material";
import ExpandableSearchBox from "./ExpandableSearch";

import { Close } from "@mui/icons-material";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewJobForm from "../../../modules/HireV3/JobRequestTable/JobRequestForm";
import AddNewTaskModal from "../../../modules/Tasks/AddNewTaskModal";
import CommonFilterMenu, {
  type MenuOptions,
  type Option,
} from "../CommonFilters/CommonFilterMenu";
import FilterView from "./FilterView";
import SplitButton, { type SplitButtonOption } from "./SplitButton";

type BaseProps = {
  onSearch?: (value: string) => void;
  secondaryActions?: React.ReactNode;
  defaultSelectedId?: string;
};

type WithBreadcrumbs = {
  breadCrumbs: React.ReactNode;
  title: string;
};

type WithoutBreadcrumbs = {
  breadCrumbs?: undefined;
  title?: undefined;
};

type WithOptions = {
  options: Array<MenuOptions>; // or whatever type your options are
  filters: Option; // or the actual filter type
  setFilters: (filters: Option) => void;
};

type WithoutOptions = {
  options?: undefined;
  filters?: undefined;
  setFilters?: undefined;
};

type Props = BaseProps &
  (WithOptions | WithoutOptions) &
  (WithBreadcrumbs | WithoutBreadcrumbs);

const actions: SplitButtonOption[] = [
  {
    label: "New job request",
    id: "job-request",
  },
  {
    label: "New Task",
    id: "task",
  },
];

const Header = ({
  filters,
  onSearch,
  breadCrumbs,
  title,
  options,
  setFilters,
  secondaryActions,
  defaultSelectedId = "job-request",
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const showMenu = Boolean(anchorEl);
  const closeMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const [active, setActive] = useState<string>("");

  const handleSelect = (id: string) => {
    if (id === "job-request") {
      navigate("/job-request/new");
      return;
    }
    setActive(id);
    // do stuff based on id
  };

  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const filteredFilters = useMemo(() => {
    return Object.entries(filters || {}).filter((el) => el[1] !== "") as [string, string][];
  }, [filters]);

  const clearFilter = useCallback(
    (el) => () => {
      setFilters?.({ [el]: "" });
    },
    [setFilters],
  );

  const closeView = useCallback(() => {
    setActive("");
  }, []);

  return (
    <Grid container direction={"column"}>
      <Grid
        container
        size={12}
        justifyContent={"space-between"}
        alignItems={"center"}
        wrap="nowrap"
      >
        <Grid container size={{ xs: 7 }} gap={2} alignItems={"center"}>
          <SplitButton
            options={actions}
            defaultSelectedId={defaultSelectedId}
            onSelect={handleSelect}
          />

          {typeof breadCrumbs === "undefined" && (
            <>
              {options && options.length > 0 && (
                <>
                  <IconButton onClick={handleFilterClick}>
                    <img src="/images/settings.svg" alt="filter" />
                  </IconButton>
                  <CommonFilterMenu
                    anchorEl={anchorEl}
                    handleClose={closeMenu}
                    open={showMenu}
                    options={options}
                    changeOption={setFilters}
                    filters={filters}
                  ></CommonFilterMenu>
                </>
              )}
              {onSearch && <ExpandableSearchBox onSearch={onSearch} />}
            </>
          )}
        </Grid>
        <Grid container size={{ xs: 5 }} justifyContent={"flex-end"}>
          {secondaryActions}
        </Grid>
      </Grid>
      {typeof breadCrumbs !== "undefined" && (
        <Grid container size={12} direction={"column"}>
          <Grid size={12}> {breadCrumbs}</Grid>
          <Grid
            container
            size={12}
            justifyContent={"space-between"}
            alignItems={"center"}
            wrap="nowrap"
          >
            <Grid container size={{ xs: "grow" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {title}
              </Typography>
            </Grid>
            <Grid
              container
              size={{ xs: "auto" }}
              wrap="nowrap"
              justifyContent={"flex-end"}
              gap={1}
            >
              {onSearch && <ExpandableSearchBox onSearch={onSearch} />}
              {options && options.length > 0 && (
                <>
                  <IconButton onClick={handleFilterClick}>
                    <img src="/images/settings.svg" alt="filter" />
                  </IconButton>
                  <CommonFilterMenu
                    anchorEl={anchorEl}
                    handleClose={closeMenu}
                    open={showMenu}
                    options={options}
                    changeOption={setFilters}
                    filters={filters}
                  ></CommonFilterMenu>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid container size={12} sx={{ display: "flex" }}>
        <Collapse in={filteredFilters.length > 0}>
          <Grid container flexWrap={"nowrap"} gap={2} my={1}>
            {filteredFilters.map((el) => (
              <FilterView
                key={el[0]}
                el={el}
                onClick={clearFilter(el[0])}
                options={options || []}
              />
            ))}
          </Grid>
        </Collapse>
      </Grid>
      <Collapse
        sx={{
          width: "100%",
        }}
        in={active === "job-request"}
        easing={{ enter: "ease-in" }}
        unmountOnExit
      >
        <Grid 
          sx={{
            borderLeft: 2,
            borderColor: "primary.main",
          }}
        >
          <Box
            sx={{
              backgroundColor: "background.paper",
              display: "flex",
              boxShadow: 1,
              px: 2,
              py: 2,
              mt: 2,
              justifyContent: "space-between",
            }}
          >
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              New request
            </Typography>
            <IconButton
              aria-label="close"
              onClick={closeView}
              size="small"
              sx={{
                color: "text.primary",
              }}
            >
              <Close />
            </IconButton>
          </Box>
          <NewJobForm
            setShowNewJobRequest={(flag) => {
              if (!flag) {
                setActive("");
              }
            }}
          />
        </Grid>
      </Collapse>

      <Collapse
        in={active === "task"}
        sx={{
          boxShadow: 1,
        }}
        easing={{ enter: "ease-in" }}
        unmountOnExit
      >
        <Grid
          sx={{
            py: 1,
            px: 2,
            bgcolor: "background.paper",
            mt: 2,
            borderLeft: 2,
            borderColor: "primary.main",
          }}
        >
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Add new task
          </Typography>
          <AddNewTaskModal closeModal={closeView}></AddNewTaskModal>
        </Grid>
      </Collapse>
    </Grid>
  );
};

export default Header;
