import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";
import { useRef } from "react";
import CandidateCard from "./CandidateCard/CandidateCard";
import AssignJobDialog from "./CandidateCard/Components/AssignJobDialog";
import { useTalentPool } from "./TalentPoolContext";

const TalentPoolCandidatesList = () => {
  const {
    state: {
      candidateList,
      selectedCandidates,
      showAssignDialog,
      error,
      loading,
      page,
      totalPages,
    },
    selectAllCandidates,
    getSelectedCount,
    setShowAssignDialog,
    goToPage,
  } = useTalentPool();

  const candidateListDivRef = useRef<HTMLDivElement>(null);

  // Check if all current page candidates are selected
  const allCandidateIds = candidateList.map((candidate) => candidate.id);
  const allCurrentPageSelected =
    allCandidateIds.length > 0 &&
    allCandidateIds.every((id) => selectedCandidates.includes(id));

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Select all candidates
      selectAllCandidates(allCandidateIds);
    } else {
      // Deselect all candidates
      selectAllCandidates([]);
    }
  };

  const handleBulkAssign = () => {
    setShowAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setShowAssignDialog(false);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    candidateListDivRef.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
    goToPage(value);
  };

  if (error) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: 200 }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Grid>
    );
  }
  if (!loading && candidateList.length === 0) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: 200 }}
      >
        <Typography color="textSecondary" variant="h6">
          No candidates available for this query
        </Typography>
      </Grid>
    );
  }
  if (loading && candidateList.length === 0) {
    return null;
  }

  return (
    <Grid container flexGrow={0} borderRadius={"10px"} sx={{ bgcolor: "background.paper" }}>
      <Box ref={candidateListDivRef}></Box>
      <Grid
        container
        size={{ xs: 12 }}
        p={2}
        alignItems={"center"}
        justifyContent={"space-between"}
        wrap="nowrap"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 9,
          bgcolor: "background.paper",
        }}
      >
        <Grid container alignItems="center" gap={2} wrap="nowrap">
          {totalPages > 1 && (
            <Pagination
              count={totalPages - 1}
              page={page}
              onChange={handlePageChange}
              disabled={loading}
              boundaryCount={0}
              siblingCount={0}
              color="primary"
              size="small"
              showFirstButton
              showLastButton
            />
          )}
        </Grid>
        <Grid
          container
          alignItems={"center"}
          justifyContent={"flex-end"}
          gap={1}
          wrap="nowrap"
        >
          {getSelectedCount() > 1 && (
            <Grid sx={{ bgcolor: "background.paper" }}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleBulkAssign}
                >
                  Assign Job ({getSelectedCount()} candidates)
                </Button>
              </Box>
            </Grid>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={allCurrentPageSelected}
                onChange={handleSelectAll}
                size="small"
                indeterminate={
                  allCandidateIds.some((id) =>
                    selectedCandidates.includes(id),
                  ) && !allCurrentPageSelected
                }
              />
            }
            label="Select All"
          />
        </Grid>
      </Grid>

      {/* Candidates List */}
      <Grid
        container
        size={{ xs: 12 }}
        px={2}
        sx={{ flexGrow: 1, overflow: "auto" }}
        gap={2}
        direction={"column"}
        pb={2}
      >
        {candidateList.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </Grid>

      {/* Assign Job Dialog */}
      <Dialog
        open={showAssignDialog}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          fontSize={"24px"}
          fontWeight={"700"}
          lineHeight={"32px"}
          textAlign={"center"}
        >
          Assign Jobs to Selected Candidates
        </DialogTitle>
        <DialogContent>
          <AssignJobDialog
            candidateIds={selectedCandidates}
            close={handleCloseAssignDialog}
          />
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default TalentPoolCandidatesList;
