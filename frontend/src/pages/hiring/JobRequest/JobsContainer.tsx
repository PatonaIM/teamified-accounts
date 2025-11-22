import { CircularProgress, Divider, Grid, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useJobRequests } from "../../../hooks/hiring/useJobRequests";
import JobRequestAccordion from "./JobRequestAccordion";

type Props = {
  searchTerm: string;
  selectedRecruiter?: string;
  selectedTimeFrame?: string;
  clientCode: number;
  showActive: boolean;
};

let renderCount = 0;

const JobsContainer = ({
  clientCode,
  searchTerm,
  selectedRecruiter,
  selectedTimeFrame,
  showActive,
}: Props) => {
  renderCount++;
  console.log('[JobsContainer] Render #' + renderCount, 'with props:', { clientCode, searchTerm, selectedRecruiter, selectedTimeFrame, showActive });

  if (renderCount > 50) {
    console.error('[JobsContainer] INFINITE LOOP DETECTED! Stopped at render', renderCount);
    return <div style={{padding: '20px', color: 'red'}}>Error: Infinite render loop detected in JobsContainer</div>;
  }

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => {
    const f = {
      showActiveJobs: showActive,
      clientId: clientCode,
      recruiterId: selectedRecruiter,
      timeframe: selectedTimeFrame,
      pageSize: 6,
      searchValue: searchTerm,
    };
    console.log('[JobsContainer] Filters memoized:', f);
    return f;
  }, [showActive, clientCode, selectedRecruiter, selectedTimeFrame, searchTerm]);

  const {
    data: jobsList,
    loading: jobRequestLoading,
    hasMore,
    totalCount,
    isFetchingNextPage: jobRequestFetchingNextPage,
    fetchNextPage
  } = useJobRequests(filters);

  const jobRequestFetching = jobRequestLoading;

  const observer = useRef<IntersectionObserver | null>(null);
  const requests = useMemo(
    () => jobsList || [],
    [jobsList],
  );

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchNextPage();
          }
        },
        { threshold: 1.0 },
      );
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasMore],
  );

  return (
    <Grid
      container
      size={12}
      direction={"column"}
      sx={{
        backgroundColor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        p: 2,
        boxShadow: 1,
      }}
    >
      <Typography 
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          px: 2.5,
        }}
      >
        {totalCount || requests.length} {showActive ? "open position" : "closed position"}s
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Grid
        container
        direction={"column"}
        height={"calc(100vh - 244px)"}
        flexWrap={"nowrap"}
        overflow={"auto"}
        gap={2}
      >
        {requests.length === 0 && !jobRequestFetching && (
          <Grid
            container
            size={12}
            justifyContent="center"
            alignItems="center"
            sx={{ 
              minHeight: 200, 
              color: "text.secondary",
            }}
          >
            <Typography 
              variant="body1"
              sx={{
                color: "text.secondary",
              }}
            >
              No open job requests found
            </Typography>
          </Grid>
        )}
        {requests?.map((el: any, index: number) => (
          <JobRequestAccordion
            request={el}
            key={el.jobRequestId || el.jobRequestID || index}
            ref={index === requests.length - 1 ? lastPostElementRef : null}
          />
        ))}
        {jobRequestFetchingNextPage && (
          <Grid
            container
            size={12}
            height={"100px"}
            justifyContent={"center"}
            alignItems={"center"}
            flexShrink={0}
          >
            <CircularProgress size={36} color="primary"></CircularProgress>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default JobsContainer;
