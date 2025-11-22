import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import talentPoolService from "../../../../services/hiring/talentPoolService";
import { FLAG_MAP } from "../../../../utils/CommonFunction";
import type { Candidate } from "../TalentPoolContext";
import { useTalentPool } from "../TalentPoolContext";
import Actions from "./Actions/Actions";
import JobList from "./JobList";

interface CandidateCardProps {
  candidate: Candidate;
}

const SkillChip = ({ skill }: { skill: string }) => (
  <Typography
    key={skill}
    sx={{
      px: 1,
      py: 0.5,
      bgcolor: "primary.light",
      borderRadius: 1,
      fontSize: "12px",
      fontWeight: 400,
      color: "primary.main",
      overflow: "hidden",
      maxWidth: "fit-content",
      minWidth: "fit-content",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {skill}
  </Typography>
);

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          // Once in view, we can disconnect the observer since we only need to trigger once
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before the element comes into view
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isInView]);

  const [candidateDetails, setCandidateDetails] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    const fetchCandidateDetails = async () => {
      try {
        setIsFetching(true);
        const data = await talentPoolService.getCandidateByEmail(candidate.email);
        setCandidateDetails(data);
      } catch (error) {
        console.error("Error fetching candidate details:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCandidateDetails();
  }, [isInView, candidate.email]);

  const highestSalary = useMemo(() => {
    const items = candidateDetails?.data || [];
    const nums = items
      .map((it: any) => {
        const v = it?.salaryIOTF;
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
      })
      .filter((n: number) => !Number.isNaN(n));
    if (nums.length === 0) return null;
    return Math.max(...nums);
  }, [candidateDetails]);

  const { state, selectCandidate, deselectCandidate } = useTalentPool();
  const isSelected = state.selectedCandidates.includes(candidate.id);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      selectCandidate(candidate.id);
    } else {
      deselectCandidate(candidate.id);
    }
  };

  const isInOfferStage = useMemo(() => {
    const items = candidateDetails?.data || [];
    return items.some((it: any) => it?.stage?.toLowerCase().includes("offer"));
  }, [candidateDetails]);

  return (
    <Grid
      ref={cardRef}
      container
      direction={"column"}
      gap={1}
      sx={{
        bgcolor: "background.paper",
        px: 1.5,
        py: 2,
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "text.secondary",
        minHeight: "222px",
      }}
    >
      <Grid
        container
        wrap="nowrap"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSelected}
                onChange={handleCheckboxChange}
                size="small"
              />
            }
            slotProps={{
              typography: {
                fontSize: "16px",
                color: "primary.main",
                fontWeight: 600,
              },
            }}
            label={
              <Grid container alignItems="center" gap={1}>
                <Link
                  to={"/talent-pool/candidate"}
                  state={{
                    email: candidate.email,
                  }}
                >
                  <Typography 
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                    }}
                  >
                    {candidate.name}
                  </Typography>
                </Link>
                {isInView && isFetching && (
                  <CircularProgress size={16} thickness={4} />
                )}
              </Grid>
            }
          />
        </Grid>
        <Grid gap={1}>
          <Actions candidate={candidateDetails?.data || []} />
        </Grid>
      </Grid>
      {isInOfferStage && (
        <Grid container alignItems="center" gap={1} pl={"26px"}>
          <Typography 
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "warning.main",
            }}
          >
            The candidate has reached the offer stage. Please review carefully
            and proceed with reassignment only if necessary.
          </Typography>
        </Grid>
      )}

      <Grid container alignItems="center" gap={1} pl={"26px"}>
        {FLAG_MAP[
          candidateDetails?.data?.[0]?.countryCode as keyof typeof FLAG_MAP
        ] && (
          <img
            src={
              FLAG_MAP[
                candidateDetails?.data?.[0]
                  ?.countryCode as keyof typeof FLAG_MAP
              ] || ""
            }
            alt="flag"
            height={16}
          />
        )}

        <Typography 
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {candidateDetails?.data?.[0]?.country || "No country specified"}
        </Typography>
      </Grid>
      <Grid container pl={"26px"} gap={1}>
        <Typography 
          variant="body2"
          sx={{
            fontWeight: 400,
            color: "text.primary",
          }}
        >
          Expected Salary:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: highestSalary ? 600 : 400,
            color: highestSalary ? "text.primary" : "text.secondary",
          }}
        >
          {highestSalary
            ? `AUD $${new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 0,
              }).format(highestSalary)}`
            : "Not specified"}
        </Typography>
      </Grid>
      <Grid container pl={"26px"} spacing={1}>
        {candidate.tags.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <SkillChip skill="No skills listed" />
          </Grid>
        ) : (
          candidate.tags.map((skill: string) => (
            <Grid key={skill}>
              <SkillChip skill={skill} />
            </Grid>
          ))
        )}
      </Grid>
      <Grid container pl={"26px"}>
        <JobList candidate={candidateDetails?.data || []} />
      </Grid>
    </Grid>
  );
};

export default memo(CandidateCard);
